"use client";

import { useAuth } from "@/contexts/AuthContext";
import * as connectApi from "@/lib/connect-api";
import type { ConnectPost } from "@/types/connect";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./connect.module.css";

const MAX_POST_LENGTH = 500;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const yearOpt = date.getFullYear() === now.getFullYear() ? undefined : "numeric";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: yearOpt });
}

export default function ConnectSpacePage() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<ConnectPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setFeedError(null);
    try {
      const list = await connectApi.listPosts(token);
      setPosts(list);
    } catch (e) {
      setFeedError(e instanceof Error ? e.message : "Couldn't load posts. Try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please select an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setSubmitError("Image must be under 4MB.");
      return;
    }

    setSubmitError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageData(result);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview(null);
    setImageData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    const hasText = text.length > 0;
    const hasImage = imageData !== null;

    if (!hasText && !hasImage) {
      setSubmitError("Add some text or an image to post.");
      return;
    }

    if (text.length > MAX_POST_LENGTH) {
      setSubmitError("Post must be 500 characters or less.");
      return;
    }

    if (!token) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      const created = await connectApi.createPost(token, hasText ? text : null, imageData);
      setPosts((prev) => [created, ...prev]);
      setContent("");
      setImagePreview(null);
      setImageData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(postId: string) {
    if (!token) return;
    setDeletingId(postId);
    try {
      await connectApi.deletePost(token, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to delete post.");
    } finally {
      setDeletingId(null);
    }
  }

  const canSubmit = !submitting && (content.trim().length > 0 || imageData !== null);

  return (
    <div className={styles.container}>
      <div className={styles.feed}>
        <form onSubmit={handleSubmit} className={styles.createPost}>
          <div className={styles.createHeader}>
            <div className={styles.avatar}>
              {user?.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening on campus?"
              className={styles.textInput}
              rows={2}
              maxLength={MAX_POST_LENGTH}
              disabled={submitting}
            />
          </div>

          {imagePreview && (
            <div className={styles.imagePreviewContainer}>
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className={styles.imagePreview}
                sizes="(max-width: 600px) 100vw, 500px"
              />
              <button
                type="button"
                onClick={removeImage}
                className={styles.removeImage}
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          {submitError && (
            <p className={styles.error} role="alert">{submitError}</p>
          )}

          <div className={styles.createFooter}>
            <div className={styles.actions}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className={styles.fileInput}
                id="image-upload"
              />
              <label htmlFor="image-upload" className={styles.iconButton} aria-label="Add photo">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </label>
            </div>
            <div className={styles.submitArea}>
              <span className={styles.charCount}>
                {content.length}/{MAX_POST_LENGTH}
              </span>
              <button type="submit" disabled={!canSubmit} className={styles.postButton}>
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading posts...</p>
          </div>
        )}

        {!loading && feedError && (
          <div className={styles.errorCard}>
            <p>{feedError}</p>
            <button type="button" onClick={loadPosts} className={styles.retryButton}>
              Try again
            </button>
          </div>
        )}

        {!loading && !feedError && posts.length === 0 && (
          <div className={styles.emptyState}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>No posts yet</h3>
            <p>Be the first to share something with your campus!</p>
          </div>
        )}

        {!loading && !feedError && posts.length > 0 && (
          <div className={styles.postsGrid}>
            {posts.map((post) => {
              const isAuthor = user?.userId != null && post.authorUserId === user.userId;
              return (
                <article key={post.id} className={styles.postCard}>
                  <header className={styles.postHeader}>
                    <div className={styles.authorInfo}>
                      <div className={styles.avatar}>
                        {post.authorDisplayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className={styles.authorName}>{post.authorDisplayName}</p>
                        <p className={styles.postTime}>{formatTime(post.createdAt)}</p>
                      </div>
                    </div>
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className={styles.deleteButton}
                        aria-label="Delete post"
                      >
                        {deletingId === post.id ? "..." : "✕"}
                      </button>
                    )}
                  </header>

                  {post.imageUrl && (
                    <button
                      type="button"
                      className={styles.postImageContainer}
                      onClick={() => setExpandedImage(post.imageUrl)}
                    >
                      <Image
                        src={post.imageUrl}
                        alt="Post image"
                        fill
                        className={styles.postImage}
                        sizes="(max-width: 600px) 100vw, 500px"
                      />
                    </button>
                  )}

                  {post.content && (
                    <p className={styles.postContent}>{post.content}</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {expandedImage && (
        <dialog open className={styles.lightbox} aria-label="Expanded image">
          <button
            type="button"
            className={styles.lightboxBackdrop}
            onClick={() => setExpandedImage(null)}
            aria-label="Close lightbox"
          />
          <button
            type="button"
            className={styles.closeLightbox}
            onClick={() => setExpandedImage(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <Image
            src={expandedImage}
            alt="Expanded view"
            width={1200}
            height={900}
            className={styles.lightboxImage}
            style={{ objectFit: "contain" }}
          />
        </dialog>
      )}
    </div>
  );
}
