import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { InvitationPage } from "@/components/invite/InvitationPage";
import { SafeState } from "@/components/invite/SafeState";
import {
  fetchPublicInvitation,
  sanitizeSlug,
  type PublicInvitationResponse,
} from "@/lib/public-invitation";

export const Route = createFileRoute("/$slug")({
  head: () => ({
    meta: [
      { title: "Wedding Invitation" },
      { name: "description", content: "A private digital wedding invitation." },
      { property: "og:title", content: "Wedding Invitation" },
      { property: "og:description", content: "A private digital wedding invitation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SlugPage,
});

type Status =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "loaded"; data: PublicInvitationResponse };

function SlugPage() {
  const { slug: routeSlug } = Route.useParams();
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setStatus({ kind: "loading" });

    // The slug always comes from the pathname's last non-empty segment.
    const pathname = typeof window !== "undefined" ? window.location.pathname : `/${routeSlug}`;
    const slug = sanitizeSlug(pathname);
    if (!slug) {
      setStatus({ kind: "loaded", data: { state: "not_found" } });
      return;
    }

    fetchPublicInvitation(slug)
      .then((data) => {
        if (!cancelled) setStatus({ kind: "loaded", data });
      })
      .catch(() => {
        if (!cancelled) setStatus({ kind: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [routeSlug, attempt]);

  if (status.kind === "loading") return <SafeState variant="loading" />;
  if (status.kind === "error") return <SafeState variant="error" onRetry={retry} />;

  const { data } = status;
  if (data.state === "live" && data.content) return <InvitationPage content={data.content} />;
  if (data.state === "fallback") return <SafeState variant="fallback" shop={data.shop} />;
  return <SafeState variant="not-found" />;
}
