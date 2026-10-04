import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeSlug,
  normalizeResponse,
  normalizeContacts,
  normalizeEvents,
  normalizeGallery,
  safeHttpUrl,
  toDateTime,
} from "../src/lib/public-invitation.ts";

test("slug uses the pathname and rejects malformed or decoded separators", () => {
  assert.equal(sanitizeSlug("/a%20b/"), "a b");
  assert.equal(sanitizeSlug("/"), null);
  for (const path of ["/%", "/%E0%A4%A", "/a%2Fb", "/a%5Cb", "/%20"])
    assert.equal(sanitizeSlug(path), null);
});

test("normalizes direct and enveloped responses without consuming detail", () => {
  for (const raw of [{ state: "live", content: {} }, { data: { state: "live", content: {} } }]) {
    assert.equal(normalizeResponse(raw).state, "live");
  }
  const response = normalizeResponse({
    state: "live",
    content: {},
    shop: { name: "Approved brand", phone: "private" },
    detail: { secret: "unused" },
  });
  assert.equal(response.brandName, "Approved brand");
  assert.equal(response.shop, undefined);
  assert.equal(response.detail, undefined);
});

test("fallback discards all wedding data and unknown shop fields", () => {
  const response = normalizeResponse({
    state: "fallback",
    content: { groom_name: "must not render" },
    invitation: { public_url: "https://example.com/private" },
    detail: {},
    shop: { name: "Brand", phone: "123", groom_name: "must not serialize", city: {} },
  });
  assert.deepEqual(response, { state: "fallback", shop: { name: "Brand", phone: "123" } });
  assert.deepEqual(normalizeResponse({ state: "not_found", content: { bride_name: "hidden" } }), {
    state: "not_found",
  });
});

test("malformed response is a request error rather than another invitation", () => {
  for (const raw of [null, {}, { state: "draft" }, { state: "live", content: [] }])
    assert.throws(() => normalizeResponse(raw));
});

test("contacts inspect only the first two entries and require a phone", () => {
  assert.deepEqual(
    normalizeContacts({ contacts: [null, { name: "No phone" }, { phone: "999" }] as never }),
    [],
  );
  const contacts = normalizeContacts({
    contacts: [
      { name: "Family", phone: "+91 90000 00000" },
      { phone: "123", whatsapp_url: "https://example.com/chat" },
      { phone: "999" },
    ],
  });
  assert.equal(contacts.length, 2);
  assert.equal(contacts[0]?.whatsappUrl, "https://wa.me/919000000000");
  assert.equal(contacts[1]?.whatsappUrl, "https://example.com/chat");
  assert.deepEqual(normalizeContacts({ contacts: {} as never }), []);
});

test("untrusted media, event items and executable URLs are ignored", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//example.com/image",
    "/image.png",
  ])
    assert.equal(safeHttpUrl(url), undefined);
  assert.deepEqual(
    normalizeGallery({
      gallery: [
        null,
        {},
        "javascript:alert(1)",
        { src: "https://example.com/photo.png", caption: "Memory" },
      ] as never,
    }),
    [{ src: "https://example.com/photo.png", alt: "Memory", caption: "Memory" }],
  );
  assert.deepEqual(
    normalizeEvents({
      events: [
        null,
        [],
        {},
        { event_name: "Ceremony", mapsUrl: "javascript:alert(1)", event_date: "2027-09-20" },
      ] as never,
    }),
    [{ key: "event-1", title: "Ceremony", date: "2027-09-20" }],
  );
});

test("calendar dates and clocks use India time independently of host timezone", () => {
  assert.equal(toDateTime("2027-09-20")?.toISOString(), "2027-09-19T18:30:00.000Z");
  assert.equal(toDateTime("2027-09-20", "18:30")?.toISOString(), "2027-09-20T13:00:00.000Z");
  assert.equal(toDateTime("2027-09-20", "6:30 PM")?.toISOString(), "2027-09-20T13:00:00.000Z");
  for (const [date, time] of [
    ["2027-02-30", undefined],
    ["invalid", undefined],
    ["2027-09-20", "25:00"],
    ["2027-09-20", "bad"],
    ["2027-09-20", "18:70"],
  ])
    assert.equal(toDateTime(date, time), null);
});
