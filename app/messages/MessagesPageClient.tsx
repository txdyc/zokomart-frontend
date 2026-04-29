"use client";

import { useState } from "react";

import { MessageHeader } from "../../components/messages/MessageHeader";
import { MessageList } from "../../components/messages/MessageList";
import type { MessageFilter, MessagesPageData } from "../../lib/types";
import styles from "../../components/messages/messages-page.module.css";

type MessagesPageClientProps = {
  initialData: MessagesPageData;
};

export function MessagesPageClient({ initialData }: MessagesPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<MessageFilter>(initialData.activeFilter);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.scrollArea}>
          <MessageHeader
            unreadTotal={initialData.unreadTotal}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          <MessageList conversations={initialData.conversations} />

          <section className={styles.quickTipCard} aria-label="Quick response tip">
            <span aria-hidden="true" className={styles.quickTipIcon}>
              ⚡
            </span>
            <div>
              <h2 className={styles.quickTipTitle}>{initialData.quickTip.title}</h2>
              <p className={styles.quickTipDescription}>{initialData.quickTip.description}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
