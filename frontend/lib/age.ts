/**
 * Age helpers shared by the registration and profile forms.
 *
 * The server validates independently — these exist so a bad date is caught
 * before the request, and so the rule is stated in one place on the client.
 */

/** Must match MIN_AGE in backend/schemas.py. */
export const MIN_AGE = 18;

/** Full years lived, counting the birthday itself as the day it turns over. */
export function ageOn(isoDate: string, today = new Date()): number | null {
  const birth = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());
  return today.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1);
}

/** Today as YYYY-MM-DD, for a date input's `max` — no birthdays in the future. */
export function todayIso(today = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

/**
 * Returns an error message, or null when the date is acceptable.
 * Mirrors _validate_birth_date in backend/schemas.py.
 */
export function birthDateError(isoDate: string): string | null {
  const age = ageOn(isoDate);
  if (age === null) return "Укажите дату рождения";
  if (age < 0) return "Дата рождения не может быть в будущем";
  if (age < MIN_AGE) return `Сервис доступен с ${MIN_AGE} лет`;
  if (age > 120) return "Проверьте дату рождения — она выглядит неправдоподобно";
  return null;
}