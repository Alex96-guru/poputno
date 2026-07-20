"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Field from "./Field";
import ModalShell from "./ModalShell";

export default function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { changePassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const newPassword = String(data.get("newPassword") ?? "");

    if (newPassword !== String(data.get("repeatPassword") ?? "")) {
      setError("Пароли не совпадают");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await changePassword({
        currentPassword: String(data.get("currentPassword") ?? ""),
        newPassword,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сменить пароль");
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title="Сменить пароль"
      subtitle="Остальные устройства выйдут из аккаунта."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <Field
          label="Текущий пароль"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <Field
          label="Новый пароль"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <Field
          label="Повторите новый пароль"
          name="repeatPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />

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
            {busy ? "Сохраняем…" : "Сменить пароль"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
