import styles from "./subcategory-page.module.css";

export function SubcategoryFilterButton() {
  return (
    <button
      type="button"
      className={styles.filterButton}
      aria-label="Filter, coming soon"
    >
      <span aria-hidden="true" className={styles.filterIcon}>
        ⌕
      </span>
      <span>Filter</span>
      <span className={styles.filterSoon}>Soon</span>
    </button>
  );
}
