import type { LanguageCode } from "@/lib/languages";
import { LANGUAGE_LABELS, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  languages,
  value,
  onChange,
}: {
  languages: LanguageCode[];
  value: LanguageCode;
  onChange: (lang: LanguageCode) => void;
}) {
  if (languages.length < 2) return null;

  return (
    <div
      role="group"
      aria-label={t("language", value)}
      className="flex items-center gap-0.5 rounded-full border border-border/70 bg-card/85 p-0.5 shadow-sm backdrop-blur-sm"
    >
      {languages.map((lang) => {
        const active = lang === value;
        return (
          <button
            key={lang}
            type="button"
            lang={lang}
            onClick={() => onChange(lang)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs leading-none transition-colors sm:px-3 sm:text-sm",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        );
      })}
    </div>
  );
}
