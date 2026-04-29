import type { MessageFilter } from "../../lib/types";
import styles from "./messages-page.module.css";

type MessageHeaderProps = {
  unreadTotal: number;
  activeFilter: MessageFilter;
  onFilterChange: (filter: MessageFilter) => void;
};

const FILTER_OPTIONS: Array<{ value: MessageFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "chat", label: "💬 Chats" },
  { value: "order", label: "📦 Orders" },
];

export function MessageHeader({
  unreadTotal,
  activeFilter,
  onFilterChange,
}: MessageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.titleRow}>
          <h1 className={styles.heading}>Messages</h1>
          <span className={styles.unreadSummaryBadge}>{unreadTotal}</span>
        </div>
        <button type="button" className={styles.markAllButton}>
          Mark all read
        </button>
      </div>

      <label className={styles.searchField}>
        <span aria-hidden="true" className={styles.searchIcon}>
          ⌕
        </span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search messages..."
          aria-label="Search messages"
          readOnly
        />
      </label>

      <div className={styles.filterTabs} aria-label="Message filter">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.filterTab} ${
              activeFilter === option.value ? styles.filterTabActive : ""
            }`}
            aria-pressed={activeFilter === option.value}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </header>
  );
}
