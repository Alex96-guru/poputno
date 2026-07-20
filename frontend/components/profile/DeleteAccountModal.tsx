"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import ModalShell from "./ModalShell";

const CONFIRM_WORD = "УДАЛИТЬ";

export default function DeleteAccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { deleteAccount } = useAuth();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || confirmation.trim() !== CONFIRM_WORD) return;
    setError(null);
    setBusy(true);
    try {
      // On success the session is gone and the profile page routes away, so
      // there is nothing left to close.
      await deleteAccount();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить аккаунт",
      );
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title="Удалить аккаунт"
      subtitle="Профиль, объявления и отзывы будут удалены безвозвратно. Это действие нельзя отменить."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-ink">
            Введите «{CONFIRM_WORD}», чтобы подтвердить
          </span>
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            placeholder={CONFIRM_WORD}
            className="rounded-btn border border-border bg-surface-2 px-4 py-3 text-[15px] text-ink outline-none focus:border-[#C0392B] placeholder:text-subtle"
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
            disabled={busy || confirmation.trim() !== CONFIRM_WORD}
            className="rounded-btn bg-[#C0392B] px-6 py-3 text-[15px] font-bold text-white transition hover:bg-[#A93226] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Удаляем…" : "Удалить навсегда"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
