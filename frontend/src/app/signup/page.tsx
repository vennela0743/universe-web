"use client";

import { useAuth } from "@/contexts/AuthContext";
import { initiateSignup, verifySignupOtp, resendOtp } from "@/lib/auth-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import styles from "../auth.module.css";

type Step = "form" | "otp";

function validateEmail(emailToCheck: string): boolean {
  const emailLower = emailToCheck.toLowerCase().trim();
  return emailLower.endsWith(".edu");
}

export default function SignupPage() {
  const { setAuthData, user, initialized } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (initialized && user) {
      router.replace("/space");
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await resendOtp({ email: email.trim(), type: "SIGNUP" });
      setSuccess("Verification code resent! Check your inbox.");
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  }, [email, resendCooldown]);

  if (initialized && user) {
    return null;
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!displayName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Only .edu email addresses are allowed.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await initiateSignup({
        email: email.trim(),
        displayName: displayName.trim(),
        password,
      });
      setStep("otp");
      setSuccess("Verification code sent to your email. Check your inbox!");
      setResendCooldown(60);
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Cannot reach the server. Is the backend running?");
      } else {
        setError(err instanceof Error ? err.message : "Failed to send verification code.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await verifySignupOtp({
        email: email.trim(),
        otp: otp.trim(),
      });
      setAuthData(response);
      router.replace("/space");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("form");
    setOtp("");
    setError(null);
    setSuccess(null);
  }

  return (
    <div className={styles.authPage}>
      <header className={styles.authHeader}>
        <h1 className={styles.authBrand}>UniVerse</h1>
        <p className={styles.authTagline}>
          {step === "form" ? "Create account" : "Verify email"}
        </p>
      </header>

      <main>
        {step === "form" ? (
          <form onSubmit={handleFormSubmit} className={styles.authCard}>
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
                  maxLength={50}
                  className={styles.authInput}
                  autoComplete="name"
                  required
                />
              </label>
              <label className={styles.authField}>
                <span className={styles.authLabel}>University email (.edu only)</span>
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
                {loading ? "Sending code…" : "Continue"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className={styles.authCard}>
            <div className={styles.authForm}>
              {error && (
                <p className={styles.authError} role="alert">
                  {error}
                </p>
              )}
              {success && (
                <output className={styles.authSuccess}>
                  {success}
                </output>
              )}
              <p className={styles.otpInstruction}>
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
              <label className={styles.authField}>
                <span className={styles.authLabel}>Verification code</span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replaceAll(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className={`${styles.authInput} ${styles.otpInput}`}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={styles.authSubmit}
              >
                {loading ? "Verifying…" : "Verify & Sign up"}
              </button>
              <div className={styles.otpActions}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resendCooldown > 0}
                  className={styles.otpResend}
                >
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className={styles.otpBack}
                >
                  Change email
                </button>
              </div>
            </div>
          </form>
        )}

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
