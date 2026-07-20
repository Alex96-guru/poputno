import Link from "next/link";
import { Calendar, Heart, MapPin, MessageSquarePlus, Star } from "lucide-react";
import type { Person } from "@/lib/types";

interface Props {
  person: Person;
  /** Link target. Defaults to the listing page; pass null for a non-clickable card. */
  href?: string | null;
  /** Override the rating text (e.g. "нов." for a new listing preview). */
  ratingLabel?: string;
  /** Drop the card's own frame so it can nest inside another card. */
  bare?: boolean;
}

export default function PersonCard({ person, href, ratingLabel, bare }: Props) {
  const target = href === undefined ? `/listing/${person.id}` : href;
  const className = bare
    ? "group flex h-full flex-col overflow-hidden bg-white"
    : "group flex h-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-[0_12px_32px_rgba(42,37,33,0.10),0_2px_6px_rgba(42,37,33,0.05)]";
  const linkClassName =
    className +
    " transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(42,37,33,0.16),0_2px_6px_rgba(42,37,33,0.06)]";

  const body = (
    <>
      <div
        className="flex h-[360px] items-start justify-between bg-cover bg-center p-3.5"
        style={{ backgroundImage: `url(${person.photoUrl})` }}
      >
        <span className="rounded-pill bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-ink backdrop-blur">
          {person.companyType}
        </span>
        <span
          aria-hidden
          className="grid h-[38px] w-[38px] place-items-center rounded-pill bg-white/90 text-ink backdrop-blur transition hover:text-accent"
        >
          <Heart className="h-[19px] w-[19px]" />
        </span>
      </div>

      <div className="flex flex-col gap-2.5 p-4 pb-[18px]">
        <header className="flex items-center justify-between gap-2">
          <h3 className="font-display text-[19px] font-bold text-ink">
            {person.name}
            {person.age !== null && (
              <span className="font-normal text-muted">, {person.age}</span>
            )}
          </h3>
          <span className="flex items-center gap-1 text-[13px] font-semibold text-ink">
            <Star className="h-[15px] w-[15px] fill-gold text-gold" />
            {ratingLabel ?? person.rating.toFixed(1)}
          </span>
        </header>

        <IconRow icon={<MapPin className="h-[15px] w-[15px] text-accent" />}>
          <span className="font-semibold">{person.location}</span>
        </IconRow>

        <IconRow icon={<Calendar className="h-[15px] w-[15px] text-accent" />}>
          {person.dates}
        </IconRow>

        <p className="text-[13px] leading-[1.45] text-subtle">
          {person.description}
        </p>

        <hr className="border-t border-border" />

        <span className="flex items-center justify-center gap-1.5 rounded-pill bg-accent-soft py-2 text-[14px] font-semibold text-accent-ink transition group-hover:bg-accent group-hover:text-white">
          <MessageSquarePlus className="h-4 w-4" />
          Написать
        </span>
      </div>
    </>
  );

  if (target === null) {
    return <div className={className}>{body}</div>;
  }

  return (
    <Link href={target} className={linkClassName}>
      {body}
    </Link>
  );
}

function IconRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[14px] text-muted">
      {icon}
      <span>{children}</span>
    </div>
  );
}
