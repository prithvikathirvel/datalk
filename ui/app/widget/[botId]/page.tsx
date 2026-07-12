import { notFound } from "next/navigation";
import { EmbedWidget } from "@/components/embed/embed-widget";
import { getEmbedConfig, isOriginAllowed } from "@/lib/embed-store";

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ parentOrigin?: string; pageUrl?: string }>;
}) {
  const { botId } = await params;
  const { parentOrigin, pageUrl } = await searchParams;
  const config = await getEmbedConfig(botId);

  if (!config?.isActive || !isOriginAllowed(config, parentOrigin)) {
    notFound();
  }

  return (
    <EmbedWidget
      config={config}
      parentOrigin={parentOrigin}
      pageUrl={pageUrl}
    />
  );
}
