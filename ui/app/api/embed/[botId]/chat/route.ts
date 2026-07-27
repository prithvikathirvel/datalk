import type { ChatResponse } from "@template/contracts";
import { NextResponse } from "next/server";
import { backendUrls, joinUrl } from "@/lib/backend";
import { getEmbedConfig, isOriginAllowed } from "@/lib/embed-store";
import { createJwtToken } from "@/lib/jwt";
import { getUserById } from "@/lib/user-store";

export async function POST(
  request: Request,
  context: { params: Promise<{ botId: string }> },
) {
  const { botId } = await context.params;
  const config = await getEmbedConfig(botId);
  if (!config?.isActive) {
    return NextResponse.json(
      { detail: "Chatbot is unavailable." },
      { status: 404 },
    );
  }

  const body = (await request.json()) as {
    message?: string;
    thread_id?: string;
    parentOrigin?: string;
    pageUrl?: string;
  };

  if (!body.message?.trim()) {
    return NextResponse.json(
      { detail: "Message is required." },
      { status: 400 },
    );
  }

  if (!isOriginAllowed(config, body.parentOrigin)) {
    return NextResponse.json(
      { detail: "This website is not allowed to use this chatbot." },
      { status: 403 },
    );
  }

  const owner = await getUserById(config.userId);
  const token = createJwtToken({
    sub: config.userId,
    email: owner?.email ?? "embed@local.app",
    name: owner?.name ?? config.botName,
  });

  try {
    const backendResponse = await fetch(
      joinUrl(backendUrls.chat, "/chat/chat"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: body.message,
          thread_id: body.thread_id,
          model: config.model,
        }),
      },
    );

    const contentType = backendResponse.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? ((await backendResponse.json()) as ChatResponse | { detail?: string })
      : { detail: await backendResponse.text() };

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Unable to reach chat service.",
      },
      { status: 502 },
    );
  }
}
