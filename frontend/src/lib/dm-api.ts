import { getAuthHeaders } from "@/lib/auth-api";
import type { Conversation, DirectMessage, UserSearchResult } from "@/types/dm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function listConversations(token: string): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/dm/conversations`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please sign in again.");
    throw new Error("Failed to load conversations.");
  }
  return res.json() as Promise<Conversation[]>;
}

export async function startConversation(
  token: string,
  recipientUserId: string,
  message?: string
): Promise<Conversation> {
  const body: { recipientUserId: string; message?: string } = { recipientUserId };
  if (message && message.trim()) {
    body.message = message.trim();
  }
  const res = await fetch(`${API_BASE}/api/dm/conversations`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please sign in again.");
    if (res.status === 404) throw new Error("User not found.");
    if (res.status === 400) {
      const err = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(err.message ?? "Cannot start this conversation.");
    }
    const errorText = await res.text().catch(() => "");
    console.error("Start conversation failed:", res.status, errorText);
    throw new Error(`Failed to start conversation (${res.status}).`);
  }
  return res.json() as Promise<Conversation>;
}

export async function getMessages(
  token: string,
  conversationId: string
): Promise<DirectMessage[]> {
  const res = await fetch(
    `${API_BASE}/api/dm/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please sign in again.");
    if (res.status === 404) throw new Error("Conversation not found.");
    if (res.status === 403) throw new Error("Access denied.");
    throw new Error("Failed to load messages.");
  }
  return res.json() as Promise<DirectMessage[]>;
}

export async function sendMessage(
  token: string,
  conversationId: string,
  content: string
): Promise<DirectMessage> {
  const res = await fetch(
    `${API_BASE}/api/dm/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ content }),
    }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please sign in again.");
    if (res.status === 404) throw new Error("Conversation not found.");
    if (res.status === 403) throw new Error("Access denied.");
    throw new Error("Failed to send message.");
  }
  return res.json() as Promise<DirectMessage>;
}

export async function searchUsers(
  token: string,
  query: string
): Promise<UserSearchResult[]> {
  const res = await fetch(
    `${API_BASE}/api/dm/users/search?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
    }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please sign in again.");
    throw new Error("Failed to search users.");
  }
  return res.json() as Promise<UserSearchResult[]>;
}
