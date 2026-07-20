/**
 * Profile photo with an initials placeholder.
 *
 * A photo of a stranger as the empty state reads as "someone else's account",
 * so an unset avatar renders initials on a tinted circle instead. The tint is
 * derived from the name, so a given user keeps the same colour everywhere.
 */

/** Palette tones that keep white text readable on top. */
const TINTS = ["#E07A5F", "#2F5D62", "#C0563C", "#7A6A5B", "#B07A3C"];

/** "Мария Иванова" -> "МИ"; a single word gives one letter. */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((w) => [...w][0].toUpperCase())
    .join("");
}

function tintOf(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return TINTS[hash % TINTS.length];
}

interface Props {
  src: string;
  name: string;
  /** Tailwind sizing classes for the circle, e.g. "h-[120px] w-[120px]". */
  className?: string;
  /** Font size of the initials; pair it with className. */
  textClassName?: string;
}

export default function Avatar({
  src,
  name,
  className = "",
  textClassName = "text-[38px]",
}: Props) {
  if (src) {
    return (
      <span
        aria-hidden
        className={`block rounded-pill bg-surface-2 bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${src})` }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name} — фото не загружено`}
      className={`grid place-items-center rounded-pill font-display font-bold text-white ${textClassName} ${className}`}
      style={{ backgroundColor: tintOf(name) }}
    >
      {initialsOf(name)}
    </span>
  );
}