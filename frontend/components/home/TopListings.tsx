import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  CircleArrowUp,
  Coffee,
  Heart,
  HeartHandshake,
  House,
  MapPin,
  Plane,
  Sparkles,
  Star,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import {
  FRIEND_CHIPS,
  FRIEND_CHIPS_MORE,
  TOP_GROUPS,
} from "@/lib/top-listings";
import type { TopGroup, TopGroupKey, TopListing } from "@/lib/types";

/**
 * Per-shelf styling and where its "Показать все" leads. `category` is the
 * listing category the catalog filters by; the interest-based shelf has no
 * counterpart in the model, so it opens the catalog unfiltered.
 */
const LOOK: Record<
  TopGroupKey,
  { icon: LucideIcon; tile: string; panel: string; category?: string }
> = {
  trips: {
    icon: Plane,
    tile: "bg-accent-soft text-accent-ink",
    panel: "bg-[#F9EAE3]",
    category: "Путешествия",
  },
  meetups: {
    icon: Coffee,
    tile: "bg-teal-soft text-teal",
    panel: "bg-[#E6EFEE]",
    category: "Встречи",
  },
  hosting: {
    icon: House,
    tile: "bg-[#FBEFD8] text-[#B07B10]",
    panel: "bg-[#F7EEDD]",
    category: "В гости",
  },
  friends: {
    icon: HeartHandshake,
    tile: "bg-accent-soft text-accent-ink",
    panel: "bg-[#F9EAE3]",
  },
};

