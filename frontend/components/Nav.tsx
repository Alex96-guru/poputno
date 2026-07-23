"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Coffee,
  Compass,
  House,
  LogOut,
  Menu,
  MessageCircle,
  Plane,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import Avatar from "./profile/Avatar";

interface SubLink {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  /** Colours for the round icon tile, matching the home page shelves. */
  tile: string;
}

const CATALOG_SECTIONS: SubLink[] = [
  {
    href: "/catalog?category=Путешествия",
    label: "Путешествия",
    hint: "Попутчики в поездки",
    icon: Plane,
    tile: "bg-accent-soft text-accent-ink",
  },
  {
    href: "/catalog?category=Встречи",
    label: "Встречи",
    hint: "Провести время в своём городе",
    icon: Coffee,
    tile: "bg-teal-soft text-teal",
  },
  {
    href: "/catalog?category=В гости",
    label: "В гости",
    hint: "Местные принимают гостей",
    icon: House,
    tile: "bg-[#FBEFD8] text-[#B07B10]",
  },
];

const NAV_LINKS: { href: string; label: string; sections?: SubLink[] }[] = [
  { href: "/catalog", label: "Найти попутчиков", sections: CATALOG_SECTIONS },
  { href: "/journal", label: "Журнал" },
  { href: "/reviews", label: "Отзывы" },
];

/** A section stays highlighted on its nested pages, e.g. /journal/some-article. */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav() {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[78px] max-w-content items-center justify-between gap-4 px-5 sm:px-8 lg:px-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Меню"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-btn text-ink transition hover:bg-surface-2 lg:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link href="/" className="flex shrink-0 items-center gap-[9px]">
            <Compass className="h-7 w-7 text-accent" strokeWidth={2} />
            <span className="font-display text-[22px] font-bold text-ink sm:text-[25px]">
              Попутно
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-[38px]">
          {NAV_LINKS.map(({ href, label, sections }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              sections={sections}
              active={isActive(pathname, href)}
            />
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

          <ProfileMenu />
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-border bg-white px-5 pb-4 pt-2 lg:hidden">
          {NAV_LINKS.map(({ href, label, sections }) => (
            <div key={href} className="flex flex-col">
              <Link
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className={`rounded-btn px-2 py-3 text-[16px] transition hover:bg-surface-2 ${
                  isActive(pathname, href)
                    ? "font-semibold text-ink"
                    : "font-medium text-muted"
                }`}
              >
                {label}
              </Link>
              {sections && (
                <div className="mb-1 flex flex-col gap-0.5 pl-2">
                  {sections.map(({ href: to, label: title, icon: Icon, tile }) => (
                    <Link
                      key={to}
                      href={to}
                      className="flex items-center gap-2.5 rounded-btn px-2 py-2 transition hover:bg-surface-2"
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ${tile}`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="text-[15px] text-ink">{title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}

/**
 * A nav link that may reveal its sections.
 *
 * The panel opens on hover and on keyboard focus, and the wrapper keeps a
 * padded gap underneath the link so the pointer can travel down to the panel
 * without crossing a dead zone that would close it.
 */
function NavItem({
  href,
  label,
  sections,
  active,
}: {
  href: string;
  label: string;
  sections?: SubLink[];
  active: boolean;
}) {
  const [open, setOpen] = useState(false);

  const linkClass = `flex items-center gap-1 text-[16px] transition-colors ${
    active
      ? "font-semibold text-ink hover:text-accent-ink"
      : "font-medium text-muted hover:text-ink"
  }`;

  if (!sections) {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={linkClass}
      >
        {label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        className={linkClass}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </Link>

      {open && (
        // pt-3 bridges the gap between the link and the panel.
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <div
            role="menu"
            className="w-[290px] overflow-hidden rounded-card border border-border bg-white p-2 shadow-[0_18px_44px_rgba(42,37,33,0.16)]"
          >
            {sections.map(({ href: to, label: title, hint, icon: Icon, tile }) => (
              <Link
                key={to}
                href={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-btn p-2.5 transition-colors hover:bg-surface-2"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] ${tile}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold text-ink">
                    {title}
                  </span>
                  <span className="text-[13px] text-muted">{hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
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
        className="h-11 w-11 overflow-hidden rounded-pill ring-offset-2 transition hover:ring-2 hover:ring-accent"
      >
        {user ? (
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            className="h-full w-full"
            textClassName="text-[15px]"
          />
        ) : (
          <span className="grid h-full w-full place-items-center rounded-pill bg-surface-2 text-subtle">
            <User className="h-5 w-5" />
          </span>
        )}
      </button>

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
          <Link
            href="/profile/me"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[14px] font-medium text-ink transition hover:bg-surface-2"
          >
            <User className="h-[18px] w-[18px] text-muted" />
            Мой профиль
          </Link>
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