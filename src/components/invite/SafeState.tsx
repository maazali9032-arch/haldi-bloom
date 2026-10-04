import { useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";
import { t } from "@/lib/i18n";
import type { ShopFallback } from "@/lib/public-invitation";
import { safeHttpUrl, str } from "@/lib/public-invitation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import leaves from "@/assets/leaves.png";
import { BrandRibbon } from "./BrandRibbon";

/**
 * Loading / not-found / fallback / request-error screens, all in the same
 * hand-painted design language. Only shop fields may ever appear here.
 */
export function SafeState({
  variant,
  shop,
  onRetry,
  staticPage = false,
}: {
  variant: "loading" | "not-found" | "fallback" | "error";
  shop?: ShopFallback | undefined;
  onRetry?: (() => void) | undefined;
  staticPage?: boolean;
}) {
  const [lang, setLang] = useState<LanguageCode>("en");

  const title =
    variant === "not-found"
      ? t("notFoundTitle", lang)
      : variant === "fallback"
        ? t("unavailableTitle", lang)
        : variant === "error"
          ? t("errorTitle", lang)
          : t("loading", lang);
  const body =
    variant === "not-found"
      ? t("notFoundBody", lang)
      : variant === "fallback"
        ? t("unavailableBody", lang)
        : variant === "error"
          ? t("errorBody", lang)
          : "";

  const shopName = str(shop?.name);
  const shopPhone = str(shop?.phone);
  const shopWhatsapp = safeHttpUrl(str(shop?.whatsapp));
  const shopAddress = str(shop?.address);
  const shopCity = str(shop?.city);
  const shopBusiness = str(shop?.business_contact);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <img
        src={leaves}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1024}
        height={1024}
        className="pointer-events-none absolute -right-16 -top-16 w-64 opacity-25 sm:w-80"
      />
      {!staticPage ? (
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <LanguageSwitcher languages={LANGUAGES} value={lang} onChange={setLang} />
        </div>
      ) : null}

      <div className="max-w-md" role="status" aria-live="polite">
        <span aria-hidden="true" className="mx-auto block h-px w-16 bg-border" />
        <h1 lang={lang} className="mt-6 text-3xl text-foreground sm:text-4xl">
          {title}
        </h1>
        {body ? (
          <p lang={lang} className="mt-4 text-pretty text-base text-muted-foreground">
            {body}
          </p>
        ) : null}

        {variant === "error" && onRetry ? (
          <button
            type="button"
            lang={lang}
            onClick={onRetry}
            className="mt-6 rounded-full border border-kumkum/40 px-5 py-2.5 text-sm text-kumkum transition-colors hover:bg-kumkum/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("retry", lang)}
          </button>
        ) : null}

        {variant === "fallback" &&
        (shopName || shopPhone || shopWhatsapp || shopAddress || shopCity || shopBusiness) ? (
          <div className="mt-10 rounded-xl border border-border/60 bg-card/70 p-5 text-sm backdrop-blur-[2px]">
            {shopName ? <p className="font-display text-lg text-kumkum">{shopName}</p> : null}
            {shopBusiness ? <p className="mt-1 text-muted-foreground">{shopBusiness}</p> : null}
            {shopAddress ? <p className="mt-2 text-muted-foreground">{shopAddress}</p> : null}
            {shopCity ? <p className="text-muted-foreground">{shopCity}</p> : null}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {shopPhone ? (
                <a
                  href={`tel:${shopPhone}`}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {shopPhone}
                </a>
              ) : null}
              {shopWhatsapp ? (
                <a
                  href={shopWhatsapp}
                  target="_blank"
                  rel="noreferrer noopener"
                  lang={lang}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {t("whatsapp", lang)}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      {variant === "fallback" ? <BrandRibbon name={shopName} /> : null}
    </main>
  );
}
