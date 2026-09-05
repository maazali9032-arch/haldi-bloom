export type LanguageCode = "en" | "hi" | "te";

/** Text that has a translation per language. Proper nouns must NOT use this. */
export type LocalizedText = Record<LanguageCode, string>;

export const LANGUAGES: LanguageCode[] = ["en", "hi", "te"];
export const DEFAULT_LANGUAGE: LanguageCode = "en";
