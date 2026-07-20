"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { birthDateError, todayIso } from "@/lib/age";
import type { User } from "@/lib/types";
import AvatarField from "./AvatarField";
import Field from "./Field";
import ModalShell from "./ModalShell";

interface Props {
  user: User;
  onClose: () => void;
}

/** "москва" -> "Москва", leaving the rest of the input alone. */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const PHONE_ERROR = "Телефон должен быть в формате +7 900 000-00-00";

/**
 * Mirrors the backend check so a typo is caught before the request. The server
 * validates and normalises independently — this is only for faster feedback.
 */
function phoneLooksValid(value: string): boolean {
  if (!value) return true;
  if (!/^[\d\s()+\-.]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 15;
}

export default function EditProfileModal({ user, onClose }: Props) {
  const { updateProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [city, setCity] = useState(user.city);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const phone = String(data.get("phone") ?? "").trim();
    if (!phoneLooksValid(phone)) {
      setError(PHONE_ERROR);
      return;
    }
    // Accounts created before the field existed may still have it empty; only
    // a filled-in value is checked, and an empty one is left untouched.
    const birthDate = String(data.get("birthDate") ?? "");
    const birthProblem = birthDate ? birthDateError(birthDate) : null;
    if (birthProblem) {
      setError(birthProblem);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await updateProfile({
        name: String(data.get("name") ?? "").trim(),
        city: capitalize(city.trim()),
        bio: String(data.get("bio") ?? "").trim(),
        phone,
        ...(birthDate ? { birthDate } : {}),
        avatarUrl,
        interests: String(data.get("interests") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 12),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title="Редактировать профиль"
      subtitle="Чем полнее профиль, тем охотнее с вами поедут."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <AvatarField
          value={avatarUrl}
          onChange={setAvatarUrl}
          onError={setError}
        />
        <Field label="Имя" name="name" defaultValue={user.name} required />
        <Field
          label="Город"
          name="city"
          value={city}
          onChange={(next) => setCity(capitalize(next))}
          placeholder="Москва"
        />
        <Field
          label="Телефон"
          name="phone"
          type="tel"
          defaultValue={user.phone}
          placeholder="+7 900 000-00-00"
        />
        <Field
          label="Дата рождения"
          name="birthDate"
          type="date"
          defaultValue={user.birthDate}
          max={todayIso()}
        />
        <Field
          label="Интересы (через запятую)"
          name="interests"
          defaultValue={user.interests.join(", ")}
          placeholder="Горы, Вино, Хайкинг"
        />

        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-ink">О себе</span>
          <textarea
            name="bio"
            rows={4}
            defaultValue={user.bio}
            maxLength={600}
            placeholder="Расскажите, как вы путешествуете и каких попутчиков ищете"
            className="resize-none rounded-btn border border-border bg-surface-2 px-4 py-3 text-[15px] leading-[1.55] text-ink outline-none focus:border-accent placeholder:text-subtle"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-btn border border-[#E9BEB6] bg-[#FCEEEB] px-4 py-3 text-[14px] font-medium text-[#C0392B]"
          >
            {error}
          </p>
        )}

        <div className="mt-1 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn border border-border bg-white px-5 py-3 text-[15px] font-semibold text-ink transition hover:border-accent"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-btn bg-accent px-6 py-3 text-[15px] font-bold text-white transition hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
