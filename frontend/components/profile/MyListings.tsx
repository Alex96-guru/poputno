"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import ListingCard from "@/components/listing/ListingCard";
import ListingCardMini from "@/components/listing/ListingCardMini";
import { formatPostedAt } from "@/lib/dates";
import type { Listing } from "@/lib/types";

interface Props {
  listings: Listing[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export default function MyListings({ listings, loading, onDelete }: Props) {
  return (
    <section id="listings" className="flex scroll-mt-24 flex-col gap-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[26px] font-bold text-ink">
            Мои объявления
          </h2>
          {listings.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-pill bg-teal-soft px-3 py-[5px] text-[13px] font-semibold text-teal">
              <span className="h-[7px] w-[7px] rounded-pill bg-teal" />
              {listings.length} активных
            </span>
          )}
        </div>

        <Link
          href="/create"
          className="flex items-center gap-2 rounded-btn bg-accent px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-accent-ink"
        >
          <Plus className="h-[18px] w-[18px]" />
          Создать объявление
        </Link>
      </header>

      {loading ? (
        <p className="rounded-card border border-border bg-white p-[22px] text-[15px] text-muted">
          Загружаем ваши объявления…
        </p>
      ) : (
        <>
          {/* Phone: three compact cards per row. */}
          <div className="grid grid-cols-3 gap-2.5 sm:hidden">
            {listings.map((listing) => (
              <ListingCardMini
                key={listing.id}
                listing={listing}
                topRight={<MiniDelete id={listing.id} onDelete={onDelete} />}
              />
            ))}
            <CreatePlaceholder mini />
          </div>
          {/* Tablet and up: the full card with the manage row. */}
          <div className="hidden gap-6 sm:grid sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                actions={<OwnerActions listing={listing} onDelete={onDelete} />}
              />
            ))}
            <CreatePlaceholder />
          </div>
        </>
      )}
    </section>
  );
}

function OwnerActions({
  listing,
  onDelete,
}: {
  listing: Listing;
  onDelete: (id: string) => Promise<void>;
}) {
  const [removing, setRemoving] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-muted">
        {formatPostedAt(listing.createdAt)}
      </span>
      <button
        type="button"
        disabled={removing}
        onClick={async () => {
          setRemoving(true);
          try {
            await onDelete(listing.id);
          } finally {
            setRemoving(false);
          }
        }}
        className="flex items-center gap-1.5 rounded-pill border border-[#F3C9C2] bg-[#FBE9E7] px-3.5 py-[7px] text-[12px] font-semibold text-[#C0392B] transition hover:bg-[#F8DAD6] disabled:opacity-60"
      >
        <Trash2 className="h-[14px] w-[14px]" />
        {removing ? "Удаляем…" : "Снять"}
      </button>
    </div>
  );
}

/** A small trash button for the mobile owner card, in place of the save heart. */
function MiniDelete({
  id,
  onDelete,
}: {
  id: string;
  onDelete: (id: string) => Promise<void>;
}) {
  const [removing, setRemoving] = useState(false);
  return (
    <button
      type="button"
      disabled={removing}
      aria-label="Снять с публикации"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setRemoving(true);
        void onDelete(id).finally(() => setRemoving(false));
      }}
      className="grid h-7 w-7 place-items-center rounded-pill bg-white/95 text-[#C0392B] transition hover:bg-white disabled:opacity-60"
    >
      <Trash2 className="h-[15px] w-[15px]" />
    </button>
  );
}

function CreatePlaceholder({ mini }: { mini?: boolean }) {
  if (mini) {
    return (
      <Link
        href="/create"
        className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-subtle bg-surface-2 p-2 text-center transition hover:border-accent"
      >
        <span className="grid h-10 w-10 place-items-center rounded-pill bg-accent-soft text-accent-ink">
          <Plus className="h-5 w-5" />
        </span>
        <span className="text-[11px] font-semibold leading-tight text-ink">
          Новое объявление
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/create"
      className="flex min-h-[320px] flex-col items-center justify-center gap-3.5 rounded-card border-2 border-dashed border-subtle bg-surface-2 p-6 text-center transition hover:border-accent"
    >
      <span className="grid h-16 w-16 place-items-center rounded-pill bg-accent-soft text-accent-ink">
        <Plus className="h-[30px] w-[30px]" />
      </span>
      <span className="font-display text-[18px] font-bold text-ink">
        Создать новое объявление
      </span>
      <span className="text-[13px] leading-[1.4] text-subtle">
        Расскажите о поездке и найдите попутчиков
      </span>
    </Link>
  );
}
