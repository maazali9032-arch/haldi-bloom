# ZAR Public Invitation Frontend Standard

Use this document when creating or adapting any ZAR invitation design (for example, with Lovable). It defines the shared public-invitation integration. A design may have its own visual style, but it must follow this data, routing, security, and lifecycle contract.

## Non-negotiable rules

- This is a frontend-only public invitation site.
- Use the **central ZAR V2 Supabase project**. Never create a separate Supabase project, database, design table, per-shop configuration, anon key, or service-role key.
- Fetch invitation data only through the public RPC named `get_public_invitation_content`.
- Never query invitation, content, shop, or design-specific tables directly from the browser.
- Never let the browser select a table, schema, design suffix, or database name.
- Never expose, use, or reference `SUPABASE_SERVICE_ROLE_KEY` in frontend code, client configuration, `.env.example`, documentation examples, or deployment variables.
- Do not alter central schema, RLS policies, lifecycle logic, or the RPC without an explicit central-platform task.
- Do not put real credentials in the repository. Add only empty environment-variable placeholders. The developer will enter actual values manually in the hosting provider.

## Environment variables

The frontend may use **only** these variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Requirements:

- Include exactly those two empty variables in `.env.example`.
- Keep `.env` ignored by Git.
- Do not add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_SERVICE_ROLE_KEY`, or any other Supabase secret/config variable.
- In Lovable, create the integration with placeholders only; do not invent or paste real values. Configure the two actual values manually in Vercel/Lovable deployment settings.

## Public URL and routing

Each invitation is displayed at exactly one single-segment route:

```text
/:slug
```

Example:

```text
https://your-design-domain.example/majid-farha
```

Rules:

- Read the slug from the URL pathname, not query parameters.
- Use only the last non-empty pathname segment.
- Decode it safely. A malformed percent-encoded path must produce `not_found`, not a crash.
- Reject an empty slug or a slug containing a slash/backslash after decoding.
- Do not substitute a default slug, first invitation, sample invitation, or previous invitation.
- Do not use `?slug=...`, hashes, local storage, or user-selected database names to select invitation data.
- Configure SPA rewrites on static hosts such as Vercel so refreshing `/:slug` still loads the application. A Vercel example is:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## Required RPC call

Call the public RPC once for the sanitized URL slug:

```ts
const { data, error } = await supabase.rpc("get_public_invitation_content", {
  p_slug: slug,
});
```

If avoiding the Supabase client library, call the PostgREST RPC endpoint with the same payload:

```text
POST {VITE_SUPABASE_URL}/rest/v1/rpc/get_public_invitation_content
Authorization: Bearer {VITE_SUPABASE_ANON_KEY}
apikey: {VITE_SUPABASE_ANON_KEY}
Content-Type: application/json

{ "p_slug": "<slug>" }
```

The RPC response may be returned directly or inside an outer `{ "data": ... }` envelope. Normalize the envelope once, then treat the normalized object as the response below.

## Response states

The normalized response has a `state` with one of these values:

| State | What may be rendered | Required behavior |
| --- | --- | --- |
| `live` | `invitation`, `content`, and optional `detail` | Render the complete design using public invitation content. |
| `fallback` | `shop` only | Render a polite unavailable/expired screen. Do **not** render couple, event, venue, gallery, music, QR, or any wedding information. |
| `not_found` | Nothing from another invitation | Render a proper “Invitation not found” screen. Do not redirect or substitute data. |
| Request/network/configuration error | No invitation content | Render a retry-friendly generic loading error. |

The central RPC is the authority for draft, archived, expired, scheduled, invalid, and access-controlled invitations. The frontend must never attempt to recreate or bypass that lifecycle logic.

## Live payload contract

For `state: "live"`, use the following public fields. Treat all string fields as optional unless marked **required by the UI**. Empty/missing optional values must simply hide their related UI rather than causing a crash.

```ts
type PublicInvitationResponse = {
  state: "live" | "fallback" | "not_found";
  invitation?: {
    public_url?: string;
  };
  content?: InvitationContent;
  detail?: Record<string, unknown>;
  shop?: ShopFallback;
};

