import styles from "./product-list-page.module.css";

type ProductListHeaderProps = {
  title: string;
  categoryName: string;
  onBack: () => void;
};

export function ProductListHeader({
  title,
  categoryName,
  onBack,
}: ProductListHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerRow}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          <span aria-hidden="true" className={styles.backIcon}>
            ←
          </span>
          <span className={styles.backLabel}>Back</span>
        </button>

        <div className={styles.headerCopy}>
          <p className={styles.headerTitle}>{title}</p>
          <p className={styles.headerSubtitle}>in {categoryName}</p>
        </div>

        <span aria-hidden="true" className={styles.searchButton}>
          ⌕
        </span>
      </div>
    </header>
  );
}
