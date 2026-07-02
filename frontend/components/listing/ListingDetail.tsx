import Link from "next/link";
import {
  BadgeCheck,
  Bookmark,
  Calendar,
  ChevronRight,
  CircleCheck,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Mountain,
  Star,
  UserSearch,
} from "lucide-react";
import type { ReactNode } from "react";
import PersonCard from "@/components/PersonCard";
import Reveal from "@/components/Reveal";
import type { Person } from "@/lib/types";

const img = (id: string, w = 1080) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`;

const THUMBS = [
  "photo-1557800524-c494ad3ae595",
  "photo-1753351054809-6f7560b2172a",
  "photo-1504193902866-27cfb5aafcc8",
];

const PLAN = [
  "Треккинг к монастырю Гергети",
  "Винный тур по Кахетии",
  "Серные бани и старый Тбилиси",
  "Совместная аренда авто",
];

interface Props {
  person: Person;
  others: Person[];
}

export default function ListingDetail({ person, others }: Props) {
  return (
    <main className="bg-bg pb-[72px] pt-9">
      <div className="mx-auto flex max-w-content flex-col gap-7 px-5 sm:px-8 lg:px-20">
        <Breadcrumb person={person} />

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <PhotoColumn person={person} />
          <Info person={person} />
        </div>

        <hr className="border-t border-border" />

        <AuthorSection person={person} />
        <OtherSection person={person} others={others} />
      </div>
    </main>
  );
}

/* -------------------------------------------------------- Breadcrumb */

function Breadcrumb({ person }: { person: Person }) {
  const region = person.location.split("·")[0]?.trim() ?? "";
  return (
    <nav className="flex items-center gap-2 text-[13px] font-medium text-muted">
      <Link href="/catalog" className="transition hover:text-ink">
        Попутчики
      </Link>
      <ChevronRight className="h-3.5 w-3.5 text-subtle" />
      <span>{region}</span>
      <ChevronRight className="h-3.5 w-3.5 text-subtle" />
      <span className="text-ink">{person.name}</span>
    </nav>
  );
}

/* -------------------------------------------------------- Photo column */

function PhotoColumn({ person }: { person: Person }) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[600px]">
      <div
        className="flex h-[440px] items-start justify-between rounded-card bg-cover bg-center p-4 sm:h-[560px] lg:h-[720px]"
        style={{ backgroundImage: `url(${person.photoUrl})` }}
      >
        <span className="rounded-pill bg-white/95 px-3.5 py-2 text-[13px] font-semibold text-ink">
          {person.companyType}
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-pill bg-white/95 text-ink">
          <Heart className="h-5 w-5" />
        </span>
      </div>

      <div className="flex gap-3">
        {THUMBS.map((id) => (
          <div
            key={id}
            className="h-[130px] flex-1 rounded-btn bg-cover bg-center"
            style={{ backgroundImage: `url(${img(id, 600)})` }}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Info */

function Info({ person }: { person: Person }) {
  return (
    <div className="flex flex-1 flex-col gap-[26px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-[32px] font-bold text-ink sm:text-[44px]">
            {person.name}
          </h1>
          <BadgeCheck className="h-[26px] w-[26px] shrink-0 text-teal" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-[18px] w-[18px] fill-gold text-gold" />
            ))}
          </div>
          <span className="text-[15px] font-bold text-ink">
            {person.rating.toFixed(1)}
          </span>
          <span className="text-[15px] text-subtle">
            · 32 отзыва · Проверенный профиль
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Fact icon={<MapPin className="h-[17px] w-[17px] text-accent" />} label="Направление">
          {person.location}
        </Fact>
        <Fact icon={<Calendar className="h-[17px] w-[17px] text-accent" />} label="Даты">
          {person.dates} · 8 дней
        </Fact>
        <Fact icon={<UserSearch className="h-[17px] w-[17px] text-accent" />} label="Кого ищу">
          Девушку или пару
        </Fact>
        <Fact icon={<Mountain className="h-[17px] w-[17px] text-accent" />} label="Формат поездки">
          Горы, хайкинг, вино
        </Fact>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[23px] font-bold text-ink">О поездке</h2>
        <p className="text-[15px] leading-[1.6] text-muted">{person.description}</p>
        <p className="text-[15px] leading-[1.6] text-muted">
          Ищу лёгких на подъём попутчиков — девушку или пару, — с которыми
          комфортно делить дорогу, жильё и впечатления. Билеты и маршрут гибкие,
          всё обсуждаемо.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[23px] font-bold text-ink">
          Что планирую
        </h2>
        {PLAN.map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <CircleCheck className="h-[19px] w-[19px] text-teal" />
            <span className="text-[15px] font-medium text-ink">{item}</span>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-4 rounded-card bg-accent-soft p-[26px]">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-[21px] font-bold text-ink">
            Понравился этот попутчик?
          </h3>
          <div className="flex items-center gap-1.5 text-[14px] text-accent-ink">
            <Clock3 className="h-[15px] w-[15px]" />
            Обычно отвечает в течение часа
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-accent py-4 text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink">
            <MessageCircle className="h-5 w-5" />
            Написать
          </button>
          <button className="flex items-center gap-2 rounded-btn border border-border bg-white px-[22px] py-4 text-[16px] font-semibold text-ink transition hover:border-accent">
            <Bookmark className="h-[19px] w-[19px]" />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-btn border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[12px] font-bold uppercase tracking-[0.4px] text-subtle">
          {label}
        </span>
      </div>
      <span className="text-[15px] font-semibold text-ink">{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------- Author */

function AuthorSection({ person }: { person: Person }) {
  return (
    <Reveal className="flex flex-col gap-5">
      <h2 className="font-display text-[26px] text-ink">Об авторе</h2>

      <div className="flex flex-col gap-6 rounded-card border border-border bg-white p-6 shadow-[0_10px_30px_rgba(42,37,33,0.09)] sm:p-7 lg:flex-row">
        <div
          className="h-24 w-24 shrink-0 rounded-pill bg-cover bg-center bg-surface-2"
          style={{ backgroundImage: `url(${img("photo-1571513722275-4b41940f54b8", 200)})` }}
        />

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="font-display text-[24px] text-ink">
              {person.name}
            </span>
            <BadgeCheck className="h-[22px] w-[22px] text-teal" />
            <span className="flex items-center gap-1.5 rounded-pill bg-surface-2 px-3 py-1.5">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="text-[13px] font-semibold text-ink">
                {person.rating.toFixed(1)}
              </span>
              <span className="text-[13px] text-muted">· 32 отзыва</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[14px] text-muted">
            <MapPin className="h-[15px] w-[15px] text-subtle" />
            Москва · на сервисе с 2023
          </div>

          <p className="text-[14px] leading-[1.5] text-muted">
            Путешествую 5+ лет, люблю горы, вино и неторопливые треки. Всегда за
            честное деление расходов и хорошую компанию в дороге.
          </p>

          <div className="mt-1 flex items-center gap-5">
            {[
              ["12", "Объявлений"],
              ["24", "Поездок"],
              ["32", "Отзывов"],
            ].map(([value, label]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-ink">{value}</span>
                <span className="text-[14px] text-subtle">{label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 lg:w-[200px]">
          <button className="rounded-btn bg-accent py-[13px] text-[15px] font-semibold text-white transition hover:bg-accent-ink">
            Написать
          </button>
          <Link
            href={`/profile/${person.id}`}
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
  person,
  others,
}: {
  person: Person;
  others: Person[];
}) {
  if (others.length === 0) return null;
  const firstName = person.name.split(",")[0];
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-[28px] text-ink">
          Другие объявления · {firstName}
        </h2>
        <Link
          href="/catalog"
          className="text-[15px] text-muted transition hover:text-ink"
        >
          Смотреть все →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((p, i) => (
          <Reveal key={p.id} delay={i * 90} className="h-full">
            <PersonCard person={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
