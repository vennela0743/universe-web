import { getAuthHeaders } from "@/lib/auth-api";
import type { SpaceEvent } from "@/types/events";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function listEvents(token: string, params?: { type?: string }): Promise<SpaceEvent[]> {
  const url = new URL(`${API_BASE}/api/space/events`);
  if (params?.type) url.searchParams.set("type", params.type);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  if (res.status === 401) throw new Error("Please sign in again.");
  if (!res.ok) throw new Error("Could not load events.");
  return res.json() as Promise<SpaceEvent[]>;
}

export interface CreateEventBody {
  title: string;
  description?: string;
  type: "event" | "hackathon";
  startTime: string; // ISO
  endTime: string;   // ISO
  location?: string;
  organizerName?: string;
  supportingDocuments: string;
}

export async function createEvent(token: string, body: CreateEventBody): Promise<SpaceEvent> {
  const res = await fetch(`${API_BASE}/api/space/events`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("Please sign in again.");
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message ?? "Failed to submit event.");
  }
  return res.json() as Promise<SpaceEvent>;
}

export interface PendingEvent extends SpaceEvent {
  status: string;
  submittedByDisplayName?: string;
  supportingDocuments?: string;
}

export async function listPendingEvents(token: string): Promise<PendingEvent[]> {
  const res = await fetch(`${API_BASE}/api/admin/events/pending`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  if (res.status === 401) throw new Error("Please sign in again.");
  if (res.status === 403) throw new Error("Access denied. Admin only.");
  if (!res.ok) throw new Error("Could not load pending events.");
  return res.json() as Promise<PendingEvent[]>;
}

export async function approveEvent(token: string, eventId: string): Promise<SpaceEvent> {
  const res = await fetch(`${API_BASE}/api/admin/events/${encodeURIComponent(eventId)}/approve`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  if (res.status === 401) throw new Error("Please sign in again.");
  if (res.status === 403) throw new Error("Access denied. Admin only.");
  if (!res.ok) throw new Error("Failed to approve.");
  return res.json() as Promise<SpaceEvent>;
}

export async function rejectEvent(token: string, eventId: string): Promise<SpaceEvent> {
  const res = await fetch(`${API_BASE}/api/admin/events/${encodeURIComponent(eventId)}/reject`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  if (res.status === 401) throw new Error("Please sign in again.");
  if (res.status === 403) throw new Error("Access denied. Admin only.");
  if (!res.ok) throw new Error("Failed to reject.");
  return res.json() as Promise<SpaceEvent>;
}
