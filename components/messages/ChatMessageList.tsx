import type { RefObject } from "react";

import type { ChatMessage } from "../../lib/types";
import { MessageBubble } from "./MessageBubble";
import styles from "./chat-detail.module.css";

type ChatMessageListProps = {
  messages: ChatMessage[];
  avatarValue: string;
  bottomAnchorRef: RefObject<HTMLDivElement | null>;
};

export function ChatMessageList({
  messages,
  avatarValue,
  bottomAnchorRef,
}: ChatMessageListProps) {
  return (
    <section className={styles.messageList} aria-label="Conversation messages">
      <div className={styles.dayPillWrap}>
        <span className={styles.dayPill}>Today</span>
      </div>

      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          showAvatar={index === 0 || messages[index - 1]?.sender !== "other"}
          avatarValue={avatarValue}
        />
      ))}

      <div ref={bottomAnchorRef} />
    </section>
  );
}
