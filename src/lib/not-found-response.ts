import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SafeState } from "../components/invite/SafeState";
import appCss from "../styles.css?url";

export function notFoundResponse(): Response {
  const body = renderToStaticMarkup(
    createElement(SafeState, { variant: "not-found", staticPage: true }),
  );
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Invitation not found</title><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="${appCss}"></head><body>${body}</body></html>`,
    { status: 404, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
