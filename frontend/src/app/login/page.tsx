"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const { login, user, loading, initialized } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (initialized && user) {
    router.replace("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <div className={styles.authPage}>
      <header className={styles.authHeader}>
        <h1 className={styles.authBrand}>UniVerse</h1>
        <p className={styles.authTagline}>Sign in</p>
      </header>

      <main>
        <form
          onSubmit={handleSubmit}
          className={styles.authCard}
        >
          <div className={styles.authForm}>
            {error && (
              <p className={styles.authError} role="alert">
                {error}
              </p>
            )}
            <label className={styles.authField}>
              <span className={styles.authLabel}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className={styles.authInput}
                autoComplete="email"
                required
              />
            </label>
            <label className={styles.authField}>
              <span className={styles.authLabel}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.authInput}
                autoComplete="current-password"
                required
                minLength={8}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className={styles.authSubmit}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <footer className={styles.authFooter}>
          <p className={styles.authSwitch}>
            Don&apos;t have an account?{" "}
            <Link href="/signup">Sign up</Link>
          </p>
          <Link href="/" className={styles.authBack}>
            ← Back to home
          </Link>
        </footer>
      </main>
    </div>
  );
}
