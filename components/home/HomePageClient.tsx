"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCartUi } from "../cart/useCartUi";
import { HomeHeroCarousel } from "./HomeHeroCarousel";
import { buyerApi, catalogApi } from "../../lib/api";
import type { HomeCategoryItem, HomePageViewModel, HomeProductCard } from "../../lib/home";
import { getApiErrorMessage } from "../../lib/view";
import styles from "../../app/page.module.css";

type HomePageClientProps = {
  model: HomePageViewModel;
  initialCartCount: number;
  productError?: string;
};

function CategoryCard({ category }: { category: HomeCategoryItem }) {
  return (
    <Link className={styles.categoryCard} href={category.href}>
      <div
        className={styles.categoryIcon}
        style={{
          backgroundColor: category.backgroundColor,
          borderColor: category.borderColor,
        }}
      >
        {category.emoji}
      </div>
      <div className={styles.categoryLabel}>{category.label}</div>
    </Link>
  );
}

function getTotalCartQuantity(items: Array<{ quantity: number }>) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function ProductCard({
  product,
  pending,
  onAddToCart,
}: {
  product: HomeProductCard;
  pending: boolean;
  onAddToCart: (
    product: HomeProductCard,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
}) {
  return (
    <article className={styles.productCard}>
      <Link className={styles.productImageWrap} href={product.href}>
        <span className={styles.discountTag}>{product.discountLabel}</span>
        {product.imageUrl ? (
          <img alt={product.name} className={styles.productImage} src={product.imageUrl} />
        ) : (
          <div className={styles.productFallback}>ZokoMart</div>
        )}
      </Link>
      <div className={styles.productBody}>
        <p className={styles.productName}>{product.name}</p>
        <div className={styles.productMeta}>
          <span>★</span>
          <span>
            {product.ratingLabel} ({product.reviewCountLabel})
          </span>
        </div>
        <div className={styles.productFooter}>
          <div>
            <div className={styles.price}>{product.priceLabel}</div>
            {product.originalPriceLabel ? (
              <div className={styles.originalPrice}>{product.originalPriceLabel}</div>
            ) : null}
          </div>
          <button
            aria-label={`Add ${product.name} to cart`}
            className={styles.cartAction}
            disabled={pending || !product.inStock}
            type="button"
            onClick={(event) => {
              void onAddToCart(product, event);
            }}
          >
            {pending ? "…" : "+"}
          </button>
        </div>
        <div className={styles.productMeta}>
          <span className={styles.merchantName}>{product.merchantName}</span>
        </div>
      </div>
    </article>
  );
}

export function HomePageClient({
  model,
  initialCartCount,
  productError,
}: HomePageClientProps) {
  const heroSlide = model.heroSlides[0];
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const {
    setCartCountFromServer,
    applyOptimisticIncrement,
    animateAddToCart,
    showToast,
  } = useCartUi();

  useEffect(() => {
    setCartCountFromServer(initialCartCount);
  }, [initialCartCount, setCartCountFromServer]);

  async function handleAddToCart(
    product: HomeProductCard,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    if (pendingProductId) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    setPendingProductId(product.id);

    try {
      const detail = await catalogApi.getProductDetail(product.id);
      const sku =
        detail.skus.find((item) => item.id === detail.defaultSkuId && item.inStock) ??
        detail.skus.find((item) => item.inStock);

      if (!sku) {
        showToast("该商品当前不可加入购物车", "error");
        return;
      }

      const rollback = applyOptimisticIncrement(1);

      try {
        const cart = await buyerApi.addCartItem({ skuId: sku.id, quantity: 1 });
        setCartCountFromServer(getTotalCartQuantity(cart.items));
        animateAddToCart({ startX, startY });
        showToast("商品已加入购物车", "success");
      } catch (error) {
        rollback();
        showToast(getApiErrorMessage(error, "加入购物车失败，请稍后重试。"), "error");
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, "商品详情暂时不可用，请稍后重试。"), "error");
    } finally {
      setPendingProductId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.phoneFrame}>
        <div className={styles.scrollArea}>
          <header className={styles.topBar}>
            <div className={styles.brandRow}>
              <div className={styles.brandBlock}>
                <div className={styles.brandBadge}>◎</div>
                <div>
                  <div className={styles.brandTitle}>ZokoMart</div>
                  <div className={styles.brandCities}>Accra · Kumasi · Tema</div>
                </div>
              </div>
              <button aria-label="Notifications" className={styles.iconButton} type="button">
                🔔
                <span className={styles.dotBadge} />
              </button>
            </div>

            <div className={styles.searchRow}>
              <div className={styles.searchInput}>
                <span>⌕</span>
                <span>Search products, vendors...</span>
              </div>
              <button aria-label="Search" className={styles.searchAction} type="button">
                ⌘
              </button>
            </div>
          </header>

          <div className={styles.content}>
            <Link className={styles.deliveryStrip} href="/addresses?from=home">
              <span>📍 Delivering to: East Legon, Accra</span>
              <span>›</span>
            </Link>

            <section className={styles.hero}>
              {model.heroSlides.length > 0 ? (
                <HomeHeroCarousel slides={model.heroSlides} />
              ) : (
                <div
                  className={`${styles.heroCard} ${
                    heroSlide.accent === "green" ? styles.heroCardGreen : ""
                  }`}
                >
                  <div className={styles.heroCardInner}>
                    <div className={styles.heroContent}>
                      <span className={styles.pill}>{heroSlide.badge}</span>
                      <h1 className={styles.heroTitle}>{heroSlide.title}</h1>
                      <p className={styles.heroSubtitle}>{heroSlide.subtitle}</p>
                      <Link className={styles.cta} href={model.heroPrimaryHref}>
                        {heroSlide.ctaLabel}
                      </Link>
                    </div>
                    <div className={styles.heroVisual} aria-hidden="true">
                      {heroSlide.visualEmoji}
                    </div>
                  </div>
                  <div className={styles.heroDots}>
                    <span className={styles.heroDot} />
                    <span className={styles.heroDot} />
                    <span className={styles.heroDotActive} />
                  </div>
                </div>
              )}
            </section>

            <section className={styles.section} id="top-categories">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Top Categories</h2>
                <Link className={styles.seeAll} href="#top-categories">
                  See all
                </Link>
              </div>
              <div className={styles.categoryStrip}>
                {model.categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>

            <section className={styles.section} id="flash-sales">
              <div className={styles.sectionHeader}>
                <div className={styles.flashHeader}>
                  <h2 className={styles.sectionTitle}>⚡ Flash Sales</h2>
                  <span className={styles.countdownPill}>ENDS IN</span>
                </div>
                <Link className={styles.seeAll} href="#flash-sales">
                  See all
                </Link>
              </div>
              <div className={styles.countdownRow}>
                <div className={styles.countdownCluster}>
                  <div className={styles.countdownColumn}>
                    <div className={styles.countdownBox}>05</div>
                    <span className={styles.countdownUnit}>HRS</span>
                  </div>
                  <div className={styles.countdownColumn}>
                    <div className={styles.countdownBox}>47</div>
                    <span className={styles.countdownUnit}>MIN</span>
                  </div>
                  <div className={styles.countdownColumn}>
                    <div className={styles.countdownBox}>01</div>
                    <span className={styles.countdownUnit}>SEC</span>
                  </div>
                </div>
              </div>

              {productError ? (
                <div className={styles.errorCard}>{productError}</div>
              ) : model.flashSaleItems.length === 0 ? (
                <div className={styles.emptyCard}>暂无可展示的闪购商品。</div>
              ) : (
                <div className={styles.productScroller}>
                  {model.flashSaleItems.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      pending={pendingProductId === product.id}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className={styles.section} id="recommended">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Popular For You</h2>
                <Link className={styles.seeAll} href="#recommended">
                  See all
                </Link>
              </div>

              {productError ? (
                <div className={styles.statusNote}>商品加载后将显示更多推荐内容。</div>
              ) : model.recommendedItems.length === 0 ? (
                <div className={styles.statusNote}>更多首页推荐位将在商品数据补齐后展示。</div>
              ) : (
                <div className={styles.productScroller}>
                  {model.recommendedItems.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      pending={pendingProductId === product.id}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className={styles.promoCard} id="momo">
              <div>
                <p className={styles.promoTitle}>Pay with MTN MoMo 📲</p>
                <p className={styles.promoText}>
                  Fast &amp; secure checkout. Zero extra fees on all orders!
                </p>
                <Link className={styles.promoButton} href="#momo">
                  Learn More
                </Link>
              </div>
              <div aria-hidden="true" className={styles.promoEmoji}>
                💛
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
