"use client";

import { useState } from "react";

import styles from "./product-list-page.module.css";

const FILTER_CHIPS = [
  { id: "default", label: "Default", icon: "⇅" },
  { id: "sale", label: "🔥 On Sale", icon: null },
  { id: "rating", label: "⭐ 4.5+", icon: null },
  { id: "delivery", label: "🚚 Free Delivery", icon: null },
  { id: "new", label: "🆕 New", icon: null },
  { id: "filters", label: "Filters", icon: "≣" },
] as const;

export function ProductFilterChips() {
  const [activeChip, setActiveChip] = useState<(typeof FILTER_CHIPS)[number]["id"]>("default");

  return (
    <div className={styles.filterScroller} aria-label="Product list filters">
      <div className={styles.filterRow}>
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.id === activeChip;

          return (
            <button
              key={chip.id}
              type="button"
              className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""}`}
              onClick={() => setActiveChip(chip.id)}
            >
              {chip.icon ? <span className={styles.filterChipIcon}>{chip.icon}</span> : null}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
