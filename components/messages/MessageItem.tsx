import Image from "next/image";
import Link from "next/link";

import type { MessageConversation, MessageStatusTone } from "../../lib/types";
import styles from "./messages-page.module.css";

type MessageItemProps = {
  conversation: MessageConversation;
};

function getStatusToneClass(tone: MessageStatusTone) {
  if (tone === "warning") {
    return styles.statusWarning;
  }

  if (tone === "success") {
    return styles.statusSuccess;
  }

  return styles.statusDanger;
}

export function MessageItem({ conversation }: MessageItemProps) {
  const hasUnread = conversation.isUnread && conversation.unreadCount > 0;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={styles.messageItem}
      aria-label={`Open conversation with ${conversation.title}`}
    >
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>
          {conversation.avatarImageUrl ? (
            <Image
              src={conversation.avatarImageUrl}
              alt={conversation.title}
              fill
              sizes="48px"
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarEmoji}>{conversation.avatarValue}</span>
          )}
        </div>
        {conversation.isOnline ? <span className={styles.onlineDot} /> : null}
      </div>

      <div className={styles.messageBody}>
        <div className={styles.messageRow}>
          <h2 className={`${styles.messageTitle} ${hasUnread ? styles.messageTitleUnread : ""}`}>
            {conversation.title}
          </h2>
          <span className={`${styles.messageTime} ${hasUnread ? styles.messageTimeUnread : ""}`}>
            {conversation.timeLabel}
          </span>
        </div>

        <p className={`${styles.previewText} ${hasUnread ? styles.previewTextUnread : ""}`}>
          {conversation.preview}
        </p>

        {conversation.statusTag ? (
          <span
            className={`${styles.statusTag} ${getStatusToneClass(
              conversation.statusTag.tone,
            )}`}
          >
            {conversation.statusTag.label}
          </span>
        ) : null}
      </div>

      <div className={styles.trailingMeta}>
        {hasUnread ? <span className={styles.itemUnreadBadge}>{conversation.unreadCount}</span> : null}
        <span className={styles.chevron}>›</span>
      </div>
    </Link>
  );
}
