import type { LanguageCode, LocalizedText } from "@/lib/languages";

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिन्दी",
  te: "తెలుగు",
};

type UiKey =
  | "invitationFor"
  | "ceremonies"
  | "venue"
  | "getDirections"
  | "countdown"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "celebrationBegun"
  | "playMusic"
  | "pauseMusic"
  | "music"
  | "language"
  | "scroll"
  | "gallery"
  | "contacts"
  | "call"
  | "whatsapp"
  | "couple"
  | "parents"
  | "relatives"
  | "loading"
  | "retry"
  | "notFoundTitle"
  | "notFoundBody"
  | "unavailableTitle"
  | "unavailableBody"
  | "errorTitle"
  | "errorBody";

export const ui: Record<UiKey, LocalizedText> = {
  invitationFor: { en: "Wedding Invitation", hi: "विवाह निमंत्रण", te: "వివాహ ఆహ్వానం" },
  ceremonies: { en: "The Celebrations", hi: "समारोह", te: "వేడుకలు" },
  venue: { en: "Venue", hi: "स्थान", te: "వేదిక" },
  getDirections: { en: "Open in Maps", hi: "मैप में खोलें", te: "మ్యాప్‌లో చూడండి" },
  countdown: { en: "Counting the days", hi: "दिन गिने जा रहे हैं", te: "రోజులు లెక్కిస్తున్నాం" },
  days: { en: "Days", hi: "दिन", te: "రోజులు" },
  hours: { en: "Hours", hi: "घंटे", te: "గంటలు" },
  minutes: { en: "Minutes", hi: "मिनट", te: "నిమిషాలు" },
  seconds: { en: "Seconds", hi: "सेकंड", te: "సెకన్లు" },
  celebrationBegun: {
    en: "The celebration has begun",
    hi: "उत्सव आरंभ हो चुका है",
    te: "వేడుక మొదలైంది",
  },
  playMusic: { en: "Play music", hi: "संगीत चलाएँ", te: "సంగీతం ప్లే చేయండి" },
  pauseMusic: { en: "Pause music", hi: "संगीत रोकें", te: "సంగీతం ఆపండి" },
  music: { en: "Invitation music", hi: "निमंत्रण संगीत", te: "ఆహ్వాన సంగీతం" },
  language: { en: "Language", hi: "भाषा", te: "భాష" },
  scroll: { en: "Scroll", hi: "स्क्रॉल करें", te: "స్క్రోల్ చేయండి" },
  gallery: { en: "Moments", hi: "यादें", te: "క్షణాలు" },
  contacts: { en: "For any help", hi: "किसी सहायता के लिए", te: "సహాయం కోసం" },
  call: { en: "Call", hi: "कॉल करें", te: "కాల్ చేయండి" },
  whatsapp: { en: "WhatsApp", hi: "व्हाट्सएप", te: "వాట్సాప్" },
  couple: { en: "The Couple", hi: "वर-वधू", te: "వధూవరులు" },
  parents: { en: "Parents", hi: "माता-पिता", te: "తల్లిదండ్రులు" },
  relatives: {
    en: "With love from the family",
    hi: "परिवार के स्नेह सहित",
    te: "కుటుంబ ఆప్యాయతతో",
  },
  loading: {
    en: "Opening your invitation…",
    hi: "निमंत्रण खुल रहा है…",
    te: "ఆహ్వానం తెరుస్తోంది…",
  },
  retry: { en: "Try again", hi: "पुनः प्रयास करें", te: "మళ్లీ ప్రయత్నించండి" },
  notFoundTitle: { en: "Invitation not found", hi: "निमंत्रण नहीं मिला", te: "ఆహ్వానం కనబడలేదు" },
  notFoundBody: {
    en: "This link may be mistyped. Please check with the family who invited you.",
    hi: "यह लिंक शायद गलत है। कृपया आमंत्रित करने वाले परिवार से पुष्टि करें।",
    te: "ఈ లింక్ తప్పు కావచ్చు. ఆహ్వానించిన కుటుంబాన్ని సంప్రదించండి.",
  },
  unavailableTitle: {
    en: "This invitation is not available",
    hi: "यह निमंत्रण अभी उपलब्ध नहीं है",
    te: "ఈ ఆహ్వానం అందుబాటులో లేదు",
  },
  unavailableBody: {
    en: "The link is no longer active. Please reach out for a fresh invitation.",
    hi: "यह लिंक अब सक्रिय नहीं है। कृपया नया निमंत्रण प्राप्त करें।",
    te: "ఈ లింక్ ఇప్పుడు పనిచేయడం లేదు. కొత్త ఆహ్వానం కోసం సంప్రదించండి.",
  },
  errorTitle: {
    en: "We could not open the invitation",
    hi: "निमंत्रण नहीं खुल सका",
    te: "ఆహ్వానం తెరవలేకపోయాం",
  },
  errorBody: {
    en: "Please check your connection and try again.",
    hi: "कृपया अपना कनेक्शन जाँचें और पुनः प्रयास करें।",
    te: "మీ ఇంటర్నెట్ చూసి మళ్లీ ప్రయత్నించండి.",
  },
};

export function t(key: UiKey, lang: LanguageCode): string {
  return ui[key][lang];
}

export function tx(text: LocalizedText | undefined, lang: LanguageCode): string {
  return text ? text[lang] : "";
}

const LOCALE: Record<LanguageCode, string> = { en: "en-IN", hi: "hi-IN", te: "te-IN" };
const TZ = "Asia/Kolkata";

/**
 * Parts are assembled by hand so server and browser Intl implementations can
 * never disagree on pattern order (a real SSR hydration hazard).
 */
function parts(date: Date, lang: LanguageCode, options: Intl.DateTimeFormatOptions) {
  const formatter = new Intl.DateTimeFormat(LOCALE[lang], { ...options, timeZone: TZ });
  const map: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) map[part.type] = part.value;
  return map;
}

export function formatDate(date: Date, lang: LanguageCode): string {
  const p = parts(date, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${p["weekday"] ?? ""}, ${p["day"] ?? ""} ${p["month"] ?? ""} ${p["year"] ?? ""}`.trim();
}

export function formatTime(date: Date, lang: LanguageCode): string {
  const p = parts(date, lang, { hour: "numeric", minute: "2-digit", hour12: true });
  const suffix = (p["dayPeriod"] ?? "").toUpperCase();
  return `${p["hour"] ?? ""}:${p["minute"] ?? ""}${suffix ? ` ${suffix}` : ""}`;
}

/** Render a raw time string ("18:30") in a friendly form; falls back to the input. */
export function formatTimeString(time: string, lang: LanguageCode): string {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i.exec(time.trim());
  if (!match) return time;
  let hour = Number(match[1]);
  if (Number(match[2]) > 59 || (match[3] ? hour < 1 || hour > 12 : hour > 23)) return time;
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  const date = new Date(Date.UTC(2000, 0, 1, hour - 5, Number(match[2]) - 30));
  return formatTime(date, lang);
}
