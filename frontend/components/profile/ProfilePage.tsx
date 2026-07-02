import {
  BadgeCheck,
  Calendar,
  MapPin,
  MessageCircle,
  Share2,
  Star,
} from "lucide-react";
import PersonCard from "@/components/PersonCard";
import Reveal from "@/components/Reveal";
import type { Person } from "@/lib/types";

const img = (id: string, w = 200) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`;

const STATS = [
  ["12", "объявлений"],
  ["31", "поездок"],
  ["37", "отзывов"],
] as const;

const REVIEWS = [
  {
    name: "Алексей",
    date: "Апрель 2026",
    rating: "5.0",
    avatar: "photo-1562532643-ecfb49d57fc0",
    body: "Путешествовали вместе по Грузии — Мария отличный компаньон, лёгкая на подъём и очень заботливая. Однозначно рекомендую!",
  },
  {
    name: "Ирина",
    date: "Март 2026",
    rating: "5.0",
    avatar: "photo-1610983262851-b6193a8daa17",
    body: "Организованная и позитивная. Всё прошло гладко, маршрут был продуман. С удовольствием поехала бы снова.",
  },
  {
    name: "Дмитрий",
    date: "Февраль 2026",
    rating: "4.8",
    avatar: "photo-1635868048064-14dae83000d2",
    body: "Классный человек и интересный собеседник. Немного разошлись по темпу, но в целом поездка супер.",
  },
];

interface Props {
  person: Person;
  listings: Person[];
}

export default function ProfilePage({ person, listings }: Props) {
  const region = person.location.split("·")[0]?.trim() ?? "Россия";

  return (
    <main className="bg-bg pb-[72px] pt-11">
      <div className="mx-auto flex max-w-content flex-col gap-9 px-5 sm:px-8 lg:px-20">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-7">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
            <div
              className="h-[132px] w-[132px] shrink-0 rounded-pill border-4 border-white bg-cover bg-center shadow-[0_10px_30px_rgba(42,37,33,0.12)]"
              style={{ backgroundImage: `url(${person.photoUrl})` }}
            />
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-[30px] font-bold text-ink sm:text-[38px]">
                  {person.name}
                </h1>
                <BadgeCheck className="h-[26px] w-[26px] shrink-0 text-teal" />
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[16px] font-medium text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-[17px] w-[17px] text-accent" />
                  {region}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-[17px] w-[17px] fill-gold text-gold" />
                  {person.rating.toFixed(1)} · 37 отзывов
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-[17px] w-[17px] text-accent" />
                  На сервисе с 2023
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex flex-1 items-center justify-center gap-2.5 rounded-btn bg-accent px-[26px] py-[13px] text-[16px] font-semibold text-white transition hover:bg-accent-ink lg:flex-none">
              <MessageCircle className="h-[19px] w-[19px]" />
              Написать
            </button>
            <button className="flex flex-1 items-center justify-center gap-2.5 rounded-btn border border-border bg-white px-[26px] py-[13px] text-[16px] font-semibold text-ink transition hover:border-accent lg:flex-none">
              <Share2 className="h-[18px] w-[18px]" />
              Поделиться
            </button>
          </div>
        </header>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display text-[22px] font-bold text-ink">О себе</h2>
          <p className="max-w-[900px] text-[16px] leading-[1.6] text-muted">
            Путешествую 8 лет, была в 24 странах. Люблю горы, вино и медленные
            маршруты без спешки. Ищу единомышленников, с которыми одинаково легко
            и в хайкинге, и в разговорах за ужином.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {[...STATS, [person.rating.toFixed(1), "рейтинг"] as const].map(
            ([value, label]) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-card border border-border bg-white p-[22px]"
              >
                <span className="font-display text-[32px] font-bold text-ink">
                  {value}
                </span>
                <span className="text-[15px] font-medium text-muted">
                  {label}
                </span>
              </div>
            ),
          )}
        </div>

        <div className="flex gap-9 border-b border-border">
          <span className="border-b-[3px] border-accent pb-3.5 text-[18px] font-bold text-ink">
            Объявления
          </span>
          <span className="pb-3.5 text-[18px] font-medium text-muted">
            Отзывы
          </span>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((p, i) => (
            <Reveal key={p.id} delay={i * 90} className="h-full">
              <PersonCard person={p} />
            </Reveal>
          ))}
        </div>

        <section className="flex flex-col gap-[18px]">
          <h2 className="font-display text-[24px] font-bold text-ink">Отзывы</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((review) => (
              <Reveal key={review.name} className="h-full">
                <article className="flex h-full flex-col gap-3.5 rounded-card border border-border bg-white p-[22px]">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-12 w-12 shrink-0 rounded-pill bg-cover bg-center bg-surface-2"
                      style={{ backgroundImage: `url(${img(review.avatar, 120)})` }}
                    />
                    <div className="flex flex-1 flex-col">
                      <span className="text-[16px] font-bold text-ink">
                        {review.name}
                      </span>
                      <span className="text-[13px] text-subtle">
                        {review.date}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Star className="h-[15px] w-[15px] fill-gold text-gold" />
                      <span className="text-[14px] font-semibold text-ink">
                        {review.rating}
                      </span>
                    </span>
                  </div>
                  <p className="text-[15px] leading-[1.55] text-muted">
                    {review.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
