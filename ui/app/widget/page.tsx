import { notFound } from "next/navigation";
import { EmbedWidget } from "@/components/embed/embed-widget";
import { embedUrl } from "@/lib/backend";
import { type BackendEmbedConfig, toEmbedConfig } from "@/lib/embed-mappers";

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
