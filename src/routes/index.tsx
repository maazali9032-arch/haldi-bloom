import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Wedding Invitations" },
      {
        name: "description",
        content:
          "Hand-painted digital wedding invitations, delivered as a private link for each family.",
      },
      { property: "og:title", content: "Digital Wedding Invitations" },
      {
        property: "og:description",
        content: "Hand-painted digital wedding invitations, delivered as a private link.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NeutralRoot,
});

/**
 * The root is deliberately neutral — no couple, date or venue is exposed here.
 * Every invitation lives behind its own private slug.
 */
function NeutralRoot() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span aria-hidden="true" className="ink-rule w-16" />
      <h1 className="mt-6 font-display text-2xl text-foreground sm:text-3xl">
        Digital Invitations
      </h1>
      <p className="mt-3 max-w-sm text-pretty text-sm text-muted-foreground">
        Invitations are shared privately. Please open the personal link sent to you by the family.
      </p>
    </main>
  );
}
