"use client";

export type UserRole = "USER" | "ADMIN";

export interface AuthSession {
  role: UserRole;
  email: string;
  username: string;
  name: string;
  token: string;
  tokenType: string;
  loginTime: string;
}

const STORAGE_KEY = "resqlink_auth_session";

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      (parsed.role === "USER" || parsed.role === "ADMIN") &&
      typeof parsed.token === "string" &&
      parsed.token.length > 10
    ) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("resqlink_auth_changed"));
  } catch (e) {
    console.error("Failed to save auth session to localStorage", e);
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("resqlink_auth_changed"));
  } catch (e) {
    console.error("Failed to clear auth session", e);
  }
}

export function subscribeToAuth(callback: (session: AuthSession | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => {
    callback(getAuthSession());
  };

  window.addEventListener("resqlink_auth_changed", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("resqlink_auth_changed", handler);
    window.removeEventListener("storage", handler);
  };
}

export function loginWithVerifiedCredentials(data: {
  access_token: string;
  token_type?: string;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: UserRole;
    db_role?: string;
  };
}): AuthSession {
  const session: AuthSession = {
    role: data.user.role,
    email: data.user.email,
    username: data.user.username || data.user.email.split("@")[0],
    name: data.user.full_name,
    token: data.access_token,
    tokenType: data.token_type || "bearer",
    loginTime: new Date().toISOString()
  };
  setAuthSession(session);
  return session;
}

export function loginAsRole(
  role: UserRole,
  emailOrUsername?: string,
  name?: string,
  customUsername?: string
): AuthSession {
  const raw = (emailOrUsername || "").trim();
  const isEmail = raw.includes("@");
  const derivedUsername =
    customUsername ||
    (isEmail ? raw.split("@")[0] : raw) ||
    (role === "ADMIN" ? "admin" : "citizen");
  const derivedEmail = isEmail
    ? raw
    : `${derivedUsername}@resqlink.org`;

  const displayName =
    name ||
    (derivedUsername
      ? derivedUsername.charAt(0).toUpperCase() + derivedUsername.slice(1)
      : role === "ADMIN"
      ? "Administrator"
      : "Citizen User");

  const session: AuthSession = {
    role,
    email: derivedEmail,
    username: derivedUsername,
    name: displayName,
    token: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    tokenType: "bearer",
    loginTime: new Date().toISOString()
  };
  setAuthSession(session);
  return session;
}

