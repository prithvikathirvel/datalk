import { NextResponse } from "next/server";
import { listEmbedFeedback } from "@/lib/embed-store";
import { getSessionUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const botId = url.searchParams.get("botId");
  const feedback = await listEmbedFeedback(user.id, botId);
  return NextResponse.json({ feedback });
}
