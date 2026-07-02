import { ArrowRight, SlidersHorizontal } from "lucide-react";
import PersonCard from "./PersonCard";
import Reveal from "./Reveal";
import type { Person } from "@/lib/types";

const FILTERS = ["Все", "Девушки", "Мужчины", "Пары", "Группы", "Друзья"];

interface Props {
  persons: Person[];
}

export default function Listings({ persons }: Props) {
  return (
    <section className="px-5 pb-20 pt-11 sm:px-8 lg:px-20">
      <div className="mx-auto flex max-w-content flex-col gap-7">
        <Header />
        <Filters />
        <Grid persons={persons} />
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-[38px] font-bold text-ink">
          Свежие попутчики
        </h2>
        <p className="text-[16px] text-muted">
          Люди, которые ищут компанию прямо сейчас
        </p>
      </div>

      <button
        type="button"
        className="flex items-center gap-1.5 py-2 text-[16px] font-semibold text-accent-ink transition hover:text-accent"
      >
        Смотреть все
        <ArrowRight className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}

function Filters() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-2 py-2.5 pr-1 text-[15px] font-semibold text-muted">
        <SlidersHorizontal className="h-4 w-4" />
        Кого ищу
      </div>
      {FILTERS.map((label, i) => (
        <Chip key={label} label={label} active={i === 0} />
      ))}
    </div>
  );
}

function Chip({ label, active }: { label: string; active: boolean }) {
  const base =
    "rounded-pill px-5 py-2.5 text-[14px] font-semibold transition cursor-pointer";
  return active ? (
    <button className={`${base} bg-accent text-white hover:bg-accent-ink`}>
      {label}
    </button>
  ) : (
    <button
      className={`${base} border border-border bg-white text-ink hover:border-accent hover:text-accent-ink`}
    >
      {label}
    </button>
  );
}

function Grid({ persons }: { persons: Person[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {persons.map((p, i) => (
        <Reveal key={p.id} delay={(i % 4) * 90} className="h-full">
          <PersonCard person={p} />
        </Reveal>
      ))}
    </div>
  );
}