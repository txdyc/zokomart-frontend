import type { MessageConversation } from "../../lib/types";
import { MessageItem } from "./MessageItem";
import styles from "./messages-page.module.css";

type MessageListProps = {
  conversations: MessageConversation[];
};

export function MessageList({ conversations }: MessageListProps) {
  if (conversations.length === 0) {
    return (
      <section className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>No messages yet</h2>
        <p className={styles.emptyText}>Vendor chats and order updates will appear here.</p>
      </section>
    );
  }

  return (
    <section className={styles.messageList} aria-label="Conversation list">
      {conversations.map((conversation) => (
        <MessageItem key={conversation.id} conversation={conversation} />
      ))}
    </section>
  );
}
