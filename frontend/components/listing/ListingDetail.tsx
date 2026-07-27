import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Cigarette,
  Compass,
  Languages,
  MapPin,
  MessageCircle,
  Ruler,
  Star,
  UserSearch,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import Avatar from "@/components/profile/Avatar";
import ListingCard from "@/components/listing/ListingCard";
import SaveButton from "@/components/listing/SaveButton";
import Reveal from "@/components/Reveal";
import { formatDateRange, formatPostedAt } from "@/lib/dates";
import type { Listing } from "@/lib/types";

interface Props {
  listing: Listing;
  /** Other listings by the same traveller. */
  others: Listing[];
}

export default function ListingDetail({ listing, others }: Props) {
  return (
    <main className="bg-bg pb-[72px] pt-9">
      <div className="mx-auto flex max-w-content flex-col gap-7 px-5 sm:px-8 lg:px-20">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-muted">
          <Link href="/catalog" className="transition hover:text-ink">
            Попутчики
          </Link>
          {listing.destinations[0] && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-subtle" />
              <span>{listing.destinations[0]}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-subtle" />
          <span className="text-ink">{listing.author.name}</span>
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="w-full shrink-0 lg:w-[600px]">
            <div className="relative h-[440px] overflow-hidden rounded-card bg-surface-2 sm:h-[560px] lg:h-[720px]">
              <Avatar
                src={listing.author.avatarUrl}
                name={listing.author.name}
                className="h-full w-full"
                radiusClassName="rounded-none"
                textClassName="text-[96px]"
              />
              <span className="absolute left-4 top-4 flex items-center gap-2 rounded-pill bg-white/95 px-3.5 py-2 text-[13px] font-semibold text-ink">
                <Users className="h-4 w-4 text-accent" />
                {listing.authorKind} · ищу {listing.seeking}
              </span>
            </div>
          </div>

          <Info listing={listing} />
        </div>

        <hr className="border-t border-border" />

        <AuthorSection listing={listing} />
        <OtherSection listing={listing} others={others} />
      </div>
    </main>
  );
}

/* -------------------------------------------------------------- Info */

function Info({ listing }: { listing: Listing }) {
  const { author } = listing;
  const dates = formatDateRange(listing.startDate, listing.endDate);
  const traits = buildTraits(listing);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[26px]">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-[32px] font-bold text-ink sm:text-[44px]">
          {author.name}
          {author.age !== null && (
            <span className="font-normal text-muted">, {author.age}</span>
          )}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          {author.reviewsCount > 0 ? (
            <>
              <Star className="h-[18px] w-[18px] fill-gold text-gold" />
              <span className="text-[15px] font-bold text-ink">
                {author.rating.toFixed(1)}
              </span>
              <span className="text-[15px] text-subtle">
                · {author.reviewsCount} отзыв(ов)
              </span>
            </>
          ) : (
            <span className="rounded-pill bg-teal-soft px-3 py-1 text-[13px] font-bold text-teal">
              Новый участник
            </span>
          )}
          <span className="text-[15px] text-subtle">
            · опубликовано {formatPostedAt(listing.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Fact icon={MapPin} label="Направление">
          {listing.destinations.join(" · ")}
        </Fact>
        <Fact icon={Calendar} label="Даты">
          {dates || "Гибкие"}
        </Fact>
        <Fact icon={UserSearch} label="Кого ищу">
          {listing.seeking}
        </Fact>
        <Fact icon={Compass} label="Тип поездки">
          {listing.tripType || "Любое путешествие"}
        </Fact>
        {listing.origin && (
          <Fact icon={MapPin} label="Откуда">
            {listing.origin}
          </Fact>
        )}
        {listing.finance && (
          <Fact icon={Wallet} label="Финансы">
            {listing.finance}
          </Fact>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[23px] font-bold text-ink">
          О поездке
        </h2>
        <p className="whitespace-pre-line text-[15px] leading-[1.6] text-muted">
          {listing.description}
        </p>
      </section>

      {traits.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[23px] font-bold text-ink">
            Об авторе поездки
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {traits.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-pill border border-border bg-white px-3.5 py-2 text-[14px] font-medium text-ink"
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-4 rounded-card bg-accent-soft p-[26px]">
        <h3 className="font-display text-[21px] font-bold text-ink">
          Понравился этот попутчик?
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/messages?to=${author.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-accent py-4 text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink"
          >
            <MessageCircle className="h-5 w-5" />
            Написать
          </Link>
          <SaveButton listingId={listing.id} authorId={author.id} />
        </div>
      </div>
    </div>
  );
}

/** Only the facts the traveller actually filled in. */
function buildTraits(listing: Listing): { icon: LucideIcon; label: string }[] {
  const traits: { icon: LucideIcon; label: string }[] = [];
  if (listing.languages.length > 0)
    traits.push({ icon: Languages, label: listing.languages.join(", ") });
  if (listing.smoking) traits.push({ icon: Cigarette, label: listing.smoking });
  if (listing.height > 0)
    traits.push({ icon: Ruler, label: `${listing.height} см` });
  return traits;
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-btn border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-[17px] w-[17px] shrink-0 text-accent" />
        <span className="text-[12px] font-bold uppercase tracking-[0.4px] text-subtle">
          {label}
        </span>
      </div>
      <span className="text-[15px] font-semibold text-ink">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------- Author */

function AuthorSection({ listing }: { listing: Listing }) {
  const { author } = listing;

  return (
    <Reveal className="flex flex-col gap-5">
      <h2 className="font-display text-[26px] text-ink">Об авторе</h2>

      <div className="flex flex-col gap-6 rounded-card border border-border bg-white p-6 shadow-[0_10px_30px_rgba(42,37,33,0.09)] sm:p-7 lg:flex-row lg:items-center">
        <Avatar
          src={author.avatarUrl}
          name={author.name}
          className="h-24 w-24 shrink-0"
          textClassName="text-[30px]"
        />

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-[24px] text-ink">
              {author.name}
            </span>
            {author.reviewsCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-pill bg-surface-2 px-3 py-1.5">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="text-[13px] font-semibold text-ink">
                  {author.rating.toFixed(1)}
                </span>
                <span className="text-[13px] text-muted">
                  · {author.reviewsCount}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[14px] text-muted">
            <MapPin className="h-[15px] w-[15px] text-subtle" />
            {author.city || "Город не указан"} · @{author.username}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 lg:w-[200px]">
          <Link
            href={`/messages?to=${author.id}`}
            className="rounded-btn bg-accent py-[13px] text-center text-[15px] font-semibold text-white transition hover:bg-accent-ink"
          >
            Написать
          </Link>
          <Link
            href={`/profile/${author.id}`}
            className="rounded-btn bg-surface-2 py-[13px] text-center text-[15px] font-semibold text-ink transition hover:bg-border"
          >
            Смотреть профиль
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------- Others */

function OtherSection({
  listing,
  others,
}: {
  listing: Listing;
  others: Listing[];
}) {
  if (others.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-[28px] text-ink">
          Другие объявления · {listing.author.name}
        </h2>
        <Link
          href="/catalog"
          className="text-[15px] text-muted transition hover:text-ink"
        >
          Смотреть все →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((other, i) => (
          <Reveal key={other.id} delay={i * 90} className="h-full">
            <ListingCard listing={other} href={`/listing/${other.id}`} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
