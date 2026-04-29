import { formatMoney } from "../../lib/view";
import type { SubcategoryProductCardItem } from "../../lib/types";

import styles from "./product-list-page.module.css";

type ProductCardProps = {
  item: SubcategoryProductCardItem;
  onSelect: (productId: string) => void;
};

function getImageRatioClassName(imageRatio: SubcategoryProductCardItem["imageRatio"]) {
  switch (imageRatio) {
    case "portrait":
      return styles.cardMediaPortrait;
    case "wide":
      return styles.cardMediaWide;
    default:
      return styles.cardMediaSquare;
  }
}

export function ProductCard({ item, onSelect }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <button type="button" className={styles.cardButton} onClick={() => onSelect(item.id)}>
        <div className={`${styles.cardMedia} ${getImageRatioClassName(item.imageRatio)}`}>
          <img src={item.imageUrl} alt={item.name} className={styles.cardImage} />

          {item.discountPercent ? (
            <span className={styles.discountBadge}>-{item.discountPercent}%</span>
          ) : null}

          <span aria-hidden="true" className={styles.wishlistBadge}>
            ♡
          </span>
        </div>

        <div className={styles.cardBody}>
          <h2 className={styles.cardTitle}>{item.name}</h2>

          <div className={styles.cardRatingRow}>
            <span className={styles.cardRatingStar}>★</span>
            <span className={styles.cardRatingValue}>{item.rating}</span>
            <span className={styles.cardReviewCount}>({item.reviewCount})</span>
          </div>

          <div className={styles.cardPriceRow}>
            <div className={styles.cardPriceBlock}>
              <span className={styles.cardPrice}>
                {formatMoney(item.priceAmount, item.currencyCode)}
              </span>
              {item.originalPriceAmount ? (
                <span className={styles.cardOriginalPrice}>
                  {formatMoney(item.originalPriceAmount, item.currencyCode)}
                </span>
              ) : null}
            </div>

            <span aria-hidden="true" className={styles.addButton}>
              +
            </span>
          </div>

          <div className={styles.cardSellerRow}>
            <span className={styles.cardSellerDot} />
            <span className={styles.cardSellerText}>{item.sellerTag}</span>
          </div>
        </div>
      </button>
    </article>
  );
}
