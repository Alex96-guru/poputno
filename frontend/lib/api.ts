import type { Person } from "./types";
import { MOCK_PERSONS, POPULAR_DESTINATIONS } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const REVALIDATE_SECONDS = 60;

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
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