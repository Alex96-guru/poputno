"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CirclePlus,
  MapPin,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import { filtersToQuery } from "@/lib/catalog-url";
import {
  ALL_COUNTRIES,
  POPULAR_COUNTRIES,
  SEEKING_OPTIONS,
} from "@/lib/listing-options";
import { EMPTY_FILTERS, type CatalogFilters } from "@/lib/listing-filters";

type Panel = "who" | "origin" | "where";

/**
 * The phone home-screen search block (design 24): three labelled fields,
 * a "Фильтры" link and a big "Найти". It writes the same query string the
 * catalog reads, so the search carries over.
 */
export default function MobileSearch() {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);

  const close = () => setPanel(null);
  const toggle = (next: Panel) => setPanel((p) => (p === next ? null : next));
  const patch = (changes: Partial<CatalogFilters>) =>
    setFilters((prev) => ({ ...prev, ...changes }));

  const go = () => {
    const q = filtersToQuery(filters);
    router.push(q ? `/catalog?${q}` : "/catalog");
  };

  const seekingSummary =
    filters.seeking.length === 0
      ? "Кого угодно"
      : filters.seeking.length === 1
        ? filters.seeking[0]
        : `${filters.seeking[0]} +${filters.seeking.length - 1}`;

  return (
    <div className="flex flex-col gap-2.5 rounded-card bg-surface-2 p-3">
      {/* Я ищу */}
      <Dropdown
        open={panel === "who"}
        onClose={close}
        panelClassName="w-full"
        trigger={
          <Field
            label="Я ищу"
            icon={UserRound}
            value={seekingSummary}
            filled={filters.seeking.length > 0}
            onClick={() => toggle("who")}
          />
        }
      >
        <div className="flex flex-col gap-0.5 p-1.5">
          {SEEKING_OPTIONS.map(({ value, icon: Icon }) => {
            const active = filters.seeking.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  patch({
                    seeking: active
                      ? filters.seeking.filter((s) => s !== value)
                      : [...filters.seeking, value],
                  })
                }
                className={`flex items-center gap-2.5 rounded-btn px-3 py-2.5 text-left text-[14px] transition ${
                  active
                    ? "bg-accent-soft font-semibold text-accent-ink"
                    : "text-ink hover:bg-surface-2"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {value}
                {active && <Check className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </Dropdown>

      {/* Откуда едем */}
      <Dropdown
        open={panel === "origin"}
        onClose={close}
        panelClassName="w-full"
        trigger={
          <Field
            label="Откуда едем"
            icon={MapPin}
            value={filters.origin || "Любой город"}
            filled={Boolean(filters.origin)}
            onClick={() => toggle("origin")}
          />
        }
      >
        <div className="flex flex-col gap-3 p-3.5">
          <input
            autoFocus
            value={filters.origin}
            onChange={(e) => patch({ origin: e.target.value })}
            placeholder="Город"
            className="rounded-btn border border-border bg-surface-2 px-3.5 py-3 text-[15px] text-ink outline-none focus:border-accent placeholder:text-muted"
          />
          <DoneButton onClick={close} />
        </div>
      </Dropdown>

      {/* Куда */}
      <div className="flex flex-col gap-2">
        <Dropdown
          open={panel === "where"}
          onClose={close}
          panelClassName="w-full"
          trigger={
            <button
              type="button"
              onClick={() => toggle("where")}
              className="w-full rounded-btn border border-border bg-white px-3.5 py-2.5 text-left"
            >
              <span className="block text-[11px] font-medium text-muted">
                Куда
              </span>
              <span className="flex items-center gap-2">
                <CirclePlus className="h-4 w-4 shrink-0 text-accent" />
                <span className="flex-1 text-[15px] font-semibold text-muted">
                  Добавить
                </span>
                {filters.destinations.length > 0 && (
                  <span className="rounded-pill bg-surface-2 px-2.5 py-[3px] text-[12px] font-semibold text-muted">
                    {filters.destinations.length}
                  </span>
                )}
              </span>
            </button>
          }
        >
          <CountryPicker
            selected={filters.destinations}
            onToggle={(country) =>
              patch({
                destinations: filters.destinations.includes(country)
                  ? filters.destinations.filter((c) => c !== country)
                  : [...filters.destinations, country],
              })
            }
            onDone={close}
          />
        </Dropdown>

        {filters.destinations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.destinations.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() =>
                  patch({
                    destinations: filters.destinations.filter(
                      (c) => c !== country,
                    ),
                  })
                }
                className="flex items-center gap-1.5 rounded-pill border border-border bg-white px-3 py-1.5 text-[13px] font-semibold text-ink"
              >
                {country}
                <X className="h-3 w-3 text-muted" />
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={go}
        className="flex items-center gap-2 self-start px-1 py-1 text-[14px] font-semibold text-muted transition hover:text-ink"
      >
        <SlidersHorizontal className="h-[17px] w-[17px]" />
        Все фильтры
      </button>

      <button
        type="button"
        onClick={go}
        className="flex items-center justify-center gap-2 rounded-btn bg-accent py-[15px] text-[16px] font-bold text-white shadow-[0_8px_18px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={2.5} />
        Найти
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- pieces */

function Field({
  label,
  icon: Icon,
  value,
  filled,
  onClick,
}: {
  label: string;
  icon: typeof UserRound;
  value: string;
  filled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-btn border border-border bg-white px-3.5 py-2.5 text-left"
    >
      <span className="block text-[11px] font-medium text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-accent" />
        <span
          className={`flex-1 truncate text-[15px] font-semibold ${
            filled ? "text-ink" : "text-muted"
          }`}
        >
          {value}
        </span>
      </span>
    </button>
  );
}

function DoneButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-btn bg-surface-2 py-3 text-[15px] font-bold text-ink transition hover:bg-border"
    >
      Готово
    </button>
  );
}

function CountryPicker({
  selected,
  onToggle,
  onDone,
}: {
  selected: string[];
  onToggle: (country: string) => void;
  onDone: () => void;
}) {
  const [tab, setTab] = useState<"popular" | "alpha">("popular");
  const list = tab === "popular" ? POPULAR_COUNTRIES : ALL_COUNTRIES;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5 px-4 pb-1 pt-3.5">
        {(["popular", "alpha"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-pill px-3.5 py-[7px] text-[13px] transition ${
              tab === key
                ? "bg-surface-2 font-semibold text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {key === "popular" ? "Популярные" : "По алфавиту"}
          </button>
        ))}
        <span className="flex-1" />
        <button
          type="button"
          onClick={onDone}
          aria-label="Закрыть"
          className="text-muted transition hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[240px] overflow-y-auto px-4 py-1">
        {list.map((country) => {
          const active = selected.includes(country);
          return (
            <button
              key={country}
              type="button"
              onClick={() => onToggle(country)}
              className="flex w-full items-center gap-3 py-2.5 text-left"
            >
              <span
                className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border-[1.5px] transition ${
                  active ? "border-accent bg-accent" : "border-border bg-white"
                }`}
              >
                {active && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className="text-[14px] text-ink">{country}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 pt-1">
        <DoneButton onClick={onDone} />
      </div>
    </div>
  );
}
