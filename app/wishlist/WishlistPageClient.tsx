"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import styles from "./page.module.css";
import { wishlistFilters, wishlistItems, type WishlistFilter } from "./wishlist-data";

type ActiveFilter = WishlistFilter["id"];

function WishlistCard({ item }: { item: (typeof wishlistItems)[number] }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(max-width: 480px) 46vw, 180px"
          className={styles.productImage}
        />
        {item.discountLabel ? <span className={styles.discount}>{item.discountLabel}</span> : null}
        {item.isFlashDeal ? <span className={styles.flash}>🔥 Flash</span> : null}
        <button type="button" className={styles.heartButton} aria-label={`Remove ${item.name}`}>
          ♥
        </button>
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{item.name}</h2>
        <p className={styles.merchant}>⌂ {item.merchantName}</p>
        <div className={styles.ratingRow}>
          <span className={styles.star}>★</span>
          <strong>{item.ratingLabel}</strong>
          <span>({item.reviewCountLabel})</span>
        </div>
        <div className={styles.priceRow}>
          <strong className={styles.price}>{item.priceLabel}</strong>
          {item.originalPriceLabel ? (
            <span className={styles.originalPrice}>{item.originalPriceLabel}</span>
          ) : null}
        </div>
        <button type="button" className={styles.addButton}>
          <span aria-hidden="true">🛒</span>
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export function WishlistPageClient() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const visibleItems = useMemo(() => {
    if (activeFilter === "all") {
      return wishlistItems;
    }

    return wishlistItems.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <main className={styles.page}>
      <section className={styles.surface} aria-labelledby="wishlist-title">
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <button type="button" className={styles.iconButton} aria-label="Go back">
              ‹
            </button>
            <div className={styles.titleBlock}>
              <h1 id="wishlist-title" className={styles.title}>
                Wishlist
              </h1>
              <span className={styles.countBadge}>{wishlistItems.length}</span>
            </div>
            <div className={styles.headerActions}>
              <button type="button" className={styles.iconButton} aria-label="Search wishlist">
                ⌕
              </button>
              <button type="button" className={styles.iconButton} aria-label="Filter wishlist">
                ≛
              </button>
            </div>
          </div>

          <div className={styles.metaRow}>
            <button type="button" className={styles.sortButton}>
              ↕ Date Added
            </button>
            <button type="button" className={styles.clearButton}>
              Clear All
            </button>
          </div>

          <nav className={styles.filterScroller} aria-label="Wishlist categories">
            {wishlistFilters.map((filter) => {
              const isActive = filter.id === activeFilter;

              return (
                <button
                  key={filter.id}
                  type="button"
                  className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              );
            })}
          </nav>
        </header>

        <div className={styles.scrollArea}>
          <section className={styles.savingsBanner}>
            <span className={styles.savingsIcon}>💚</span>
            <div>
              <p className={styles.savingsTitle}>You&apos;re saving GH₵ 715!</p>
              <p className={styles.savingsText}>Across 5 discounted items in your wishlist</p>
            </div>
          </section>

          <section className={styles.grid} aria-label="Wishlist products">
            {visibleItems.map((item) => (
              <WishlistCard key={item.id} item={item} />
            ))}
          </section>

          <div className={styles.ctaDock}>
            <button type="button" className={styles.addAllButton}>
              <span aria-hidden="true">🛒</span>
              Add All to Cart ({visibleItems.length} items)
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
