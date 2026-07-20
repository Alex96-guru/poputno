"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthShell, {
  AuthDivider,
  AuthError,
  AuthField,
  SocialButtons,
} from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    setError(null);
    setBusy(true);
    try {
      await login({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
      setBusy(false);
    }
  };

  return (
    <AuthShell
      image="photo-1610731237344-a75ce23e4ab5"
      testimonial={{
        quote:
          "«Нашла попутчицу для Грузии буквально за вечер — съездили и теперь дружим»",
        name: "Мария, 28",
        role: "Путешествует по Кавказу",
        avatar: "photo-1529218164294-0d21b06ea831",
      }}
      bottom={
        <>
          <span className="text-[14px] text-muted">Нет аккаунта?</span>
          <Link
            href="/register"
            className="text-[14px] font-bold text-accent-ink transition hover:text-accent"
          >
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-[22px]">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[32px] font-bold text-ink sm:text-[40px]">
            С возвращением
          </h1>
          <p className="text-[15px] leading-[1.5] text-muted">
            Войдите, чтобы продолжить искать попутчиков и общаться.
          </p>
        </div>

        <AuthField
          label="E-mail или телефон"
          name="email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
        />
        <AuthField
          label="Пароль"
          name="password"
          icon={Lock}
          placeholder="Введите пароль"
          password
        />

        <div className="-mt-2 flex justify-end">
          <a
            href="#"
            className="text-[13px] font-semibold text-accent-ink transition hover:text-accent"
          >
            Забыли пароль?
          </a>
        </div>

        <AuthError message={error} />

        <button
          type="submit"
          disabled={busy}
          className="rounded-btn bg-accent py-4 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Входим…" : "Войти"}
        </button>

        <AuthDivider />
        <SocialButtons />
      </form>
    </AuthShell>
  );
}