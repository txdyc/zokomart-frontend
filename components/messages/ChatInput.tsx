import { useEffect, useRef, type KeyboardEvent } from "react";

import styles from "./chat-detail.module.css";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;

    if (!element) {
      return;
    }

    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  }, [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <div className={styles.inputBar}>
      <label className={styles.inputWrap}>
        <span className={styles.visuallyHidden}>Type a message</span>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Type a message..."
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </label>
      <button
        type="button"
        className={styles.sendButton}
        onClick={onSend}
        disabled={value.trim().length === 0}
        aria-label="Send message"
      >
        →
      </button>
    </div>
  );
}
