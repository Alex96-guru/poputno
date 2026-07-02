import { Fragment } from "react";
import Link from "next/link";
import { Calendar, MapPin, Search, UserSearch, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Field {
  icon: LucideIcon;
  label: string;
  value: string;
}

const FIELDS: Field[] = [
  { icon: MapPin, label: "Направление", value: "Куда едем?" },
  { icon: Calendar, label: "Даты", value: "Любые даты" },
  { icon: Users, label: "Формат компании", value: "Любой формат" },
  { icon: UserSearch, label: "Кого ищу", value: "Кто угодно" },
];

export default function SearchBar() {
  return (
    <div className="flex w-full flex-col items-stretch gap-1.5 rounded-card border border-border bg-white p-2 shadow-[0_16px_40px_rgba(42,37,33,0.12)] md:flex-row md:items-center">
      {FIELDS.map((field, i) => (
        <Fragment key={field.label}>
          <FieldButton {...field} />
          {i < FIELDS.length - 1 && (
            <span aria-hidden className="hidden h-9 w-px bg-border md:block" />
          )}
        </Fragment>
      ))}

      <Link
        href="/catalog"
        className="flex items-center justify-center gap-2 rounded-btn bg-accent px-[26px] py-[15px] text-[16px] font-bold text-white transition hover:bg-accent-ink md:ml-1"
      >
        <Search className="h-[19px] w-[19px]" strokeWidth={2.5} />
        Найти попутчиков
      </Link>
    </div>
  );
}

function FieldButton({ icon: Icon, label, value }: Field) {
  return (
    <button
      type="button"
      className="flex flex-1 items-center gap-3 rounded-[18px] px-4 py-2.5 text-left transition hover:bg-surface-2"
    >
      <Icon className="h-5 w-5 shrink-0 text-accent" />
      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-muted">
          {label}
        </span>
        <span className="truncate text-[15px] font-semibold text-ink">
          {value}
        </span>
      </span>
    </button>
  );
}