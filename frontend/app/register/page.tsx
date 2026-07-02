"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AuthShell, {
  AuthDivider,
  AuthField,
  SocialButtons,
} from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [consent, setConsent] = useState(true);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim() || "Путешественник";
    const email = String(data.get("email") ?? "").trim() || "traveler@poputno.ru";
    login({ name, email });
    router.push("/");
  };

  return (
    <AuthShell
      image="photo-1780186481262-d57697414adf"
      testimonial={{
        quote:
          "«За полгода — три поездки и куча новых друзей. Один бы так и не решился»",
        name: "Артём, 31",
        role: "Любит горы и роадтрипы",
        avatar: "photo-1667382136327-5f78dc5cf835",
      }}
      bottom={
        <>
          <span className="text-[14px] text-muted">Уже есть аккаунт?</span>
          <Link
            href="/login"
            className="text-[14px] font-bold text-accent-ink transition hover:text-accent"
          >
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[30px] font-bold leading-[1.08] text-ink sm:text-[38px]">
            Присоединяйся к сообществу
          </h1>
          <p className="text-[15px] leading-[1.5] text-muted">
            Создайте профиль, чтобы находить попутчиков и планировать поездки
            вместе.
          </p>
        </div>

        <AuthField
          label="Имя"
          name="name"
          icon={User}
          placeholder="Как вас зовут?"
        />
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
          placeholder="Придумайте пароль"
          password
        />

        <button
          type="button"
          onClick={() => setConsent((v) => !v)}
          className="flex items-start gap-[11px] text-left"
        >
          <span
            className={`mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border-[1.5px] transition ${
              consent
                ? "border-accent bg-accent text-white"
                : "border-border bg-white text-transparent"
            }`}
          >
            <Check className="h-[14px] w-[14px]" strokeWidth={3} />
          </span>
          <span className="text-[13px] leading-[1.45] text-muted">
            Я принимаю правила сервиса и политику конфиденциальности «Попутно».
          </span>
        </button>

        <button
          type="submit"
          className="rounded-btn bg-accent py-4 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink"
        >
          Создать аккаунт
        </button>

        <AuthDivider />
        <SocialButtons />
      </form>
    </AuthShell>
  );
}