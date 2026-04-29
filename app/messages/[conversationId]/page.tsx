import { notFound } from "next/navigation";

import { getMessageConversationDetail } from "../../../lib/messages";
import { ChatDetailPageClient } from "./ChatDetailPageClient";

type MessageDetailPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function MessageDetailPage({
  params,
}: MessageDetailPageProps) {
  const { conversationId } = await params;
  const conversation = await getMessageConversationDetail(conversationId);

  if (!conversation) {
    notFound();
  }

  return <ChatDetailPageClient initialConversation={conversation} />;
}
