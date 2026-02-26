"use client";

import { useAuth } from "@/contexts/AuthContext";
import * as proApi from "@/lib/pro-api";
import type { ProjectRoom, RoomChatMessage, RoomUpdate } from "@/types/pro";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../../../../auth.module.css";

const MAX_CHAT_LENGTH = 2000;
const MAX_UPDATE_LENGTH = 2000;

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ProjectRoomPage() {
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const [room, setRoom] = useState<ProjectRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [updates, setUpdates] = useState<RoomUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [updateInput, setUpdateInput] = useState("");
  const [updateSending, setUpdateSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadRoom = useCallback(async () => {
    if (!token || !roomId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await proApi.getRoom(token, roomId);
      setRoom(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load room.");
      if (e instanceof Error && e.message.includes("not a member")) {
        router.replace("/space/pro");
      }
    } finally {
      setLoading(false);
    }
  }, [token, roomId, router]);

  const loadChat = useCallback(async () => {
    if (!token || !roomId) return;
    try {
      const list = await proApi.getChatMessages(token, roomId);
      setChatMessages(list);
    } catch {
      setChatMessages([]);
    }
  }, [token, roomId]);

  const loadUpdates = useCallback(async () => {
    if (!token || !roomId) return;
    try {
      const list = await proApi.getRoomUpdates(token, roomId);
      setUpdates(list);
    } catch {
      setUpdates([]);
    }
  }, [token, roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    if (!room) return;
    loadChat();
    loadUpdates();
  }, [room, loadChat, loadUpdates]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!token || !roomId || !text || chatSending) return;
    setChatSending(true);
    try {
      const msg = await proApi.sendChatMessage(token, roomId, text);
      setChatMessages((prev) => [...prev, msg]);
      setChatInput("");
    } catch {
      // keep input
    } finally {
      setChatSending(false);
    }
  };

  const postUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = updateInput.trim();
    if (!token || !roomId || !text || updateSending) return;
    setUpdateSending(true);
    try {
      const u = await proApi.postRoomUpdate(token, roomId, text);
      setUpdates((prev) => [u, ...prev]);
      setUpdateInput("");
    } catch {
      // keep input
    } finally {
      setUpdateSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px 16px", maxWidth: "720px", margin: "0 auto" }}>
        <p className={styles.profileUserEmail}>Loading room…</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div style={{ padding: "24px 16px", maxWidth: "720px", margin: "0 auto" }}>
        <p className={styles.authError}>{error ?? "Room not found."}</p>
        <Link href="/space/pro" className={styles.authBack}>← Back to Pro-Space</Link>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "720px", margin: "0 auto", padding: "0 16px 80px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/space/pro/rooms" className={styles.authBack} style={{ display: "inline-block", marginBottom: "8px" }}>← My rooms</Link>
        <h1 className={styles.profileUserName} style={{ margin: 0, fontSize: "1.25rem" }}>{room.title}</h1>
      </div>

      <div className={styles.profileCard} style={{ marginBottom: "20px", padding: "16px" }}>
        <h2 className={styles.authLabel} style={{ marginBottom: "12px", fontSize: "0.9rem" }}>Members</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          {room.members?.map((m) => (
            <li key={m.userId} className={styles.profileUserEmail} style={{ fontSize: "13px" }}>
              {m.displayName}
              {user?.userId === m.userId && " (you)"}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.profileCard} style={{ marginBottom: "20px", padding: "16px" }}>
        <h2 className={styles.authLabel} style={{ marginBottom: "12px", fontSize: "0.9rem" }}>Chat</h2>
        <div style={{ maxHeight: "280px", overflowY: "auto", marginBottom: "12px", minHeight: "120px" }}>
          {chatMessages.length === 0 && (
            <p className={styles.profileUserEmail} style={{ fontSize: "12px", margin: 0 }}>No messages yet.</p>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: "10px" }}>
              <span className={styles.authLabel} style={{ fontSize: "11px", marginRight: "6px" }}>{msg.authorDisplayName}</span>
              <span className={styles.profileUserEmail} style={{ fontSize: "11px" }}>{formatTime(msg.createdAt)}</span>
              <p style={{ fontSize: "13px", color: "#e2e8f0", margin: "2px 0 0", wordBreak: "break-word" }}>{msg.content}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendChat} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value.slice(0, MAX_CHAT_LENGTH))}
            placeholder="Type a message..."
            className={styles.authInput}
            style={{ flex: 1 }}
            maxLength={MAX_CHAT_LENGTH}
            disabled={chatSending}
          />
          <button type="submit" disabled={chatSending || !chatInput.trim()} className={styles.authSubmit} style={{ padding: "10px 16px" }}>
            {chatSending ? "…" : "Send"}
          </button>
        </form>
      </div>

      <div className={styles.profileCard} style={{ padding: "16px" }}>
        <h2 className={styles.authLabel} style={{ marginBottom: "12px", fontSize: "0.9rem" }}>Updates</h2>
        <form onSubmit={postUpdate} style={{ marginBottom: "16px" }}>
          <textarea
            value={updateInput}
            onChange={(e) => setUpdateInput(e.target.value.slice(0, MAX_UPDATE_LENGTH))}
            placeholder="Share an update..."
            className={styles.authInput}
            rows={2}
            maxLength={MAX_UPDATE_LENGTH}
            disabled={updateSending}
            style={{ resize: "vertical", marginBottom: "8px" }}
          />
          <button type="submit" disabled={updateSending || !updateInput.trim()} className={styles.authSubmit} style={{ padding: "8px 14px", fontSize: "13px" }}>
            {updateSending ? "Posting…" : "Post update"}
          </button>
        </form>
        <div>
          {updates.length === 0 && (
            <p className={styles.profileUserEmail} style={{ fontSize: "12px", margin: 0 }}>No updates yet.</p>
          )}
          {updates.map((u) => (
            <div key={u.id} style={{ padding: "10px 0", borderTop: "1px solid rgba(148,163,184,0.15)" }}>
              <span className={styles.authLabel} style={{ fontSize: "11px", marginRight: "6px" }}>{u.authorDisplayName}</span>
              <span className={styles.profileUserEmail} style={{ fontSize: "11px" }}>{formatTime(u.createdAt)}</span>
              <p style={{ fontSize: "13px", color: "#e2e8f0", margin: "4px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{u.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
