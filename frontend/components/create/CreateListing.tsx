"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Eye, MapPin, Send, User } from "lucide-react";
import PersonCard from "@/components/PersonCard";
import type { Person } from "@/lib/types";

const PREVIEW_PHOTO =
  "https://images.unsplash.com/photo-1551473451-f41b0ef72a95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";

const FORMATS = [
  "Один",
  "Пара",
  "Друзья",
  "Смешанная",
  "Только девушки",
  "Только парни",
];
const LOOKING = ["Не важно", "Девушку", "Мужчину", "Пару", "Группу"];
const TRIP_TYPES = ["Пляж", "Горы", "Города", "Роадтрип", "Бэкпекинг"];

export default function CreateListing() {
  const router = useRouter();
  const [direction, setDirection] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("Пара");
  const [looking, setLooking] = useState("Не важно");
  const [tripType, setTripType] = useState("Горы");

  const dates =
    startDate && endDate
      ? `${startDate} – ${endDate}`
      : startDate || endDate || "5–14 сентября";

  const preview: Person = {
    id: "preview",
    name: "Алекс",
    age: 30,
    companyType: format,
    location: direction || "Португалия · Лиссабон",
    dates,
    description:
      description ||
      "Люблю океан, сёрф и уличную еду. Ищу лёгкую компанию для роадтрипа по побережью.",
    rating: 0,
    photoUrl: PREVIEW_PHOTO,
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/catalog");
  };

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

        <div className="flex flex-col gap-10 lg:flex-row">
          <form
            onSubmit={onSubmit}
            className="flex w-full shrink-0 flex-col gap-[26px] rounded-card border border-border bg-white p-5 sm:p-8 lg:w-[780px]"
          >
            <Field label="Ваше фото">
              <button
                type="button"
                className="flex h-[260px] flex-col items-center justify-center gap-3.5 rounded-card border-2 border-dashed border-accent bg-accent-soft p-6 text-center transition hover:bg-accent-soft/70"
              >
                <span className="grid h-[76px] w-[76px] place-items-center rounded-pill border border-accent bg-white text-accent">
                  <User className="h-8 w-8" />
                </span>
                <span className="text-[16px] font-semibold text-ink">
                  Загрузите ваше фото
                </span>
                <span className="text-[13px] text-muted">
                  Портретное фото, JPG или PNG до 8 МБ
                </span>
              </button>
            </Field>

            <Field label="Направление">
              <div className="flex items-center gap-2.5 rounded-btn border border-border bg-surface-2 px-4 py-4">
                <MapPin className="h-[18px] w-[18px] shrink-0 text-subtle" />
                <input
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  placeholder="Куда вы едете? Например, Грузия · Тбилиси"
                  className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
                />
              </div>
            </Field>

            <Field label="Даты поездки">
              <div className="flex items-center gap-2.5">
                <DateInput
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Дата начала"
                />
                <span className="text-[15px] text-subtle">—</span>
                <DateInput
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Дата конца"
                />
              </div>
            </Field>

            <Field label="Формат компании">
              <ChipGroup
                options={FORMATS}
                value={format}
                onChange={setFormat}
              />
            </Field>

            <Field label="Кого ищу">
              <ChipGroup
                options={LOOKING}
                value={looking}
                onChange={setLooking}
              />
            </Field>

            <Field label="Тип поездки">
              <ChipGroup
                options={TRIP_TYPES}
                value={tripType}
                onChange={setTripType}
              />
            </Field>

            <Field label="Описание">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Расскажите о себе, планах и каких попутчиков ищете. Что для вас важно в поездке?"
                className="h-[130px] w-full resize-none rounded-btn border border-border bg-surface-2 p-4 text-[15px] leading-[1.5] text-ink outline-none placeholder:text-subtle focus:border-accent"
              />
            </Field>

            <button
              type="submit"
              className="flex items-center justify-center gap-2.5 rounded-btn bg-accent py-4 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink"
            >
              <Send className="h-[19px] w-[19px]" />
              Опубликовать
            </button>
          </form>

          <aside className="flex flex-1 flex-col gap-4 lg:order-none">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-muted">
                <Eye className="h-[17px] w-[17px]" />
                Предпросмотр
              </div>
              <p className="max-w-[300px] text-[13px] leading-[1.45] text-subtle">
                Так ваша карточка выглядит для других путешественников.
              </p>
            </div>

            <div className="w-full max-w-[300px] lg:sticky lg:top-[94px]">
              <PersonCard person={preview} href={null} ratingLabel="нов." />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[9px]">
      <span className="text-[14px] font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function DateInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-2.5 rounded-btn border border-border bg-surface-2 px-4 py-3.5">
      <Calendar className="h-[18px] w-[18px] shrink-0 text-subtle" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
      />
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-pill border px-4 py-2.5 text-[14px] font-semibold transition ${
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
