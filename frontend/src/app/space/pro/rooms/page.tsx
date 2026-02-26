"use client";

import { useAuth } from "@/contexts/AuthContext";
import * as proApi from "@/lib/pro-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "../../../auth.module.css";

export default function ProRoomsListPage() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await proApi.listMyRooms(token);
      setRooms(list.map((r) => ({ id: r.id, title: r.title })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load rooms.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ width: "100%", maxWidth: "520px", margin: "0 auto", padding: "0 16px 80px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/space/pro" className={styles.authBack} style={{ display: "inline-block", marginBottom: "8px" }}>← Pro-Space</Link>
        <h1 className={styles.profileUserName} style={{ margin: 0, fontSize: "1.25rem" }}>My project rooms</h1>
      </div>
      {loading && <div className={styles.profileCard}><p className={styles.profileUserEmail} style={{ margin: 0 }}>Loading…</p></div>}
      {!loading && error && (
        <div className={styles.profileCard}>
          <p className={styles.authError}>{error}</p>
          <button type="button" onClick={load} className={styles.authSubmit} style={{ marginTop: 8 }}>Try again</button>
        </div>
      )}
      {!loading && !error && rooms.length === 0 && (
        <div className={styles.profileCard}>
          <p className={styles.profileUserEmail} style={{ margin: 0 }}>You’re not in any project rooms yet. Apply to an opportunity and get accepted to join one.</p>
          <Link href="/space/pro" className={styles.authSubmit} style={{ display: "inline-block", marginTop: 12, textDecoration: "none" }}>Browse opportunities</Link>
        </div>
      )}
      {!loading && !error && rooms.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          {rooms.map((r) => (
            <li key={r.id}>
              <Link href={`/space/pro/rooms/${r.id}`} className={styles.profileCard} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                <span className={styles.profileUserName} style={{ fontSize: "1rem" }}>{r.title}</span>
                <span className={styles.profileUserEmail} style={{ fontSize: "12px", marginLeft: "8px" }}>→ Open room</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
