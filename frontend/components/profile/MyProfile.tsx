"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AccountSettings from "@/components/profile/AccountSettings";
import MyListings from "@/components/profile/MyListings";
import ProfileReviews, { type Review } from "@/components/profile/ProfileReviews";
import ProfileSidebar, {
  type EditSection,
  type ProfileTab,
} from "@/components/profile/ProfileSidebar";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSaved } from "@/lib/saved";
import type { Listing, User } from "@/lib/types";

// Reviews arrive with their own backend work; until then the section shows an
// empty state.
const REVIEWS: Review[] = [];

export default function MyProfile({ user }: { user: User }) {
  const { logout, token } = useAuth();
  const { isSaved } = useSaved();
  const router = useRouter();
  const [tab, setTab] = useState<ProfileTab>("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [saved, setSaved] = useState<Listing[]>([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    Promise.all([api.fetchMyListings(token), api.fetchSavedListings(token)])
      .then(([mine, savedListings]) => {
        if (cancelled) return;
        setListings(mine);
        setSaved(savedListings);
      })
      // An unreachable server leaves the sections empty rather than breaking
      // the whole profile page.
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingListings(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Un-saving from a card drops it here live, without a reload; the loaded
  // objects stay, but only the still-saved ones are shown.
  const visibleSaved = saved.filter((l) => isSaved(l.id));

  const removeListing = useCallback(
    async (id: string) => {
      if (!token) return;
      await api.deleteListing(token, id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    },
    [token],
  );

  // Filling in a profile is a screen of its own — every "edit" affordance here
  // opens it, optionally at the section the user clicked from.
  const edit = (section?: EditSection) =>
    router.push(section ? `/profile/edit#${section}` : "/profile/edit");

  const navigate = (next: ProfileTab) => {
    setTab(next);
    if (next === "settings") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Settings is a separate view, so leaving it has to render first.
    requestAnimationFrame(() => {
      document
        .getElementById(next)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <Nav />
      <main className="bg-surface-2 pb-[72px] pt-8">
        <div className="mx-auto flex max-w-content flex-col gap-9 px-5 sm:px-8 lg:flex-row lg:gap-9 lg:px-20">
          <ProfileSidebar
            user={user}
            active={tab}
            onNavigate={navigate}
            onEdit={edit}
            listingsCount={listings.length}
            savedCount={visibleSaved.length}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-7">
            {tab === "settings" ? (
              <AccountSettings
                user={user}
                onEdit={() => edit("basics")}
                onLogout={logout}
                onBack={() => navigate("listings")}
              />
            ) : (
              <>
                <MyListings
                  listings={listings}
                  loading={loadingListings}
                  onDelete={removeListing}
                />
                <ProfileReviews
                  user={user}
                  reviews={REVIEWS}
                  saved={visibleSaved}
                />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
