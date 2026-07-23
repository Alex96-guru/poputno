"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  ChevronDown,
  CirclePlus,
  Compass,
  Eye,
  Languages,
  Lock,
  MapPin,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateRange } from "@/lib/dates";
import {
  ALL_COUNTRIES,
  AUTHOR_KINDS,
  DEFAULT_CATEGORY,
  FINANCE_OPTIONS,
  LISTING_CATEGORIES,
  LANGUAGE_OPTIONS,
  MAX_DESTINATIONS,
  MAX_HEIGHT_CM,
  MIN_HEIGHT_CM,
  POPULAR_COUNTRIES,
  SEEKING_OPTIONS,
  SMOKING_OPTIONS,
  TRIP_TYPES,
  type Choice,
} from "@/lib/listing-options";
import type { Listing, ListingDraft, User } from "@/lib/types";
import ListingCard from "@/components/listing/ListingCard";
import Dropdown from "@/components/ui/Dropdown";
import { HostingFields, MeetupFields } from "./CategoryFields";

/** Dresses the unsaved draft as a listing so the preview shares one card. */
function toPreview(user: User, draft: ListingDraft): Listing {
  return {
    ...draft,
    id: "preview",
    createdAt: "",
    // The server pins the origin on publish; the preview never needs it.
    originLat: null,
    originLon: null,
    author: {
      id: user.id,
      name: user.name,
      username: user.username,
      age: user.age,
      avatarUrl: user.avatarUrl,
      city: user.city,
      interests: user.interests,
      rating: user.rating,
      reviewsCount: user.reviewsCount,
    },
  };
}

/** Which popover is open; only one at a time. */
type Panel =
  | "author"
  | "seeking"
  | "destinations"
  | "dates"
  | "finance"
  | "tripType"
  | "languages";

