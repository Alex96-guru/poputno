"use client";

import { useState } from "react";
import { Check, ChevronDown, House, Lock, MapPin, UserRound } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import InterestAccordion from "@/components/ui/InterestAccordion";
import {
  HOSTING_ROLES,
  SEEKING_OPTIONS,
  type Choice,
} from "@/lib/listing-options";
import type { ListingDraft } from "@/lib/types";

interface Props {
  draft: ListingDraft;
  set: <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => void;
  /** The author's city, shown on the "рядом" switch and the visit form. */
  homeCity: string;
}

/* --------------------------------------------------------------- Встречи */

export function MeetupFields({ draft, set, homeCity }: Props) {
  const toggleInterest = (item: string) =>
    set(
      "interests",
      draft.interests.includes(item)
        ? draft.interests.filter((i) => i !== item)
        : [...draft.interests, item],
    );

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <SeekingField
          value={draft.seeking}
          onPick={(v) => set("seeking", v)}
        />

        <div className="rounded-btn border border-border bg-white px-3.5 py-2.5">
          <span className="block text-[11px] font-medium text-muted">
            Возраст
          </span>
          <span className="flex items-center gap-2">
            <AgeBox
              value={draft.ageMin}
              onChange={(v) => set("ageMin", v)}
              label="Возраст от"
              placeholder="18"
            />
            <span className="text-[14px] text-muted">—</span>
            <AgeBox
              value={draft.ageMax}
              onChange={(v) => set("ageMax", v)}
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
          Встречаемся поблизости
          <span className="text-muted">
            {homeCity ? ` · ${homeCity}` : " · укажите город в профиле"}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={draft.nearby}
          aria-label="Встречаемся поблизости"
          disabled={!homeCity}
          onClick={() => set("nearby", !draft.nearby)}
          className={`flex h-[26px] w-[46px] shrink-0 items-center rounded-pill p-[3px] transition disabled:cursor-not-allowed ${
            draft.nearby ? "justify-end bg-accent" : "justify-start bg-border"
          }`}
        >
          <span className="h-5 w-5 rounded-pill bg-white" />
        </button>
      </div>

      <InterestAccordion
        selected={draft.interests}
        onToggle={toggleInterest}
      />
    </div>
  );
}

/* -------------------------------------------------------------- В гости */

export function HostingFields({ draft, set, homeCity }: Props) {
  const hosting = draft.hostingRole !== "Ищу приём";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-2.5">
        {HOSTING_ROLES.map((role) => {
          const active = draft.hostingRole === role;
          return (
            <button
              key={role}
              type="button"
              aria-pressed={active}
              onClick={() => set("hostingRole", role)}
              className={`flex items-center justify-center gap-2 rounded-btn px-3 py-3 text-[14px] transition ${
                active
                  ? "border-[1.5px] border-accent bg-accent-soft font-bold text-accent-ink"
                  : "border border-border bg-white font-medium text-muted hover:border-accent"
              }`}
            >
              <House className="h-[17px] w-[17px]" />
              {role}
            </button>
          );
        })}
      </div>

      {/* The label flips with the role: a host states where they are — taken
          from the profile — while a guest types where they are heading. */}
      <div className="rounded-btn border border-border bg-white px-3.5 py-2.5 focus-within:border-accent">
        <span className="block text-[11px] font-medium text-muted">
          {hosting ? "Где находитесь" : "Куда едете"}
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-accent" />
          {hosting ? (
            <>
              <span className="flex-1 truncate text-[15px] font-semibold text-ink">
                {homeCity || "Укажите город в профиле"}
              </span>
              <Lock className="h-[15px] w-[15px] shrink-0 text-muted" />
            </>
          ) : (
            <input
              value={draft.destinations[0] ?? ""}
              onChange={(e) =>
                set(
                  "destinations",
                  e.target.value.trim() ? [e.target.value] : [],
                )
              }
              placeholder="Город или страна"
              aria-label="Куда едете"
              className="w-full min-w-0 bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
            />
          )}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- controls */

function AgeBox({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      min={18}
      max={120}
      aria-label={label}
      value={value === 0 ? "" : value}
      placeholder={placeholder}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-12 rounded-btn border border-border bg-surface-2 py-1.5 text-center text-[14px] text-ink outline-none focus:border-accent placeholder:text-subtle"
    />
  );
}

function SeekingField({
  value,
  onPick,
}: {
  value: string;
  onPick: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current: Choice | undefined = SEEKING_OPTIONS.find(
    (o) => o.value === value,
  );
  const Icon = current?.icon ?? UserRound;

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
          <span className="block text-[11px] font-medium text-muted">
            Я ищу
          </span>
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-accent" />
            <span className="flex-1 truncate text-[15px] font-semibold text-ink">
              {value || "Выбрать"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
          </span>
        </button>
      }
    >
      <div className="flex flex-col gap-0.5 p-1.5">
        {SEEKING_OPTIONS.map(({ value: option, icon: OptionIcon }) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                onPick(option);
                setOpen(false);
              }}
              className={`flex items-center gap-2.5 rounded-btn px-3 py-2.5 text-left text-[14px] transition ${
                active
                  ? "bg-accent-soft font-semibold text-accent-ink"
                  : "text-ink hover:bg-surface-2"
              }`}
            >
              <OptionIcon className="h-4 w-4 shrink-0" />
              {option}
              {active && <Check className="ml-auto h-4 w-4" />}
            </button>
          );
        })}
      </div>
    </Dropdown>
  );
}
