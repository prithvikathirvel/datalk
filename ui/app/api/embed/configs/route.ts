import { NextResponse } from "next/server";
import type { EmbedConfigInput } from "@/lib/embed-store";
import { listEmbedConfigs, upsertEmbedConfig } from "@/lib/embed-store";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const configs = await listEmbedConfigs(user.id);
  return NextResponse.json({ configs });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<EmbedConfigInput>;
  const config = await upsertEmbedConfig(user.id, {
    id: body.id,
    botName: body.botName ?? "AI Assistant",
    welcomeMessage:
      body.welcomeMessage ?? "Hi! Ask me anything about our documents.",
    primaryColor: body.primaryColor ?? "#0f172a",
    position: body.position ?? "bottom-right",
    launcherLabel: body.launcherLabel ?? "Chat with us",
    avatarInitials: body.avatarInitials ?? "AI",
    allowedOrigins: body.allowedOrigins ?? [],
    suggestedQuestions: body.suggestedQuestions ?? [],
    fallbackMessage:
      body.fallbackMessage ??
      "I could not find a confident answer. Share your email and our team can follow up.",
    collectVisitorEmail: body.collectVisitorEmail ?? true,
    model: body.model,
    isActive: body.isActive ?? true,
  });

  return NextResponse.json({ config });
}
