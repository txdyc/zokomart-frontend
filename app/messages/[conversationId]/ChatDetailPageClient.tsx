"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChatHeader } from "../../../components/messages/ChatHeader";
import { ChatInput } from "../../../components/messages/ChatInput";
import { ChatMessageList } from "../../../components/messages/ChatMessageList";
import type { ChatMessage, MessageConversationDetail } from "../../../lib/types";
import styles from "../../../components/messages/chat-detail.module.css";

type ChatDetailPageClientProps = {
  initialConversation: MessageConversationDetail;
};

function createOutgoingMessage(content: string, index: number): ChatMessage {
  return {
    id: `local-${index}`,
    sender: "me",
    content: content.trim(),
    timestamp: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()),
    readState: "sent",
  };
}

export function ChatDetailPageClient({
  initialConversation,
}: ChatDetailPageClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialConversation.messages);
  const [draftMessage, setDraftMessage] = useState("");
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  const sortedMessages = useMemo(() => [...messages], [messages]);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [sortedMessages]);

  function handleSend() {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      createOutgoingMessage(trimmedMessage, currentMessages.length + 1),
    ]);
    setDraftMessage("");
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <ChatHeader conversation={initialConversation} />
        <div className={styles.conversationBody}>
          <ChatMessageList
            messages={sortedMessages}
            avatarValue={initialConversation.avatarValue}
            bottomAnchorRef={bottomAnchorRef}
          />
        </div>
        <ChatInput value={draftMessage} onChange={setDraftMessage} onSend={handleSend} />
      </div>
    </main>
  );
}
