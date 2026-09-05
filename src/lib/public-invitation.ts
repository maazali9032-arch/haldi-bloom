/**
 * ZAR public invitation integration.
 *
 * The browser talks to exactly one endpoint: the central public RPC
 * `get_public_invitation_content`. No table, schema or design name is ever
 * chosen client side, and only the two allowed public env vars are read.
 */

export type PublicState = "live" | "fallback" | "not_found";

export interface PublicContact {
  name?: string;
  phone?: string;
  whatsapp_url?: string;
}

export interface PublicEvent {
  id?: string;
  name?: string;
  title?: string;
  event_name?: string;
  date?: string;
  event_date?: string;
  time?: string;
  start_time?: string;
  venue?: string;
  venue_name?: string;
  city?: string;
  maps_url?: string;
  mapsUrl?: string;
  note?: string;
  description?: string;
}

export type PublicGalleryItem =
  | string
  | {
      url?: string;
      src?: string;
      image_url?: string;
      alt?: string;
      caption?: string;
      width?: number;
      height?: number;
      span?: "tall" | "wide";
    };

export interface InvitationContent {
  groom_name?: string;
  bride_name?: string;
  groom_photo_url?: string;
  bride_photo_url?: string;
  groom_qualification?: string;
  bride_qualification?: string;
  groom_occupation?: string;
  bride_occupation?: string;
  groom_parents?: string;
  bride_parents?: string;
  relatives?: string;

  invocation?: string;
  wedding_date?: string;
  start_time?: string;
  end_time?: string;
  events?: PublicEvent[];

  venue_name?: string;
  venue_address?: string;
  city?: string;
  maps_url?: string;
  venue_image_url?: string;

  gallery?: PublicGalleryItem[];
  music_enabled?: boolean;
  music_url?: string;

  contacts?: PublicContact[];
  qr_text?: string;
}

export interface ShopFallback {
  name?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  business_contact?: string;
}

export interface PublicInvitationResponse {
  state: PublicState;
  invitation?: { public_url?: string };
  content?: InvitationContent;
  detail?: Record<string, unknown>;
  shop?: ShopFallback;
}

/* ── slug ─────────────────────────────────────────────────────── */

/** Last non-empty pathname segment, safely decoded. Returns null when unusable. */
export function sanitizeSlug(pathname: string): string | null {
  const raw = pathname.split("/").filter(Boolean).pop();
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  decoded = decoded.trim();
  if (!decoded || decoded.includes("/") || decoded.includes("\\")) return null;
  return decoded;
}

/* ── helpers ──────────────────────────────────────────────────── */

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const str = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s ? s : undefined;
};

export const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Unwrap the optional `{ data: ... }` envelope and validate the shape. */
export function normalizeResponse(raw: unknown): PublicInvitationResponse {
  let node: unknown = raw;
  if (Array.isArray(node)) node = node[0];
  if (isObject(node) && !("state" in node) && "data" in node) node = node["data"];
  if (Array.isArray(node)) node = node[0];
  if (!isObject(node)) return { state: "not_found" };

  const state = node["state"];
  if (state !== "live" && state !== "fallback") return { state: "not_found" };

  const invitation = isObject(node["invitation"]) ? node["invitation"] : undefined;
  const result: PublicInvitationResponse = { state };
  if (state === "live") {
    if (invitation) result.invitation = { ...(str(invitation["public_url"]) ? { public_url: str(invitation["public_url"])! } : {}) };
    if (isObject(node["content"])) result.content = node["content"] as InvitationContent;
    if (isObject(node["detail"])) result.detail = node["detail"] as Record<string, unknown>;
  } else if (isObject(node["shop"])) {
    result.shop = node["shop"] as ShopFallback;
  }
  return result;
}

/* ── RPC ──────────────────────────────────────────────────────── */

export class ConfigError extends Error {}

export async function fetchPublicInvitation(slug: string): Promise<PublicInvitationResponse> {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  if (!url || !key) throw new ConfigError("Missing public Supabase configuration");

  const response = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/rpc/get_public_invitation_content`,
    {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_slug: slug }),
    },
  );
  if (!response.ok) throw new Error(`Invitation request failed (${response.status})`);
  return normalizeResponse(await response.json());
}

/* ── content view helpers ─────────────────────────────────────── */

export interface NormalizedEvent {
  key: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  mapsUrl?: string;
  note?: string;
}

export function normalizeEvents(content: InvitationContent | undefined): NormalizedEvent[] {
  return list<unknown>(content?.events)
    .filter(isObject)
    .map((raw, index) => {
      const e = raw as PublicEvent;
      const event: NormalizedEvent = { key: str(e.id) ?? `event-${index}` };
      const title = str(e.name) ?? str(e.title) ?? str(e.event_name);
      const date = str(e.date) ?? str(e.event_date);
      const time = str(e.time) ?? str(e.start_time);
      const venue = str(e.venue) ?? str(e.venue_name);
      const city = str(e.city);
      const mapsUrl = safeHttpUrl(str(e.maps_url) ?? str(e.mapsUrl));
      const note = str(e.note) ?? str(e.description);
      if (title) event.title = title;
      if (date) event.date = date;
      if (time) event.time = time;
      if (venue) event.venue = venue;
      if (city) event.city = city;
      if (mapsUrl) event.mapsUrl = mapsUrl;
      if (note) event.note = note;
      return event;
    })
    .filter((e) => e.title || e.date || e.time || e.venue || e.note);
}

export interface NormalizedImage {
  src: string;
  alt: string;
  caption?: string;
}

export function normalizeGallery(content: InvitationContent | undefined): NormalizedImage[] {
  return list<PublicGalleryItem>(content?.gallery)
    .map((item): NormalizedImage | null => {
      if (typeof item === "string") {
        const src = safeHttpUrl(str(item));
        return src ? { src, alt: "" } : null;
      }
      if (!isObject(item)) return null;
      const src = safeHttpUrl(str(item.url) ?? str(item.src) ?? str(item.image_url));
      if (!src) return null;
      const caption = str(item.caption);
      return { src, alt: str(item.alt) ?? caption ?? "", ...(caption ? { caption } : {}) };
    })
    .filter((v): v is NormalizedImage => v !== null);
}

export interface RenderableContact {
  name?: string;
  phone: string;
  whatsappUrl?: string;
}

export function normalizeContacts(content: InvitationContent | undefined): RenderableContact[] {
  return list<unknown>(content?.contacts)
    .filter(isObject)
    .slice(0, 2)
    .map((raw): RenderableContact | null => {
      const c = raw as PublicContact;
      const phone = str(c.phone);
      if (!phone) return null;
      const digits = phone.replace(/\D/g, "");
      const whatsappUrl = safeHttpUrl(str(c.whatsapp_url)) ?? (digits ? `https://wa.me/${digits}` : undefined);
      const name = str(c.name);
      return { phone, ...(name ? { name } : {}), ...(whatsappUrl ? { whatsappUrl } : {}) };
    })
    .filter((v): v is RenderableContact => v !== null);
}

/** Only http(s) links are ever rendered. */
export function safeHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Combine a date and optional time into a valid ISO target, or null. */
export function toDateTime(date: string | undefined, time?: string | undefined): Date | null {
  const d = str(date);
  if (!d) return null;
  const t = str(time);
  const candidates = t ? [`${d}T${normalizeTime(t)}`, d] : [d];
  for (const candidate of candidates) {
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function normalizeTime(time: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(time.trim());
  if (!match) return "00:00:00";
  const h = String(Number(match[1])).padStart(2, "0");
  return `${h}:${match[2]}:${match[3] ?? "00"}`;
}
