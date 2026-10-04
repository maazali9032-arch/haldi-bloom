import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Exercise the exact built Vercel SSR entry. The public RPC is intercepted
// in this process only; no database changes or live requests are made.
const nativeFetch = globalThis.fetch;
let calls = 0;
let fixture;
let fail = false;
globalThis.fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url.endsWith("/rest/v1/rpc/get_public_invitation_content")) {
    calls++;
    assert.equal(init.method, "POST");
    assert.deepEqual(Object.keys(JSON.parse(init.body)), ["p_slug"]);
    return Response.json(fixture, { status: fail ? 503 : 200 });
  }
  return nativeFetch(input, init);
};
const handler = (await import("../.vercel/output/functions/__server.func/index.mjs")).default;
async function render(path) {
  calls = 0;
  const response = await handler.fetch(new Request(`https://example.test${path}`));
  return { response, html: await response.text(), calls };
}

test("built live page emits canonical share metadata and brand without shop contacts", async () => {
  fixture = {
    state: "live",
    invitation: { public_url: "https://example.test/exact-canonical" },
    content: { groom_name: "Test Groom", bride_name: "Test Bride" },
    shop: { name: "Approved Shop", phone: "SHOP_CONTACT_MUST_NOT_LEAK" },
    detail: { internal: "DETAIL_MUST_NOT_LEAK" },
  };
  const { html, calls } = await render("/live-fixture");
  assert.equal(calls, 1);
  assert.match(html, /Test Groom/);
  assert.match(html, /Approved Shop/);
  assert.match(html, /rel="canonical" href="https:\/\/example.test\/exact-canonical"/);
  assert.match(html, /property="og:image" content="https:\/\/example.test\/og-image.png"/);
  assert.doesNotMatch(
    html,
    /SHOP_CONTACT_MUST_NOT_LEAK|DETAIL_MUST_NOT_LEAK|id="venue-heading"|id="events-heading"|id="gallery-heading"|id="contact-heading"|<audio/,
  );
});

test("built fallback never renders or serializes invitation data", async () => {
  fixture = {
    state: "fallback",
    invitation: { public_url: "https://example.test/WEDDING_URL_MUST_NOT_LEAK" },
    content: { groom_name: "WEDDING_MUST_NOT_LEAK" },
    shop: { name: "Approved Shop", groom_name: "MALFORMED_SHOP_MUST_NOT_LEAK" },
  };
  const { html, calls } = await render("/fallback-fixture");
  assert.equal(calls, 1);
  assert.match(html, /This invitation is not available/);
  assert.match(html, /Approved Shop/);
  assert.doesNotMatch(
    html,
    /WEDDING_MUST_NOT_LEAK|WEDDING_URL_MUST_NOT_LEAK|MALFORMED_SHOP_MUST_NOT_LEAK|rel="canonical"/,
  );
});

test("built error and not-found states are distinct", async () => {
  fixture = { state: "not_found", content: { bride_name: "DO_NOT_LEAK" } };
  const missing = await render("/missing-fixture");
  assert.match(missing.html, /Invitation not found/);
  assert.doesNotMatch(missing.html, /DO_NOT_LEAK/);
  fail = true;
  const error = await render("/error-fixture");
  fail = false;
  assert.match(error.html, /We could not open the invitation/);
  assert.match(error.html, /Try again/);
});

test("malformed and nested routes do not request invitation data", async () => {
  for (const path of ["/%", "/%E0%A4%A", "/a%2Fb", "/nested/path"]) {
    const { html, calls } = await render(path);
    assert.equal(calls, 0);
    assert.match(html, /Invitation not found/);
  }
});

test("Vercel output preserves supplied public branding assets byte for byte", () => {
  for (const file of [
    "favicon.ico",
    "favicon-32x32.png",
    "favicon-16x16.png",
    "favicon-96x96.png",
    "apple-icon-180x180.png",
    "android-icon-192x192.png",
    "og-image.png",
  ]) {
    assert.deepEqual(
      readFileSync(resolve("public", file)),
      readFileSync(resolve(".vercel/output/static", file)),
    );
  }
});
