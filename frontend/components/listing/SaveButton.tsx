"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSaved } from "@/lib/saved";

interface Props {
  listingId: string;
  authorId: string;
}

/** The detail page's "Сохранить" button — the labelled twin of SaveHeart. */
export default function SaveButton({ listingId, authorId }: Props) {
  const router = useRouter();
  const { user, token } = useAuth();
  const { isSaved, toggle } = useSaved();

  if (user && user.id === authorId) return null;

  const saved = isSaved(listingId);

  const onClick = () => {
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
      className={`flex items-center gap-2 rounded-btn border px-[22px] py-4 text-[16px] font-semibold transition ${
        saved
          ? "border-[#E0564B] bg-[#FDECEA] text-[#C0392B]"
          : "border-border bg-white text-ink hover:border-accent"
      }`}
    >
      <Heart
        className={`h-[19px] w-[19px] ${saved ? "fill-[#E0564B] text-[#E0564B]" : ""}`}
      />
      {saved ? "В сохранённых" : "Сохранить"}
    </button>
  );
}
