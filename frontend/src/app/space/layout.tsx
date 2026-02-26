"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SPACE_HOME_PATH, SPACE_ROUTES } from "./space-nav";
import styles from "../page.module.css";

const ICONS: Record<string, JSX.Element> = {
  home: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  ),
  connect: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <circle cx="9" cy="7" r="3" />
      <circle cx="15" cy="7" r="3" />
      <path d="M3 18v-1a4 4 0 0 1 4-4h2m4 0h2a4 4 0 0 1 4 4v1" />
    </svg>
  ),
  pro: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 20h8M12 18v2" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  dm: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  "my-posts": (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  ),
};

export default function SpaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  useEffect(() => {
    const el = headerRef.current;
    if (el) {
      const update = () => setHeaderHeight(el.offsetHeight);
      update();
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
      if (ro) {
        ro.observe(el);
        return () => ro.disconnect();
      }
    }
  }, []);

  if (!initialized || !user) {
    return (
      <div className={styles.page}>
        <span className={styles.tagline} style={{ margin: "2rem auto", display: "block", textAlign: "center" }}>
          Loading…
        </span>
      </div>
    );
  }

  const universityDisplayName =
    user.universitySpace?.name?.trim() || user.universitySpace?.domain || "UniVerse";

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={styles.page}
      style={
        {
          "--header-height": headerHeight > 0 ? `${headerHeight}px` : undefined,
          "--footer-height": "0px",
        } as React.CSSProperties
      }
    >
      <header className={styles.header} ref={headerRef}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>{universityDisplayName}</div>
          <div className={styles.tagline}>Space Home</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {user.role === "ADMIN" && (
            <Link href="/space/admin/events" className={styles.adminButton}>
              <span className={styles.adminIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <span>Admin</span>
            </Link>
          )}
          <Link href="/profile" className={styles.profileButton}>
            <span className={styles.profileIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <span>{user.displayName}</span>
          </Link>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.taskbar} aria-label="Space navigation">
        <div className={styles.taskbarInner} style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
          <Link 
            href={SPACE_HOME_PATH} 
            className={styles.taskbarItem}
            style={isActive(SPACE_HOME_PATH) ? { background: "rgba(148, 163, 184, 0.14)" } : undefined}
          >
            <span className={styles.taskbarIcon} aria-hidden="true">
              {ICONS.home}
            </span>
            <span className={styles.taskbarLabel}>Home</span>
          </Link>
          {SPACE_ROUTES.map(({ path, label, slug }) => (
            <Link 
              key={path} 
              href={path} 
              className={styles.taskbarItem}
              style={isActive(path) ? { background: "rgba(148, 163, 184, 0.14)" } : undefined}
            >
              <span className={styles.taskbarIcon} aria-hidden="true">
                {ICONS[slug] || ICONS.home}
              </span>
              <span className={styles.taskbarLabel}>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
