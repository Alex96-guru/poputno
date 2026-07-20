"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as api from "./api";
import type { ProfileUpdate, SettingsUpdate, User } from "./types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  ready: boolean;
  register: (input: {
    name: string;
    email: string;
    password: string;
    birthDate: string;
  }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  updateProfile: (changes: ProfileUpdate) => Promise<void>;
  updateSettings: (changes: SettingsUpdate) => Promise<void>;
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "poputno_token";

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors (private mode, quota)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Restore the session: a stored token is only trusted once /me confirms it.
  useEffect(() => {
    const stored = readToken();
    if (!stored) {
      setReady(true);
      return;
    }
    api
      .fetchMe(stored)
      .then((me) => {
        setToken(stored);
        setUser(me);
      })
      .catch(() => writeToken(null))
      .finally(() => setReady(true));
  }, []);

  const apply = useCallback((next: { token: string; user: User }) => {
    writeToken(next.token);
    setToken(next.token);
    setUser(next.user);
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      birthDate: string;
    }) => {
      apply(await api.register(input));
    },
    [apply],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      apply(await api.login(input));
    },
    [apply],
  );

  const updateProfile = useCallback(
    async (changes: ProfileUpdate) => {
      if (!token) throw new api.ApiError("Требуется авторизация");
      setUser(await api.updateMe(token, changes));
    },
    [token],
  );

  // The toggle flips right away; a failed request puts it back.
  const updateSettings = useCallback(
    async (changes: SettingsUpdate) => {
      if (!token) throw new api.ApiError("Требуется авторизация");
      const previous = user;
      setUser((u) =>
        u ? { ...u, settings: { ...u.settings, ...changes } } : u,
      );
      try {
        const settings = await api.updateMySettings(token, changes);
        setUser((u) => (u ? { ...u, settings } : u));
      } catch (err) {
        setUser(previous);
        throw err;
      }
    },
    [token, user],
  );

  const changePassword = useCallback(
    async (input: { currentPassword: string; newPassword: string }) => {
      if (!token) throw new api.ApiError("Требуется авторизация");
      apply(await api.changePassword(token, input));
    },
    [token, apply],
  );

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!token) throw new api.ApiError("Требуется авторизация");
    await api.deleteMe(token);
    logout();
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        register,
        login,
        updateProfile,
        updateSettings,
        changePassword,
        deleteAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
