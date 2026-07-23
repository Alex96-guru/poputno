"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

/** All dates are handled in UTC so a timezone never shifts the calendar. */
function iso(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function todayIso(): string {
  const now = new Date();
  return iso(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Days of the month laid out in Monday-first weeks; null pads the edges. */
function monthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(Date.UTC(year, month, 1));
  // getUTCDay() is Sunday-based; shift so Monday starts the week.
  const lead = (first.getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

interface Props {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}

/**
 * Range picker. The first click sets the start, the second the end; clicking
 * again starts a new range. Picking an earlier second date flips the pair
 * rather than rejecting it.
 */
export default function RangeCalendar({ start, end, onChange }: Props) {
  const anchor = start || todayIso();
  const [view, setView] = useState(() => ({
    year: Number(anchor.slice(0, 4)),
    month: Number(anchor.slice(5, 7)) - 1,
  }));

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });

  const pick = (day: number) => {
    const value = iso(view.year, view.month, day);
    if (!start || (start && end)) return onChange(value, "");
    if (value < start) return onChange(value, start);
    onChange(start, value);
  };

  const today = todayIso();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-[16px] font-bold text-ink">
          {MONTHS[view.month]} {view.year}
        </span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Предыдущий месяц"
            className="grid h-7 w-7 place-items-center rounded-pill text-accent transition hover:bg-surface-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Следующий месяц"
            className="grid h-7 w-7 place-items-center rounded-pill text-accent transition hover:bg-surface-2"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </span>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-center text-[12px] text-muted"
            aria-hidden
          >
            {day}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {monthGrid(view.year, view.month).map((week, w) => (
          <div key={w} className="grid grid-cols-7">
            {week.map((day, d) => {
              if (day === null) return <span key={d} className="h-9" />;

              const value = iso(view.year, view.month, day);
              const isStart = value === start;
              const isEnd = value === end;
              const inRange =
                Boolean(start && end) && value > start && value < end;

              return (
                <span key={d} className="flex justify-center py-[1px]">
                  <button
                    type="button"
                    onClick={() => pick(day)}
                    aria-pressed={isStart || isEnd}
                    className={`grid h-9 w-9 place-items-center rounded-pill text-[14px] transition ${
                      isStart || isEnd
                        ? "bg-accent font-semibold text-white"
                        : inRange
                          ? "bg-accent-soft text-accent-ink"
                          : value === today
                            ? "font-semibold text-accent hover:bg-surface-2"
                            : "text-ink hover:bg-surface-2"
                    }`}
                  >
                    {day}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
