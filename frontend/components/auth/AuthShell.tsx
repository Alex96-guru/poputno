"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Compass, Eye, EyeOff, Send, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const img = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`;

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

interface Props {
  image: string;
  testimonial: Testimonial;
  bottom: ReactNode;
  children: ReactNode;
}

export default function AuthShell({
  image,
  testimonial,
  bottom,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Form panel */}
      <div className="flex w-full shrink-0 flex-col py-11 lg:w-[760px]">
        <div className="px-6 sm:px-12 lg:px-[72px]">
          <Link href="/" className="flex items-center gap-[9px]">
            <Compass className="h-[26px] w-[26px] text-accent" strokeWidth={2} />
            <span className="font-display text-[23px] font-bold text-ink">
              Попутно
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-5 sm:px-12 lg:px-[72px]">
          <div className="flex w-full max-w-[400px] flex-col gap-5">{children}</div>
        </div>

        <div className="flex items-center justify-center gap-1.5 px-6 sm:px-12 lg:px-[72px]">
          {bottom}
        </div>
      </div>

      {/* Photo panel */}
      <div
        className="relative hidden flex-1 items-end bg-cover bg-center p-14 lg:flex"
        style={{ backgroundImage: `url(${img(image, 1600)})` }}
      >
        <div className="flex w-[460px] max-w-full flex-col gap-3.5 rounded-card bg-white/[0.95] p-7 shadow-[0_18px_44px_rgba(42,37,33,0.25)]">
          <div className="flex gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-gold text-gold" />
            ))}
          </div>
          <p className="font-display text-[20px] font-semibold leading-[1.45] text-ink">
            {testimonial.quote}
          </p>
          <div className="flex items-center gap-2.5">
            <span
              className="h-10 w-10 rounded-pill bg-cover bg-center bg-surface-2"
              style={{ backgroundImage: `url(${img(testimonial.avatar, 120)})` }}
            />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-ink">
                {testimonial.name}
              </span>
              <span className="text-[12px] text-muted">{testimonial.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Form parts */

interface FieldProps {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  name: string;
  type?: "text" | "email" | "date";
  password?: boolean;
  minLength?: number;
  /** Latest value a date input accepts, as YYYY-MM-DD. */
  max?: string;
}

export function AuthField({
  label,
  icon: Icon,
  placeholder,
  name,
  type = "text",
  password = false,
  minLength,
  max,
}: FieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-[11px] rounded-btn border border-border bg-surface-2 px-4 py-[15px] focus-within:border-accent">
        <Icon className="h-[18px] w-[18px] shrink-0 text-subtle" />
        <input
          name={name}
          type={password ? (visible ? "text" : "password") : type}
          placeholder={placeholder}
          required
          minLength={minLength}
          max={max}
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
        />
        {password && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
            className="shrink-0 text-subtle transition hover:text-muted"
          >
            {visible ? (
              <Eye className="h-[18px] w-[18px]" />
            ) : (
              <EyeOff className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>
    </label>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-btn border border-[#E9BEB6] bg-[#FCEEEB] px-4 py-3 text-[14px] font-medium text-[#C0392B]"
    >
      {message}
    </p>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3.5">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[13px] text-subtle">или</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function SocialButtons() {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        className="flex items-center justify-center gap-2.5 rounded-btn border border-border bg-white py-[13px] text-[15px] font-semibold text-ink transition hover:bg-surface-2"
      >
        <Send className="h-[18px] w-[18px] text-[#29A9EA]" />
        Продолжить с Telegram
      </button>
      <div className="flex gap-2.5">
        {[
          { label: "Google", color: "#EA4335", letter: "G" },
          { label: "ВКонтакте", color: "#4C75A3", letter: "B" },
        ].map((s) => (
          <button
            key={s.label}
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-btn border border-border bg-white py-3 text-[15px] font-semibold text-ink transition hover:bg-surface-2"
          >
            <span
              className="grid h-5 w-5 place-items-center rounded-pill text-[11px] font-bold text-white"
              style={{ backgroundColor: s.color }}
            >
              {s.letter}
            </span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}