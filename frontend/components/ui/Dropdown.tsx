"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  /** The control that opens the panel. Kept inside the outside-click boundary. */
  trigger: ReactNode;
  children: ReactNode;
  /** Width (and any other) classes for the floating panel. */
  panelClassName?: string;
  /**
   * Which edge the panel lines up with. Set explicitly rather than overriding
   * the placement through panelClassName, where class order decides the winner.
   */
  align?: "left" | "right";
}

/**
 * A field with a panel anchored under it.
 *
 * The trigger lives inside the same wrapper the outside-click listener watches,
 * so clicking the trigger while open closes the panel instead of closing and
 * immediately reopening it.
 */
export default function Dropdown({
  open,
  onClose,
  trigger,
  children,
  panelClassName = "w-full",
  align = "left",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      {trigger}
      {open && (
        <div
          className={`absolute top-[calc(100%+8px)] z-40 overflow-hidden rounded-[16px] border border-border bg-white shadow-[0_14px_36px_rgba(42,37,34,0.15)] ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
