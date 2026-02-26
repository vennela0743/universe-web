"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import * as myPostsApi from "@/lib/my-posts-api";
import type { ConnectPost } from "@/types/connect";
import type { OpportunityPost, EventPost } from "@/lib/my-posts-api";
import styles from "./my-posts.module.css";

type Tab = "connect" | "opportunities" | "events";

interface DeleteTarget {
  type: Tab;
  id: string;
  title: string;
}

export default function MyPostsPage() {
  const { user, token, initialized } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("connect");
  const [connectPosts, setConnectPosts] = useState<ConnectPost[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityPost[]>([]);
  const [events, setEvents] = useState<EventPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  const fetchMyPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await myPostsApi.getMyPosts(token);
      setConnectPosts(data.connectPosts || []);
      setOpportunities(data.opportunities || []);
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your posts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMyPosts();
    }
  }, [token, fetchMyPosts]);

  const handleDeleteClick = (type: Tab, id: string, title: string) => {
    setDeleteTarget({ type, id, title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "connect") {
        await myPostsApi.deleteConnectPost(token, deleteTarget.id);
        setConnectPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      } else if (deleteTarget.type === "opportunities") {
        await myPostsApi.deleteOpportunity(token, deleteTarget.id);
        setOpportunities((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      } else if (deleteTarget.type === "events") {
        await myPostsApi.deleteEvent(token, deleteTarget.id);
        setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  if (!initialized || !user) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return styles.statusApproved;
      case "PENDING":
        return styles.statusPending;
      case "REJECTED":
        return styles.statusRejected;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Posts</h1>
        <p className={styles.subtitle}>Manage your content across all spaces</p>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "connect" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("connect")}
        >
          Connect ({connectPosts.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "opportunities" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("opportunities")}
        >
          Opportunities ({opportunities.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "events" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events ({events.length})
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.loading}>Loading your posts...</p>
      ) : (
        <div className={styles.content}>
          {activeTab === "connect" && (
            <div className={styles.postsList}>
              {connectPosts.length === 0 ? (
                <p className={styles.empty}>You haven&apos;t posted anything in Connect yet.</p>
              ) : (
                connectPosts.map((post) => (
                  <div key={post.id} className={styles.postCard}>
                    <div className={styles.postHeader}>
                      <span className={styles.postDate}>{formatDate(post.createdAt)}</span>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick("connect", post.id, post.content || "this post")}
                        aria-label="Delete post"
                      >
                        Delete
                      </button>
                    </div>
                    {post.imageUrl && (
                      <div className={styles.postImageContainer}>
                        <Image
                          src={post.imageUrl}
                          alt="Post image"
                          fill
                          className={styles.postImage}
                          unoptimized
                        />
                      </div>
                    )}
                    {post.content && <p className={styles.postContent}>{post.content}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className={styles.postsList}>
              {opportunities.length === 0 ? (
                <p className={styles.empty}>You haven&apos;t posted any opportunities yet.</p>
              ) : (
                opportunities.map((opp) => (
                  <div key={opp.id} className={styles.postCard}>
                    <div className={styles.postHeader}>
                      <span className={styles.postDate}>{formatDate(opp.createdAt)}</span>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick("opportunities", opp.id, opp.title)}
                        aria-label="Delete opportunity"
                      >
                        Delete
                      </button>
                    </div>
                    <h3 className={styles.postTitle}>{opp.title}</h3>
                    <div className={styles.postMeta}>
                      <span className={styles.typeBadge}>{opp.type}</span>
                      <span>{opp.duration}</span>
                      <span>{opp.commitment}</span>
                    </div>
                    <p className={styles.postContent}>{opp.description}</p>
                    {opp.skillsNeeded && opp.skillsNeeded.length > 0 && (
                      <div className={styles.skills}>
                        {opp.skillsNeeded.map((skill, i) => (
                          <span key={i} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "events" && (
            <div className={styles.postsList}>
              {events.length === 0 ? (
                <p className={styles.empty}>You haven&apos;t submitted any events yet.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className={styles.postCard}>
                    <div className={styles.postHeader}>
                      <div className={styles.eventHeaderLeft}>
                        <span className={styles.postDate}>{formatDate(event.createdAt)}</span>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick("events", event.id, event.title)}
                        aria-label="Delete event"
                      >
                        Delete
                      </button>
                    </div>
                    <h3 className={styles.postTitle}>{event.title}</h3>
                    <div className={styles.postMeta}>
                      <span className={styles.typeBadge}>{event.type}</span>
                      <span>{event.location}</span>
                    </div>
                    <p className={styles.eventTime}>
                      {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
                    </p>
                    <p className={styles.postContent}>{event.description}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <dialog open className={styles.modal}>
          <div className={styles.modalBackdrop} onClick={handleCancelDelete} />
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Delete Confirmation</h2>
            <p className={styles.modalText}>
              Are you sure you want to delete{" "}
              <strong>&quot;{deleteTarget.title.substring(0, 50)}{deleteTarget.title.length > 50 ? "..." : ""}&quot;</strong>?
            </p>
            <p className={styles.modalWarning}>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
