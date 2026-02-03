"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "../auth.module.css";

export default function ProfilePage() {
  const { user, logout, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className={styles.authPage}>
        <span className={styles.authTagline} style={{ marginTop: "2rem" }}>
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <header className={styles.profileTopBar}>
        <Link href="/">← Home</Link>
        <span className={styles.profileTitle}>Profile</span>
        <span style={{ width: 48 }} aria-hidden="true" />
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
        }}
      >
        <div className={styles.profileCard}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className={styles.profileAvatar}>
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={styles.profileUserName}>{user.displayName}</p>
              <p className={styles.profileUserEmail}>{user.email}</p>
            </div>
          </div>
          <p className={styles.profileUserId}>User ID: {user.userId}</p>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className={styles.profileLogout}
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
