"use client";

import { useAuth } from "@/contexts/AuthContext";
import { forgotPassword, resetPassword, resendOtp } from "@/lib/auth-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import styles from "../auth.module.css";

type Step = "email" | "otp" | "success";

export default function ForgotPasswordPage() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      await resendOtp({ email: email.trim(), type: "PASSWORD_RESET" });
      setSuccess("Reset code resent! Check your inbox.");
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

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setStep("otp");
      setSuccess("Reset code sent to your email. Check your inbox!");
      setResendCooldown(60);
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Cannot reach the server. Is the backend running?");
      } else {
        setError(err instanceof Error ? err.message : "Failed to send reset code.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  }

  return (
    <div className={styles.authPage}>
      <header className={styles.authHeader}>
        <h1 className={styles.authBrand}>UniVerse</h1>
        <p className={styles.authTagline}>
          {step === "email" && "Reset password"}
          {step === "otp" && "Enter reset code"}
          {step === "success" && "Password reset"}
        </p>
      </header>

      <main>
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className={styles.authCard}>
            <div className={styles.authForm}>
              {error && (
                <p className={styles.authError} role="alert">
                  {error}
                </p>
              )}
              <p className={styles.otpInstruction}>
                Enter your email address and we&apos;ll send you a code to reset your password.
              </p>
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
              <button
                type="submit"
                disabled={loading}
                className={styles.authSubmit}
              >
                {loading ? "Sending code…" : "Send reset code"}
              </button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleResetSubmit} className={styles.authCard}>
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
                <span className={styles.authLabel}>Reset code</span>
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
              <label className={styles.authField}>
                <span className={styles.authLabel}>New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={styles.authInput}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </label>
              <label className={styles.authField}>
                <span className={styles.authLabel}>Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={styles.authInput}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </label>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={styles.authSubmit}
              >
                {loading ? "Resetting…" : "Reset password"}
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

        {step === "success" && (
          <div className={styles.authCard}>
            <div className={styles.authForm}>
              <div className={styles.successIcon}>✓</div>
              <p className={styles.successMessage}>
                Your password has been reset successfully!
              </p>
              <Link href="/login" className={styles.authSubmit} style={{ textAlign: "center", display: "block", textDecoration: "none" }}>
                Sign in with new password
              </Link>
            </div>
          </div>
        )}

        <footer className={styles.authFooter}>
          <p className={styles.authSwitch}>
            Remember your password?{" "}
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
