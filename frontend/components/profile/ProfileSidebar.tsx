"use client";

import {
  BadgeCheck,
  Bookmark,
  Camera,
  ChevronRight,
  ClipboardList,
  CirclePlus,
  CircleCheck,
  Pencil,
  Settings,
  Share2,
  Star,
} from "lucide-react";
import type { User } from "@/lib/types";
import Avatar from "./Avatar";

export type ProfileTab = "listings" | "reviews" | "saved" | "settings";

interface Props {
  user: User;
  active: ProfileTab;
  onNavigate: (tab: ProfileTab) => void;
  onEdit: () => void;
  listingsCount: number;
  savedCount: number;
}

export default function ProfileSidebar({
  user,
  active,
  onNavigate,
  onEdit,
  listingsCount,
  savedCount,
}: Props) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-96">
      <ProfileCard user={user} onEdit={onEdit} onNavigate={onNavigate} />
      <Completeness user={user} />
      <About user={user} onEdit={onEdit} />
      <QuickNav
        user={user}
        active={active}
        onNavigate={onNavigate}
        listingsCount={listingsCount}
        savedCount={savedCount}
      />
    </aside>
  );
}

/* ------------------------------------------------------------------ card */

function ProfileCard({
  user,
  onEdit,
  onNavigate,
}: {
  user: User;
  onEdit: () => void;
  onNavigate: (tab: ProfileTab) => void;
}) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-card border border-border bg-white p-[26px] shadow-[0_10px_28px_rgba(42,37,33,0.10)]">
      <div className="relative h-[120px] w-[120px]">
        <Avatar
          src={user.avatarUrl}
          name={user.name}
          className="h-full w-full"
        />
        <button
          type="button"
          onClick={onEdit}
          aria-label="Сменить фото"
          className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-pill border-[3px] border-white bg-accent text-white transition hover:bg-accent-ink"
        >
          <Camera className="h-[17px] w-[17px]" />
        </button>
      </div>

      <div className="flex items-center gap-[7px]">
        <h1 className="font-display text-[23px] font-bold text-ink">
          {user.name}
        </h1>
        {user.emailVerified && (
          <BadgeCheck className="h-5 w-5 shrink-0 text-teal" />
        )}
      </div>

      <p className="text-[14px] text-muted">
        @{user.username}
        {user.age !== null && ` · ${plural(user.age, "год", "года", "лет")}`}
        {user.city && ` · ${user.city}`}
      </p>

      <div className="flex items-center gap-1.5">
        <Stars value={user.rating} size={15} />
        <span className="text-[13px] font-semibold text-ink">
          {user.reviewsCount > 0
            ? `${user.rating.toFixed(1)} · ${plural(user.reviewsCount, "отзыв", "отзыва", "отзывов")}`
            : "Пока нет отзывов"}
        </span>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center justify-center gap-2 rounded-btn bg-accent py-[13px] text-[15px] font-bold text-white transition hover:bg-accent-ink"
      >
        <Pencil className="h-4 w-4" />
        Редактировать профиль
      </button>

      <div className="flex w-full gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate("settings")}
          className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-surface-2 py-[11px] text-[14px] font-semibold text-muted transition hover:text-ink"
        >
          <Settings className="h-4 w-4" />
          Настройки
        </button>
        <button
          type="button"
          aria-label="Поделиться профилем"
          onClick={() => {
            void navigator.clipboard?.writeText(
              `${window.location.origin}/profile/${user.id}`,
            );
          }}
          className="grid w-12 place-items-center rounded-btn bg-surface-2 py-[11px] text-muted transition hover:text-ink"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- completeness */

function Completeness({ user }: { user: User }) {
  const { percent, items } = user.completeness;
  return (
    <section className="flex flex-col gap-3.5 rounded-card border border-border bg-white p-[22px]">
      <header className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-ink">Заполнение профиля</h2>
        <span className="font-display text-[18px] font-bold text-accent-ink">
          {percent}%
        </span>
      </header>

      <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-2">
        <div
          className="h-full rounded-pill bg-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="flex flex-col gap-[9px]">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-[9px]">
            {item.done ? (
              <CircleCheck className="h-[17px] w-[17px] shrink-0 text-teal" />
            ) : (
              <CirclePlus className="h-[17px] w-[17px] shrink-0 text-accent" />
            )}
            <span
              className={
                item.done
                  ? "flex-1 text-[13.5px] text-muted"
                  : "flex-1 text-[13.5px] font-semibold text-accent-ink"
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ----------------------------------------------------------------- about */

function About({ user, onEdit }: { user: User; onEdit: () => void }) {
  return (
    <section className="flex flex-col gap-3 rounded-card border border-border bg-white p-[22px]">
      <header className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-ink">О себе</h2>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Редактировать описание"
          className="grid h-[30px] w-[30px] place-items-center rounded-btn bg-surface-2 text-muted transition hover:text-ink"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </header>

      <p
        className={`text-[14px] leading-[1.55] ${user.bio ? "text-muted" : "text-subtle"}`}
      >
        {user.bio ||
          "Расскажите о себе — с кем и как вы любите путешествовать. Это первое, что читают попутчики."}
      </p>

      {user.interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {user.interests.map((tag) => (
            <span
              key={tag}
              className="rounded-pill bg-surface-2 px-3 py-1.5 text-[12px] font-semibold text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------- quick nav */

function QuickNav({
  user,
  active,
  onNavigate,
  listingsCount,
  savedCount,
}: {
  user: User;
  active: ProfileTab;
  onNavigate: (tab: ProfileTab) => void;
  listingsCount: number;
  savedCount: number;
}) {
  const items: {
    tab: ProfileTab;
    label: string;
    icon: typeof ClipboardList;
    badge?: number;
  }[] = [
    { tab: "listings", label: "Мои объявления", icon: ClipboardList, badge: listingsCount },
    { tab: "reviews", label: "Отзывы обо мне", icon: Star, badge: user.reviewsCount },
    { tab: "saved", label: "Сохранённые", icon: Bookmark, badge: savedCount },
    { tab: "settings", label: "Настройки", icon: Settings },
  ];

  return (
    <nav className="flex flex-col gap-0.5 rounded-card border border-border bg-white p-2">
      {items.map(({ tab, label, icon: Icon, badge }) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onNavigate(tab)}
            className={`flex items-center justify-between rounded-btn px-[13px] py-[11px] transition ${
              isActive ? "bg-accent-soft" : "hover:bg-surface-2"
            }`}
          >
            <span className="flex items-center gap-[11px]">
              <Icon
                className={`h-[18px] w-[18px] ${isActive ? "text-accent-ink" : "text-muted"}`}
              />
              <span
                className={
                  isActive
                    ? "text-[14px] font-bold text-accent-ink"
                    : "text-[14px] font-medium text-ink"
                }
              >
                {label}
              </span>
            </span>
            {badge === undefined ? (
              <ChevronRight className="h-4 w-4 text-subtle" />
            ) : (
              <span
                className={`rounded-pill px-[9px] py-0.5 text-[12px] font-bold ${
                  isActive ? "bg-accent text-white" : "bg-surface-2 text-subtle"
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* --------------------------------------------------------------- shared */

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <span className="flex gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < filled ? "fill-gold text-gold" : "text-subtle"}
        />
      ))}
    </span>
  );
}

export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}
