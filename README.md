# Haldi Bloom Invitations

A watercolor ZAR public invitation frontend. The existing artwork, typography, multilingual controls, reveals and responsive layout are retained.

## Public data contract

Follow [PUBLIC_INVITATION_INTEGRATION.md](PUBLIC_INVITATION_INTEGRATION.md). Each invitation uses exactly one single-segment `/:slug` route and calls only `get_public_invitation_content` with `{ p_slug }`. The RPC owns all lifecycle and access decisions. The homepage contains no sample invitation.

Live pages render public `content`, with only the approved RPC `shop.name` retained for the thin floating ribbon. Shop contacts are never rendered in live state. Fallback renders only the permitted shop fields; not-found and request errors never substitute another invitation. Optional sections hide when their data is absent. Music requires both `music_enabled: true` and a valid public `music_url`, and starts after interaction. No QR is shown on the already-open invitation.

## Environment

Copy `.env.example` to the Git-ignored `.env` and configure only its two public variables. Enter actual values manually in the hosting provider. Never add other Supabase configuration or credentials to this frontend.

## Development and validation

Use Node.js 24 (Node.js 22.18+ also supports the test runner).

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

Both `package-lock.json` and `bun.lock` are maintained. Bun users may install with `bun install --frozen-lockfile`.

## Vercel

The Nitro Vercel preset produces `.vercel/output` with static assets and an SSR function. The generated routing configuration serves assets first, then sends invitation paths to SSR, supporting direct visits and refreshes. Do not add a catch-all SPA rewrite: this project uses framework routing and SSR so link-preview crawlers receive metadata in the initial HTML. Configure both public Vite variables before building, and use `npm run build` as the build command.

React Start is pinned to the patched `1.168.60`, React Router to compatible `1.170.41`, and Router Plugin to `1.168.42`. The resolved Start server core is `1.169.39`.

## Branding and sharing

All icons are the supplied files in `public/`. Apple, Android, Windows and browser metadata reference those exact assets. Sharing metadata uses `public/og-image.png`, the supplied ZAR artwork. Couple titles and canonical URLs are available in SSR; the canonical URL comes only from `invitation.public_url`. No invitation URL is constructed from the browser location. Generic sharing metadata uses the deployment's brand image URL, not an invitation URL. If the deployment domain changes, update that static asset URL in the root and slug route metadata.

Redeploy to publish metadata changes. WhatsApp and other apps may cache previously shared previews; they control when those caches refresh.

This repository remains connected to Lovable. Preserve published Git history. Lovable's build selects its own managed Nitro target; the Vercel target applies to external builds.
