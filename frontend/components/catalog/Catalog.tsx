import {
  Calendar,
  ChevronDown,
  Search,
  Wallet,
  X,
} from "lucide-react";
import PersonCard from "@/components/PersonCard";
import Reveal from "@/components/Reveal";
import type { Person } from "@/lib/types";

interface Props {
  persons: Person[];
}

export default function Catalog({ persons }: Props) {
  return (
    <main className="bg-bg pb-20 pt-11">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-5 sm:px-8 lg:px-20">
        <header className="flex flex-col gap-2.5">
          <h1 className="font-display text-[32px] font-bold text-ink sm:text-[44px]">
            Попутчики для путешествий
          </h1>
          <p className="max-w-[820px] text-[17px] leading-[1.5] text-muted">
            Найдите единомышленников, с которыми удобно и безопасно отправиться в
            дорогу. Фильтруйте по направлению, датам, бюджету и формату компании.
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterPanel />
          <Results persons={persons} />
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------- Filter panel */

const FORMAT_ROWS: { label: string; active?: boolean }[][] = [
  [{ label: "Любая", active: true }, { label: "Пара" }, { label: "Друзья" }],
  [{ label: "Смешанная" }, { label: "Соло" }],
];

const LOOKING_ROWS: { label: string; active?: boolean }[][] = [
  [{ label: "Все", active: true }, { label: "Девушку" }],
  [{ label: "Мужчину" }, { label: "Пару" }],
  [{ label: "Группу" }],
];

const TRIP_TYPES = ["Пляж", "Горы", "Города", "Роадтрип", "Бэкпекинг"];

function FilterPanel() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-[22px] self-start rounded-card border border-border bg-white p-6 lg:w-[300px]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[22px] font-bold text-ink">Фильтры</h2>
        <button className="text-[13px] font-semibold text-accent-ink transition hover:text-accent">
          Сбросить
        </button>
      </div>

      <FilterGroup label="Направление">
        <FilterInput icon={<Search className="h-[17px] w-[17px] text-subtle" />}>
          Куда едем?
        </FilterInput>
      </FilterGroup>

      <FilterGroup label="Даты">
        <div className="flex items-center gap-2">
          <FilterInput icon={<Calendar className="h-[17px] w-[17px] text-subtle" />}>
            от
          </FilterInput>
          <span className="text-[14px] text-subtle">—</span>
          <FilterInput icon={<Calendar className="h-[17px] w-[17px] text-subtle" />}>
            до
          </FilterInput>
        </div>
      </FilterGroup>

      <FilterGroup label="Бюджет, ₽">
        <div className="flex items-center gap-2">
          <FilterInput icon={<Wallet className="h-4 w-4 text-subtle" />} prefix="от">
            20к
          </FilterInput>
          <span className="text-[14px] text-subtle">—</span>
          <FilterInput icon={<Wallet className="h-4 w-4 text-subtle" />} prefix="до">
            150к
          </FilterInput>
        </div>
      </FilterGroup>

      <FilterGroup label="Формат компании">
        <ChipRows rows={FORMAT_ROWS} />
      </FilterGroup>

      <FilterGroup label="Кого ищу">
        <ChipRows rows={LOOKING_ROWS} />
      </FilterGroup>

      <FilterGroup label="Тип поездки">
        {TRIP_TYPES.map((label) => (
          <label
            key={label}
            className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink"
          >
            <span className="grid h-5 w-5 place-items-center rounded-md border-[1.5px] border-border bg-white" />
            {label}
          </label>
        ))}
      </FilterGroup>

      <div className="flex flex-col gap-2.5">
        <button className="rounded-btn bg-accent py-[13px] text-[15px] font-semibold text-white transition hover:bg-accent-ink">
          Применить
        </button>
        <button className="rounded-btn bg-surface-2 py-[13px] text-[15px] font-semibold text-muted transition hover:text-ink">
          Сбросить фильтры
        </button>
      </div>
    </aside>
  );
}

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

function FilterInput({
  icon,
  prefix,
  children,
}: {
  icon: React.ReactNode;
  prefix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-center gap-2 rounded-btn border border-border bg-surface-2 px-3.5 py-3">
      {icon}
      {prefix && <span className="text-[13px] text-subtle">{prefix}</span>}
      <span className="text-[14px] font-medium text-subtle">{children}</span>
    </div>
  );
}

function ChipRows({
  rows,
}: {
  rows: { label: string; active?: boolean }[][];
}) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap gap-2">
          {row.map((chip) => (
            <span
              key={chip.label}
              className={`cursor-pointer rounded-pill border px-3.5 py-[7px] text-[13px] font-semibold transition ${
                chip.active
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface-2 text-muted hover:border-accent hover:text-accent-ink"
              }`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Results */

const ACTIVE_FILTERS = ["Грузия", "Июль", "Горы"];

function Results({ persons }: { persons: Person[] }) {
  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-3 rounded-btn border border-border bg-white p-2 pl-[18px] shadow-[0_4px_14px_rgba(42,37,33,0.05)]">
        <Search className="h-5 w-5 shrink-0 text-accent" />
        <span className="flex-1 text-[15px] text-subtle">
          Поиск по имени, направлению или описанию
        </span>
        <button className="flex items-center gap-2 rounded-btn bg-accent px-6 py-[11px] text-[15px] font-semibold text-white transition hover:bg-accent-ink">
          Найти
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[16px] font-semibold text-ink">
            найдено 128 попутчиков
          </span>
          {ACTIVE_FILTERS.map((label) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-pill bg-accent-soft px-3 py-[7px] text-[13px] font-semibold text-accent-ink"
            >
              {label}
              <X className="h-[13px] w-[13px]" />
            </span>
          ))}
        </div>

        <button className="flex shrink-0 items-center gap-2 rounded-btn border border-border bg-white px-[15px] py-[11px] text-[14px] font-semibold text-muted transition hover:text-ink">
          Сортировка: по рейтингу
          <ChevronDown className="h-4 w-4 text-subtle" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {persons.map((person, i) => (
          <Reveal key={person.id} delay={(i % 3) * 90} className="h-full">
            <PersonCard person={person} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
