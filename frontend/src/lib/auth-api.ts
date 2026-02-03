import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Invalid email or password.");
    throw new Error("Login failed. Please try again.");
  }
  return res.json() as Promise<AuthResponse>;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 400) throw new Error("Registration failed. Email may already be in use or domain not allowed.");
    throw new Error("Registration failed. Please try again.");
  }
  return res.json() as Promise<AuthResponse>;
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
