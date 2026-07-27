import { ChatShell } from "@/components/chat/chat-shell";

export const metadata = { title: "Chat – Datalk" };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <ChatShell threadId={decodeURIComponent(threadId)} />;
}
