"use client";

import AuthorizedHome from "@/components/AuthorizedHome";
import Landing from "@/components/landing/Landing";
import { useAuth } from "@/lib/auth";
import type { Person } from "@/lib/types";

interface Props {
  persons: Person[];
  destinations: string[];
}

export default function HomeGate({ persons, destinations }: Props) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="min-h-screen bg-bg" />;
  }

  return user ? (
    <AuthorizedHome persons={persons} destinations={destinations} />
  ) : (
    <Landing />
  );
}