export default function TopListings() {
  return (
    <section className="bg-gradient-to-b from-[#F7EBE0] via-[#FBF6F0] to-[#F6EADF] px-5 pb-10 pt-16 sm:px-8 lg:px-20">
      <div className="mx-auto flex max-w-content flex-col gap-[34px]">
        <Head />
        {TOP_GROUPS.map((group, i) => (
          <Reveal key={group.key} delay={i * 80}>
            <Shelf group={group} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Head() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[32px] font-bold text-ink">
          Топ-объявления
        </h2>
        <p className="text-[15px] text-muted">
          Лучшие предложения сообщества — путешествия, встречи и гостеприимство
        </p>
      </div>

      <button
        type="button"
        className="flex w-fit shrink-0 items-center gap-[7px] rounded-pill bg-accent-soft px-[15px] py-[9px] text-[14px] font-semibold text-accent-ink transition hover:bg-accent hover:text-white"
      >
        <CircleArrowUp className="h-4 w-4" />
        Как сюда попасть
      </button>
    </div>
  );
}

function Shelf({ group }: { group: TopGroup }) {
  const { icon: Icon, tile, panel, category } = LOOK[group.key];
  const seeAll = category
    ? `/catalog?category=${encodeURIComponent(category)}`
    : "/catalog";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[12px] ${tile}`}
          >
            <Icon className="h-[21px] w-[21px]" />
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-[22px] font-bold leading-tight text-ink">
              {group.title}
            </h3>
            <p className="text-[13px] text-muted">{group.caption}</p>
          </div>
        </div>

        <Link
          href={seeAll}
          className="flex w-fit shrink-0 items-center gap-[5px] rounded-pill border border-border bg-white/70 px-3.5 py-2 text-[13px] font-semibold text-muted transition hover:border-accent hover:text-ink"
        >
          Показать все
          <ChevronRight className="h-[15px] w-[15px]" />
        </Link>
      </div>

      {group.key === "friends" && <Chips />}

      <div
        className={`grid gap-[18px] rounded-card p-5 sm:grid-cols-2 xl:grid-cols-4 ${panel}`}
      >
        {group.listings.map((listing) => (
          <Card key={listing.id} listing={listing} kind={group.key} />
        ))}
      </div>
    </div>
  );
}

function Chips() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {FRIEND_CHIPS.map(({ label, dot }) => (
        <span
          key={label}
          className="flex items-center gap-[7px] rounded-pill border border-border bg-white px-3.5 py-2 text-[13px] font-semibold text-ink"
        >
          <span className={`h-2 w-2 shrink-0 rounded-pill ${dot}`} />
          {label}
        </span>
      ))}
      <span className="rounded-pill bg-surface-2 px-3.5 py-2 text-[13px] font-bold text-muted">
        +{FRIEND_CHIPS_MORE}
      </span>
    </div>
  );
}

function Card({ listing, kind }: { listing: TopListing; kind: TopGroupKey }) {
  // Hosts get a warm "В гости" call to action; everyone else gets a message.
  const hosting = listing.status === "Принимаю";

  return (
    <article className="group flex flex-col overflow-hidden rounded-[18px] border border-border bg-white shadow-[0_10px_24px_rgba(42,37,33,0.13)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(42,37,33,0.18)]">
      <div
        className="flex h-[300px] items-start justify-between bg-cover bg-center p-3 sm:h-[340px] xl:h-[376px]"
        style={{ backgroundImage: `url(${listing.photoUrl})` }}
      >
        {listing.status ? (
          <span
            className={`rounded-pill px-[11px] py-[5px] text-[11px] font-bold ${
              hosting ? "bg-teal-soft text-teal" : "bg-accent-soft text-accent-ink"
            }`}
          >
            {listing.status}
          </span>
        ) : (
          <span
            aria-hidden
            className="flex items-center gap-[5px] rounded-pill bg-white/95 px-2.5 py-[5px]"
          >
            <UserRound className="h-[13px] w-[13px] text-accent" />
            <ArrowRight className="h-2.5 w-2.5 text-muted" />
            <UserRound className="h-[13px] w-[13px] text-teal" />
          </span>
        )}

        <div className="flex flex-col items-end gap-2">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-pill bg-white/95 text-ink transition hover:text-accent"
          >
            <Heart className="h-4 w-4" />
          </span>
          {listing.featured && (
            <span className="flex items-center gap-1 rounded-pill bg-gold px-[9px] py-1 text-[11px] font-bold text-white">
              <Star className="h-[11px] w-[11px]" />
              ТОП
            </span>
          )}
        </div>
      </div>

      <div
        className={`flex flex-1 flex-col px-3.5 pb-3.5 pt-[13px] ${
          kind === "friends" ? "gap-[9px]" : "gap-2"
        }`}
      >
        <header className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-ink">
              {listing.name}, {listing.age}
            </span>
            {listing.online && (
              <span
                aria-label="Сейчас в сети"
                className="h-2 w-2 shrink-0 rounded-pill bg-[#3BB273]"
              />
            )}
          </span>
          <span className="flex shrink-0 items-center gap-[3px] text-[13px] font-semibold text-ink">
            <Star className="h-[14px] w-[14px] fill-gold text-gold" />
            {listing.rating.toFixed(1)}
          </span>
        </header>

        {kind === "friends" ? (
          <p className="flex gap-1.5 text-[13px] leading-[1.4] text-muted">
            <Sparkles className="mt-0.5 h-[14px] w-[14px] shrink-0 text-accent" />
            {listing.interests?.join(", ")}
          </p>
        ) : (
          <>
            <p className="flex items-center gap-1.5 text-[14px] font-semibold text-muted">
              <MapPin className="h-[14px] w-[14px] shrink-0 text-accent" />
              <span className="truncate">{listing.location}</span>
            </p>
            <p className="text-[12.5px] leading-[1.4] text-subtle">
              {listing.description}
            </p>
          </>
        )}

        <footer className="mt-auto flex items-center justify-between gap-2 pt-1">
          {kind === "friends" ? (
            <span className="rounded-pill bg-accent-soft px-2.5 py-[5px] text-[11px] font-bold text-accent-ink">
              {listing.commonInterests} общих
            </span>
          ) : (
            <span className="flex min-w-0 items-center gap-[5px] text-[12px] text-subtle">
              {kind === "hosting" ? (
                <Users className="h-[13px] w-[13px] shrink-0" />
              ) : (
                <Calendar className="h-[13px] w-[13px] shrink-0" />
              )}
              <span className="truncate">{listing.meta}</span>
            </span>
          )}

          <span
            className={`shrink-0 rounded-pill px-3 py-1.5 text-[12px] font-semibold ${
              hosting
                ? "bg-[#FBEFD8] text-[#B07B10]"
                : "bg-accent text-white"
            }`}
          >
            {hosting ? "В гости" : "Написать"}
          </span>
        </footer>
      </div>
    </article>
  );
}
