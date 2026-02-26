export interface UniversitySpaceInfo {
  id: string;
  name: string;
  domain: string;
}

export type UserRole = "ADMIN" | "STUDENT";

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  universitySpace: UniversitySpaceInfo | null;
}

export interface AuthResponse {
  token: string;
  email: string;
  displayName: string;
  userId: string;
  role: string | null;
  universitySpaceId: string | null;
  universitySpaceName: string | null;
  universitySpaceDomain: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}
