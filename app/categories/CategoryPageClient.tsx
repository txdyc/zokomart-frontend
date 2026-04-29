"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { fetchCategoryList } from "../../lib/categories";
import type { CategoryItem, CategoryTone } from "../../lib/types";
import styles from "./page.module.css";

type CategoryPageClientProps = {
  initialItems: CategoryItem[];
};

const TONE_CLASS_MAP: Record<CategoryTone, string> = {
  rose: styles.toneRose,
  green: styles.toneGreen,
  amber: styles.toneAmber,
  purple: styles.tonePurple,
  blue: styles.toneBlue,
  orange: styles.toneOrange,
  neutral: styles.toneNeutral,
  sky: styles.toneSky,
};

export function CategoryPageClient({ initialItems }: CategoryPageClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [displayItems, setDisplayItems] = useState(initialItems);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  const isEmpty = hasSearched && displayItems.length === 0;

  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const result = await fetchCategoryList({ query: trimmedQuery });
      setDisplayItems(result.items);
    } finally {
      setIsSearching(false);
    }
  }

  function handleCategoryClick(item: CategoryItem) {
    setSelectedCategorySlug(item.slug);
    router.push(`/category/${item.id}`);
  }

  return (
    <main className={styles.page}>
      <div className={styles.scrollArea}>
        <header className={styles.topBar}>
          <h1 className={styles.heading}>Categories</h1>

          <form
            className={styles.searchRow}
            onSubmit={(event) => {
              event.preventDefault();
              void handleSearch();
            }}
          >
            <label className={styles.searchField}>
              <span aria-hidden="true" className={styles.searchIcon}>
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={styles.searchInput}
                placeholder="Search categories..."
                aria-label="Search categories"
              />
            </label>

            <button
              type="submit"
              className={styles.searchButton}
              disabled={isSearching}
            >
              {isSearching ? "Searching" : "Search"}
            </button>
          </form>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionTitleRow}>
            <span aria-hidden="true" className={styles.sectionIcon}>
              ◔
            </span>
            <h2 className={styles.sectionTitle}>All Categories</h2>
          </div>

          {isEmpty ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No matching categories</p>
              <p className={styles.emptyText}>Try searching in English or Twi.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {displayItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.card} ${TONE_CLASS_MAP[item.tone]} ${
                    selectedCategorySlug === item.slug ? styles.cardActive : ""
                  }`}
                  onClick={() => handleCategoryClick(item)}
                >
                  <span className={styles.cardIconWrap}>
                    <span aria-hidden="true" className={styles.cardIcon}>
                      {item.emoji}
                    </span>
                  </span>
                  <span className={styles.cardName}>{item.name}</span>
                  <span className={styles.cardLocalName}>{item.localName}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
