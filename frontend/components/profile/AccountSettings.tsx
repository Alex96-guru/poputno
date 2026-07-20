"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CircleCheckBig,
  FileText,
  Mail,
  Phone,
  Share2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { User, UserSettings } from "@/lib/types";
import ChangePasswordModal from "./ChangePasswordModal";
import DeleteAccountModal from "./DeleteAccountModal";

interface Props {
  user: User;
  onEdit: () => void;
  onLogout: () => void;
  onBack: () => void;
}

export default function AccountSettings({
  user,
  onEdit,
  onLogout,
  onBack,
}: Props) {
  const { updateSettings } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggle = (key: keyof UserSettings) => ({
    checked: user.settings[key],
    onChange: async (next: boolean) => {
      setError(null);
      try {
        await updateSettings({ [key]: next });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не удалось сохранить настройку",
        );
      }
    },
  });

  return (
    <section id="settings" className="flex flex-col gap-5 scroll-mt-24">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад к профилю"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-btn border border-border bg-white text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h2 className="font-display text-[26px] font-semibold text-ink">
          Настройки аккаунта
        </h2>
      </header>

      <Card title="Личные данные">
        <DataRow label="Имя" value={user.name} onEdit={onEdit} />
        <DataRow label="E-mail" value={user.email} onEdit={onEdit} />
        <DataRow
          label="Телефон"
          value={user.phone || "Не указан"}
          onEdit={onEdit}
        />
        <DataRow
          label="Город"
          value={user.city || "Не указан"}
          onEdit={onEdit}
          last
        />
      </Card>

      <Card title="Верификация">
        <VerifyRow icon={<Mail />} label="Почта" done={user.emailVerified} />
        <VerifyRow icon={<Phone />} label="Телефон" done={user.phoneVerified} />
        <VerifyRow icon={<FileText />} label="Документ" done={false} />
        <VerifyRow icon={<Share2 />} label="Соцсети" done={false} last />
      </Card>

      {error && (
        <p
          role="alert"
          className="rounded-btn border border-[#E9BEB6] bg-[#FCEEEB] px-4 py-3 text-[14px] font-medium text-[#C0392B]"
        >
          {error}
        </p>
      )}

      <Card title="Уведомления">
        <ToggleRow label="Новые сообщения" {...toggle("notifyMessages")} />
        <ToggleRow
          label="Отклики на объявления"
          {...toggle("notifyResponses")}
        />
        <ToggleRow label="E-mail-рассылка" {...toggle("notifyEmailDigest")} />
        <ToggleRow label="Новости сервиса" {...toggle("notifyNews")} last />
      </Card>

      <Card title="Приватность">
        <ToggleRow
          label="Показывать онлайн-статус"
          {...toggle("privacyOnline")}
        />
        <ToggleRow label="Показывать возраст" {...toggle("privacyShowAge")} />
        <ToggleRow label="Профиль в поиске" {...toggle("privacyInSearch")} last />
        <div className="flex flex-wrap gap-3 pt-1.5">
          <GhostButton onClick={() => setChangingPassword(true)}>
            Сменить пароль
          </GhostButton>
          <GhostButton onClick={onLogout}>Выйти из аккаунта</GhostButton>
        </div>
      </Card>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-[#E9BEB6] bg-[#FCEEEB] p-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-[17px] font-semibold text-[#C0392B]">
            Удалить аккаунт
          </h3>
          <p className="text-[14px] text-muted">
            Аккаунт и все объявления будут удалены безвозвратно.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDeleting(true)}
          className="flex items-center gap-2 rounded-btn border border-[#C0392B] bg-[#FCEEEB] px-5 py-[11px] text-[14px] font-semibold text-[#C0392B] transition hover:bg-[#F8DAD6]"
        >
          <Trash2 className="h-4 w-4" />
          Удалить аккаунт
        </button>
      </section>

      {changingPassword && (
        <ChangePasswordModal onClose={() => setChangingPassword(false)} />
      )}
      {deleting && <DeleteAccountModal onClose={() => setDeleting(false)} />}
    </section>
  );
}

/* --------------------------------------------------------------- pieces */

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-card border border-border bg-white p-6">
      <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

const rowClass = (last?: boolean) =>
  `flex items-center justify-between gap-3 py-4 ${last ? "" : "border-b border-border"}`;

function DataRow({
  label,
  value,
  onEdit,
  last,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  last?: boolean;
}) {
  return (
    <div className={rowClass(last)}>
      <span className="flex flex-col gap-1">
        <span className="text-[13px] text-muted">{label}</span>
        <span className="text-[16px] font-medium text-ink">{value}</span>
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-btn border border-border bg-white px-3.5 py-2 text-[14px] font-medium text-ink transition hover:border-accent"
      >
        Изменить
      </button>
    </div>
  );
}

function VerifyRow({
  icon,
  label,
  done,
  last,
}: {
  icon: ReactNode;
  label: string;
  done: boolean;
  last?: boolean;
}) {
  return (
    <div className={rowClass(last)}>
      <span className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-surface-2 text-muted [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </span>
        <span className="text-[16px] font-medium text-ink">{label}</span>
      </span>
      {done ? (
        <span className="flex shrink-0 items-center gap-2 text-[14px] font-medium text-[#3E8E5A]">
          <CircleCheckBig className="h-[18px] w-[18px]" />
          Подтверждена
        </span>
      ) : (
        <button
          type="button"
          className="shrink-0 rounded-btn border border-border bg-white px-3.5 py-2 text-[14px] font-medium text-accent-ink transition hover:border-accent"
        >
          Подтвердить
        </button>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  last,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  last?: boolean;
}) {
  return (
    <div className={`${rowClass(last)} !py-3.5`}>
      <span className="text-[16px] font-medium text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`flex h-6 w-11 shrink-0 items-center rounded-pill px-[3px] transition ${
          checked ? "justify-end bg-accent" : "justify-start bg-subtle"
        }`}
      >
        <span className="h-[18px] w-[18px] rounded-pill bg-white" />
      </button>
    </div>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-btn border border-border bg-white px-[18px] py-2.5 text-[14px] font-semibold text-ink transition hover:border-accent"
    >
      {children}
    </button>
  );
}
