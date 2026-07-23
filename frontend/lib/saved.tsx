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
import { useAuth } from "./auth";

interface SavedContextValue {
  /** Ids the user has saved. Empty when signed out. */
  savedIds: Set<string>;
  isSaved: (id: string) => boolean;
  /** Optimistically flips the saved state; reverts if the request fails. */
  toggle: (id: string) => Promise<void>;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Load the saved set whenever the session changes; clear it on sign-out.
  useEffect(() => {
    if (!token) {
      setSavedIds(new Set());
      return;
    }
    let cancelled = false;
    api
      .fetchSavedIds(token)
      .then((ids) => {
        if (!cancelled) setSavedIds(new Set(ids));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggle = useCallback(
    async (id: string) => {
      if (!token) return;
      const wasSaved = savedIds.has(id);

      // Optimistic: update the icon now, undo if the server rejects.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(id);
        else next.add(id);
        return next;
      });

      try {
        if (wasSaved) await api.unsaveListing(token, id);
        else await api.saveListing(token, id);
      } catch {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    },
    [token, savedIds],
  );

  return (
    <SavedContext.Provider
      value={{ savedIds, isSaved: (id) => savedIds.has(id), toggle }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
