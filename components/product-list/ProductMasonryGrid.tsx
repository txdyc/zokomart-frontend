import { ProductCard } from "./ProductCard";
import styles from "./product-list-page.module.css";
import type { SubcategoryProductCardItem } from "../../lib/types";

type ProductMasonryGridProps = {
  items: SubcategoryProductCardItem[];
  onSelect: (productId: string) => void;
};

export function ProductMasonryGrid({
  items,
  onSelect,
}: ProductMasonryGridProps) {
  const leftColumnItems = items.filter((_, index) => index % 2 === 0);
  const rightColumnItems = items.filter((_, index) => index % 2 === 1);

  return (
    <div className={styles.masonry}>
      <div className={styles.masonryColumn}>
        {leftColumnItems.map((item) => (
          <ProductCard key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>

      <div className={styles.masonryColumn}>
        {rightColumnItems.map((item) => (
          <ProductCard key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
