"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  MapPin,
  Search,
  SlidersHorizontal,
  UserSearch,
  X,
  type LucideIcon,
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import RangeCalendar from "@/components/ui/RangeCalendar";
import { filtersToQuery } from "@/lib/catalog-url";
import { formatDateRange } from "@/lib/dates";
import {
  ALL_COUNTRIES,
  POPULAR_COUNTRIES,
  SEEKING_OPTIONS,
} from "@/lib/listing-options";
import { EMPTY_FILTERS, type CatalogFilters } from "@/lib/listing-filters";
import { suggestCities } from "@/lib/geo";
import type { City } from "@/lib/types";

type Panel = "where" | "origin" | "when" | "who" | "more";

export default function SearchBar({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);

  const close = useCallback(() => setPanel(null), []);
  const toggle = (next: Panel) => setPanel((p) => (p === next ? null : next));
  const patch = (changes: Partial<CatalogFilters>) =>
    setFilters((prev) => ({ ...prev, ...changes }));

  const submit = () => {
    const query = filtersToQuery(filters);
    router.push(query ? `/catalog?${query}` : "/catalog");
  };

  const extras = Number(filters.withPhoto) + Number(filters.travellingNow);

  return (
    <div className="flex w-full flex-col items-stretch gap-1.5 rounded-card border border-border bg-white p-2 shadow-[0_16px_40px_rgba(42,37,33,0.12)] md:flex-row md:items-center">
      <Dropdown
        open={panel === "where"}
        onClose={close}
        panelClassName="w-[300px]"
        trigger={
          <FieldButton
            icon={MapPin}
            label="Куда"
            value={
              filters.destinations.length > 0
                ? filters.destinations.join(", ")
                : "Куда едем?"
            }
            filled={filters.destinations.length > 0}
            onClick={() => toggle("where")}
          />
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

      <Divider />

      <Dropdown
        open={panel === "origin"}
        onClose={close}
        panelClassName="w-[300px]"
        trigger={
          <FieldButton
            icon={MapPin}
            label="Откуда едем"
            value={filters.origin || "Любой город"}
            filled={Boolean(filters.origin)}
            onClick={() => toggle("origin")}
          />
        }
      >
        <OriginPicker
          cities={cities}
          origin={filters.origin}
          radius={filters.radius}
          onChange={patch}
          onDone={close}
        />
      </Dropdown>

      <Divider />

      <Dropdown
        open={panel === "when"}
        onClose={close}
        panelClassName="w-[320px]"
        trigger={
          <FieldButton
            icon={Calendar}
            label="Когда"
            value={formatDateRange(filters.from, filters.to) || "Любые даты"}
            filled={Boolean(filters.from || filters.to)}
            onClick={() => toggle("when")}
          />
        }
      >
        <div className="flex flex-col gap-3 p-4">
          <RangeCalendar
            start={filters.from}
            end={filters.to}
            onChange={(from, to) => patch({ from, to })}
          />
          <div className="flex items-center gap-2">
            {(filters.from || filters.to) && (
              <button
                type="button"
                onClick={() => patch({ from: "", to: "" })}
                className="rounded-btn px-3 py-3 text-[14px] font-semibold text-muted transition hover:text-ink"
              >
                Сбросить
              </button>
            )}
            <DoneButton onClick={close} />
          </div>
        </div>
      </Dropdown>

      <Divider />

      <Dropdown
        open={panel === "who"}
        onClose={close}
        panelClassName="w-[300px]"
        trigger={
          <FieldButton
            icon={UserSearch}
            label="Я ищу"
            value={
              filters.seeking.length > 0
                ? filters.seeking.join(", ")
                : "Кого угодно"
            }
            filled={filters.seeking.length > 0}
            onClick={() => toggle("who")}
          />
        }
      >
        <div className="flex flex-col gap-4 p-[18px]">
          <div className="flex flex-wrap gap-2">
            {SEEKING_OPTIONS.map(({ value, icon: Icon }) => {
              const active = filters.seeking.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    patch({
                      seeking: active
                        ? filters.seeking.filter((s) => s !== value)
                        : [...filters.seeking, value],
                    })
                  }
                  className={`flex items-center gap-2 rounded-pill border px-3.5 py-[9px] text-[14px] transition ${
                    active
                      ? "border-accent bg-accent-soft font-semibold text-accent-ink"
                      : "border-border bg-white text-ink hover:border-accent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {value}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] font-semibold text-ink">Возраст</span>
            <div className="flex items-center gap-2.5">
              <AgeInput
                value={filters.ageMin}
                onChange={(ageMin) => patch({ ageMin })}
                label="Возраст от"
              />
              <span className="text-[15px] text-muted">—</span>
              <AgeInput
                value={filters.ageMax}
                onChange={(ageMax) => patch({ ageMax })}
                label="Возраст до"
              />
              <span className="flex-1" />
              {(filters.ageMin || filters.ageMax) && (
                <button
                  type="button"
                  onClick={() => patch({ ageMin: "", ageMax: "" })}
                  aria-label="Сбросить возраст"
                  className="grid h-[30px] w-[30px] place-items-center rounded-pill bg-surface-2 text-muted transition hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <CheckRow
            checked={filters.withPhoto}
            onToggle={() => patch({ withPhoto: !filters.withPhoto })}
            title="Только с фото"
          />

          <DoneButton onClick={close} />
        </div>
      </Dropdown>

      <Dropdown
        open={panel === "more"}
        onClose={close}
        panelClassName="w-[320px]"
        align="right"
        trigger={
          <button
            type="button"
            onClick={() => toggle("more")}
            aria-label="Дополнительные фильтры"
            className="relative flex items-center justify-center gap-2 rounded-btn px-4 py-3 text-[14px] font-semibold text-muted transition hover:bg-surface-2 hover:text-ink md:px-3"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="md:hidden">Ещё фильтры</span>
            {extras > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-pill bg-accent md:right-0" />
            )}
          </button>
        }
      >
        <div className="flex flex-col gap-4 p-[18px]">
          <CheckRow
            checked={filters.travellingNow}
            onToggle={() => patch({ travellingNow: !filters.travellingNow })}
            title="Уже отдыхают"
            hint="Те, чья поездка идёт прямо сейчас"
          />
          <CheckRow
            checked={filters.withPhoto}
            onToggle={() => patch({ withPhoto: !filters.withPhoto })}
            title="Только с фото"
          />
          <DoneButton onClick={close} />
        </div>
      </Dropdown>

      <button
        type="button"
        onClick={submit}
        className="flex items-center justify-center gap-2 rounded-btn bg-accent px-[26px] py-[15px] text-[16px] font-bold text-white transition hover:bg-accent-ink md:ml-1"
      >
        <Search className="h-[19px] w-[19px]" strokeWidth={2.5} />
        Найти попутчиков
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- controls */

function Divider() {
  return <span aria-hidden className="hidden h-9 w-px bg-border md:block" />;
}

function FieldButton({
  icon: Icon,
  label,
  value,
  filled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  filled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[18px] px-4 py-2.5 text-left transition hover:bg-surface-2"
    >
      <Icon className="h-5 w-5 shrink-0 text-accent" />
      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted">
          {label}
        </span>
        <span
          className={`truncate text-[15px] font-semibold ${
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
      className="flex-1 rounded-btn bg-surface-2 py-3 text-[15px] font-bold text-ink transition hover:bg-border"
    >
      Готово
    </button>
  );
}

function AgeInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={18}
      max={120}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-[76px] rounded-btn border border-border bg-surface-2 py-2.5 text-center text-[15px] text-ink outline-none focus:border-accent"
    />
  );
}

function CheckRow({
  checked,
  onToggle,
  title,
  hint,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`mt-[1px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[6px] border-[1.5px] transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
          checked ? "border-accent bg-accent" : "border-border bg-white"
        }`}
      >
        {checked && <Check className="h-[14px] w-[14px] text-white" />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] text-ink">{title}</span>
        {hint && <span className="text-[13px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}

const RADIUS_STEPS = [0, 25, 50, 100, 200, 500, 1000];

function OriginPicker({
  cities,
  origin,
  radius,
  onChange,
  onDone,
}: {
  cities: City[];
  origin: string;
  radius: number;
  onChange: (changes: Partial<CatalogFilters>) => void;
  onDone: () => void;
}) {
  const suggestions = suggestCities(cities, origin);
  const known = cities.some(
    (c) => c.name.toLowerCase() === origin.trim().toLowerCase(),
  );

  return (
    <div className="flex flex-col gap-4 p-[18px]">
      <div className="flex flex-col gap-2">
        <input
          autoFocus
          value={origin}
          onChange={(e) => onChange({ origin: e.target.value })}
          placeholder="Город"
          className="rounded-btn border border-border bg-surface-2 px-3.5 py-3 text-[15px] text-ink outline-none focus:border-accent placeholder:text-muted"
        />
        {!known && suggestions.length > 0 && (
          <div className="flex max-h-[132px] flex-col overflow-y-auto">
            {suggestions.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => onChange({ origin: city.name })}
                className="rounded-btn px-2.5 py-2 text-left text-[14px] text-ink transition hover:bg-surface-2"
              >
                {city.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Distance is only measurable from a city we have on the map. */}
      {known ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-muted">Радиус поиска</span>
            <span className="text-[14px] font-semibold text-ink">
              {radius === 0 ? "только город" : `${radius} км`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={RADIUS_STEPS.length - 1}
            step={1}
            value={Math.max(0, RADIUS_STEPS.indexOf(radius))}
            onChange={(e) =>
              onChange({ radius: RADIUS_STEPS[Number(e.target.value)] })
            }
            aria-label="Радиус поиска"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-pill bg-surface-2 accent-accent"
          />
        </div>
      ) : (
        origin.trim() !== "" && (
          <p className="text-[13px] leading-[1.4] text-muted">
            Этого города нет в справочнике — искать будем по названию, без
            радиуса.
          </p>
        )
      )}

      <DoneButton onClick={onDone} />
    </div>
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

      <div className="max-h-[260px] overflow-y-auto px-4 py-1">
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
