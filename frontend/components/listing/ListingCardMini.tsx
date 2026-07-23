import { type ReactNode } from "react";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import Avatar from "@/components/profile/Avatar";
import SaveHeart from "@/components/listing/SaveHeart";
import { formatDateRange } from "@/lib/dates";
import type { Listing } from "@/lib/types";

interface Props {
  listing: Listing;
  /** Overlay for the photo's top-right corner. Defaults to the save heart. */
  topRight?: ReactNode;
}

/**
 * Compact listing card for the mobile 3-per-row grids.
 *
 * A photo, one bold line (where), and a tiny meta line — everything else is
 * dropped so three fit across a phone. The full card is used from `sm:` up.
 */
export default function ListingCardMini({ listing, topRight }: Props) {
  const { author } = listing;
  const where =
    listing.destinations.join(" · ") || listing.origin || author.name;
  const dates = formatDateRange(listing.startDate, listing.endDate);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="flex flex-col overflow-hidden rounded-[12px] border border-border bg-white shadow-[0_4px_12px_rgba(42,37,33,0.08)]"
    >
      <div className="relative h-[96px] bg-surface-2">
        <Avatar
          src={author.avatarUrl}
          name={author.name}
          className="h-full w-full"
          radiusClassName="rounded-none"
          textClassName="text-[26px]"
        />
        <span className="absolute right-1.5 top-1.5">
          {topRight ?? (
            <SaveHeart listingId={listing.id} authorId={author.id} />
          )}
        </span>
      </div>

      <div className="flex flex-col gap-1 px-2 pb-2.5 pt-2">
        <p className="flex items-center gap-1 text-[12.5px] font-bold leading-tight text-ink">
          <MapPin className="h-3 w-3 shrink-0 text-accent" />
          <span className="truncate">{where}</span>
        </p>
        <p className="flex items-center gap-1 text-[10px] text-muted">
          <Calendar className="h-2.5 w-2.5 shrink-0 text-accent" />
          <span className="truncate">{dates || "Даты гибкие"}</span>
        </p>
      </div>
    </Link>
  );
}
