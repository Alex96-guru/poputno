"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MyProfile from "@/components/profile/MyProfile";
import { useAuth } from "@/lib/auth";

export default function MyProfilePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="min-h-screen bg-surface-2" />;
  }

  return <MyProfile user={user} />;
}
