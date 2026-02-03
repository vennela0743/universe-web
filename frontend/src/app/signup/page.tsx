"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../auth.module.css";

export default function SignupPage() {
  const { register, user, loading, initialized } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (initialized && user) {
    router.replace("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password || !displayName.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await register(email.trim(), password, displayName.trim());
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  return (
    <div className={styles.authPage}>
      <header className={styles.authHeader}>
        <h1 className={styles.authBrand}>UniVerse</h1>
        <p className={styles.authTagline}>Create account</p>
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
              <span className={styles.authLabel}>Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                className={styles.authInput}
                autoComplete="name"
                required
              />
            </label>
            <label className={styles.authField}>
              <span className={styles.authLabel}>University email</span>
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
                placeholder="At least 8 characters"
                className={styles.authInput}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className={styles.authSubmit}
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </div>
        </form>

        <footer className={styles.authFooter}>
          <p className={styles.authSwitch}>
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </p>
          <Link href="/" className={styles.authBack}>
            ← Back to home
          </Link>
        </footer>
      </main>
    </div>
  );
}
