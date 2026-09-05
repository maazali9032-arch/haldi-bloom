import { Phone, MessageCircle } from "lucide-react";
import type { LanguageCode } from "@/lib/languages";
import { t } from "@/lib/i18n";
import type { RenderableContact } from "@/lib/public-invitation";
import { Reveal } from "./Reveal";

export function ContactSection({
  contacts,
  lang,
}: {
  contacts: RenderableContact[];
  lang: LanguageCode;
}) {
  if (contacts.length === 0) return null;

  return (
    <section
      aria-labelledby="contact-heading"
      className="relative mx-auto w-full max-w-2xl px-5 py-16 sm:px-8"
    >
      <Reveal>
        <h2
          id="contact-heading"
          lang={lang}
          className="text-center text-2xl text-foreground sm:text-3xl"
        >
          {t("contacts", lang)}
        </h2>
      </Reveal>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {contacts.map((contact, i) => (
          <Reveal as="li" key={`${contact.phone}-${i}`} delay={i * 90}>
            <div className="rounded-xl border border-border/60 bg-card/70 p-5 text-center backdrop-blur-[2px]">
              {contact.name ? (
                <p className="font-display text-lg text-kumkum sm:text-xl">{contact.name}</p>
              ) : null}
              <p className="mt-1 text-sm text-muted-foreground">{contact.phone}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  lang={lang}
                  className="inline-flex items-center gap-2 rounded-full border border-kumkum/40 px-4 py-2 text-sm text-kumkum transition-colors hover:bg-kumkum/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {t("call", lang)}
                </a>
                {contact.whatsappUrl ? (
                  <a
                    href={contact.whatsappUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    lang={lang}
                    className="inline-flex items-center gap-2 rounded-full border border-leaf/50 px-4 py-2 text-sm text-foreground transition-colors hover:bg-leaf/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    {t("whatsapp", lang)}
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
