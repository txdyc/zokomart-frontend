"use client";

import { useRouter } from "next/navigation";

import type {
  CategoryDetail,
  SubcategoryItem,
  SubcategoryProductCardItem,
} from "../../lib/types";

import { ProductFilterChips } from "./ProductFilterChips";
import { ProductListHeader } from "./ProductListHeader";
import { ProductMasonryGrid } from "./ProductMasonryGrid";
import { ProductResultsSummary } from "./ProductResultsSummary";
import styles from "./product-list-page.module.css";

type ProductListPageClientProps = {
  category: CategoryDetail;
  subcategory: SubcategoryItem;
  items: SubcategoryProductCardItem[];
};

export function ProductListPageClient({
  category,
  subcategory,
  items,
}: ProductListPageClientProps) {
  const router = useRouter();

  function handleBack() {
    router.push(`/category/${category.id}`);
  }

  function handleSelectProduct(productId: string) {
    router.push(`/products/${productId}`);
  }

  return (
    <main className={styles.page}>
      <div className={styles.scrollArea}>
        <ProductListHeader
          title={subcategory.name}
          categoryName={category.name}
          onBack={handleBack}
        />

        <section className={styles.contentSection}>
          <ProductFilterChips />
          <ProductResultsSummary total={items.length} />

          {items.length > 0 ? (
            <ProductMasonryGrid items={items} onSelect={handleSelectProduct} />
          ) : (
            <section className={styles.emptyState}>
              <p className={styles.emptyTitle}>No products yet</p>
              <p className={styles.emptyText}>
                This subcategory is ready for future product data.
              </p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