export default function CreateListing({ user }: { user: User }) {
  const { token } = useAuth();
  const router = useRouter();

  const [panel, setPanel] = useState<Panel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Smoking, height and languages start from the profile but belong to the
  // listing once posted, so the traveller can tune them per trip.
  const [draft, setDraft] = useState<ListingDraft>({
    category: DEFAULT_CATEGORY,
    // Taken from the profile — the form no longer asks who the author is.
    authorKind: user.gender,
    seeking: "кого-нибудь",
    origin: user.city,
    destinations: [],
    description: "",
    startDate: "",
    endDate: "",
    finance: "Каждый платит за себя",
    tripType: "Любое путешествие",
    smoking: user.smoking,
    height: user.height ?? 0,
    languages: user.languages,
    remind: true,
    interests: [],
    ageMin: 0,
    ageMax: 0,
    nearby: true,
    hostingRole: "Принимаю гостей",
  });

  const isTrip = draft.category === "Путешествия";
  const isMeetup = draft.category === "Встречи";

  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const close = useCallback(() => setPanel(null), []);
  const toggle = (next: Panel) => setPanel((p) => (p === next ? null : next));

  const fail = (message: string) => {
    setError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!draft.authorKind)
      return fail("Укажите, кто вы, в профиле — без этого не опубликовать");
    // Only a trip has to name where it goes; a meeting or a visit has a city.
    if (isTrip && draft.destinations.length === 0)
      return fail("Выберите хотя бы одно направление");
    if (isMeetup && draft.interests.length === 0)
      return fail("Отметьте, чем хотите заняться");
    if (!draft.description.trim())
      return fail(isTrip ? "Опишите ваше путешествие" : "Добавьте описание");
    if (!token) return fail("Требуется авторизация");

    setError(null);
    setBusy(true);
    try {
      await api.createListing(token, {
        ...draft,
        description: draft.description.trim(),
      });
      router.push("/profile/me#listings");
    } catch (err) {
      setBusy(false);
      fail(err instanceof Error ? err.message : "Не удалось опубликовать");
    }
  };

  const toggleIn = (list: string[], item: string) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
    <main className="bg-bg pb-20 pt-11">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-5 sm:px-8 lg:px-20">
        <header className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold text-ink sm:text-[44px]">
            Новое объявление
          </h1>
          <p className="max-w-[820px] text-[17px] leading-[1.5] text-muted">
            Расскажите о себе и своём путешествии. Хорошее фото и понятное
            описание помогут быстрее найти попутчиков.
          </p>
        </header>

        <div className="flex flex-col justify-center gap-11 lg:flex-row">
          <form
            onSubmit={onSubmit}
            className="flex w-full flex-col gap-5 rounded-card border border-border bg-white p-5 shadow-[0_12px_32px_rgba(42,37,33,0.10)] sm:p-7 lg:w-[500px] lg:shrink-0"
          >
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[25px] font-bold text-ink">
                Моё путешествие
              </h2>
              <p className="text-[14px] text-muted">
                Заполните поля — так проще найти попутчиков по духу.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-btn border border-[#E9BEB6] bg-[#FCEEEB] px-4 py-3 text-[14px] font-medium text-[#C0392B]"
              >
                {error}
              </p>
            )}

            {/* Sets which shelf the listing lands on, so it comes first. */}
            <div className="grid grid-cols-3 gap-2">
              {LISTING_CATEGORIES.map(({ value, icon: Icon }) => {
                const active = draft.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set("category", value)}
                    className={`flex flex-col items-center gap-1.5 rounded-btn border px-2 py-3 text-[13px] font-semibold transition ${
                      active
                        ? "border-accent bg-accent-soft text-accent-ink"
                        : "border-border bg-white text-muted hover:border-accent"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {value}
                  </button>
                );
              })}
            </div>

            {/* "Я" comes from the profile now, so the form no longer asks. */}
            {!user.gender && (
              <p className="rounded-btn border border-[#E9BEB6] bg-[#FCEEEB] px-4 py-3 text-[14px] text-[#C0392B]">
                Укажите, кто вы, в{" "}
                <Link
                  href="/profile/edit#basics"
                  className="font-semibold underline underline-offset-2"
                >
                  профиле
                </Link>{" "}
                — это подставится в объявление.
              </p>
            )}

            {isMeetup && (
              <MeetupFields draft={draft} set={set} homeCity={user.city} />
            )}

            {draft.category === "В гости" && (
              <HostingFields draft={draft} set={set} homeCity={user.city} />
            )}

            {/* ------------------------------------------- who and where */}
            {isTrip && (
            <div className="flex flex-col gap-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Dropdown
                  open={panel === "seeking"}
                  onClose={close}
                  trigger={
                    <FieldButton
                      label="Ищу"
                      icon={SEEKING_OPTIONS.find((c) => c.value === draft.seeking)?.icon}
                      value={draft.seeking}
                      placeholder="Выбрать"
                      onClick={() => toggle("seeking")}
                    />
                  }
                >
                  <OptionList
                    options={SEEKING_OPTIONS}
                    value={draft.seeking}
                    onPick={(v) => {
                      set("seeking", v);
                      close();
                    }}
                  />
                </Dropdown>
              </div>

              {/* Comes from the profile — one home city, not per listing. */}
              <div className="rounded-btn border border-border bg-white px-3.5 py-2.5">
                <span className="text-[11px] font-medium text-muted">
                  Откуда едем
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-accent" />
                  {draft.origin ? (
                    <span className="flex-1 truncate text-[15px] font-semibold text-ink">
                      {draft.origin}
                    </span>
                  ) : (
                    <Link
                      href="/profile/edit#basics"
                      className="flex-1 truncate text-[15px] font-semibold text-accent-ink underline underline-offset-2"
                    >
                      Укажите город в профиле
                    </Link>
                  )}
                  <Lock className="h-[15px] w-[15px] shrink-0 text-muted" />
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <Dropdown
                  open={panel === "destinations"}
                  onClose={close}
                  trigger={
                    <button
                      type="button"
                      onClick={() => toggle("destinations")}
                      className="w-full rounded-btn border border-border bg-white px-3.5 py-2.5 text-left transition hover:border-accent"
                    >
                      <span className="block text-[11px] font-medium text-muted">
                        Куда
                      </span>
                      <span className="flex items-center gap-2">
                        <CirclePlus className="h-4 w-4 shrink-0 text-accent" />
                        <span className="flex-1 text-[15px] font-semibold text-muted">
                          Выбрать
                        </span>
                        <span className="rounded-pill bg-surface-2 px-2.5 py-[3px] text-[12px] font-semibold text-muted">
                          {draft.destinations.length} / {MAX_DESTINATIONS}
                        </span>
                      </span>
                    </button>
                  }
                >
                  <DestinationPicker
                    selected={draft.destinations}
                    onToggle={(country) => {
                      const has = draft.destinations.includes(country);
                      if (!has && draft.destinations.length >= MAX_DESTINATIONS)
                        return;
                      set("destinations", toggleIn(draft.destinations, country));
                    }}
                    onDone={close}
                  />
                </Dropdown>

                {draft.destinations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {draft.destinations.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() =>
                          set(
                            "destinations",
                            draft.destinations.filter((c) => c !== country),
                          )
                        }
                        className="flex items-center gap-[7px] rounded-pill bg-accent-soft px-3.5 py-[7px] text-[13px] font-semibold text-accent-ink transition hover:bg-accent hover:text-white"
                      >
                        {country}
                        <X className="h-[13px] w-[13px]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )}

            <textarea
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={1200}
              placeholder={
                isTrip
                  ? "Опишите ваше путешествие, и кого вы видите в качестве попутчика…"
                  : isMeetup
                    ? "Опишите, чем хотите заняться и с кем…"
                    : "Расскажите о жилье и что покажете гостям…"
              }
              className="h-[118px] w-full resize-none rounded-btn border border-border bg-white p-3.5 text-[14px] leading-[1.5] text-ink outline-none placeholder:text-muted focus:border-accent"
            />

            {isTrip && (
            <>
            {/* ------------------------------------- dates, money, format */}
            {/* No overflow-hidden here: it would clip the popovers, which are
                positioned absolutely against each row. The rows carry the
                rounded corners instead. */}
            <div className="rounded-card border border-border">
              <Dropdown
                open={panel === "dates"}
                onClose={close}
                trigger={
                  <SelectRow
                    icon={Calendar}
                    iconClass="text-accent"
                    value={
                      formatDateRange(draft.startDate, draft.endDate) ||
                      "Когда — выберите даты"
                    }
                    muted={!draft.startDate && !draft.endDate}
                    onClick={() => toggle("dates")}
                    divider
                    className="rounded-t-card"
                  />
                }
              >
                <DateRangePicker
                  start={draft.startDate}
                  end={draft.endDate}
                  onChange={(key, value) => set(key, value)}
                  onDone={close}
                />
              </Dropdown>

              <Dropdown
                open={panel === "finance"}
                onClose={close}
                trigger={
                  <SelectRow
                    icon={Wallet}
                    iconClass="text-teal"
                    value={draft.finance}
                    onClick={() => toggle("finance")}
                    divider
                  />
                }
              >
                <OptionList
                  options={FINANCE_OPTIONS}
                  value={draft.finance}
                  onPick={(v) => {
                    set("finance", v);
                    close();
                  }}
                />
              </Dropdown>

              <Dropdown
                open={panel === "tripType"}
                onClose={close}
                trigger={
                  <SelectRow
                    icon={Compass}
                    iconClass="text-accent"
                    value={draft.tripType}
                    onClick={() => toggle("tripType")}
                    className="rounded-b-card"
                  />
                }
              >
                <OptionList
                  options={TRIP_TYPES.map((value) => ({ value, icon: Compass }))}
                  value={draft.tripType}
                  onPick={(v) => {
                    set("tripType", v);
                    close();
                  }}
                />
              </Dropdown>
            </div>

            {/* -------------------------------------------- about, languages */}
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-3.5 rounded-card border border-border bg-white p-4">
                <span className="text-[11px] font-bold tracking-[0.5px] text-muted">
                  О СЕБЕ
                </span>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex gap-2.5">
                    {SMOKING_OPTIONS.map((option) => {
                      const active = draft.smoking === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={active}
                          onClick={() => set("smoking", active ? "" : option)}
                          className={`rounded-pill border px-4 py-[9px] text-[14px] transition ${
                            active
                              ? "border-accent bg-accent-soft font-semibold text-accent-ink"
                              : "border-border bg-white text-muted hover:border-accent"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-muted">Рост</span>
                    <span className="flex w-[92px] items-center gap-1 rounded-btn border border-border bg-surface-2 px-3 py-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={MIN_HEIGHT_CM}
                        max={MAX_HEIGHT_CM}
                        value={draft.height === 0 ? "" : draft.height}
                        onChange={(e) =>
                          set("height", Number(e.target.value) || 0)
                        }
                        placeholder="—"
                        className="w-full bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:text-subtle"
                      />
                      <span className="text-[15px] text-muted">см</span>
                    </span>
                  </label>
                </div>
              </div>

              <Dropdown
                open={panel === "languages"}
                onClose={close}
                trigger={
                  <button
                    type="button"
                    onClick={() => toggle("languages")}
                    className="flex w-full items-center gap-3 rounded-btn border border-border bg-white px-4 py-3.5 text-left transition hover:border-accent"
                  >
                    <Languages className="h-[18px] w-[18px] shrink-0 text-accent" />
                    <span className="text-[15px] text-ink">Владею языками</span>
                    <span className="flex-1 truncate text-[13px] text-muted">
                      {summarise(draft.languages)}
                    </span>
                    {draft.languages.length > 0 && (
                      <span className="h-2 w-2 shrink-0 rounded-pill bg-[#3BB273]" />
                    )}
                    <ChevronDown className="h-[17px] w-[17px] shrink-0 text-muted" />
                  </button>
                }
                panelClassName="w-full"
              >
                <CheckList
                  options={LANGUAGE_OPTIONS}
                  selected={draft.languages}
                  onToggle={(l) => set("languages", toggleIn(draft.languages, l))}
                  onDone={close}
                />
              </Dropdown>
            </div>
            </>
            )}

            {/* --------------------------------------------------- actions */}
            <div className="flex flex-col gap-3.5">
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2.5 rounded-btn bg-accent py-4 text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check className="h-[19px] w-[19px]" />
                {busy ? "Публикуем…" : "Опубликовать"}
              </button>

              <div className="flex items-center justify-between gap-3">
                <span id="remind-label" className="text-[14px] text-muted">
                  Напомнить перед окончанием публикации
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.remind}
                  aria-labelledby="remind-label"
                  onClick={() => set("remind", !draft.remind)}
                  className={`flex h-[26px] w-[46px] shrink-0 items-center rounded-pill p-[3px] transition ${
                    draft.remind ? "justify-end bg-accent" : "justify-start bg-border"
                  }`}
                >
                  <span className="h-5 w-5 rounded-pill bg-white" />
                </button>
              </div>
            </div>
          </form>

          <aside className="flex flex-col gap-4 lg:w-[340px] lg:shrink-0">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-muted">
              <Eye className="h-[17px] w-[17px]" />
              Предпросмотр
            </div>
            <p className="max-w-[300px] text-[13px] leading-[1.45] text-muted">
              Так ваше объявление выглядит в топе и поиске.
            </p>
            <div className="w-full max-w-[300px] lg:sticky lg:top-[94px]">
              <ListingCard listing={toPreview(user, draft)} preview />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/** "· English, +2" — the language field's subtitle. */
function summarise(languages: string[]): string {
  if (languages.length === 0) return "";
  const rest = languages.length - 1;
  return rest > 0 ? `· ${languages[0]}, +${rest}` : `· ${languages[0]}`;
}

/* ------------------------------------------------------------- controls */

function FieldButton({
  label,
  icon: Icon,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  value: string;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-btn border border-border bg-white px-3.5 py-2.5 text-left transition hover:border-accent"
    >
      <span className="block text-[11px] font-medium text-muted">{label}</span>
      <span className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-accent" />}
        <span
          className={`flex-1 truncate text-[15px] font-semibold ${
            value ? "text-ink" : "text-muted"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </span>
    </button>
  );
}

function SelectRow({
  icon: Icon,
  iconClass,
  value,
  muted,
  onClick,
  divider,
  className = "",
}: {
  icon: LucideIcon;
  iconClass: string;
  value: string;
  muted?: boolean;
  onClick: () => void;
  divider?: boolean;
  /** Corner rounding, since the group around the rows cannot clip them. */
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 bg-white px-4 py-[15px] text-left transition hover:bg-surface-2 ${
        divider ? "border-b border-border" : ""
      } ${className}`}
    >
      <Icon className={`h-[18px] w-[18px] shrink-0 ${iconClass}`} />
      <span
        className={`flex-1 truncate text-[15px] font-medium ${
          muted ? "text-muted" : "text-ink"
        }`}
      >
        {value}
      </span>
      <ChevronDown className="h-[17px] w-[17px] shrink-0 text-muted" />
    </button>
  );
}

function OptionList({
  options,
  value,
  onPick,
}: {
  options: Choice[];
  value: string;
  onPick: (value: string) => void;
}) {
  return (
    <div className="flex max-h-[320px] flex-col gap-0.5 overflow-y-auto p-1.5">
      {options.map(({ value: option, icon: Icon }) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onPick(option)}
            className={`flex items-center gap-3 rounded-btn px-3.5 py-2.5 text-left text-[14.5px] transition ${
              active
                ? "bg-accent-soft font-bold text-accent-ink"
                : "font-medium text-ink hover:bg-surface-2"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${
                active ? "text-accent-ink" : "text-muted"
              }`}
            />
            {option}
          </button>
        );
      })}
    </div>
  );
}

