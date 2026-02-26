import { getAuthHeaders } from "@/lib/auth-api";
import type { ConnectPost } from "@/types/connect";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function createPost(
  token: string,
  content: string | null,
  imageData: string | null = null
): Promise<ConnectPost> {
  const res = await fetch(`${API_BASE}/api/space/connect/posts`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ content, imageData }),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please sign in again.");
    if (res.status === 413) throw new Error("Image is too large. Please use a smaller image.");
    if (res.status === 400) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message ?? "Post must have text or an image.");
    }
    const errorText = await res.text().catch(() => "");
    console.error("Post failed:", res.status, errorText);
    throw new Error(`Failed to post (${res.status}). Please try again.`);
  }
  return res.json() as Promise<ConnectPost>;
}

export async function listPosts(token: string): Promise<ConnectPost[]> {
  const res = await fetch(`${API_BASE}/api/space/connect/posts`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please sign in again.");
    throw new Error("Couldn’t load posts. Try again.");
  }
  return res.json() as Promise<ConnectPost[]>;
}

export async function deletePost(token: string, postId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/space/connect/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please sign in again.");
    if (res.status === 403 || res.status === 400) throw new Error("You can only delete your own posts.");
    if (res.status === 404) throw new Error("Post not found.");
    throw new Error("Failed to delete post.");
  }
}
