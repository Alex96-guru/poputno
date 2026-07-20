"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AccountSettings from "@/components/profile/AccountSettings";
import EditProfileModal from "@/components/profile/EditProfileModal";
import MyListings, { type MyListing } from "@/components/profile/MyListings";
import ProfileReviews, { type Review } from "@/components/profile/ProfileReviews";
import ProfileSidebar, { type ProfileTab } from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/lib/auth";
import type { Person, User } from "@/lib/types";

// Real listings/reviews/saved arrive with the listings backend work; until
// then every section renders its empty state from these.
const MY_LISTINGS: MyListing[] = [];
const REVIEWS: Review[] = [];
const SAVED: Person[] = [];

export default function MyProfile({ user }: { user: User }) {
  const { logout } = useAuth();
  const [tab, setTab] = useState<ProfileTab>("listings");
  const [editing, setEditing] = useState(false);

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
            onEdit={() => setEditing(true)}
            listingsCount={MY_LISTINGS.length}
            savedCount={SAVED.length}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-7">
            {tab === "settings" ? (
              <AccountSettings
                user={user}
                onEdit={() => setEditing(true)}
                onLogout={logout}
                onBack={() => navigate("listings")}
              />
            ) : (
              <>
                <MyListings listings={MY_LISTINGS} />
                <ProfileReviews user={user} reviews={REVIEWS} saved={SAVED} />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {editing && (
        <EditProfileModal user={user} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
