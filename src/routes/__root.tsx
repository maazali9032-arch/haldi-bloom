import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { SafeState } from "@/components/invite/SafeState";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return <SafeState variant="not-found" />;
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <SafeState
      variant="error"
      onRetry={() => {
        void router.invalidate();
        reset();
      }}
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Digital Wedding Invitations" },
      {
        name: "description",
        content: "Hand-painted digital wedding invitations shared as private links.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ZAR Wedding Invitations" },
      { property: "og:image", content: "https://haldi-bloom.vercel.app/og-image.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1731" },
      { property: "og:image:height", content: "909" },
      { property: "og:image:alt", content: "ZAR Wedding Invitations — Beautiful Beginnings" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://haldi-bloom.vercel.app/og-image.png" },
      { name: "twitter:image:alt", content: "ZAR Wedding Invitations — Beautiful Beginnings" },
      { name: "theme-color", content: "#faf4e5" },
      { name: "msapplication-TileImage", content: "/ms-icon-144x144.png" },
      { name: "msapplication-TileColor", content: "#faf4e5" },
      { name: "msapplication-config", content: "/browserconfig.xml" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Marcellus&family=Mukta:wght@300;400;600&family=Noto+Serif+Telugu:wght@400;600&family=Noto+Sans+Telugu:wght@300;400;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { rel: "apple-touch-icon", href: "/apple-icon-180x180.png", sizes: "180x180" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
