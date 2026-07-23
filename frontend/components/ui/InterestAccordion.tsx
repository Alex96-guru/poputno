"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { INTEREST_CATEGORIES } from "@/lib/profile-options";

interface Props {
  selected: string[];
  onToggle: (value: string) => void;
  title?: string;
}

/**
 * "Чем займёмся?" — the profile's interest grid folded into categories.
 * Shared by the meetup form and the catalog's filter panel.
 */
export default function InterestAccordion({
  selected,
  onToggle,
  title = "Чем займёмся?",
}: Props) {
  const [openKey, setOpenKey] = useState<string | null>(
    INTEREST_CATEGORIES[0]?.key ?? null,
  );

  return (
    <div className="overflow-hidden rounded-card border border-border">
      <div className="flex items-center justify-between px-4 py-3.5">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-ink">{title}</span>
          {selected.length > 0 && (
            <span className="rounded-pill bg-accent-soft px-2 py-0.5 text-[12px] font-bold text-accent-ink">
              {selected.length}
            </span>
          )}
        </span>
        <Sparkles className="h-[17px] w-[17px] text-accent" />
      </div>

      {INTEREST_CATEGORIES.map((category, i) => {
        const open = openKey === category.key;
        const picked = category.items.filter((item) =>
          selected.includes(item),
        ).length;
        const last = i === INTEREST_CATEGORIES.length - 1;

        return (
          <div key={category.key}>
            <button
              type="button"
              onClick={() => setOpenKey(open ? null : category.key)}
              aria-expanded={open}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-surface-2 ${
                last && !open ? "" : "border-b border-border"
              }`}
            >
              <span className="flex min-w-0 items-center gap-[11px]">
                <span
                  className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-pill ${category.tile}`}
                >
                  <category.icon className="h-4 w-4" />
                </span>
                <span className="truncate text-[14px] font-medium text-ink">
                  {category.name}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2.5">
                {picked > 0 && (
                  <span className="h-2 w-2 rounded-pill bg-accent" />
                )}
                {open ? (
                  <ChevronUp className="h-[17px] w-[17px] text-muted" />
                ) : (
                  <ChevronDown className="h-[17px] w-[17px] text-muted" />
                )}
              </span>
            </button>

            {open && (
              <div
                className={`flex flex-wrap gap-2 bg-bg px-4 pb-3.5 pt-2.5 ${
                  last ? "" : "border-b border-border"
                }`}
              >
                {category.items.map((item) => {
                  const active = selected.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onToggle(item)}
                      className={`rounded-pill border px-3.5 py-1.5 text-[13px] transition ${
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
      })}
    </div>
  );
}
