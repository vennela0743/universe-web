import { getAuthHeaders } from "./auth-api";
import type { ConnectPost } from "@/types/connect";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface OpportunityPost {
  id: string;
  title: string;
  type: string;
  skillsNeeded: string[];
  duration: string;
  commitment: string;
  description: string;
  ownerUserId: string;
  ownerDisplayName: string;
  createdAt: string;
}

export interface EventPost {
  id: string;
  title: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  organizerName: string;
  status: string;
  submittedByDisplayName: string;
  supportingDocuments: string | null;
  createdAt: string;
}

export interface MyPostsResponse {
  connectPosts: ConnectPost[];
  opportunities: OpportunityPost[];
  events: EventPost[];
}

export async function getMyPosts(token: string): Promise<MyPostsResponse> {
  const res = await fetch(`${API_BASE}/api/space/my-posts`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch your posts");
  }
  return res.json();
}

export async function deleteConnectPost(token: string, postId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/space/my-posts/connect/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete post");
  }
}

export async function deleteOpportunity(token: string, opportunityId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/space/my-posts/opportunities/${opportunityId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete opportunity");
  }
}

export async function deleteEvent(token: string, eventId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/space/my-posts/events/${eventId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete event");
  }
}
