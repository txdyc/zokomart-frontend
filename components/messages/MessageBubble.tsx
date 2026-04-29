import type { ChatMessage } from "../../lib/types";
import styles from "./chat-detail.module.css";

type MessageBubbleProps = {
  message: ChatMessage;
  showAvatar: boolean;
  avatarValue: string;
};

function getReadStateLabel(message: ChatMessage) {
  if (message.readState === "read") {
    return "✓✓";
  }

  if (message.readState === "delivered") {
    return "✓";
  }

  return "";
}

export function MessageBubble({
  message,
  showAvatar,
  avatarValue,
}: MessageBubbleProps) {
  const isMine = message.sender === "me";
  const readStateLabel = getReadStateLabel(message);

  return (
    <div className={`${styles.messageRow} ${isMine ? styles.messageRowMine : ""}`}>
      {!isMine ? (
        <div
          className={`${styles.bubbleAvatar} ${showAvatar ? "" : styles.bubbleAvatarSpacer}`}
          aria-hidden="true"
        >
          {showAvatar ? avatarValue : ""}
        </div>
      ) : null}

      <div className={`${styles.bubbleWrap} ${isMine ? styles.bubbleWrapMine : ""}`}>
        <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleOther}`}>
          <p className={styles.bubbleText}>{message.content}</p>
        </div>
        <p className={`${styles.metaText} ${isMine ? styles.metaTextMine : ""}`}>
          {message.timestamp}
          {isMine && readStateLabel ? ` · ${readStateLabel}` : ""}
        </p>
      </div>
    </div>
  );
}
