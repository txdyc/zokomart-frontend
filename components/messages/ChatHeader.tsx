import Image from "next/image";
import Link from "next/link";

import type { MessageConversationDetail } from "../../lib/types";
import styles from "./chat-detail.module.css";

type ChatHeaderProps = {
  conversation: Pick<
    MessageConversationDetail,
    "title" | "avatarValue" | "avatarImageUrl" | "isOnline"
  >;
};

export function ChatHeader({ conversation }: ChatHeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/messages" className={styles.backButton} aria-label="Back to messages">
        ←
      </Link>
      <div className={styles.headerAvatar}>
        {conversation.avatarImageUrl ? (
          <Image
            src={conversation.avatarImageUrl}
            alt={conversation.title}
            fill
            sizes="36px"
            className={styles.headerAvatarImage}
          />
        ) : (
          <span className={styles.headerAvatarEmoji}>{conversation.avatarValue}</span>
        )}
      </div>
      <div className={styles.headerMeta}>
        <h1 className={styles.headerTitle}>{conversation.title}</h1>
        {conversation.isOnline ? <p className={styles.headerStatus}>● Online</p> : null}
      </div>
    </header>
  );
}
