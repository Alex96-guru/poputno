import {
  Baby,
  Briefcase,
  Calendar,
  Cigarette,
  Heart,
  Languages,
  MapPin,
  MessageCircle,
  Music,
  PawPrint,
  Ruler,
  School,
  Star,
  type LucideIcon,
} from "lucide-react";
import ListingCard from "@/components/listing/ListingCard";
import Reveal from "@/components/Reveal";
import type { Listing, PublicUser } from "@/lib/types";
import Avatar from "./Avatar";
import { plural } from "./ProfileSidebar";

interface Props {
  user: PublicUser;
  listings: Listing[];
}

export default function ProfilePage({ user, listings }: Props) {
  const facts = buildFacts(user);

  return (
    <main className="bg-bg pb-[72px] pt-11">
      <div className="mx-auto flex max-w-content flex-col gap-9 px-5 sm:px-8 lg:px-20">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-7">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              className="h-[132px] w-[132px] shrink-0 border-4 border-white shadow-[0_10px_30px_rgba(42,37,33,0.12)]"
            />
            <div className="flex flex-col gap-2.5">
              <h1 className="font-display text-[30px] font-bold text-ink sm:text-[38px]">
                {user.name}
                {user.age !== null && (
                  <span className="font-normal text-muted">, {user.age}</span>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[16px] font-medium text-muted">
                {user.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-[17px] w-[17px] text-accent" />
                    {user.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Star className="h-[17px] w-[17px] fill-gold text-gold" />
                  {user.reviewsCount > 0
                    ? `${user.rating.toFixed(1)} · ${plural(user.reviewsCount, "отзыв", "отзыва", "отзывов")}`
                    : "Пока нет отзывов"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-[17px] w-[17px] text-accent" />
                  На сервисе с {new Date(user.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2.5 rounded-btn bg-accent px-[26px] py-[13px] text-[16px] font-semibold text-white transition hover:bg-accent-ink"
          >
            <MessageCircle className="h-[19px] w-[19px]" />
            Написать
          </button>
        </header>

        {user.bio && (
          <section className="flex flex-col gap-2.5">
            <h2 className="font-display text-[22px] font-bold text-ink">
              О себе
            </h2>
            <p className="max-w-[900px] whitespace-pre-line text-[16px] leading-[1.6] text-muted">
              {user.bio}
            </p>
          </section>
        )}

        {facts.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {facts.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-pill border border-border bg-white px-3.5 py-2 text-[14px] font-medium text-ink"
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                {label}
              </span>
            ))}
          </div>
        )}

        {user.interests.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-[22px] font-bold text-ink">
              Интересы
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill bg-surface-2 px-3.5 py-2 text-[13px] font-semibold text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-6">
          <h2 className="border-b border-border pb-3.5 font-display text-[22px] font-bold text-ink">
            Объявления
            {listings.length > 0 && (
              <span className="ml-2 font-body text-[16px] font-medium text-muted">
                {listings.length}
              </span>
            )}
          </h2>

          {listings.length === 0 ? (
            <p className="rounded-card border border-dashed border-border bg-white px-6 py-10 text-center text-[15px] text-muted">
              У {user.name} пока нет активных объявлений.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing, i) => (
                <Reveal key={listing.id} delay={i * 90} className="h-full">
                  <ListingCard
                    listing={listing}
                    href={`/listing/${listing.id}`}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/** Only the profile fields this traveller actually filled in. */
function buildFacts(user: PublicUser): { icon: LucideIcon; label: string }[] {
  const facts: { icon: LucideIcon; label: string }[] = [];
  if (user.languages.length > 0)
    facts.push({ icon: Languages, label: user.languages.join(", ") });
  if (user.profession) facts.push({ icon: Briefcase, label: user.profession });
  if (user.university) facts.push({ icon: School, label: user.university });
  if (user.maritalStatus)
    facts.push({ icon: Heart, label: user.maritalStatus });
  if (user.children) facts.push({ icon: Baby, label: user.children });
  if (user.pets) facts.push({ icon: PawPrint, label: user.pets });
  if (user.smoking) facts.push({ icon: Cigarette, label: user.smoking });
  if (user.height) facts.push({ icon: Ruler, label: `${user.height} см` });
  if (user.music) facts.push({ icon: Music, label: user.music });
  return facts;
}
