import { useEffect, useState } from "react";
import type { LanguageCode } from "@/lib/languages";
import { t } from "@/lib/i18n";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    done: ms === 0,
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

export function Countdown({ target: targetDate, lang }: { target: Date; lang: LanguageCode }) {
  const target = targetDate.getTime();
  // Computed after mount only, so SSR and hydration always agree.
  const [state, setState] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setState(diff(target));
    const id = window.setInterval(() => setState(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (state?.done) return null;

  const cells = [
    { value: state?.days, label: t("days", lang) },
    { value: state?.hours, label: t("hours", lang) },
    { value: state?.minutes, label: t("minutes", lang) },
    { value: state?.seconds, label: t("seconds", lang) },
  ];

  return (
    <div
      className="grid w-full grid-cols-4 gap-2 sm:gap-4"
      role="timer"
      aria-live="off"
      aria-label={t("countdown", lang)}
    >
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="rounded-lg border border-border/60 bg-card/60 px-1 py-3 text-center backdrop-blur-[2px] sm:py-5"
        >
          <span className="block font-display text-2xl tabular-nums text-kumkum sm:text-4xl md:text-5xl">
            {state ? String(cell.value).padStart(2, "0") : "--"}
          </span>
          <span
            lang={lang}
            className="mt-1 block text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs"
          >
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}
