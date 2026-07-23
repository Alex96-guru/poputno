"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import ListingCard from "@/components/listing/ListingCard";
import Dropdown from "@/components/ui/Dropdown";
import InterestAccordion from "@/components/ui/InterestAccordion";
import Reveal from "@/components/Reveal";
import { useAuth } from "@/lib/auth";
import { findCity, indexCities } from "@/lib/geo";
import {
  AUTHOR_KINDS,
  FINANCE_OPTIONS,
  LISTING_CATEGORIES,
  POPULAR_COUNTRIES,
  SEEKING_OPTIONS,
  TRIP_TYPES,
} from "@/lib/listing-options";
import {
  applyFilters,
  EMPTY_FILTERS,
  hasAnyFilter,
  pluralTravellers,
  sortListings,
  type CatalogFilters,
  type SortKey,
} from "@/lib/listing-filters";
import type { City, Listing } from "@/lib/types";

/** Filter fields that hold a multi-select list. */
type ToggleKey =
  | "categories"
  | "interests"
  | "destinations"
  | "authorKinds"
  | "seeking"
  | "tripTypes";

/** Radii the slider snaps to, in kilometres; 0 means the city itself. */
const RADIUS_STEPS = [0, 25, 50, 100, 200, 500, 1000];

/** Panel heading follows the chosen shelf. */
const PANEL_COPY: Record<string, { title: string; hint: string }> = {
  Путешествия: {
    title: "Поиск попутчиков",
    hint: "Найдите, с кем отправиться в дорогу.",
  },
  Встречи: { title: "Поиск встреч", hint: "Найдите, с кем провести время рядом." },
  "В гости": { title: "Поиск хозяев", hint: "Найдите, кто примет и покажет город." },
};

const DEFAULT_COPY = {
  title: "Найти попутчиков",
  hint: "Люди по духу, месту и датам.",
};

interface Props {
  listings: Listing[];
  cities: City[];
  /** Seeded from the URL, so a search from the home page arrives applied. */
  initialFilters?: CatalogFilters;
}

