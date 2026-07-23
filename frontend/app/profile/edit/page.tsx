"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import EditProfile from "@/components/profile/EditProfile";
import { useAuth } from "@/lib/auth";

export default function EditProfilePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="min-h-screen bg-surface-2" />;
  }

  return <EditProfile user={user} />;
}
