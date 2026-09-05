import { useEffect, useRef, useState } from "react";
import { Music2, Pause } from "lucide-react";
import type { LanguageCode } from "@/lib/languages";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Music never autoplays. It only starts from an explicit user interaction,
 * and any playback failure silently leaves the page usable.
 */
export function MusicToggle({
  src,
  title,
  lang,
  requestPlay,
  onHandled,
}: {
  src: string;
  title?: string | undefined;
  lang: LanguageCode;
  /** Set true by a user gesture elsewhere on the page (e.g. hero tap). */
  requestPlay?: boolean;
  onHandled?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async (next?: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    const shouldPlay = next ?? !playing;
    try {
      if (shouldPlay) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch {
      setPlaying(false);
    }
  };

  useEffect(() => {
    if (requestPlay && !playing) {
      void toggle(true);
      onHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPlay]);

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" aria-hidden="true" />
      <button
        type="button"
        onClick={() => void toggle()}
        aria-pressed={playing}
        aria-label={`${playing ? t("pauseMusic", lang) : t("playMusic", lang)} — ${title ?? t("music", lang)}`}
        className={cn(
          "flex size-9 items-center justify-center rounded-full border border-border/70 bg-card/85 text-foreground shadow-sm backdrop-blur-sm transition-colors",
          "hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        {playing ? (
          <Pause className="size-4" aria-hidden="true" />
        ) : (
          <Music2 className="size-4" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
