"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cake, Check, Lock, Mail, User, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { birthDateError, todayIso } from "@/lib/age";
import AuthShell, {
  AuthDivider,
  AuthError,
  AuthField,
  SocialButtons,
} from "@/components/auth/AuthShell";

/** The value is stored as-is and reused as the listing's "Я". */
const GENDERS = [
  { value: "мужчина", label: "Мужчина" },
  { value: "женщина", label: "Женщина" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [consent, setConsent] = useState(true);
  const [gender, setGender] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    if (!gender) {
      setError("Укажите, кто вы.");
      return;
    }
    if (!consent) {
      setError("Примите правила сервиса, чтобы продолжить.");
      return;
    }
    const data = new FormData(e.currentTarget);
    const birthDate = String(data.get("birthDate") ?? "");
    const birthProblem = birthDateError(birthDate);
    if (birthProblem) {
      setError(birthProblem);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await register({
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
        birthDate,
        gender,
      });
      router.push("/profile/me");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
      setBusy(false);
    }
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
        {/* Fills "Я" on every listing, so the create form need not ask again. */}
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-ink">Кто вы</span>
          <div className="grid grid-cols-2 gap-2.5">
            {GENDERS.map(({ value, label }) => {
              const active = gender === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setGender(value)}
                  className={`flex items-center justify-center gap-2 rounded-btn py-3.5 text-[15px] transition ${
                    active
                      ? "border-[1.5px] border-accent bg-accent-soft font-bold text-accent-ink"
                      : "border border-border bg-white font-medium text-muted hover:border-accent"
                  }`}
                >
                  <UserRound className="h-[18px] w-[18px]" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <AuthField
          label="Дата рождения"
          name="birthDate"
          icon={Cake}
          type="date"
          max={todayIso()}
          placeholder="дд.мм.гггг"
        />
        <AuthField
          label="Пароль"
          name="password"
          icon={Lock}
          placeholder="Минимум 6 символов"
          password
          minLength={6}
        />

        <AuthError message={error} />

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
          disabled={busy}
          className="rounded-btn bg-accent py-4 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(192,86,60,0.25)] transition hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Создаём аккаунт…" : "Создать аккаунт"}
        </button>

        <AuthDivider />
        <SocialButtons />
      </form>
    </AuthShell>
  );
}