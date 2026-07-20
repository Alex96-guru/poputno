"use client";

interface Props {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  /** Latest value a date input accepts, as YYYY-MM-DD. */
  max?: string;
  /** Pass with onChange to drive the field; otherwise it is uncontrolled. */
  value?: string;
  onChange?: (next: string) => void;
}

export default function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  autoComplete,
  minLength,
  max,
  value,
  onChange,
}: Props) {
  const controlled = value !== undefined;
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-semibold text-ink">{label}</span>
      <input
        name={name}
        type={type}
        {...(controlled
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue })}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        max={max}
        className="rounded-btn border border-border bg-surface-2 px-4 py-3 text-[15px] text-ink outline-none focus:border-accent placeholder:text-subtle"
      />
    </label>
  );
}
