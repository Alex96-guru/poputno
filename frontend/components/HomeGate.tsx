"use client";

import AuthorizedHome from "@/components/AuthorizedHome";
import Landing from "@/components/landing/Landing";
import { useAuth } from "@/lib/auth";
import type { City } from "@/lib/types";

interface Props {
  cities: City[];
}

export default function HomeGate({ cities }: Props) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="min-h-screen bg-bg" />;
  }

  return user ? <AuthorizedHome cities={cities} /> : <Landing />;
}
