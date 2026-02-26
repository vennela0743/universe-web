"use client";

import { useAuth } from "@/contexts/AuthContext";
import * as eventsApi from "@/lib/events-api";
import type { PendingEvent } from "@/lib/events-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "../../../page.module.css";
import authStyles from "../../../auth.module.css";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function AdminEventsPage() {
  const { user, token, initialized } = useAuth();
  const [pending, setPending] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await eventsApi.listPendingEvents(token);
      setPending(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (initialized && token && user?.role === "ADMIN") {
      loadPending();
    }
  }, [initialized, token, user?.role, loadPending]);

  const handleApprove = async (eventId: string) => {
    if (!token) return;
    setActioningId(eventId);
    setError(null);
    try {
      await eventsApi.approveEvent(token, eventId);
      setPending((prev) => prev.filter((e) => e.id !== eventId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve.");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (eventId: string) => {
    if (!token) return;
    setActioningId(eventId);
    setError(null);
    try {
      await eventsApi.rejectEvent(token, eventId);
      setPending((prev) => prev.filter((e) => e.id !== eventId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reject.");
    } finally {
      setActioningId(null);
    }
  };

  if (!initialized || !user) {
    return (
      <div className={styles.panel} style={{ position: "relative", maxWidth: "720px", margin: "24px auto" }}>
        <p style={{ color: "#94a3b8", textAlign: "center" }}>Loading…</p>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className={styles.panel} style={{ position: "relative", maxWidth: "720px", margin: "24px auto" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "8px" }}>Access denied</h1>
        <p style={{ color: "#94a3b8", margin: 0 }}>
          Only admins can review pending events. Your role: {user.role ?? "STUDENT"}.
        </p>
        <Link href="/space/events" style={{ display: "inline-block", marginTop: "16px", color: "#818cf8" }}>
          ← Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "8px" }}>Admin – Pending Events</h1>
      <p style={{ color: "#94a3b8", marginBottom: "20px", fontSize: "14px" }}>
        Review event and hackathon submissions for your university space.
      </p>

      {error && (
        <div className={authStyles.authError} style={{ marginBottom: "16px" }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={loadPending}
          disabled={loading}
          className={authStyles.authSubmit}
          style={{ padding: "10px 20px" }}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
        <Link href="/space/events" className={authStyles.authBack} style={{ padding: "10px 16px", display: "inline-flex", alignItems: "center" }}>
          ← Back to Events
        </Link>
      </div>

      {pending.length === 0 && !loading && (
        <div className={styles.panel} style={{ position: "relative" }}>
          <p style={{ color: "#94a3b8", margin: 0 }}>No pending events to review.</p>
        </div>
      )}

      {pending.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
          {pending.map((ev) => (
            <li key={ev.id} className={styles.panel} style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{ev.title}</h2>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: ev.type === "hackathon" ? "rgba(251,146,60,0.2)" : "rgba(96,165,250,0.2)", color: ev.type === "hackathon" ? "#fb923c" : "#60a5fa" }}>
                  {ev.type}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                Submitted by <strong style={{ color: "#cbd5e1" }}>{ev.submittedByDisplayName ?? "—"}</strong> · {ev.createdAt && formatDate(ev.createdAt)}
              </p>
              {ev.startTime && ev.endTime && (
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                  📅 {formatDate(ev.startTime)} – {formatDate(ev.endTime)}
                </p>
              )}
              {ev.location && <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>📍 {ev.location}</p>}
              {ev.organizerName && <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>Organizer: {ev.organizerName}</p>}
              {ev.description && <p style={{ fontSize: "13px", color: "#e2e8f0", marginBottom: "8px" }}>{ev.description}</p>}
              {ev.supportingDocuments && (
                <div style={{ marginBottom: "12px", padding: "10px", background: "rgba(15,23,42,0.6)", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.2)" }}>
                  <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Supporting documents</span>
                  <p style={{ fontSize: "12px", color: "#cbd5e1", whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{ev.supportingDocuments}</p>
                </div>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className={authStyles.authSubmit}
                  style={{ padding: "8px 14px", fontSize: "12px" }}
                  disabled={actioningId === ev.id}
                  onClick={() => handleApprove(ev.id)}
                >
                  {actioningId === ev.id ? "…" : "Approve"}
                </button>
                <button
                  type="button"
                  className={authStyles.profileLogout}
                  style={{ padding: "8px 14px", fontSize: "12px" }}
                  disabled={actioningId === ev.id}
                  onClick={() => handleReject(ev.id)}
                >
                  {actioningId === ev.id ? "…" : "Reject"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
