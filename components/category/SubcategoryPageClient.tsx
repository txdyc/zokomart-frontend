"use client";

import { useRouter } from "next/navigation";

import type { CategoryDetail, SubcategoryItem } from "../../lib/types";
import { SubcategoryFilterButton } from "./SubcategoryFilterButton";
import { SubcategoryHero } from "./SubcategoryHero";
import { SubcategoryList } from "./SubcategoryList";
import { SubcategoryPageHeader } from "./SubcategoryPageHeader";
import styles from "./subcategory-page.module.css";

type SubcategoryPageClientProps = {
  category: CategoryDetail;
  items: SubcategoryItem[];
};

export function SubcategoryPageClient({
  category,
  items,
}: SubcategoryPageClientProps) {
  const router = useRouter();

  function handleBack() {
    router.push("/categories");
  }

  function handleSelect(subcategoryId: string) {
    router.push(`/category/${category.id}/subcategory/${subcategoryId}`);
  }

  return (
    <main className={styles.page}>
      <div className={styles.scrollArea}>
        <SubcategoryPageHeader
          title={category.name}
          subtitle={category.localName}
          onBack={handleBack}
        />

        <SubcategoryHero category={category} />

        <section className={styles.contentSection}>
          <div className={styles.listCard}>
            <div className={styles.filterRow}>
              <SubcategoryFilterButton />
            </div>

            <SubcategoryList items={items} onSelect={handleSelect} />
          </div>
        </section>
      </div>
    </main>
  );
}
