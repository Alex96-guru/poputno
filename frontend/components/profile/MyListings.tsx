"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  MessageSquare,
  Pause,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import PersonCard from "@/components/PersonCard";
import type { Person } from "@/lib/types";

export type ListingStatus = "active" | "moderation" | "draft" | "archived";

export interface MyListing {
  person: Person;
  status: ListingStatus;
  views: number;
  replies: number;
}

const FILTERS: { key: ListingStatus; label: string }[] = [
  { key: "active", label: "Активные" },
  { key: "moderation", label: "На модерации" },
  { key: "draft", label: "Черновики" },
  { key: "archived", label: "Архив" },
];

const STATUS_STYLE: Record<ListingStatus, { label: string; chip: string; dot: string }> = {
  active: { label: "Активно", chip: "bg-[#E4F3EA] text-[#2C7A54]", dot: "bg-[#3E9B6E]" },
  moderation: { label: "На модерации", chip: "bg-surface-2 text-muted", dot: "bg-gold" },
  draft: { label: "Черновик", chip: "bg-surface-2 text-muted", dot: "bg-subtle" },
  archived: { label: "В архиве", chip: "bg-surface-2 text-subtle", dot: "bg-subtle" },
};

export default function MyListings({ listings }: { listings: MyListing[] }) {
  const [filter, setFilter] = useState<ListingStatus>("active");
  const visible = listings.filter((l) => l.status === filter);
  const activeCount = listings.filter((l) => l.status === "active").length;

  return (
    <section id="listings" className="flex flex-col gap-7 scroll-mt-24">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[26px] font-bold text-ink">
            Мои объявления
          </h2>
          <span className="flex items-center gap-1.5 rounded-pill bg-teal-soft px-3 py-[5px] text-[13px] font-semibold text-teal">
            <span className="h-[7px] w-[7px] rounded-pill bg-teal" />
            {activeCount} активных
          </span>
        </div>

        <Link
          href="/create"
          className="flex items-center gap-2 rounded-btn bg-accent px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-accent-ink"
        >
          <Plus className="h-[18px] w-[18px]" />
          Создать объявление
        </Link>
      </header>

      {listings.length > 0 && (
      <div className="flex flex-wrap gap-2.5">
        {FILTERS.map(({ key, label }) => {
          const count = listings.filter((l) => l.status === key).length;
          const isActive = key === filter;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`flex items-center gap-[7px] rounded-pill border px-4 py-[9px] text-[13px] font-semibold transition ${
                isActive
                  ? "border-accent bg-accent-soft text-accent-ink"
                  : "border-border bg-white text-muted hover:border-accent"
              }`}
            >
              {label}
              <span
                className={`rounded-pill px-2 py-0.5 text-[11px] font-bold ${
                  isActive ? "bg-accent text-white" : "bg-surface-2 text-subtle"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      )}

      {listings.length > 0 && visible.length === 0 && (
        <p className="rounded-card border border-border bg-white p-[22px] text-[15px] text-muted">
          В этой вкладке пока пусто.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((listing) => (
          <ListingItem key={listing.person.id} listing={listing} />
        ))}
        <CreatePlaceholder />
      </div>
    </section>
  );
}

function ListingItem({ listing }: { listing: MyListing }) {
  const status = STATUS_STYLE[listing.status];
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-border bg-white shadow-[0_12px_32px_rgba(42,37,33,0.10),0_2px_6px_rgba(42,37,33,0.05)]">
      <PersonCard person={listing.person} bare />

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-pill px-[11px] py-1.5 text-[12px] font-semibold ${status.chip}`}
          >
            <span className={`h-2 w-2 rounded-pill ${status.dot}`} />
            {status.label}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
            <Eye className="h-3.5 w-3.5 text-subtle" />
            {listing.views}
            <span className="text-subtle">·</span>
            <MessageSquare className="h-3.5 w-3.5 text-subtle" />
            {listing.replies}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-btn bg-surface-2 py-[9px] text-[12px] font-semibold text-ink transition hover:bg-border"
          >
            <Pencil className="h-[15px] w-[15px]" />
            Редактировать
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 rounded-btn bg-surface-2 px-3 py-[9px] text-[12px] font-semibold text-muted transition hover:bg-border"
          >
            <Pause className="h-[15px] w-[15px]" />
            Пауза
          </button>
          <button
            type="button"
            aria-label="Удалить объявление"
            className="grid w-10 place-items-center rounded-btn border border-[#F3C9C2] bg-[#FBE9E7] text-[#C0392B] transition hover:bg-[#F8DAD6]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function CreatePlaceholder() {
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
