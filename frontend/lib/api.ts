import type {
  Person,
  ProfileUpdate,
  SettingsUpdate,
  User,
  UserSettings,
} from "./types";
import { MOCK_PERSONS, POPULAR_DESTINATIONS } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const TIMEOUT_MS = 8000;

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPersons(): Promise<Person[]> {
  return (await fetchJson<Person[]>("/api/persons")) ?? MOCK_PERSONS;
}

export async function fetchPopularDestinations(): Promise<string[]> {
  return (
    (await fetchJson<string[]>("/api/destinations")) ?? POPULAR_DESTINATIONS
  );
}

/* ------------------------------------------------------------------ auth */

/** Surfaces the backend's error text so forms can show it verbatim. */
export class ApiError extends Error {}

interface AuthResponse {
  token: string;
  user: User;
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...rest.headers,
      },
    });
  } catch {
    throw new ApiError("Сервер недоступен. Попробуйте позже.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = (body as { detail?: unknown } | null)?.detail;
    if (typeof detail === "string") throw new ApiError(detail);
    // Validation failures arrive as a list of {loc, msg} instead of a string.
    const first = Array.isArray(detail)
      ? (detail[0] as { msg?: unknown } | undefined)?.msg
      : undefined;
    throw new ApiError(
      typeof first === "string"
        ? first.replace(/^Value error, /, "")
        : "Что-то пошло не так",
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchMe(token: string): Promise<User> {
  return request<User>("/api/auth/me", { token });
}

export function updateMe(token: string, changes: ProfileUpdate): Promise<User> {
  return request<User>("/api/users/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(changes),
  });
}

export function updateMySettings(
  token: string,
  changes: SettingsUpdate,
): Promise<UserSettings> {
  return request<UserSettings>("/api/users/me/settings", {
    method: "PATCH",
    token,
    body: JSON.stringify(changes),
  });
}

/** Retires every other session, so it returns a fresh token for this one. */
export function changePassword(
  token: string,
  input: { currentPassword: string; newPassword: string },
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/users/me/password", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function deleteMe(token: string): Promise<void> {
  return request<void>("/api/users/me", { method: "DELETE", token });
}