export default function Catalog({ listings, cities, initialFilters }: Props) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<CatalogFilters>(
    initialFilters ?? EMPTY_FILTERS,
  );
  const [sort, setSort] = useState<SortKey>("recent");

  const patch = (changes: Partial<CatalogFilters>) =>
    setFilters((prev) => ({ ...prev, ...changes }));

  const toggleIn = (key: ToggleKey, value: string) =>
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));

  const cityIndex = useMemo(() => indexCities(cities), [cities]);

  const visible = useMemo(
    () =>
      sortListings(applyFilters(listings, filters, { cities: cityIndex }), sort),
    [listings, filters, sort, cityIndex],
  );

  const chips = useMemo(() => buildChips(filters), [filters]);

  return (
    <main className="bg-bg pb-20 pt-11">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-5 sm:px-8 lg:px-20">
        <header className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold text-ink sm:text-[44px]">
            Найти попутчиков
          </h1>
          <p className="max-w-[820px] text-[17px] leading-[1.5] text-muted">
            Люди, которые ищут компанию прямо сейчас. Фильтруйте по типу,
            интересам, месту и датам.
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterPanel
            filters={filters}
            patch={patch}
            toggleIn={toggleIn}
            onReset={() => setFilters(EMPTY_FILTERS)}
            knownOrigin={findCity(cityIndex, filters.origin) !== undefined}
            homeCity={user?.city ?? ""}
            resultCount={visible.length}
          />

          <section
            id="results"
            className="flex min-w-0 flex-1 scroll-mt-24 flex-col gap-6"
          >
            <label className="flex items-center gap-3 rounded-btn border border-border bg-white p-2 pl-[18px] shadow-[0_4px_14px_rgba(42,37,33,0.05)]">
              <Search className="h-5 w-5 shrink-0 text-accent" />
              <input
                value={filters.query}
                onChange={(e) => patch({ query: e.target.value })}
                placeholder="Поиск по имени, направлению или описанию"
                className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
              />
              {filters.query && (
                <button
                  type="button"
                  onClick={() => patch({ query: "" })}
                  aria-label="Очистить поиск"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-btn text-muted transition hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[16px] font-semibold text-ink">
                  найдено {pluralTravellers(visible.length)}
                </span>
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => patch(chip.clear)}
                    className="flex items-center gap-1.5 rounded-pill bg-accent-soft px-3 py-[7px] text-[13px] font-semibold text-accent-ink transition hover:bg-accent hover:text-white"
                  >
                    {chip.label}
                    <X className="h-[13px] w-[13px]" />
                  </button>
                ))}
              </div>

              <label className="flex shrink-0 items-center gap-2 rounded-btn border border-border bg-white px-[15px] py-[11px] text-[14px] font-semibold text-muted">
                Сортировка:
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-transparent font-semibold text-ink outline-none"
                >
                  <option value="recent">сначала новые</option>
                  <option value="rating">по рейтингу</option>
                </select>
              </label>
            </div>

            {visible.length === 0 ? (
              <EmptyState
                filtered={hasAnyFilter(filters)}
                onReset={() => setFilters(EMPTY_FILTERS)}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((listing, i) => (
                  <Reveal key={listing.id} delay={(i % 3) * 90} className="h-full">
                    <ListingCard listing={listing} href={`/listing/${listing.id}`} />
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------- active chips */

interface Chip {
  key: string;
  label: string;
  clear: Partial<CatalogFilters>;
}

function buildChips(filters: CatalogFilters): Chip[] {
  const chips: Chip[] = [];
  for (const category of filters.categories)
    chips.push({
      key: `cat-${category}`,
      label: category,
      clear: { categories: filters.categories.filter((c) => c !== category) },
    });
  for (const interest of filters.interests)
    chips.push({
      key: `int-${interest}`,
      label: interest,
      clear: { interests: filters.interests.filter((i) => i !== interest) },
    });
  for (const country of filters.destinations)
    chips.push({
      key: `to-${country}`,
      label: country,
      clear: { destinations: filters.destinations.filter((c) => c !== country) },
    });
  if (filters.origin)
    chips.push({
      key: "origin",
      label:
        filters.radius > 0
          ? `${filters.origin} +${filters.radius} км`
          : `из ${filters.origin}`,
      clear: { origin: "", radius: 0 },
    });
  if (filters.ageMin || filters.ageMax)
    chips.push({
      key: "age",
      label: `${filters.ageMin || "18"}–${filters.ageMax || "…"} лет`,
      clear: { ageMin: "", ageMax: "" },
    });
  if (filters.withPhoto)
    chips.push({ key: "photo", label: "с фото", clear: { withPhoto: false } });
  if (filters.travellingNow)
    chips.push({
      key: "now",
      label: "уже в поездке",
      clear: { travellingNow: false },
    });
  if (filters.from || filters.to)
    chips.push({
      key: "dates",
      label: [filters.from, filters.to].filter(Boolean).join(" – "),
      clear: { from: "", to: "" },
    });
  if (filters.finance)
    chips.push({ key: "finance", label: filters.finance, clear: { finance: "" } });
  for (const kind of filters.authorKinds)
    chips.push({
      key: `kind-${kind}`,
      label: kind,
      clear: { authorKinds: filters.authorKinds.filter((k) => k !== kind) },
    });
  for (const type of filters.tripTypes)
    chips.push({
      key: `trip-${type}`,
      label: type,
      clear: { tripTypes: filters.tripTypes.filter((t) => t !== type) },
    });
  return chips;
}

/* ---------------------------------------------------------- filter panel */

function FilterPanel({
  filters,
  patch,
  toggleIn,
  onReset,
  knownOrigin,
  homeCity,
  resultCount,
}: {
  filters: CatalogFilters;
  patch: (changes: Partial<CatalogFilters>) => void;
  toggleIn: (key: ToggleKey, value: string) => void;
  onReset: () => void;
  knownOrigin: boolean;
  homeCity: string;
  resultCount: number;
}) {
  const [more, setMore] = useState(false);
  const activeTab = filters.categories[0] ?? "";
  const copy = PANEL_COPY[activeTab] ?? DEFAULT_COPY;
  const nearby = filters.origin !== "" && filters.origin === homeCity;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 self-start rounded-card border border-border bg-white p-6 shadow-[0_12px_32px_rgba(42,37,33,0.10)] lg:w-[400px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[22px] font-bold text-ink">
            {copy.title}
          </h2>
          <p className="text-[14px] text-muted">{copy.hint}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasAnyFilter(filters)}
          className="shrink-0 pt-1 text-[13px] font-semibold text-accent-ink transition hover:text-accent disabled:text-subtle"
        >
          Сбросить
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {LISTING_CATEGORIES.map(({ value, icon: Icon }) => {
          const active = activeTab === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => patch({ categories: active ? [] : [value] })}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-btn px-1.5 py-3.5 text-[13px] transition ${
                active
                  ? "border-[1.5px] border-accent bg-accent-soft font-bold text-accent-ink"
                  : "border border-border bg-white font-medium text-muted hover:border-accent"
              }`}
            >
              <Icon className="h-5 w-5" />
              {value}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SeekingField
          selected={filters.seeking}
          onToggle={(v) => toggleIn("seeking", v)}
        />
        <div className="rounded-btn border border-border bg-white px-3.5 py-2.5">
          <span className="block text-[11px] font-medium text-muted">Возраст</span>
          <span className="flex items-center gap-2">
            <AgeBox
              value={filters.ageMin}
              onChange={(ageMin) => patch({ ageMin })}
              label="Возраст от"
              placeholder="18"
            />
            <span className="text-[14px] text-muted">—</span>
            <AgeBox
              value={filters.ageMax}
              onChange={(ageMax) => patch({ ageMax })}
              label="Возраст до"
              placeholder="99"
            />
          </span>
        </div>
      </div>

      <div
        className={`flex items-center gap-2.5 rounded-btn border border-border bg-white px-3.5 py-3 ${
          homeCity ? "" : "opacity-60"
        }`}
      >
        <MapPin className="h-[17px] w-[17px] shrink-0 text-accent" />
        <span className="flex-1 text-[14px] text-ink">
          Искать поблизости
          <span className="text-muted">
            {homeCity ? ` · ${homeCity}` : " · укажите город в профиле"}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={nearby}
          aria-label="Искать поблизости"
          disabled={!homeCity}
          onClick={() =>
            patch(nearby ? { origin: "", radius: 0 } : { origin: homeCity, radius: 50 })
          }
          className={`flex h-[26px] w-[46px] shrink-0 items-center rounded-pill p-[3px] transition disabled:cursor-not-allowed ${
            nearby ? "justify-end bg-accent" : "justify-start bg-border"
          }`}
        >
          <span className="h-5 w-5 rounded-pill bg-white" />
        </button>
      </div>

      <InterestAccordion
        selected={filters.interests}
        onToggle={(v) => toggleIn("interests", v)}
      />

      <button
        type="button"
        onClick={() =>
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        className="flex items-center justify-center gap-2.5 rounded-btn bg-accent py-[15px] text-[16px] font-bold text-white shadow-[0_8px_18px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink"
      >
        <Search className="h-[18px] w-[18px]" />
        Найти
        <span className="font-medium opacity-80">· {resultCount}</span>
      </button>

      <button
        type="button"
        onClick={() => setMore((v) => !v)}
        aria-expanded={more}
        className="flex items-center justify-center gap-1.5 text-[14px] font-semibold text-muted transition hover:text-ink"
      >
        {more ? "Свернуть фильтры" : "Больше фильтров"}
        {more ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {more && (
        <div className="flex flex-col gap-[22px] border-t border-border pt-5">
          <FilterGroup label="Куда">
            <ChipGroup
              options={POPULAR_COUNTRIES}
              selected={filters.destinations}
              onToggle={(v) => toggleIn("destinations", v)}
            />
            {filters.destinations.filter((c) => !POPULAR_COUNTRIES.includes(c))
              .length > 0 && (
              <ChipGroup
                options={filters.destinations.filter(
                  (c) => !POPULAR_COUNTRIES.includes(c),
                )}
                selected={filters.destinations}
                onToggle={(v) => toggleIn("destinations", v)}
              />
            )}
          </FilterGroup>

          <FilterGroup label="Откуда едут">
            <div className="flex w-full items-center gap-2 rounded-btn border border-border bg-surface-2 px-3.5 py-3 focus-within:border-accent">
              <MapPin className="h-[17px] w-[17px] shrink-0 text-subtle" />
              <input
                value={filters.origin}
                onChange={(e) => patch({ origin: e.target.value })}
                placeholder="Любой город"
                className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-subtle"
              />
            </div>
            {knownOrigin && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted">Радиус</span>
                  <span className="text-[13px] font-semibold text-ink">
                    {filters.radius === 0 ? "только город" : `${filters.radius} км`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={RADIUS_STEPS.length - 1}
                  step={1}
                  value={Math.max(0, RADIUS_STEPS.indexOf(filters.radius))}
                  onChange={(e) =>
                    patch({ radius: RADIUS_STEPS[Number(e.target.value)] })
                  }
                  aria-label="Радиус поиска"
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-pill bg-surface-2 accent-accent"
                />
              </div>
            )}
          </FilterGroup>

          <FilterGroup label="Даты">
            <div className="flex flex-col gap-2">
              <DateInput
                value={filters.from}
                onChange={(from) => patch({ from })}
                label="Дата от"
                prefix="от"
              />
              <DateInput
                value={filters.to}
                min={filters.from}
                onChange={(to) => patch({ to })}
                label="Дата до"
                prefix="до"
              />
            </div>
          </FilterGroup>

          <FilterGroup label="Финансы">
            <div className="flex w-full items-center gap-2 rounded-btn border border-border bg-surface-2 px-3.5 py-3 focus-within:border-accent">
              <Wallet className="h-4 w-4 shrink-0 text-subtle" />
              <select
                value={filters.finance}
                onChange={(e) => patch({ finance: e.target.value })}
                aria-label="Финансы"
                className="w-full bg-transparent text-[14px] text-ink outline-none"
              >
                <option value="">Любые</option>
                {FINANCE_OPTIONS.map(({ value }) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </FilterGroup>

          <FilterGroup label="Формат компании">
            <ChipGroup
              options={AUTHOR_KINDS.map((c) => c.value)}
              selected={filters.authorKinds}
              onToggle={(v) => toggleIn("authorKinds", v)}
            />
          </FilterGroup>

          <FilterGroup label="Тип поездки">
            <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto pr-1">
              {TRIP_TYPES.map((type) => (
                <Toggle
                  key={type}
                  checked={filters.tripTypes.includes(type)}
                  onToggle={() => toggleIn("tripTypes", type)}
                  label={type}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Ещё">
            <Toggle
              checked={filters.withPhoto}
              onToggle={() => patch({ withPhoto: !filters.withPhoto })}
              label="Только с фото"
            />
            <Toggle
              checked={filters.travellingNow}
              onToggle={() => patch({ travellingNow: !filters.travellingNow })}
              label="Уже в поездке"
            />
          </FilterGroup>
        </div>
      )}
    </aside>
  );
}

/* --------------------------------------------------------------- pieces */

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[11px]">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      {children}
    </div>
  );
}

function AgeBox({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      min={18}
      max={120}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-10 rounded-btn border border-border bg-surface-2 py-1.5 text-center text-[14px] text-ink outline-none focus:border-accent placeholder:text-subtle"
    />
  );
}

function DateInput({
  value,
  min,
  onChange,
  label,
  prefix,
}: {
  value: string;
  min?: string;
  onChange: (value: string) => void;
  label: string;
  prefix: string;
}) {
  return (
    <span className="flex w-full min-w-0 items-center gap-2 rounded-btn border border-border bg-surface-2 px-3 py-2.5 focus-within:border-accent">
      <Calendar className="h-[17px] w-[17px] shrink-0 text-subtle" />
      <span className="shrink-0 text-[13px] text-subtle">{prefix}</span>
      <input
        type="date"
        value={value}
        min={min || undefined}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 bg-transparent text-[13px] text-ink outline-none"
      />
    </span>
  );
}

function Toggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[14px] text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-[1.5px] transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
          checked ? "border-accent bg-accent" : "border-border bg-white"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </span>
      {label}
    </label>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option)}
            className={`rounded-pill border px-3.5 py-[7px] text-[13px] font-semibold transition ${
              active
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface-2 text-muted hover:border-accent hover:text-accent-ink"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function SeekingField({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const summary =
    selected.length === 0
      ? "кого угодно"
      : selected.length === 1
        ? selected[0]
        : `${selected[0]} +${selected.length - 1}`;

  return (
    <Dropdown
      open={open}
      onClose={() => setOpen(false)}
      trigger={
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full rounded-btn border border-border bg-white px-3.5 py-2.5 text-left transition hover:border-accent"
        >
          <span className="block text-[11px] font-medium text-muted">Я ищу</span>
          <span className="flex items-center gap-2">
            <UserRound className="h-4 w-4 shrink-0 text-accent" />
            <span className="flex-1 truncate text-[15px] font-semibold text-ink">
              {summary}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
          </span>
        </button>
      }
    >
      <div className="flex flex-col gap-0.5 p-1.5">
        {SEEKING_OPTIONS.map(({ value, icon: Icon }) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
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
  );
}

/* ----------------------------------------------------------- empty state */

function EmptyState({
  filtered,
  onReset,
}: {
  filtered: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-white px-6 py-14 text-center">
      <p className="font-display text-[20px] font-bold text-ink">
        {filtered ? "Под фильтры ничего не подошло" : "Объявлений пока нет"}
      </p>
      <p className="max-w-[420px] text-[14px] leading-[1.5] text-muted">
        {filtered
          ? "Попробуйте убрать часть условий — например, расширить даты или направление."
          : "Станьте первым: расскажите о поездке, и вас увидят другие путешественники."}
      </p>
      {filtered ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-1 rounded-btn bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-ink"
        >
          Сбросить фильтры
        </button>
      ) : (
        <Link
          href="/create"
          className="mt-1 rounded-btn bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-ink"
        >
          Создать объявление
        </Link>
      )}
    </div>
  );
}
