import { NextResponse } from "next/server";
import {
  addEmbedFeedback,
  getEmbedConfig,
  isOriginAllowed,
} from "@/lib/embed-store";

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
    threadId?: string;
    question?: string;
    answer?: string;
    visitorEmail?: string;
    pageUrl?: string;
    parentOrigin?: string;
    reason?: "not_helpful" | "needs_human" | "gap_detected";
  };

  if (!isOriginAllowed(config, body.parentOrigin)) {
    return NextResponse.json(
      { detail: "This website is not allowed to use this chatbot." },
      { status: 403 },
    );
  }

  if (!body.question?.trim()) {
    return NextResponse.json(
      { detail: "Question is required." },
      { status: 400 },
    );
  }

  const feedback = await addEmbedFeedback(config, {
    threadId: body.threadId,
    question: body.question,
    answer: body.answer,
    visitorEmail: body.visitorEmail,
    pageUrl: body.pageUrl,
    parentOrigin: body.parentOrigin,
    reason: body.reason ?? "not_helpful",
  });

  return NextResponse.json({ feedback }, { status: 201 });
}
