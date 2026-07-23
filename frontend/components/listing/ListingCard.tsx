import { type ReactNode } from "react";
import Link from "next/link";
import { Calendar, Heart, MapPin, MessageCircle, Star, Users } from "lucide-react";
import Avatar from "@/components/profile/Avatar";
import SaveHeart from "@/components/listing/SaveHeart";
import { formatDateRange, formatPostedAt } from "@/lib/dates";
import type { Listing } from "@/lib/types";

interface Props {
  listing: Listing;
  /**
   * Replaces the default "posted · Написать" row — used by the owner's view,
   * which offers management actions instead of a way to contact themselves.
   */
  actions?: ReactNode;
  /** Skips the posted date, for the live preview of an unpublished draft. */
  preview?: boolean;
  /** Makes the whole card a link. Omit for previews and owner cards. */
  href?: string;
}

/**
 * One traveller's listing, as it appears in the catalog, the owner's profile
 * and the create form's preview. The photo is the author's profile picture:
 * listings carry no image of their own.
 */
export default function ListingCard({
  listing,
  actions,
  preview,
  href,
}: Props) {
  const { author } = listing;
  const dates = formatDateRange(listing.startDate, listing.endDate);
  // A poster with no reviews yet is flagged as new rather than shown as 0.0.
  const isNew = author.reviewsCount === 0;

  const card = (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-border bg-white shadow-[0_10px_24px_rgba(42,37,33,0.10)]">
      <div className="relative h-[260px] shrink-0 bg-surface-2 sm:h-[300px]">
        <Avatar
          src={author.avatarUrl}
          name={author.name}
          className="h-full w-full"
          radiusClassName="rounded-none"
        />
        <div className="absolute inset-0 flex items-start justify-between p-3">
          <span className="flex items-center gap-1.5 rounded-pill bg-white/95 px-2.5 py-1.5 text-[12px] font-semibold text-ink">
            <Users className="h-[13px] w-[13px] shrink-0 text-accent" />
            {listing.authorKind} · ищу {listing.seeking}
          </span>
          {preview ? (
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-pill bg-white/95 text-ink"
            >
              <Heart className="h-4 w-4" />
            </span>
          ) : (
            <SaveHeart listingId={listing.id} authorId={author.id} />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-[7px] px-3.5 pb-3.5 pt-[13px]">
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-[15px] font-bold text-ink">
            {author.name}
            {author.age !== null && `, ${author.age}`}
          </span>
          {isNew ? (
            <span className="shrink-0 rounded-pill bg-teal-soft px-2.5 py-[3px] text-[11px] font-bold text-teal">
              НОВОЕ
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-[3px] text-[13px] font-semibold text-ink">
              <Star className="h-[14px] w-[14px] fill-gold text-gold" />
              {author.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-[14px] font-semibold text-muted">
          <MapPin className="h-[14px] w-[14px] shrink-0 text-accent" />
          <span className="truncate">
            {listing.destinations.join(" · ") || "Направление не выбрано"}
          </span>
        </p>

        <p className="flex items-center gap-1.5 text-[13px] text-muted">
          <Calendar className="h-[14px] w-[14px] shrink-0 text-accent" />
          {dates || "Даты гибкие"}
        </p>

        <p className="line-clamp-3 text-[12.5px] leading-[1.4] text-subtle">
          {listing.description ||
            "Здесь появится описание вашего путешествия."}
        </p>

        <div className="mt-auto flex flex-col gap-2.5 pt-2">
          <div className="h-px w-full bg-border" />
          {actions ?? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] text-muted">
                {preview ? "сейчас" : formatPostedAt(listing.createdAt)}
              </span>
              <span className="flex items-center gap-1.5 rounded-pill bg-accent px-3.5 py-[7px] text-[12px] font-semibold text-white">
                <MessageCircle className="h-[14px] w-[14px]" />
                Написать
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      className="block h-full transition duration-200 hover:-translate-y-1"
    >
      {card}
    </Link>
  );
}
