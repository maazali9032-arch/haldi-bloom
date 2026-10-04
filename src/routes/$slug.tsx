import { createFileRoute, useRouter } from "@tanstack/react-router";
import { InvitationPage } from "@/components/invite/InvitationPage";
import { SafeState } from "@/components/invite/SafeState";
import {
  fetchPublicInvitation,
  sanitizeSlug,
  safeHttpUrl,
  str,
  type PublicInvitationResponse,
} from "@/lib/public-invitation";

type Result = { kind: "loaded"; data: PublicInvitationResponse } | { kind: "error" };

export const Route = createFileRoute("/$slug")({
  // SSR exposes metadata to sharing crawlers. Hydration reuses the result.
  loader: async ({ location }): Promise<Result> => {
    const slug = sanitizeSlug(location.pathname);
    if (!slug) return { kind: "loaded", data: { state: "not_found" } };
    try {
      return { kind: "loaded", data: await fetchPublicInvitation(slug) };
    } catch {
      return { kind: "error" };
    }
  },
  staleTime: 0,
  head: ({ loaderData }) => {
    const data = loaderData?.kind === "loaded" ? loaderData.data : undefined;
    const live = data?.state === "live";
    const names = live
      ? [str(data.content?.groom_name), str(data.content?.bride_name)].filter(Boolean).join(" & ")
      : "";
    const title = names ? `${names} | Wedding Invitation` : "Wedding Invitation";
    const description = live
      ? "You are warmly invited to celebrate with us."
      : "A private digital wedding invitation.";
    const publicUrl =
      live && safeHttpUrl(data.invitation?.public_url) ? data.invitation?.public_url : undefined;
    const image = publicUrl
      ? new URL("/og-image.png", publicUrl).href
      : "https://haldi-bloom.vercel.app/og-image.png";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:image:secure_url", content: image },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "robots", content: "noindex, nofollow" },
        ...(publicUrl ? [{ property: "og:url", content: publicUrl }] : []),
      ],
      links: publicUrl ? [{ rel: "canonical", href: publicUrl }] : [],
    };
  },
  pendingComponent: () => <SafeState variant="loading" />,
  component: SlugPage,
});

function SlugPage() {
  const result = Route.useLoaderData();
  const router = useRouter();
  const { slug } = Route.useParams();
  if (result.kind === "error")
    return (
      <SafeState
        variant="error"
        onRetry={() => {
          void router.invalidate();
        }}
      />
    );
  const { data } = result;
  if (data.state === "live" && data.content)
    return <InvitationPage key={slug} content={data.content} brandName={data.brandName} />;
  if (data.state === "fallback") return <SafeState variant="fallback" shop={data.shop} />;
  return <SafeState variant="not-found" />;
}
