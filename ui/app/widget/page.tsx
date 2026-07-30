import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmbedWidget } from "@/components/embed/embed-widget";
import { embedUrl } from "@/lib/backend";
import { type BackendEmbedConfig, toEmbedConfig } from "@/lib/embed-mappers";

/**
 * This is a functional iframe payload (embedded on customer sites), not a
 * destination page for search results, so it should never be indexed even
 * though it's publicly reachable. See app/robots.ts for why this is a
 * page-level noindex instead of a robots.txt disallow.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The widget iframe. The API key is the only credential — the backend
 * resolves which chatbot it belongs to, so no config id appears in the URL.
 */
export default async function WidgetPage({
  searchParams,
}: {
  searchParams: Promise<{
    apiKey?: string;
    parentOrigin?: string;
    pageUrl?: string;
  }>;
}) {
  const { apiKey, parentOrigin, pageUrl } = await searchParams;
  if (!apiKey) {
    notFound();
  }

  let config: ReturnType<typeof toEmbedConfig>;
  try {
    const response = await fetch(embedUrl("/config"), {
      method: "GET",
      headers: { "X-Api-Key": apiKey },
      cache: "no-store",
    });
    if (!response.ok) {
      notFound();
    }
    config = toEmbedConfig((await response.json()) as BackendEmbedConfig);
  } catch {
    notFound();
  }

  if (!config.isActive) {
    notFound();
  }

  return (
    <EmbedWidget
      config={config}
      apiKey={apiKey}
      parentOrigin={parentOrigin}
      pageUrl={pageUrl}
    />
  );
}
