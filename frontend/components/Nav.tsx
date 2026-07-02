"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Compass, LogOut, MessageCircle, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/catalog", label: "Найти попутчиков", active: true },
  { href: "/destinations", label: "Направления" },
  { href: "/how", label: "Как это работает" },
  { href: "/reviews", label: "Отзывы" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 h-[78px] border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-content items-center justify-between gap-4 px-5 sm:px-8 lg:px-20">
        <Link href="/" className="flex shrink-0 items-center gap-[9px]">
          <Compass className="h-7 w-7 text-accent" strokeWidth={2} />
          <span className="font-display text-[22px] font-bold text-ink sm:text-[25px]">
            Попутно
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-[38px]">
          {NAV_LINKS.map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "text-[16px] font-semibold text-ink"
                  : "text-[16px] font-medium text-muted transition hover:text-ink"
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-[18px]">
          <Link
            href="/messages"
            aria-label="Сообщения"
            className="relative grid h-11 w-11 place-items-center rounded-pill bg-surface-2 text-muted transition hover:text-ink"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-pill border-2 border-white bg-accent px-1 text-[10px] font-bold text-white">
              3
            </span>
          </Link>

          <button
            type="button"
            aria-label="Уведомления"
            className="hidden h-11 w-11 place-items-center rounded-pill bg-surface-2 text-muted transition hover:text-ink sm:grid"
          >
            <Bell className="h-5 w-5" />
          </button>

          <Link
            href="/create"
            aria-label="Создать объявление"
            className="flex items-center gap-2 rounded-btn bg-accent px-3.5 py-[11px] text-[15px] font-semibold text-white transition hover:bg-accent-ink sm:px-5"
          >
            <Plus className="h-[19px] w-[19px]" strokeWidth={2.5} />
            <span className="hidden sm:inline">Создать объявление</span>
          </Link>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Профиль"
        onClick={() => setOpen((v) => !v)}
        className="h-11 w-11 rounded-pill bg-cover bg-center bg-surface-2 ring-offset-2 transition hover:ring-2 hover:ring-accent"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1594751684241-bcef815d5a57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200)",
        }}
      />

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-card border border-border bg-white shadow-[0_16px_40px_rgba(42,37,33,0.14)]">
          {user && (
            <div className="flex flex-col gap-0.5 border-b border-border px-4 py-3">
              <span className="text-[14px] font-semibold text-ink">
                {user.name}
              </span>
              <span className="truncate text-[13px] text-muted">
                {user.email}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[14px] font-medium text-ink transition hover:bg-surface-2"
          >
            <LogOut className="h-[18px] w-[18px] text-muted" />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}