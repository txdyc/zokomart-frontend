import type { CategoryDetail } from "../../lib/types";
import styles from "./subcategory-page.module.css";

type SubcategoryHeroProps = {
  category: CategoryDetail;
};

export function SubcategoryHero({ category }: SubcategoryHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroIconWrap}>
          <span aria-hidden="true" className={styles.heroIcon}>
            {category.emoji}
          </span>
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>
            {category.summary.subcategoryCount} sub-categories
          </p>
          <p className={styles.heroText}>
            {category.summary.totalItemCount} total items in {category.name}
          </p>
        </div>
      </div>

      <div className={styles.heroDots} aria-hidden="true">
        <span className={`${styles.heroDot} ${styles.heroDotRed}`} />
        <span className={`${styles.heroDot} ${styles.heroDotGold}`} />
        <span className={`${styles.heroDot} ${styles.heroDotGreen}`} />
      </div>
    </section>
  );
}
