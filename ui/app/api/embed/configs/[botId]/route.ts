import { NextResponse } from "next/server";
import { deleteEmbedConfig, getEmbedConfig } from "@/lib/embed-store";
import { getSessionUser } from "@/lib/session";

export async function GET(
  _request: Request,
  context: { params: Promise<{ botId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { botId } = await context.params;
  const config = await getEmbedConfig(botId);
  if (!config || config.userId !== user.id) {
    return NextResponse.json(
      { detail: "Embed chatbot not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ config });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ botId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { botId } = await context.params;
  const deleted = await deleteEmbedConfig(user.id, botId);
  if (!deleted) {
    return NextResponse.json(
      { detail: "Embed chatbot not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
