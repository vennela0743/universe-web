"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SPACE_ROUTES } from "./space-nav";
import styles from "../page.module.css";

const PLANETS = [
  { color: "#9ca3af", size: 80 },
  { color: "#22d3ee", size: 84 },
  { color: "#6366f1", size: 86 },
  { color: "#f59e0b", size: 82 },
  { color: "#ec4899", size: 78 },
];

export default function SpaceHomePage() {
  const { user } = useAuth();
  const universityDisplayName =
    user?.universitySpace?.name?.trim() || user?.universitySpace?.domain || "UniVerse";

  const [angle, setAngle] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const raf = useRef<number | null>(null);
  const autoSpin = useRef(true);
  const lastTime = useRef<number | null>(null);
  const systemRef = useRef<HTMLDivElement | null>(null);
  const [orbit, setOrbit] = useState({ x: 220, y: 120 });
  const maxPlanetSize = 86;

  const step = 360 / SPACE_ROUTES.length;
  const activeIndex = useMemo(() => {
    const normalized = ((-angle + 90) % 360 + 360) % 360;
    return Math.round(normalized / step) % SPACE_ROUTES.length;
  }, [angle, step]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    velocity.current = 0;
    autoSpin.current = false;
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    velocity.current = delta;
    setAngle((prev) => prev + delta * 0.35);
  };

  const handlePointerUp = () => {
    dragging.current = false;
    const snapToNearest = (a: number) => Math.round(a / step) * step;
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
        autoSpin.current = true;
      }
    };
    if (Math.abs(velocity.current) > 0.1) {
      raf.current = requestAnimationFrame(animate);
    } else {
      setAngle((prev) => snapToNearest(prev));
      autoSpin.current = true;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    setAngle((prev) => prev + e.deltaY * 0.2);
    velocity.current = e.deltaY * 0.2;
    handlePointerUp();
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

  const updateOrbit = () => {
    if (!systemRef.current) return;
    const rect = systemRef.current.getBoundingClientRect();
    const padding = 2;
    const maxRadius = maxPlanetSize / 2;
    const baseX = rect.width / 2 - maxRadius - padding;
    const baseY = rect.height / 2 - maxRadius - padding;
    setOrbit({ x: Math.max(0, baseX * 1.05), y: Math.max(0, baseY * 0.62) });
  };

  useEffect(() => {
    updateOrbit();
    const el = systemRef.current;
    if (el) {
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateOrbit);
      if (ro) {
        ro.observe(el);
        return () => ro.disconnect();
      }
    }
  }, []);

  return (
    <section
      className={styles.system}
      aria-label="University spaces"
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
      <div className={styles.sun} aria-label="University space">
        {universityDisplayName}
      </div>
      {(() => {
        const route = SPACE_ROUTES[activeIndex];
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
            <div className={styles.activeTitle}>{route.label}</div>
            <div className={styles.activeDesc}>Click to open</div>
          </div>
        );
      })()}
      {SPACE_ROUTES.map((route, index) => {
        const theta = ((index * step + angle) * Math.PI) / 180;
        const x = Math.cos(theta) * orbit.x;
        const y = Math.sin(theta) * orbit.y;
        const depth = (1 - Math.sin(theta)) / 2;
        const scale = 0.7 + 0.4 * depth;
        const planet = PLANETS[index] ?? PLANETS[0];
        return (
          <Link
            key={route.path}
            href={route.path}
            className={`${styles.planet} ${index === activeIndex ? styles.active : ""}`}
            style={
              {
                "--tx": `${x}px`,
                "--ty": `${y}px`,
                "--planet-color": planet.color,
                "--planet-size": `${planet.size}px`,
                "--planet-scale": scale,
              } as CSSProperties
            }
            aria-label={`${route.label} space`}
          >
            <span className={styles.planetBody} aria-hidden="true" />
            <span className={styles.planetShort}>{route.label}</span>
          </Link>
        );
      })}
    </section>
  );
}
