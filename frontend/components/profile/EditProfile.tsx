"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Baby,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  IdCard,
  PawPrint,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { useAuth } from "@/lib/auth";
import { birthDateError, todayIso } from "@/lib/age";
import {
  CHILDREN_OPTIONS,
  INTEREST_CATEGORIES,
  INTERESTS_TOTAL,
  LANGUAGE_OPTIONS,
  MARITAL_OPTIONS,
  MAX_HEIGHT_CM,
  MIN_HEIGHT_CM,
  PETS_OPTIONS,
  SMOKING_OPTIONS,
} from "@/lib/profile-options";
import type { ProfileUpdate, User } from "@/lib/types";
import AvatarField from "./AvatarField";
import Field from "./Field";

/** "москва" -> "Москва", leaving the rest of the input alone. */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const PHONE_ERROR = "Телефон должен быть в формате +7 900 000-00-00";

/**
 * Mirrors the backend check so a typo is caught before the request. The server
 * validates and normalises independently — this is only for faster feedback.
 */
function phoneLooksValid(value: string): boolean {
  if (!value) return true;
  if (!/^[\d\s()+\-.]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 15;
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item)
    ? list.filter((x) => x !== item)
    : [...list, item];
}

export default function EditProfile({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [interests, setInterests] = useState(user.interests);
  const [languages, setLanguages] = useState(user.languages);
  const [text, setText] = useState({
    name: user.name,
    city: user.city,
    phone: user.phone,
    birthDate: user.birthDate,
    bio: user.bio,
    university: user.university,
    profession: user.profession,
    music: user.music,
    smoking: user.smoking,
    maritalStatus: user.maritalStatus,
    children: user.children,
    pets: user.pets,
    height: user.height === null ? "" : String(user.height),
    gender: user.gender,
  });

  const set = (key: keyof typeof text, next: string) =>
    setText((prev) => ({ ...prev, [key]: next }));

  // The page is behind an auth gate, so the section a #hash points at does not
  // exist yet when Next would normally scroll to it. Do it once we have rendered.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, []);

  // Accounts filled in before this screen existed hold free-typed interests
  // that no chip represents. They stay editable here so saving never drops them.
  const custom = useMemo(() => {
    const known = new Set(
      INTEREST_CATEGORIES.flatMap((category) => category.items),
    );
    return interests.filter((tag) => !known.has(tag));
  }, [interests]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;

    if (!phoneLooksValid(text.phone.trim())) return fail(PHONE_ERROR);
    // Accounts created before the field existed may still have it empty; only
    // a filled-in value is checked, and an empty one is left untouched.
    const birthProblem = text.birthDate ? birthDateError(text.birthDate) : null;
    if (birthProblem) return fail(birthProblem);

    const height = text.height.trim() === "" ? 0 : Number(text.height);
    if (
      !Number.isInteger(height) ||
      (height !== 0 && (height < MIN_HEIGHT_CM || height > MAX_HEIGHT_CM))
    ) {
      return fail(`Рост должен быть от ${MIN_HEIGHT_CM} до ${MAX_HEIGHT_CM} см`);
    }

    const changes: ProfileUpdate = {
      name: text.name.trim(),
      city: capitalize(text.city.trim()),
      phone: text.phone.trim(),
      ...(text.birthDate ? { birthDate: text.birthDate } : {}),
      avatarUrl,
      bio: text.bio.trim(),
      interests,
      languages,
      smoking: text.smoking,
      height,
      gender: text.gender,
      maritalStatus: text.maritalStatus,
      children: text.children,
      pets: text.pets,
      university: text.university.trim(),
      profession: text.profession.trim(),
      music: text.music.trim(),
    };

    setError(null);
    setBusy(true);
    try {
      await updateProfile(changes);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  };

  const fail = (message: string) => {
    setSaved(false);
    setError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedCount = interests.length;

  return (
    <>
      <Nav />
      <main className="bg-surface-2 pb-[72px] pt-9">
        <div className="mx-auto flex w-full max-w-[900px] flex-col px-5 sm:px-8">
          <header className="flex flex-col gap-1.5 pb-5">
            <Link
              href="/profile/me"
              className="flex w-fit items-center gap-1.5 pb-1 text-[14px] font-medium text-muted transition hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />В профиль
            </Link>
            <h1 className="font-display text-[32px] font-bold leading-tight text-ink">
              Расскажите о себе
            </h1>
            <p className="text-[16px] text-muted">
              Чем подробнее профиль — тем проще найти попутчиков по духу.
            </p>
          </header>

          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-[26px] rounded-card border border-border bg-white p-5 shadow-[0_12px_32px_rgba(42,37,33,0.10)] sm:p-8"
          >
            {saved && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-btn border border-teal-soft bg-teal-soft px-4 py-3 text-[14px] font-semibold text-teal"
              >
                <Check className="h-4 w-4 shrink-0" />
                Профиль сохранён
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-btn border border-[#E9BEB6] bg-[#FCEEEB] px-4 py-3 text-[14px] font-medium text-[#C0392B]"
              >
                {error}
              </p>
            )}

            {/* ------------------------------------------------- basics */}
            <section id="basics" className="flex scroll-mt-24 flex-col gap-4">
              <SectionHead
                icon={IdCard}
                title="Основное"
                sub="Так вас увидят в каталоге и в переписке"
              />
              <AvatarField
                value={avatarUrl}
                onChange={setAvatarUrl}
                onError={setError}
              />
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-ink">
                  Кто вы
                </span>
                <div className="flex gap-2.5">
                  {["мужчина", "женщина"].map((option) => {
                    const active = text.gender === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={active}
                        onClick={() => set("gender", option)}
                        className={`rounded-pill border px-5 py-[11px] text-[14px] transition ${
                          active
                            ? "border-accent bg-accent-soft font-semibold text-accent-ink"
                            : "border-border bg-white text-muted hover:border-accent"
                        }`}
                      >
                        {option[0].toUpperCase() + option.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Имя"
                  name="name"
                  value={text.name}
                  onChange={(next) => set("name", next)}
                  required
                />
                <Field
                  label="Город"
                  name="city"
                  value={text.city}
                  onChange={(next) => set("city", capitalize(next))}
                  placeholder="Москва"
                />
                <Field
                  label="Телефон"
                  name="phone"
                  type="tel"
                  value={text.phone}
                  onChange={(next) => set("phone", next)}
                  placeholder="+7 900 000-00-00"
                />
                <Field
                  label="Дата рождения"
                  name="birthDate"
                  type="date"
                  value={text.birthDate}
                  onChange={(next) => set("birthDate", next)}
                  max={todayIso()}
                />
              </div>
            </section>

            <Rule />

            {/* ---------------------------------------------- interests */}
            <section id="interests" className="flex scroll-mt-24 flex-col gap-3">
              <SectionHead
                icon={Sparkles}
                title="Чем займусь в свободное время"
                sub={
                  selectedCount > 0
                    ? `Отметьте занятия, которые вам близки · выбрано ${selectedCount} из ${INTERESTS_TOTAL}`
                    : "Отметьте занятия, которые вам близки"
                }
              />
              <div className="flex flex-col gap-3">
                {INTEREST_CATEGORIES.map((category) => (
                  <CategoryCard
                    key={category.key}
                    icon={category.icon}
                    tile={category.tile}
                    name={category.name}
                    items={category.items}
                    selected={interests}
                    onToggle={(item) =>
                      setInterests((prev) => toggle(prev, item))
                    }
                  />
                ))}
                {custom.length > 0 && (
                  <div className="flex flex-col gap-2.5 rounded-card border border-border bg-white p-4">
                    <p className="text-[15px] font-semibold text-ink">
                      Ваши интересы
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {custom.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setInterests((prev) => toggle(prev, tag))
                          }
                          className="flex items-center gap-1.5 rounded-pill border border-accent bg-accent px-[15px] py-2 text-[13px] text-white"
                        >
                          {tag}
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <Rule />

            {/* -------------------------------------------------- about */}
            <section id="about" className="flex scroll-mt-24 flex-col gap-4">
              <SectionHead icon={UserRound} title="О себе" />

              <div className="grid gap-7 lg:grid-cols-[396px_1fr]">
                <div className="flex flex-col gap-[18px]">
                  <div className="flex flex-col gap-2.5">
                    <Label>Владею языками</Label>
                    <div className="h-[150px] overflow-y-auto rounded-btn border border-border bg-surface-2 p-3.5">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
                        {LANGUAGE_OPTIONS.map((language) => (
                          <Checkbox
                            key={language}
                            label={language}
                            checked={languages.includes(language)}
                            onChange={() =>
                              setLanguages((prev) => toggle(prev, language))
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>Отношение к курению</Label>
                    <div className="flex flex-wrap gap-2.5">
                      {SMOKING_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={text.smoking === option}
                          onClick={() =>
                            set("smoking", text.smoking === option ? "" : option)
                          }
                          className={`rounded-pill border px-[18px] py-[11px] text-[14px] font-medium transition ${
                            text.smoking === option
                              ? "border-accent bg-accent text-white"
                              : "border-border bg-white text-ink hover:border-accent"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="height">Рост</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="height"
                        name="height"
                        type="number"
                        inputMode="numeric"
                        min={MIN_HEIGHT_CM}
                        max={MAX_HEIGHT_CM}
                        value={text.height}
                        onChange={(e) => set("height", e.target.value)}
                        placeholder="—"
                        className="w-[90px] rounded-btn border border-border bg-surface-2 px-3.5 py-3 text-[15px] text-ink outline-none focus:border-accent placeholder:text-subtle"
                      />
                      <span className="text-[14px] text-muted">см</span>
                    </div>
                  </div>

                  <Select
                    icon={Heart}
                    label="Семейное положение"
                    placeholder="— Не указано —"
                    options={MARITAL_OPTIONS}
                    value={text.maritalStatus}
                    onChange={(next) => set("maritalStatus", next)}
                  />
                  <Select
                    icon={Baby}
                    label="Дети"
                    placeholder="— Не указано —"
                    options={CHILDREN_OPTIONS}
                    value={text.children}
                    onChange={(next) => set("children", next)}
                  />
                  <Select
                    icon={PawPrint}
                    label="Питомцы"
                    placeholder="— Не указано —"
                    options={PETS_OPTIONS}
                    value={text.pets}
                    onChange={(next) => set("pets", next)}
                  />
                </div>

                <div className="flex flex-col gap-3.5">
                  <label className="flex flex-col gap-2">
                    <Label>О себе</Label>
                    <textarea
                      name="bio"
                      rows={5}
                      value={text.bio}
                      onChange={(e) => set("bio", e.target.value)}
                      maxLength={600}
                      placeholder="Расскажите о себе в несколько строк…"
                      className="resize-none rounded-btn border border-border bg-surface-2 px-3.5 py-3.5 text-[15px] leading-[1.55] text-ink outline-none focus:border-accent placeholder:text-subtle"
                    />
                  </label>
                  <Field
                    label="Университет"
                    name="university"
                    value={text.university}
                    onChange={(next) => set("university", next)}
                    placeholder="Мой университет"
                  />
                  <Field
                    label="Профессия"
                    name="profession"
                    value={text.profession}
                    onChange={(next) => set("profession", next)}
                    placeholder="Моя профессия"
                  />
                  <Field
                    label="Любимые исполнители"
                    name="music"
                    value={text.music}
                    onChange={(next) => set("music", next)}
                    placeholder="Группы и исполнители, которых слушаете…"
                  />
                </div>
              </div>
            </section>

            {/* --------------------------------------------------- save */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/profile/me")}
                className="rounded-btn border border-border bg-white px-5 py-[15px] text-[15px] font-semibold text-ink transition hover:border-accent"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex items-center justify-center gap-2.5 rounded-btn bg-accent px-12 py-[15px] text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check className="h-[19px] w-[19px]" />
                {busy ? "Сохраняем…" : "Сохранить профиль"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------- pieces */

function Rule() {
  return <div className="h-px w-full bg-border" />;
}

/** A <label> when it points at a control, otherwise a caption for a group. */
function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  const className = "text-[14px] font-semibold text-ink";
  if (!htmlFor) return <span className={className}>{children}</span>;
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}

function SectionHead({
  icon: Icon,
  title,
  sub,
}: {
  icon: LucideIcon;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="flex items-center gap-2.5 font-display text-[21px] font-bold text-ink">
        <Icon className="h-5 w-5 shrink-0 text-accent" />
        {title}
      </h2>
      {sub && <p className="text-[14px] text-subtle">{sub}</p>}
    </div>
  );
}

function CategoryCard({
  icon: Icon,
  tile,
  name,
  items,
  selected,
  onToggle,
}: {
  icon: LucideIcon;
  tile: string;
  name: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  // Collapsed by default: five open categories is a wall of ~50 chips, and the
  // count badge already says which ones the user has touched.
  const [open, setOpen] = useState(false);
  const count = items.filter((item) => selected.includes(item)).length;
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-[13px] text-left"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-pill ${tile}`}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="truncate text-[15px] font-semibold text-ink">
            {name}
          </span>
          {count > 0 && (
            <span className="shrink-0 rounded-pill bg-accent-soft px-2 py-0.5 text-[12px] font-bold text-accent-ink">
              {count}
            </span>
          )}
        </span>
        <Chevron className="h-5 w-5 shrink-0 text-muted" />
      </button>

      {open && (
        <div className="flex flex-wrap gap-2 bg-bg px-4 pb-4 pt-3">
          {items.map((item) => {
            const active = selected.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(item)}
                className={`rounded-pill border px-[15px] py-2 text-[13px] transition ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-muted hover:border-accent hover:text-ink"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border-[1.5px] transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
          checked ? "border-accent bg-accent" : "border-border bg-white"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </span>
      <span className="truncate text-[13px] text-ink">{label}</span>
    </label>
  );
}

function Select({
  icon: Icon,
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  const id = `select-${label}`;
  return (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-pill bg-accent-soft text-accent-ink">
          <Icon className="h-5 w-5" />
        </span>
        <div className="relative min-w-0 flex-1">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full appearance-none rounded-btn border border-border bg-surface-2 py-3 pl-3.5 pr-10 text-[14px] outline-none focus:border-accent ${
              value ? "text-ink" : "text-muted"
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
        </div>
      </div>
    </div>
  );
}
