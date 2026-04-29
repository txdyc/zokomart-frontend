import styles from "./product-list-page.module.css";

type ProductResultsSummaryProps = {
  total: number;
};

export function ProductResultsSummary({ total }: ProductResultsSummaryProps) {
  const productLabel = total === 1 ? "product" : "products";

  return (
    <div className={styles.summaryRow}>
      <p className={styles.summaryText}>
        {total} {productLabel} found
      </p>

      <div className={styles.summaryDots} aria-hidden="true">
        <span className={`${styles.summaryDot} ${styles.summaryDotRed}`} />
        <span className={`${styles.summaryDot} ${styles.summaryDotGold}`} />
        <span className={`${styles.summaryDot} ${styles.summaryDotGreen}`} />
      </div>
    </div>
  );
}
