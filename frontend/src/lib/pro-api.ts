import { getAuthHeaders } from "@/lib/auth-api";
import type {
  Application,
  Opportunity,
  ProjectRoom,
  RoomChatMessage,
  RoomUpdate,
} from "@/types/pro";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function checkAuth(res: Response) {
  if (res.status === 401) throw new Error("Please sign in again.");
}

export async function listOpportunities(
  token: string,
  params?: { type?: string; skills?: string[] }
): Promise<Opportunity[]> {
  const url = new URL(`${API_BASE}/api/space/pro/opportunities`);
  if (params?.type) url.searchParams.set("type", params.type);
  if (params?.skills?.length)
    params.skills.forEach((s) => url.searchParams.append("skills", s));
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  checkAuth(res);
  if (!res.ok) throw new Error("Could not load opportunities.");
  return res.json() as Promise<Opportunity[]>;
}

export async function getOpportunity(
  token: string,
  opportunityId: string
): Promise<Opportunity> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/opportunities/${encodeURIComponent(opportunityId)}`,
    { method: "GET", headers: getAuthHeaders(token) }
  );
  checkAuth(res);
  if (!res.ok) throw new Error("Opportunity not found.");
  return res.json() as Promise<Opportunity>;
}

export async function createOpportunity(
  token: string,
  body: {
    title: string;
    type: string;
    skillsNeeded?: string[];
    duration?: string;
    commitment?: string;
    description?: string;
  }
): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}/api/space/pro/opportunities`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  checkAuth(res);
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message ?? "Failed to create opportunity.");
  }
  return res.json() as Promise<Opportunity>;
}

export async function applyToOpportunity(
  token: string,
  opportunityId: string,
  message: string
): Promise<Application> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Cover letter or pitch is required.");
  const res = await fetch(
    `${API_BASE}/api/space/pro/opportunities/${encodeURIComponent(opportunityId)}/apply`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ message: trimmed }),
    }
  );
  checkAuth(res);
  if (!res.ok) {
    if (res.status === 400) {
      const data = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(data.message ?? "Cannot apply.");
    }
    throw new Error("Failed to apply.");
  }
  return res.json() as Promise<Application>;
}

export async function listMyApplications(token: string): Promise<Application[]> {
  const res = await fetch(`${API_BASE}/api/space/pro/applications/me`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  checkAuth(res);
  if (!res.ok) throw new Error("Could not load your applications.");
  return res.json() as Promise<Application[]>;
}

export async function listApplications(
  token: string,
  opportunityId: string
): Promise<Application[]> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/opportunities/${encodeURIComponent(opportunityId)}/applications`,
    { method: "GET", headers: getAuthHeaders(token) }
  );
  checkAuth(res);
  if (!res.ok) throw new Error("Could not load applications.");
  return res.json() as Promise<Application[]>;
}

export async function acceptApplication(
  token: string,
  applicationId: string
): Promise<Application> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/applications/${encodeURIComponent(applicationId)}/accept`,
    { method: "POST", headers: getAuthHeaders(token) }
  );
  checkAuth(res);
  if (!res.ok) {
    if (res.status === 403) throw new Error("You cannot accept this application.");
    if (res.status === 404) throw new Error("Application not found.");
    throw new Error("Failed to accept.");
  }
  return res.json() as Promise<Application>;
}

export async function declineApplication(
  token: string,
  applicationId: string
): Promise<Application> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/applications/${encodeURIComponent(applicationId)}/decline`,
    { method: "POST", headers: getAuthHeaders(token) }
  );
  checkAuth(res);
  if (!res.ok) {
    if (res.status === 403) throw new Error("You cannot decline this application.");
    if (res.status === 404) throw new Error("Application not found.");
    throw new Error("Failed to decline.");
  }
  return res.json() as Promise<Application>;
}

export async function listMyRooms(token: string): Promise<ProjectRoom[]> {
  const res = await fetch(`${API_BASE}/api/space/pro/rooms`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
  checkAuth(res);
  if (!res.ok) throw new Error("Could not load rooms.");
  return res.json() as Promise<ProjectRoom[]>;
}

export async function getRoom(
  token: string,
  roomId: string
): Promise<ProjectRoom> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/rooms/${encodeURIComponent(roomId)}`,
    { method: "GET", headers: getAuthHeaders(token) }
  );
  checkAuth(res);
  if (!res.ok) {
    if (res.status === 403) throw new Error("You are not a member of this room.");
    if (res.status === 404) throw new Error("Room not found.");
    throw new Error("Could not load room.");
  }
  return res.json() as Promise<ProjectRoom>;
}

export async function getChatMessages(
  token: string,
  roomId: string
): Promise<RoomChatMessage[]> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/rooms/${encodeURIComponent(roomId)}/chat`,
    { method: "GET", headers: getAuthHeaders(token) }
  );
  checkAuth(res);
  if (!res.ok) throw new Error("Could not load chat.");
  return res.json() as Promise<RoomChatMessage[]>;
}

export async function sendChatMessage(
  token: string,
  roomId: string,
  content: string
): Promise<RoomChatMessage> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/rooms/${encodeURIComponent(roomId)}/chat`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ content }),
    }
  );
  checkAuth(res);
  if (!res.ok) throw new Error("Failed to send message.");
  return res.json() as Promise<RoomChatMessage>;
}

export async function getRoomUpdates(
  token: string,
  roomId: string
): Promise<RoomUpdate[]> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/rooms/${encodeURIComponent(roomId)}/updates`,
    { method: "GET", headers: getAuthHeaders(token) }
  );
  checkAuth(res);
  if (!res.ok) throw new Error("Could not load updates.");
  return res.json() as Promise<RoomUpdate[]>;
}

export async function postRoomUpdate(
  token: string,
  roomId: string,
  content: string
): Promise<RoomUpdate> {
  const res = await fetch(
    `${API_BASE}/api/space/pro/rooms/${encodeURIComponent(roomId)}/updates`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ content }),
    }
  );
  checkAuth(res);
  if (!res.ok) throw new Error("Failed to post update.");
  return res.json() as Promise<RoomUpdate>;
}
