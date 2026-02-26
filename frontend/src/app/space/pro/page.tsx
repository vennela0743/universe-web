"use client";

import { useAuth } from "@/contexts/AuthContext";
import * as proApi from "@/lib/pro-api";
import type { Application, Opportunity } from "@/types/pro";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "../../auth.module.css";

const TYPES = ["hackathon", "project", "research"] as const;
const MAX_DESCRIPTION = 2000;
const MAX_TITLE = 200;
const APPLY_MESSAGE_MAX = 3000;

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const yearOpt = date.getFullYear() === now.getFullYear() ? undefined : "numeric";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: yearOpt });
}

export default function ProSpacePage() {
  const { user, token } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [skillsFilter, setSkillsFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [applyOpportunityId, setApplyOpportunityId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applicantsOpportunityId, setApplicantsOpportunityId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [acceptDeclineError, setAcceptDeclineError] = useState<string | null>(null);
  const [myRooms, setMyRooms] = useState<{ id: string; title: string }[]>([]);

  const [createTitle, setCreateTitle] = useState("");
  const [createType, setCreateType] = useState<string>("project");
  const [createSkills, setCreateSkills] = useState<string[]>([]);
  const [createSkillInput, setCreateSkillInput] = useState("");
  const [createDuration, setCreateDuration] = useState("");
  const [createCommitment, setCreateCommitment] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [opps, apps, rooms] = await Promise.all([
        proApi.listOpportunities(token, {
          type: typeFilter || undefined,
          skills: skillsFilter.trim() ? skillsFilter.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean) : undefined,
        }),
        proApi.listMyApplications(token),
        proApi.listMyRooms(token),
      ]);
      setOpportunities(opps);
      setMyApplications(apps);
      setMyRooms(rooms.map((r) => ({ id: r.id, title: r.title })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load opportunities.");
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter, skillsFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadApplicants = useCallback(async () => {
    if (!token || !applicantsOpportunityId) return;
    setApplicantsLoading(true);
    try {
      const list = await proApi.listApplications(token, applicantsOpportunityId);
      setApplicants(list);
    } catch {
      setApplicants([]);
    } finally {
      setApplicantsLoading(false);
    }
  }, [token, applicantsOpportunityId]);

  useEffect(() => {
    if (applicantsOpportunityId) loadApplicants();
  }, [applicantsOpportunityId, loadApplicants]);

  const myApplicationByOppId = new Map(myApplications.map((a) => [a.opportunityId, a]));

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const title = createTitle.trim();
    if (!title) {
      setCreateError("Title is required.");
      return;
    }
    if (title.length > MAX_TITLE) {
      setCreateError(`Title must be ${MAX_TITLE} characters or less.`);
      return;
    }
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const created = await proApi.createOpportunity(token, {
        title,
        type: createType,
        skillsNeeded: createSkills.length ? createSkills : undefined,
        duration: createDuration.trim() || undefined,
        commitment: createCommitment.trim() || undefined,
        description: createDescription.trim() || undefined,
      });
      setOpportunities((prev) => [created, ...prev]);
      setShowCreate(false);
      setCreateTitle("");
      setCreateType("project");
      setCreateSkills([]);
      setCreateDuration("");
      setCreateCommitment("");
      setCreateDescription("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create opportunity.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const addSkill = () => {
    const s = createSkillInput.trim();
    if (s && !createSkills.includes(s) && createSkills.length < 20) {
      setCreateSkills((prev) => [...prev, s]);
      setCreateSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setCreateSkills((prev) => prev.filter((x) => x !== skill));
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !applyOpportunityId) return;
    const trimmed = applyMessage.trim();
    if (!trimmed) {
      setApplyError("Cover letter or pitch is required.");
      return;
    }
    setApplyError(null);
    setApplySubmitting(true);
    try {
      const app = await proApi.applyToOpportunity(token, applyOpportunityId, trimmed);
      setMyApplications((prev) => [app, ...prev]);
      setApplyOpportunityId(null);
      setApplyMessage("");
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : "Failed to apply.");
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleAccept = async (applicationId: string) => {
    if (!token) return;
    setAcceptDeclineError(null);
    try {
      const app = await proApi.acceptApplication(token, applicationId);
      setApplicants((prev) => prev.map((a) => (a.id === app.id ? app : a)));
      if (app.projectRoomId) {
        setMyRooms((prev) => {
          const opp = opportunities.find((o) => o.id === app.opportunityId);
          return [{ id: app.projectRoomId!, title: opp?.title ?? "Project room" }, ...prev];
        });
      }
      loadApplicants();
    } catch (e) {
      setAcceptDeclineError(e instanceof Error ? e.message : "Failed to accept.");
    }
  };

  const handleDecline = async (applicationId: string) => {
    if (!token) return;
    setAcceptDeclineError(null);
    try {
      const app = await proApi.declineApplication(token, applicationId);
      setApplicants((prev) => prev.map((a) => (a.id === app.id ? app : a)));
      loadApplicants();
    } catch (e) {
      setAcceptDeclineError(e instanceof Error ? e.message : "Failed to decline.");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "640px", margin: "0 auto", padding: "0 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <h1 className={styles.profileUserName} style={{ margin: 0, fontSize: "1.35rem" }}>
          Pro-Space · Opportunities
        </h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {myRooms.length > 0 && (
            <Link
              href="/space/pro/rooms"
              className={styles.authSubmit}
              style={{ padding: "8px 16px", fontSize: "13px", textDecoration: "none" }}
            >
              My rooms ({myRooms.length})
            </Link>
          )}
          <button
            type="button"
            className={styles.authSubmit}
            style={{ padding: "8px 16px", fontSize: "13px" }}
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Cancel" : "Post opportunity"}
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateSubmit} className={styles.profileCard} style={{ marginBottom: "24px" }}>
          <h2 className={styles.authLabel} style={{ marginBottom: "12px" }}>New opportunity</h2>
          <div className={styles.authForm}>
            <div className={styles.authField}>
              <span className={styles.authLabel}>Title</span>
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="e.g. Campus hackathon team"
                className={styles.authInput}
                maxLength={MAX_TITLE}
              />
            </div>
            <div className={styles.authField}>
              <span className={styles.authLabel}>Type</span>
              <select
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
                className={styles.authInput}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className={styles.authField}>
              <span className={styles.authLabel}>Skills (tags)</span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text"
                  value={createSkillInput}
                  onChange={(e) => setCreateSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="Add skill and press Enter"
                  className={styles.authInput}
                  style={{ flex: "1", minWidth: "140px" }}
                />
                <button type="button" onClick={addSkill} className={styles.authSubmit} style={{ padding: "8px 14px" }}>
                  Add
                </button>
              </div>
              {createSkills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {createSkills.map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: "rgba(251, 146, 60, 0.2)",
                        border: "1px solid rgba(251, 146, 60, 0.4)",
                        fontSize: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.authField}>
              <span className={styles.authLabel}>Duration</span>
              <input
                type="text"
                value={createDuration}
                onChange={(e) => setCreateDuration(e.target.value)}
                placeholder="e.g. 2 weeks"
                className={styles.authInput}
              />
            </div>
            <div className={styles.authField}>
              <span className={styles.authLabel}>Commitment</span>
              <input
                type="text"
                value={createCommitment}
                onChange={(e) => setCreateCommitment(e.target.value)}
                placeholder="e.g. 5 hrs/week"
                className={styles.authInput}
              />
            </div>
            <div className={styles.authField}>
              <span className={styles.authLabel}>Description</span>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Describe the opportunity..."
                className={styles.authInput}
                rows={4}
                maxLength={MAX_DESCRIPTION}
                style={{ resize: "vertical" }}
              />
              <span className={styles.profileUserEmail} style={{ fontSize: "11px" }}>{createDescription.length} / {MAX_DESCRIPTION}</span>
            </div>
            {createError && <p className={styles.authError} role="alert">{createError}</p>}
            <button type="submit" disabled={createSubmitting} className={styles.authSubmit}>
              {createSubmitting ? "Creating…" : "Create opportunity"}
            </button>
          </div>
        </form>
      )}

      <div className={styles.profileCard} style={{ marginBottom: "16px", padding: "12px 16px" }}>
        <div className={styles.authLabel} style={{ marginBottom: "8px" }}>Filters</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.authInput}
            style={{ width: "auto", minWidth: "120px" }}
          >
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="text"
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
            placeholder="Filter by skills (comma-separated)"
            className={styles.authInput}
            style={{ flex: "1", minWidth: "180px" }}
          />
        </div>
      </div>

      {loading && (
        <div className={styles.profileCard}>
          <p className={styles.profileUserEmail} style={{ margin: 0 }}>Loading opportunities…</p>
        </div>
      )}
      {!loading && error && (
        <div className={styles.profileCard}>
          <p className={styles.authError} role="alert">{error}</p>
          <button type="button" onClick={() => loadData()} className={styles.authSubmit} style={{ marginTop: 8 }}>Try again</button>
        </div>
      )}
      {!loading && !error && opportunities.length === 0 && (
        <div className={styles.profileCard}>
          <p className={styles.profileUserEmail} style={{ margin: 0 }}>No opportunities yet. Post one to get started.</p>
        </div>
      )}
      {!loading && !error && opportunities.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
          {opportunities.map((opp) => {
            const isOwner = user?.userId === opp.ownerUserId;
            const myApp = myApplicationByOppId.get(opp.id);
            return (
              <li key={opp.id} className={styles.profileCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                  <h3 className={styles.profileUserName} style={{ fontSize: "1rem", margin: 0 }}>{opp.title}</h3>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "rgba(148, 163, 184, 0.2)",
                      color: "#94a3b8",
                      textTransform: "capitalize",
                    }}
                  >
                    {opp.type}
                  </span>
                </div>
                <p className={styles.profileUserEmail} style={{ fontSize: "11px", marginBottom: "8px" }}>
                  {formatTime(opp.createdAt)} · {opp.ownerDisplayName}
                </p>
                {(opp.skillsNeeded?.length ?? 0) > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                    {(opp.skillsNeeded ?? []).map((s) => (
                      <span key={s} style={{ fontSize: "11px", color: "#94a3b8" }}>#{s}</span>
                    ))}
                  </div>
                )}
                {(opp.duration || opp.commitment) && (
                  <p className={styles.profileUserEmail} style={{ fontSize: "12px", marginBottom: "8px" }}>
                    {[opp.duration, opp.commitment].filter(Boolean).join(" · ")}
                  </p>
                )}
                {opp.description && (
                  <p style={{ fontSize: "13px", color: "#e2e8f0", lineHeight: 1.5, whiteSpace: "pre-wrap", marginBottom: "12px" }}>
                    {opp.description.slice(0, 200)}{opp.description.length > 200 ? "…" : ""}
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {isOwner && (
                    <button
                      type="button"
                      className={styles.authSubmit}
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => setApplicantsOpportunityId(opp.id)}
                    >
                      View applicants
                    </button>
                  )}
                  {!isOwner && !myApp && (
                    <button
                      type="button"
                      className={styles.authSubmit}
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => setApplyOpportunityId(opp.id)}
                    >
                      Apply
                    </button>
                  )}
                  {!isOwner && myApp && (
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {myApp.status === "PENDING" && "Applied (pending)"}
                      {myApp.status === "ACCEPTED" && myApp.projectRoomId && (
                        <Link href={`/space/pro/rooms/${myApp.projectRoomId}`} className={styles.authSwitch} style={{ fontWeight: 600 }}>Open project room →</Link>
                      )}
                      {myApp.status === "ACCEPTED" && !myApp.projectRoomId && "Accepted"}
                      {myApp.status === "DECLINED" && "Declined"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {applyOpportunityId && (
        <dialog open aria-label="Apply" style={{ position: "fixed", inset: 0, margin: 0, border: "none", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div className={styles.profileCard} style={{ maxWidth: "480px", width: "100%" }}>
            <h2 className={styles.authLabel} style={{ marginBottom: "12px" }}>Apply</h2>
            <p className={styles.profileUserEmail} style={{ fontSize: "12px", marginBottom: "12px" }}>
              Add a cover letter, pitch, or paste a link to your resume or portfolio. This field is required.
            </p>
            <form onSubmit={handleApplySubmit}>
              <div className={styles.authField} style={{ marginBottom: "12px" }}>
                <span className={styles.authLabel}>Cover letter / pitch (required)</span>
                <textarea
                  value={applyMessage}
                  onChange={(e) => { setApplyMessage(e.target.value); setApplyError(null); }}
                  placeholder="Paste your cover letter, a short pitch, or a link to your resume or portfolio..."
                  className={styles.authInput}
                  rows={5}
                  maxLength={APPLY_MESSAGE_MAX}
                  required
                  aria-required="true"
                  aria-invalid={!!applyError}
                />
                <span className={styles.profileUserEmail} style={{ fontSize: "11px", marginTop: "4px" }}>
                  {applyMessage.length} / {APPLY_MESSAGE_MAX} characters
                </span>
              </div>
              <div className={styles.profileUserEmail} style={{ fontSize: "11px", marginBottom: "8px", fontStyle: "italic" }}>
                Attach document (optional) — file upload coming soon.
              </div>
              {applyError && <p className={styles.authError} style={{ marginBottom: "8px" }}>{applyError}</p>}
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" disabled={applySubmitting || !applyMessage.trim()} className={styles.authSubmit}>
                  {applySubmitting ? "Submitting…" : "Submit application"}
                </button>
                <button type="button" className={styles.profileLogout} style={{ padding: "10px 16px" }} onClick={() => { setApplyOpportunityId(null); setApplyMessage(""); setApplyError(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {applicantsOpportunityId && (
        <dialog open aria-label="Applicants" style={{ position: "fixed", inset: 0, margin: 0, border: "none", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div className={styles.profileCard} style={{ maxWidth: "420px", width: "100%", maxHeight: "85vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h2 className={styles.authLabel} style={{ margin: 0 }}>Applicants</h2>
              <button type="button" className={styles.profileLogout} style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => { setApplicantsOpportunityId(null); setAcceptDeclineError(null); }}>Close</button>
            </div>
            {acceptDeclineError && <p className={styles.authError} style={{ marginBottom: "8px" }}>{acceptDeclineError}</p>}
            {applicantsLoading && <p className={styles.profileUserEmail}>Loading…</p>}
            {!applicantsLoading && applicants.length === 0 && <p className={styles.profileUserEmail}>No applications yet.</p>}
            {!applicantsLoading && applicants.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {applicants.map((app) => (
                  <li key={app.id} style={{ padding: "12px", border: "1px solid rgba(148,163,184,0.2)", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <p className={styles.profileUserName} style={{ fontSize: "0.95rem", margin: 0 }}>{app.applicantDisplayName}</p>
                        <p className={styles.profileUserEmail} style={{ fontSize: "11px", margin: "4px 0 0" }}>{formatTime(app.createdAt)} · {app.status}</p>
                        {app.message && <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "6px" }}>{app.message}</p>}
                      </div>
                      {app.status === "PENDING" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button type="button" className={styles.authSubmit} style={{ padding: "6px 10px", fontSize: "11px" }} onClick={() => handleAccept(app.id)}>Accept</button>
                          <button type="button" className={styles.profileLogout} style={{ padding: "6px 10px", fontSize: "11px" }} onClick={() => handleDecline(app.id)}>Decline</button>
                        </div>
                      )}
                      {app.status === "ACCEPTED" && app.projectRoomId && (
                        <Link href={`/space/pro/rooms/${app.projectRoomId}`} className={styles.authSubmit} style={{ padding: "6px 10px", fontSize: "11px", textDecoration: "none" }}>Open room</Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
}
