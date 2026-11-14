"use client";

export type UserRole = "USER" | "ADMIN";

export interface AuthSession {
  role: UserRole;
  email: string;
  name: string;
  loginTime: string;
}

const STORAGE_KEY = "resqlink_auth_session";

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.role === "USER" || parsed.role === "ADMIN")) {
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

export function loginAsRole(role: UserRole, email?: string, name?: string): AuthSession {
  const session: AuthSession = {
    role,
    email: email || (role === "ADMIN" ? "admin@resqlink.org" : "citizen@resqlink.org"),
    name: name || (role === "ADMIN" ? "Administrator" : "Citizen User"),
    loginTime: new Date().toISOString()
  };
  setAuthSession(session);
  return session;
}

