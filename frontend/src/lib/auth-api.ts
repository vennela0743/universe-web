import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface InitiateSignupRequest {
  email: string;
  displayName: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResendOtpRequest {
  email: string;
  type: "SIGNUP" | "PASSWORD_RESET";
}

export interface MessageResponse {
  message: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed. Please try again.");
  }
  return data as T;
}

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error(data.message || "Invalid email or password.");
    throw new Error(data.message || "Login failed. Please try again.");
  }
  return res.json() as Promise<AuthResponse>;
}

/**
 * Step 1 of signup: Initiates signup and sends OTP to email
 */
export async function initiateSignup(data: InitiateSignupRequest): Promise<MessageResponse> {
  const res = await fetch(`${API_BASE}/api/auth/signup/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<MessageResponse>(res);
}

/**
 * Step 2 of signup: Verifies OTP and completes registration
 */
export async function verifySignupOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/signup/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

/**
 * Step 1 of password reset: Sends OTP to email
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
  const res = await fetch(`${API_BASE}/api/auth/password/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<MessageResponse>(res);
}

/**
 * Step 2 of password reset: Verifies OTP and resets password
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
  const res = await fetch(`${API_BASE}/api/auth/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<MessageResponse>(res);
}

/**
 * Resends OTP for signup or password reset
 */
export async function resendOtp(data: ResendOtpRequest): Promise<MessageResponse> {
  const res = await fetch(`${API_BASE}/api/auth/otp/resend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<MessageResponse>(res);
}

/**
 * @deprecated Use initiateSignup and verifySignupOtp instead
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 400) throw new Error(errorData.message || "Registration failed. Email may already be in use or domain not allowed.");
    throw new Error(errorData.message || "Registration failed. Please try again.");
  }
  return res.json() as Promise<AuthResponse>;
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
