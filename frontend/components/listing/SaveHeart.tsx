"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSaved } from "@/lib/saved";

interface Props {
  listingId: string;
  authorId: string;
}

/**
 * The heart on a listing card. Red once saved, toggling on click.
 *
 * Hidden on the viewer's own listings — you cannot save your own. A guest is
 * sent to sign in. It lives inside the card's <Link>, so it stops the click
 * from also navigating to the listing.
 */
export default function SaveHeart({ listingId, authorId }: Props) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { isSaved, toggle } = useSaved();

  if (user && user.id === authorId) return null;

  const saved = isSaved(listingId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push("/login");
      return;
    }
    void toggle(listingId);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Убрать из сохранённых" : "Сохранить объявление"}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-pill bg-white/95 text-ink transition hover:scale-110"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          saved ? "fill-[#E0564B] text-[#E0564B]" : "text-ink"
        }`}
      />
    </button>
  );
}