function DestinationPicker({
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
      <div className="flex items-center gap-2.5 px-4 py-3.5">
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

      <div className="max-h-[260px] overflow-y-auto px-4">
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

      <button
        type="button"
        onClick={onDone}
        className="border-t border-border py-3.5 text-[15px] font-bold text-ink transition hover:bg-surface-2"
      >
        Готово
      </button>
    </div>
  );
}

function CheckList({
  options,
  selected,
  onToggle,
  onDone,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="grid max-h-[260px] grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto p-3.5">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className="flex items-center gap-2 py-1.5 text-left"
            >
              <span
                className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border-[1.5px] transition ${
                  active ? "border-accent bg-accent" : "border-border bg-white"
                }`}
              >
                {active && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className="truncate text-[13px] text-ink">{option}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onDone}
        className="border-t border-border py-3.5 text-[15px] font-bold text-ink transition hover:bg-surface-2"
      >
        Готово
      </button>
    </div>
  );
}

function DateRangePicker({
  start,
  end,
  onChange,
  onDone,
}: {
  start: string;
  end: string;
  onChange: (key: "startDate" | "endDate", value: string) => void;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-muted">Начало</span>
          <input
            type="date"
            value={start}
            onChange={(e) => onChange("startDate", e.target.value)}
            className="rounded-btn border border-border bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-muted">Конец</span>
          <input
            type="date"
            value={end}
            min={start || undefined}
            onChange={(e) => onChange("endDate", e.target.value)}
            className="rounded-btn border border-border bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="border-t border-border py-3.5 text-[15px] font-bold text-ink transition hover:bg-surface-2"
      >
        Готово
      </button>
    </div>
  );
}