type InvitationContent = {
  // Couple
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

  // Religious opening and ceremony
  invocation?: string;
  wedding_date?: string;
  start_time?: string;
  end_time?: string;
  events?: PublicEvent[];

  // Venue
  venue_name?: string;
  venue_address?: string;
  city?: string;
  maps_url?: string;
  venue_image_url?: string;

  // Media
  gallery?: PublicGalleryItem[];
  music_enabled?: boolean;
  music_url?: string;

  // Invitation contacts (0–2 objects)
  contacts?: PublicContact[];

  // QR label only; QR target is never taken from this field
  qr_text?: string;
};

type PublicEvent = {
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
};

type PublicGalleryItem = string | {
  url?: string;
  src?: string;
  image_url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  span?: "tall" | "wide";
};

type PublicContact = {
  name?: string;
  phone?: string;
  whatsapp_url?: string;
};
```

### Field usage and optionality

| Area | Dynamic fields | Rendering rule |
| --- | --- | --- |
| Couple names | `groom_name`, `bride_name` | The design’s primary title. If either is absent, render only non-empty names; never use sample names. |
| Couple profiles | photos, qualification, occupation, parents, `relatives` | Optional. Hide each absent photo/text line. Do not show a blank profile card. |
| Religious opening | `invocation` | Optional. Hide the opening entirely when absent. Preserve plain text safely; do not inject HTML. |
| Wedding timing | `wedding_date`, `start_time`, `end_time` | Render available values. Countdown must be hidden if there is no valid future target datetime. |
| Events | `events` | Optional list. Render only valid event objects; hide the section if none exist. |
| Venue | venue fields | Render only non-empty values. Hide directions when `maps_url` is absent. Venue image is optional. |
| Gallery | `gallery` plus optional couple photos | Render valid image URLs only. Hide gallery if no images exist. |
| Music | `music_enabled`, `music_url` | Show music control only if enabled. If a URL is missing/unplayable, fail silently; do not crash. Browser playback must begin only after user interaction. |
| Contacts | `contacts` | See the contact section below. Never use shop contacts during `live`. |
| QR | `invitation.public_url`, optional `content.qr_text` | Generate a QR only where the design explicitly needs one, and only from the exact returned `public_url`. Do not construct or guess a URL. |

## Contacts: mandatory behavior when included

The live content may include `content.contacts`, an optional array with at most two objects:

```json
[
  {
    "name": "Ahmed Khan",
    "phone": "+91 90000 00000",
    "whatsapp_url": "https://wa.me/919000000000"
  }
]
```

Implement this exactly:

- Read at most the first two contact objects.
- A contact is renderable only when `phone` is non-empty.
- Hide the whole Contact section when no renderable contacts exist.
- Display `name` only when supplied.
- Render a Call button using `href={\`tel:${phone}\`}`.
- Render a WhatsApp button using `whatsapp_url` when supplied.
- If `whatsapp_url` is absent, derive it only from that same contact’s phone: `https://wa.me/` + phone digits only.
- If no phone is available, do not show either contact/button.
- Do not use shop contacts, venue details, sample data, hardcoded numbers, or social links as a fallback.
- Use the current design’s button style. Use `target="_blank" rel="noreferrer noopener"` for WhatsApp.

## Fallback payload contract

For `state: "fallback"`, only this allowed shop data may be shown:

```ts
type ShopFallback = {
  name?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  business_contact?: string;
};
```

Render a polite unavailable/expired message and only those populated shop fields. Never display content fields in fallback, even if they happen to be present in a malformed response.

## Links and security

- Open external maps, WhatsApp, and social/external links in a new tab with `target="_blank" rel="noreferrer noopener"`.
- `tel:` links may open normally without a new tab.
- Never use `dangerouslySetInnerHTML` for invitation data.
- Treat all RPC fields as untrusted input. Validate that arrays are arrays and objects are objects before reading them.
- Ignore unknown/malformed gallery, event, social, and contact items safely.
- Keep client data access limited to the RPC endpoint and the two allowed public environment variables.

## Design requirements

- Preserve the design’s own visual identity, typography, illustrations, colors, animation, and responsive behavior.
- Make the page work on small mobile screens first, then tablet and desktop.
- Avoid empty frames/sections when optional content is absent.
- Provide clear loading, request-error, fallback, and not-found screens in the same design language.
- Do not show a generic landing invitation, sample couple, or placeholder wedding content for a slug route.
- Do not show a QR on the already-open public invitation unless the product specifically asks for it. If a QR is used elsewhere (for example, dashboard/share/print), its payload must be exactly `data.invitation.public_url`.

## Lovable implementation prompt/checklist

Use this checklist with Lovable or another design implementation tool:

```text
Build/adapt this invitation frontend as a ZAR public invitation design.

Use only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as empty placeholders; do not use or create real environment values, a service-role key, a new Supabase project, tables, database schema, or RLS policies.

For /:slug, safely read the final URL pathname segment and call only the central public RPC get_public_invitation_content with { p_slug: slug }. Do not query any tables directly and do not reference table-specific column names, invitation-code fields, or design table names in public UI code.

Respect live, fallback, not_found, loading, and request-error states. Render only data.content for a live invitation. Render only data.shop in fallback. Never substitute another invitation or sample wedding content.

Map couple, invocation, wedding date/time, venue, events, gallery, music, optional QR label, and contacts from data.content. Use data.invitation.public_url as the sole canonical public URL; never guess or build it from window.location.

For content.contacts, render at most two contacts that have phone values. Add a Contact section near the bottom with the contact name when present, a Call tel: link, and a WhatsApp link from whatsapp_url or a digits-only wa.me fallback based on that same phone. Hide the section when there are no valid contacts. Do not use shop or hardcoded contacts during live state.

Configure direct-refresh support for /:slug (SPA rewrite or framework dynamic route). Keep the design responsive and fail safely for every optional field.
```

## Pre-deploy checklist

- [ ] `.env.example` contains only the two allowed empty Vite variables.
- [ ] `.env` is Git-ignored and no secret is committed.
- [ ] A direct visit and refresh to `/:slug` works.
- [ ] The frontend calls only `get_public_invitation_content({ p_slug })`.
- [ ] No browser code queries Supabase tables or names design-specific tables/columns.
- [ ] `live`, `fallback`, `not_found`, loading, and request-error states are distinct.
- [ ] Fallback cannot show couple/wedding content.
- [ ] Missing optional photos, gallery, events, venue, music, or contacts do not create errors or blank sections.
- [ ] Contact behavior follows the rules above.
- [ ] Any QR uses the exact RPC-provided `invitation.public_url`; no browser-generated fallback URL exists.
- [ ] External links use `noopener noreferrer`.
- [ ] Production build passes.

## Design-specific presentation rules

### Couple-name hero layout

For this design’s invitation hero:

- Render the groom’s name, the `&` symbol, and the bride’s name on three separate centered lines.
- The `&` must be visually isolated between the two names; never place it on the same line as either name.
- If only one name is provided, render only that name and hide the `&`.
- Show the wedding date only once above or below reduce the redundency.

## Floating Shop / Brand Showcase

Every ZAR public invitation design must include a subtle floating shop/brand-name showcase.

- The showcase must be **fixed to the bottom of the device viewport**, remaining visible while the invitation is scrolled.
- It must be a **very thin horizontal ribbon/line**, never a large banner, card, or opaque strip.
- The strip itself should occupy only approximately **1–2% of the viewport height** on mobile.
- Use a **semi-transparent/translucent treatment** so the invitation artwork, lines, typography, or other design elements behind it remain visible through the strip.
- The associated **Shop/Brand name must scroll horizontally in a continuous marquee-style motion**.
- This is a **shared ZAR requirement across every invitation design**, while its typography, colors, ornamentation, and styling should follow each design's visual identity.
- Keep it visually lightweight and elegant, functioning as a subtle branding/detail element rather than an advertisement.
- Do not use a large background panel, opaque banner, excessive height, or intrusive animation.
- The displayed Shop/Brand name must come from the invitation's **approved public shop/brand data** supplied by the central ZAR public invitation contract. Do not hardcode a shop name or query shop tables directly from the browser.
- The showcase must not expose shop contact information during `live` invitation rendering.
- Keep the showcase responsive and proportionally thin across mobile, tablet, and desktop.