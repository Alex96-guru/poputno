"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

/** Backdrop, escape handling and header shared by the profile dialogs. */
export default function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-y-auto rounded-card border border-border bg-white p-7 shadow-[0_24px_60px_rgba(42,37,33,0.28)]"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[24px] font-bold text-ink">
              {title}
            </h2>
            {subtitle && <p className="text-[14px] text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-surface-2 text-muted transition hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
