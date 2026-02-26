"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

const spaces = [
  {
    title: "Connect Space",
    description: "Talk, share, and express freely.",
    short: "Connect",
    path: "/space/connect",
    planet: { name: "Mercury", color: "#9ca3af", size: 80 },
  },
  {
    title: "Pro-Space",
    description: "Turn ideas into projects.",
    short: "Pro",
    path: "/space/pro",
    planet: { name: "Venus", color: "#facc15", size: 74 },
  },
  {
    title: "Event Space",
    description: "Hackathons and campus events.",
    short: "Events",
    path: "/space/events",
    planet: { name: "Earth", color: "#38bdf8", size: 78 },
  },
  {
    title: "DM / Chat",
    description: "1:1 or small-group messaging.",
    short: "DM",
    path: "/space/dm",
    planet: { name: "Mars", color: "#ef4444", size: 90 },
  },
];

export default function Home() {
  const { user } = useAuth();
  const [angle, setAngle] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const raf = useRef<number | null>(null);
  const autoSpin = useRef(true);
  const lastTime = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const systemRef = useRef<HTMLDivElement | null>(null);
  const [orbit, setOrbit] = useState({ x: 220, y: 120 });
  const [layoutHeights, setLayoutHeights] = useState({
    header: 0,
    footer: 0,
  });
  const maxPlanetSize = useMemo(
    () => Math.max(...spaces.map((space) => space.planet.size)),
    []
  );

  const step = 360 / spaces.length;
  const activeIndex = useMemo(() => {
    const normalized = ((-angle + 90) % 360 + 360) % 360;
    return Math.round(normalized / step) % spaces.length;
  }, [angle, step]);

  const handlePointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = event.clientX;
    velocity.current = 0;
    autoSpin.current = false;
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = event.clientX - lastX.current;
    lastX.current = event.clientX;
    velocity.current = delta;
    setAngle((prev) => prev + delta * 0.35);
  };

  const handlePointerUp = () => {
    dragging.current = false;
    startInertia();
  };

  const handleWheel = (event: React.WheelEvent) => {
    setAngle((prev) => prev + event.deltaY * 0.2);
    velocity.current = event.deltaY * 0.2;
    startInertia();
  };

  const snapToNearest = (currentAngle: number) => {
    return Math.round(currentAngle / step) * step;
  };

  const startInertia = () => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }

    const animate = () => {
      velocity.current *= 0.92;
      setAngle((prev) => prev + velocity.current);
      if (Math.abs(velocity.current) > 0.1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        raf.current = null;
        setAngle((prev) => snapToNearest(prev));
      }
    };

    if (Math.abs(velocity.current) > 0.1) {
      raf.current = requestAnimationFrame(animate);
    } else {
      setAngle((prev) => snapToNearest(prev));
      autoSpin.current = true;
    }
  };

  useEffect(() => {
    let animationFrame: number;

    const tick = (timestamp: number) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const deltaMs = timestamp - lastTime.current;
      lastTime.current = timestamp;

      if (autoSpin.current && !dragging.current && Math.abs(velocity.current) < 0.1) {
        setAngle((prev) => prev + deltaMs * 0.015);
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const updateOrbit = () => {
      if (!systemRef.current) return;
      const rect = systemRef.current.getBoundingClientRect();
      const padding = 2;
      const maxRadius = maxPlanetSize / 2;
      const baseX = rect.width / 2 - maxRadius - padding;
      const baseY = rect.height / 2 - maxRadius - padding;

      setOrbit({
        x: Math.max(0, baseX * 1.05),
        y: Math.max(0, baseY * 0.62),
      });
    };

    updateOrbit();

    const el = systemRef.current;
    if (!el) return;

    const g = globalThis as unknown as {
      ResizeObserver?: typeof ResizeObserver;
      addEventListener?: (type: string, listener: () => void) => void;
      removeEventListener?: (type: string, listener: () => void) => void;
    };

    if (g.ResizeObserver !== undefined) {
      const ro = new g.ResizeObserver(() => updateOrbit());
      ro.observe(el);
      return () => ro.disconnect();
    }

    g.addEventListener?.("resize", updateOrbit);
    return () => g.removeEventListener?.("resize", updateOrbit);
  }, [maxPlanetSize]);

  useEffect(() => {
    const headerEl = headerRef.current;
    const footerEl = footerRef.current;
    if (!headerEl || !footerEl) return;

    const update = () => {
      setLayoutHeights({
        header: headerEl.offsetHeight,
        footer: footerEl.offsetHeight,
      });
    };

    update();

    const g = globalThis as unknown as { ResizeObserver?: typeof ResizeObserver };
    if (g.ResizeObserver) {
      const ro = new g.ResizeObserver(() => update());
      ro.observe(headerEl);
      ro.observe(footerEl);
      return () => ro.disconnect();
    }
  }, []);

  const pageVars = useMemo(() => {
    const vars = {} as CSSProperties & Record<string, string>;
    if (layoutHeights.header > 0)
      vars["--header-height"] = `${layoutHeights.header}px`;
    if (layoutHeights.footer > 0)
      vars["--footer-height"] = `${layoutHeights.footer}px`;
    return vars;
  }, [layoutHeights.header, layoutHeights.footer]);

  return (
    <div className={styles.page} style={pageVars}>
      <header className={styles.header} ref={headerRef}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>UniVerse</div>
          <div className={styles.tagline}>
            From Conversations to Collaborations
          </div>
        </div>
        {user ? (
          <Link href="/profile" className={styles.profileButton}>
            <span className={styles.profileIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <span>{user.displayName}</span>
          </Link>
        ) : (
          <Link href="/login" className={styles.profileButton}>
            <span className={styles.profileIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <span>Login</span>
          </Link>
        )}
      </header>

      <main className={styles.main}>
        <section
          className={styles.system}
          aria-label="UniVerse spaces"
          ref={systemRef}
          style={
            {
              "--orbit-x": `${orbit.x}px`,
              "--orbit-y": `${orbit.y}px`,
            } as CSSProperties
          }
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          <div className={styles.orbit} aria-hidden="true" />
          <div className={styles.sun} aria-label="UniVerse logo">
            UniVerse
          </div>
          {(() => {
            const theta = ((activeIndex * step + angle) * Math.PI) / 180;
            const x = Math.cos(theta) * orbit.x;
            const y = Math.sin(theta) * orbit.y;
            return (
              <div
                className={styles.activeLabel}
                aria-live="polite"
                style={
                  {
                    "--tx": `${x}px`,
                    "--ty": `${y}px`,
                  } as CSSProperties
                }
              >
                <div className={styles.activeTitle}>
                  {spaces[activeIndex].short}
                </div>
                <div className={styles.activeDesc}>
                  {spaces[activeIndex].description}
                </div>
              </div>
            );
          })()}
          {spaces.map((space, index) => {
            const theta = ((index * step + angle) * Math.PI) / 180;
            const x = Math.cos(theta) * orbit.x;
            const y = Math.sin(theta) * orbit.y;
            const depth = (1 - Math.sin(theta)) / 2;
            const scale = 0.7 + 0.4 * depth;
            return (
              <button
                key={space.title}
                type="button"
                className={`${styles.planet} ${
                  index === activeIndex ? styles.active : ""
                }`}
                style={
                  {
                    "--tx": `${x}px`,
                    "--ty": `${y}px`,
                    "--planet-color": space.planet.color,
                    "--planet-size": `${space.planet.size}px`,
                    "--planet-scale": scale,
                  } as CSSProperties
                }
                onClick={() => setSelectedIndex(index)}
                aria-label={`${space.title} (${space.planet.name})`}
              >
                <span className={styles.planetBody} aria-hidden="true" />
                <span className={styles.planetShort}>{space.short}</span>
              </button>
            );
          })}
        </section>
      </main>

      {selectedIndex !== null && (
        <section className={styles.panel} aria-live="polite">
          <div className={styles.panelHeader}>
            <div>
              <h2>{spaces[selectedIndex].title}</h2>
              <p>{spaces[selectedIndex].description}</p>
            </div>
            <button
              type="button"
              className={styles.panelClose}
              onClick={() => setSelectedIndex(null)}
            >
              Close
            </button>
          </div>
          <div className={styles.panelBody}>
            <Link href={spaces[selectedIndex].path} className={styles.taskbarLabel} style={{ fontWeight: 600, color: "var(--planet-color, #facc15)" }}>
              Enter {spaces[selectedIndex].short} →
            </Link>
          </div>
        </section>
      )}

      <footer className={styles.footer} ref={footerRef}>
        <div className={styles.footerInner}>
          Campus‑only social universe for students to connect, collaborate, and
          grow together.
        </div>
      </footer>

      <nav className={styles.taskbar} aria-label="Bottom taskbar">
        <div className={styles.taskbarInner}>
          <Link href="/" className={styles.taskbarItem}>
            <span className={styles.taskbarIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
              </svg>
            </span>
            <span className={styles.taskbarLabel}>Home</span>
          </Link>
          <Link href="/space" className={styles.taskbarItem}>
            <span className={styles.taskbarIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
              </svg>
            </span>
            <span className={styles.taskbarLabel}>Spaces</span>
          </Link>
          <Link href="/space/connect" className={styles.taskbarItem}>
            <span className={styles.taskbarIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="9" cy="7" r="3" />
                <circle cx="15" cy="7" r="3" />
                <path d="M3 18v-1a4 4 0 0 1 4-4h2m4 0h2a4 4 0 0 1 4 4v1" />
              </svg>
            </span>
            <span className={styles.taskbarLabel}>Connect</span>
          </Link>
          {user ? (
            <Link href="/profile" className={styles.taskbarItem}>
              <span className={styles.taskbarIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <span className={styles.taskbarLabel}>Profile</span>
            </Link>
          ) : (
            <Link href="/login" className={styles.taskbarItem}>
              <span className={styles.taskbarIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
              </span>
              <span className={styles.taskbarLabel}>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
