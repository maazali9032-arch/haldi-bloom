import { useState } from "react";
import { MapPin, Clock, CalendarDays } from "lucide-react";
import { LANGUAGES, DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/languages";
import { formatDate, formatTimeString, t } from "@/lib/i18n";
import { useParallax } from "@/hooks/use-scroll-motion";
import {
  normalizeContacts,
  normalizeEvents,
  normalizeGallery,
  safeHttpUrl,
  str,
  toDateTime,
  type InvitationContent,
} from "@/lib/public-invitation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MusicToggle } from "./MusicToggle";
import { Countdown } from "./Countdown";
import { ContactSection } from "./ContactSection";
import { Reveal } from "./Reveal";
import { BrandRibbon } from "./BrandRibbon";

import paper from "@/assets/paper.jpg";
import garland from "@/assets/garland.png";
import haldiPot from "@/assets/haldi-pot.png";
import hands from "@/assets/hands.png";
import leaves from "@/assets/leaves.png";
import petals from "@/assets/petals.png";

export function InvitationPage({
  content,
  brandName,
}: {
  content: InvitationContent;
  brandName?: string | undefined;
}) {
  const [lang, setLang] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [requestPlay, setRequestPlay] = useState(false);

  const petalsLayer = useParallax<HTMLImageElement>(-140);
  const leavesLayer = useParallax<HTMLImageElement>(90);
  const potLayer = useParallax<HTMLImageElement>(-70);
  const handsLayer = useParallax<HTMLImageElement>(-55);

  const groomName = str(content.groom_name);
  const brideName = str(content.bride_name);
  const invocation = str(content.invocation);
  const weddingAt = toDateTime(content.wedding_date, content.start_time);
  const weddingDay = toDateTime(content.wedding_date);
  const startTime = str(content.start_time);
  const endTime = str(content.end_time);

  const venueName = str(content.venue_name);
  const venueAddress = str(content.venue_address);
  const venueCity = str(content.city);
  const mapsUrl = safeHttpUrl(str(content.maps_url));
  const venueImage = safeHttpUrl(str(content.venue_image_url));
  const hasVenue = Boolean(venueName || venueAddress || venueCity || mapsUrl || venueImage);

  const events = normalizeEvents(content);
  const gallery = normalizeGallery(content);
  const contacts = normalizeContacts(content);

  const groomPhoto = safeHttpUrl(str(content.groom_photo_url));
  const bridePhoto = safeHttpUrl(str(content.bride_photo_url));
  const profiles = [
    {
      key: "groom",
      name: groomName,
      photo: groomPhoto,
      qualification: str(content.groom_qualification),
      occupation: str(content.groom_occupation),
      parents: str(content.groom_parents),
    },
    {
      key: "bride",
      name: brideName,
      photo: bridePhoto,
      qualification: str(content.bride_qualification),
      occupation: str(content.bride_occupation),
      parents: str(content.bride_parents),
    },
  ].filter((p) => p.photo || p.qualification || p.occupation || p.parents);
  const relatives = str(content.relatives);

  const musicUrl = content.music_enabled === true ? safeHttpUrl(str(content.music_url)) : undefined;
  const countdownTarget = weddingAt && weddingAt.getTime() > Date.now() ? weddingAt : null;

  return (
    <main
      lang={lang}
      className="relative w-full overflow-x-clip"
      style={{
        backgroundImage: `url(${paper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* floating controls */}
      <div className="fixed right-3 top-3 z-50 flex items-center gap-2 sm:right-5 sm:top-5">
        <LanguageSwitcher languages={LANGUAGES} value={lang} onChange={setLang} />
        {musicUrl ? (
          <MusicToggle
            src={musicUrl}
            lang={lang}
            requestPlay={requestPlay}
            onHandled={() => setRequestPlay(false)}
          />
        ) : null}
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="invite-heading"
        onClick={() => musicUrl && setRequestPlay(true)}
        className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 pb-24 pt-[max(12rem,65vw)] text-center sm:px-8 sm:pt-[max(14rem,45vw)] lg:pt-[max(14rem,35vw)]"
      >
        <div
          className="wash pointer-events-none absolute inset-0"
          style={{ ["--wash-x" as string]: "50%", ["--wash-y" as string]: "22%" }}
          aria-hidden="true"
        />
        <img
          src={garland}
          alt=""
          aria-hidden="true"
          width={1920}
          height={640}
          className="pointer-events-none absolute -top-2 left-1/2 w-[190%] max-w-none -translate-x-1/2 opacity-95 sm:w-[130%] lg:w-full"
        />
        <div
          ref={petalsLayer as never}
          aria-hidden="true"
          data-parallax=""
          className="pointer-events-none absolute inset-0"
        >
          {[
            { x: "6%", y: "26%", s: 78, r: -18, o: 0.5, bp: "0% 0%" },
            { x: "82%", y: "18%", s: 62, r: 24, o: 0.4, bp: "50% 33%" },
            { x: "14%", y: "72%", s: 92, r: 38, o: 0.35, bp: "100% 66%" },
            { x: "74%", y: "64%", s: 70, r: -32, o: 0.45, bp: "0% 66%" },
            { x: "46%", y: "12%", s: 54, r: 12, o: 0.3, bp: "50% 100%" },
            { x: "90%", y: "84%", s: 60, r: -8, o: 0.35, bp: "100% 0%" },
          ].map((p) => (
            <span
              key={`${p.x}-${p.y}`}
              className="absolute block bg-no-repeat"
              style={{
                left: p.x,
                top: p.y,
                width: p.s,
                height: p.s,
                opacity: p.o,
                transform: `rotate(${p.r}deg)`,
                backgroundImage: `url(${petals})`,
                backgroundSize: "300% 300%",
                backgroundPosition: p.bp,
              }}
            />
          ))}
        </div>
        <img
          ref={leavesLayer}
          src={leaves}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1024}
          height={1024}
          data-parallax=""
          className="pointer-events-none absolute -bottom-10 -left-16 w-56 rotate-12 opacity-70 sm:w-72 lg:-left-6 lg:w-96"
        />

        <Reveal className="relative z-10 w-full max-w-2xl">
          {invocation ? (
            <p className="mx-auto mb-6 max-w-lg text-pretty font-display text-base leading-relaxed text-foreground/85 sm:text-lg">
              {invocation}
            </p>
          ) : null}
          <p
            lang={lang}
            className="text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground sm:text-xs"
          >
            {t("invitationFor", lang)}
          </p>

          {/* Names on three centred lines; the ampersand always stands alone. */}
          <h1
            id="invite-heading"
            className="mt-6 flex flex-col items-center break-words font-display text-[clamp(2.4rem,12vw,5.5rem)] leading-[1.02] text-kumkum [overflow-wrap:anywhere]"
          >
            {groomName ? <span className="block max-w-full">{groomName}</span> : null}
            {groomName && brideName ? (
              <span className="my-2 block text-[0.42em] text-marigold" aria-hidden="true">
                &amp;
              </span>
            ) : null}
            {brideName ? <span className="block max-w-full">{brideName}</span> : null}
          </h1>

          <span aria-hidden="true" className="ink-rule mx-auto mt-6 block w-40" />

          {weddingDay ? (
            <p className="mt-6 font-display text-lg text-foreground sm:text-xl">
              {formatDate(weddingDay, lang)}
            </p>
          ) : null}
          {startTime || endTime ? (
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {[startTime, endTime]
                .filter((value): value is string => Boolean(value))
                .map((value) => formatTimeString(value, lang))
                .join(" – ")}
            </p>
          ) : null}
        </Reveal>

        <img
          ref={potLayer}
          src={haldiPot}
          alt=""
          aria-hidden="true"
          width={1024}
          height={1024}
          data-parallax=""
          className="pointer-events-none relative z-0 mt-8 w-52 max-w-[62vw] drop-shadow-sm sm:w-64 lg:w-72"
        />

        <span
          lang={lang}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground"
        >
          {t("scroll", lang)}
        </span>
      </section>

      {/* ── Couple ───────────────────────────────────────────── */}
      {profiles.length > 0 || relatives ? (
        <section
          aria-labelledby="couple-heading"
          className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8"
        >
          <Reveal>
            <h2
              id="couple-heading"
              lang={lang}
              className="text-center text-3xl text-foreground sm:text-4xl"
            >
              {t("couple", lang)}
            </h2>
          </Reveal>
          {profiles.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {profiles.map((profile, i) => (
                <Reveal key={profile.key} delay={i * 100}>
                  <article className="h-full rounded-xl border border-border/60 bg-card/70 p-6 text-center backdrop-blur-[2px]">
                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt={profile.name ?? ""}
                        loading="lazy"
                        className="mx-auto size-32 rounded-full object-cover sm:size-40"
                      />
                    ) : null}
                    {profile.name ? (
                      <h3 className="mt-4 font-display text-2xl text-kumkum">{profile.name}</h3>
                    ) : null}
                    {profile.qualification ? (
                      <p className="mt-2 text-sm text-foreground/85">{profile.qualification}</p>
                    ) : null}
                    {profile.occupation ? (
                      <p className="mt-1 text-sm text-foreground/85">{profile.occupation}</p>
                    ) : null}
                    {profile.parents ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        <span lang={lang}>{t("parents", lang)}: </span>
                        {profile.parents}
                      </p>
                    ) : null}
                  </article>
                </Reveal>
              ))}
            </div>
          ) : null}
          {relatives ? (
            <Reveal delay={140} className="mt-10 text-center">
              <p lang={lang} className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {t("relatives", lang)}
              </p>
              <p className="mt-3 text-pretty text-base text-foreground/85">{relatives}</p>
            </Reveal>
          ) : null}
          <Reveal delay={180} className="mt-12 flex justify-center">
            <img
              ref={handsLayer}
              src={hands}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={1024}
              height={1024}
              data-parallax=""
              className="w-64 max-w-[78vw] sm:w-80 lg:w-[26rem]"
            />
          </Reveal>
        </section>
      ) : null}

      {/* ── Countdown ────────────────────────────────────────── */}
      {countdownTarget ? (
        <section
          aria-labelledby="countdown-heading"
          className="relative mx-auto max-w-2xl px-5 py-16 sm:px-8"
        >
          <Reveal>
            <h2
              id="countdown-heading"
              lang={lang}
              className="mb-6 text-center text-sm uppercase tracking-[0.24em] text-muted-foreground"
            >
              {t("countdown", lang)}
            </h2>
            <Countdown target={countdownTarget} lang={lang} />
          </Reveal>
        </section>
      ) : null}

      {/* ── Events ───────────────────────────────────────────── */}
      {events.length > 0 ? (
        <section
          aria-labelledby="events-heading"
          className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8"
        >
          <Reveal>
            <h2
              id="events-heading"
              lang={lang}
              className="text-center text-3xl text-foreground sm:text-4xl"
            >
              {t("ceremonies", lang)}
            </h2>
          </Reveal>
          <ol className="mt-10 space-y-6 sm:space-y-8">
            {events.map((event, i) => {
              const eventDate = toDateTime(event.date);
              return (
                <Reveal as="li" key={event.key} delay={i * 90}>
                  <article className="relative overflow-hidden rounded-xl border border-border/60 bg-card/70 p-5 backdrop-blur-[2px] sm:p-7">
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-1 bg-turmeric/70"
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      {event.title ? (
                        <h3 className="font-display text-xl text-kumkum sm:text-2xl">
                          {event.title}
                        </h3>
                      ) : null}
                      {event.time ? (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="size-4 shrink-0" aria-hidden="true" />
                          <span>{formatTimeString(event.time, lang)}</span>
                        </p>
                      ) : null}
                    </div>
                    {eventDate ? (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                        <span>{formatDate(eventDate, lang)}</span>
                      </p>
                    ) : null}
                    {event.venue || event.city ? (
                      <p className="mt-2 text-sm text-foreground/80">
                        {[event.venue, event.city].filter(Boolean).join(", ")}
                      </p>
                    ) : null}
                    {event.note ? (
                      <p className="mt-3 text-pretty text-sm text-foreground/80 sm:text-base">
                        {event.note}
                      </p>
                    ) : null}
                    {event.mapsUrl ? (
                      <a
                        href={event.mapsUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        lang={lang}
                        className="mt-4 inline-flex items-center gap-2 text-sm text-kumkum underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <MapPin className="size-4" aria-hidden="true" />
                        {t("getDirections", lang)}
                      </a>
                    ) : null}
                  </article>
                </Reveal>
              );
            })}
          </ol>
        </section>
      ) : null}

      {/* ── Venue ────────────────────────────────────────────── */}
      {hasVenue ? (
        <section
          aria-labelledby="venue-heading"
          className="relative mx-auto max-w-3xl overflow-hidden px-5 py-20 text-center sm:px-8"
        >
          <img
            src={leaves}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1024}
            height={1024}
            className="pointer-events-none absolute -right-24 top-0 w-56 -scale-x-100 opacity-20 sm:w-72"
          />
          <Reveal className="relative">
            <h2 id="venue-heading" lang={lang} className="text-3xl text-foreground sm:text-4xl">
              {t("venue", lang)}
            </h2>
            {venueImage ? (
              <img
                src={venueImage}
                alt={venueName ?? ""}
                loading="lazy"
                className="mx-auto mt-8 w-full max-w-xl rounded-xl object-cover"
              />
            ) : null}
            {venueName ? (
              <p className="mt-6 font-display text-2xl text-kumkum sm:text-3xl">{venueName}</p>
            ) : null}
            {venueAddress || venueCity ? (
              <address className="mt-3 not-italic text-sm leading-relaxed text-muted-foreground sm:text-base">
                {venueAddress ? <span className="block">{venueAddress}</span> : null}
                {venueCity ? <span className="block">{venueCity}</span> : null}
              </address>
            ) : null}
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                lang={lang}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-kumkum/40 px-5 py-2.5 text-sm text-kumkum transition-colors hover:bg-kumkum/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <MapPin className="size-4" aria-hidden="true" />
                {t("getDirections", lang)}
              </a>
            ) : null}
          </Reveal>
        </section>
      ) : null}

      {/* ── Gallery ──────────────────────────────────────────── */}
      {gallery.length > 0 ? (
        <section
          aria-labelledby="gallery-heading"
          className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8"
        >
          <Reveal>
            <h2
              id="gallery-heading"
              lang={lang}
              className="text-center text-3xl text-foreground sm:text-4xl"
            >
              {t("gallery", lang)}
            </h2>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {gallery.map((image, i) => (
              <Reveal as="li" key={`${image.src}-${i}`} delay={(i % 3) * 80}>
                <figure className="overflow-hidden rounded-xl border border-border/60 bg-card/60">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  {image.caption ? (
                    <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                      {image.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Contacts ─────────────────────────────────────────── */}
      <ContactSection contacts={contacts} lang={lang} />

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="relative overflow-hidden px-5 pb-10 pt-8 text-center">
        <img
          src={garland}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1920}
          height={640}
          className="pointer-events-none mx-auto w-[170%] max-w-none rotate-180 opacity-80 sm:w-[120%] lg:w-full"
        />
        {groomName || brideName ? (
          <p className="mt-8 font-display text-lg text-kumkum">
            {[groomName, brideName].filter(Boolean).join(" & ")}
          </p>
        ) : null}
      </footer>
      <BrandRibbon name={brandName} />
    </main>
  );
}
