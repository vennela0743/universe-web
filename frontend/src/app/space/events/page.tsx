"use client";

import { useAuth } from "@/contexts/AuthContext";
import * as eventsApi from "@/lib/events-api";
import type { SpaceEvent } from "@/types/events";
import { useCallback, useEffect, useState } from "react";
import styles from "../../auth.module.css";

function formatEventDate(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  const dateStr = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const timeStr = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const endTimeStr = end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) {
    return `${dateStr} · ${timeStr} – ${endTimeStr}`;
  }
  const endDateStr = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${dateStr} ${timeStr} – ${endDateStr} ${endTimeStr}`;
}

const SUPPORTING_DOCS_MAX = 3000;

export default function EventsSpacePage() {
  const { token } = useAuth();
  const [events, setEvents] = useState<SpaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addType, setAddType] = useState<"event" | "hackathon">("event");
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [addLocation, setAddLocation] = useState("");
  const [addOrganizer, setAddOrganizer] = useState("");
  const [addSupportingDocs, setAddSupportingDocs] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await eventsApi.listEvents(token, typeFilter ? { type: typeFilter } : undefined);
      setEvents(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const trimmedDocs = addSupportingDocs.trim();
    if (!trimmedDocs) {
      setAddError("Supporting documents are required (e.g. approval letter, venue booking, or links).");
      return;
    }
    const startIso = addStart ? new Date(addStart).toISOString() : "";
    const endIso = addEnd ? new Date(addEnd).toISOString() : "";
    if (!addTitle.trim()) {
      setAddError("Title is required.");
      return;
    }
    if (!startIso || !endIso) {
      setAddError("Start and end date/time are required.");
      return;
    }
    if (new Date(addEnd) <= new Date(addStart)) {
      setAddError("End must be after start.");
      return;
    }
    setAddError(null);
    setAddSubmitting(true);
    try {
      await eventsApi.createEvent(token, {
        title: addTitle.trim(),
        description: addDescription.trim() || undefined,
        type: addType,
        startTime: startIso,
        endTime: endIso,
        location: addLocation.trim() || undefined,
        organizerName: addOrganizer.trim() || undefined,
        supportingDocuments: trimmedDocs,
      });
      setSubmitSuccess("Submitted for review. An admin will review your request and the event will go live once approved.");
      setShowAddForm(false);
      setAddTitle("");
      setAddDescription("");
      setAddStart("");
      setAddEnd("");
      setAddLocation("");
      setAddOrganizer("");
      setAddSupportingDocs("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to submit.");
    } finally {
      setAddSubmitting(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "960px", margin: "0 auto", padding: "0 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h1 className={styles.profileUserName} style={{ margin: 0, fontSize: "1.35rem" }}>
            Event Space
          </h1>
          <p className={styles.profileUserEmail} style={{ marginTop: "4px", fontSize: "13px" }}>
            Hackathons and campus events in your university space.
          </p>
        </div>
        <button
          type="button"
          className={styles.authSubmit}
          style={{ padding: "8px 16px", fontSize: "13px" }}
          onClick={() => { setShowAddForm(true); setAddError(null); setSubmitSuccess(null); }}
        >
          Add event / hackathon
        </button>
      </div>

      {submitSuccess && (
        <div className={styles.profileCard} style={{ marginBottom: "16px", padding: "12px 16px", borderColor: "rgba(34, 197, 94, 0.4)", background: "rgba(34, 197, 94, 0.1)" }}>
          <p style={{ margin: 0, color: "#86efac", fontSize: "13px" }}>{submitSuccess}</p>
        </div>
      )}

      <div className={styles.profileCard} style={{ marginBottom: "16px", padding: "12px 16px" }}>
        <div className={styles.authLabel} style={{ marginBottom: "8px" }}>Filter</div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={styles.authInput}
          style={{ width: "100%", maxWidth: "200px" }}
        >
          <option value="">All (events & hackathons)</option>
          <option value="event">Events</option>
          <option value="hackathon">Hackathons</option>
        </select>
      </div>

      {loading && (
        <div className={styles.profileCard}>
          <p className={styles.profileUserEmail} style={{ margin: 0 }}>Loading events…</p>
        </div>
      )}
      {!loading && error && (
        <div className={styles.profileCard}>
          <p className={styles.authError} role="alert">{error}</p>
          <button type="button" onClick={() => loadEvents()} className={styles.authSubmit} style={{ marginTop: 8 }}>
            Try again
          </button>
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className={styles.profileCard}>
          <p className={styles.profileUserEmail} style={{ margin: 0 }}>No events right now. Check back later.</p>
        </div>
      )}
      {!loading && !error && events.length > 0 && (
        <ul
          className={styles.eventsGrid}
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {events.map((ev) => (
            <li key={ev.id} className={styles.profileCard} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                <h2 className={styles.profileUserName} style={{ fontSize: "0.95rem", margin: 0, lineHeight: 1.3 }}>{ev.title}</h2>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: ev.type === "hackathon" ? "rgba(251, 146, 60, 0.25)" : "rgba(148, 163, 184, 0.2)",
                    color: ev.type === "hackathon" ? "#fbbf24" : "#94a3b8",
                    textTransform: "capitalize",
                    flexShrink: 0,
                  }}
                >
                  {ev.type}
                </span>
              </div>
              <p className={styles.profileUserEmail} style={{ fontSize: "11px", marginBottom: "6px" }}>
                {formatEventDate(ev.startTime, ev.endTime)}
              </p>
              {ev.location && (
                <p className={styles.profileUserEmail} style={{ fontSize: "11px", marginBottom: "4px" }}>
                  📍 {ev.location}
                </p>
              )}
              {ev.organizerName && (
                <p className={styles.profileUserEmail} style={{ fontSize: "10px", marginBottom: "6px" }}>
                  By {ev.organizerName}
                </p>
              )}
              {ev.description && (
                <p style={{ fontSize: "12px", color: "#e2e8f0", lineHeight: 1.45, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
                  {ev.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {showAddForm && (
        <dialog open aria-label="Add event or hackathon" style={{ position: "fixed", inset: 0, margin: 0, border: "none", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div className={styles.profileCard} style={{ maxWidth: "480px", width: "100%", maxHeight: "90vh", overflow: "auto" }}>
            <h2 className={styles.authLabel} style={{ marginBottom: "8px" }}>Add event or hackathon</h2>
            <p className={styles.profileUserEmail} style={{ fontSize: "12px", marginBottom: "16px" }}>
              Your submission will be reviewed by an admin. Supporting documents (e.g. approval letter, venue booking, or links) are required.
            </p>
            <form onSubmit={handleAddSubmit}>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>Title *</span>
                <input type="text" value={addTitle} onChange={(e) => setAddTitle(e.target.value)} className={styles.authInput} placeholder="Event title" maxLength={200} required />
              </div>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>Type *</span>
                <select value={addType} onChange={(e) => setAddType(e.target.value as "event" | "hackathon")} className={styles.authInput}>
                  <option value="event">Event</option>
                  <option value="hackathon">Hackathon</option>
                </select>
              </div>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>Start date & time *</span>
                <input type="datetime-local" value={addStart} onChange={(e) => setAddStart(e.target.value)} className={styles.authInput} required />
              </div>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>End date & time *</span>
                <input type="datetime-local" value={addEnd} onChange={(e) => setAddEnd(e.target.value)} className={styles.authInput} required />
              </div>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>Location</span>
                <input type="text" value={addLocation} onChange={(e) => setAddLocation(e.target.value)} className={styles.authInput} placeholder="e.g. Main Hall" maxLength={200} />
              </div>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>Organizer name</span>
                <input type="text" value={addOrganizer} onChange={(e) => setAddOrganizer(e.target.value)} className={styles.authInput} placeholder="e.g. CS Department" maxLength={200} />
              </div>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>Description</span>
                <textarea value={addDescription} onChange={(e) => setAddDescription(e.target.value)} className={styles.authInput} rows={2} maxLength={2000} placeholder="What's it about?" style={{ resize: "vertical" }} />
              </div>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>Supporting documents *</span>
                <textarea value={addSupportingDocs} onChange={(e) => setAddSupportingDocs(e.target.value)} className={styles.authInput} rows={4} maxLength={SUPPORTING_DOCS_MAX} placeholder="Paste links or describe your approval letter, venue booking, or other proof. Required for admin review." style={{ resize: "vertical" }} required />
                <span className={styles.profileUserEmail} style={{ fontSize: "11px" }}>{addSupportingDocs.length} / {SUPPORTING_DOCS_MAX}</span>
              </div>
              {addError && <p className={styles.authError} style={{ marginBottom: "8px" }}>{addError}</p>}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="submit" disabled={addSubmitting} className={styles.authSubmit}>
                  {addSubmitting ? "Submitting…" : "Submit for review"}
                </button>
                <button type="button" className={styles.profileLogout} style={{ padding: "10px 16px" }} onClick={() => { setShowAddForm(false); setAddError(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
