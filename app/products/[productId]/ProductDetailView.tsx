"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useCartUi } from "../../../components/cart/useCartUi";
import { buyerApi } from "../../../lib/api";
import {
  type SelectedOptions,
  buildInitialSelectedOptions,
  findMatchingSku,
  getTotalAmount,
  isOptionValueReachable,
} from "../../../lib/product-detail";
import type { ProductDetailResponse } from "../../../lib/types";
import { formatMoney, getApiErrorMessage } from "../../../lib/view";

import styles from "./ProductDetailView.module.css";

type ProductDetailViewProps = {
  product: ProductDetailResponse;
  actionError?: string;
  initialCartCount?: number;
};

function getSaveAmount(product: ProductDetailResponse, skuId?: string | null) {
  if (!skuId) {
    return null;
  }

  const sku = product.skus.find((item) => item.id === skuId);
  if (!sku?.originalPriceAmount) {
    return null;
  }

  const originalPriceAmount = Number(sku.originalPriceAmount);
  const priceAmount = Number(sku.priceAmount);

  if (Number.isNaN(originalPriceAmount) || Number.isNaN(priceAmount)) {
    return null;
  }

  const saveAmount = originalPriceAmount - priceAmount;
  if (saveAmount <= 0) {
    return null;
  }

  return saveAmount.toFixed(2);
}

export function ProductDetailView({
  product,
  actionError,
  initialCartCount,
}: ProductDetailViewProps) {
  const router = useRouter();
  const [showHeroImage, setShowHeroImage] = useState(Boolean(product.primaryImageUrl));
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() =>
    buildInitialSelectedOptions(product),
  );
  const [quantity, setQuantity] = useState(1);
  const [hasOptionInteraction, setHasOptionInteraction] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add" | "buy-now" | null>(null);
  const [localActionError, setLocalActionError] = useState<string | null>(null);
  const {
    cartCount,
    registerCartAnchor,
    isCartBadgeBouncing,
    setCartCountFromServer,
    applyOptimisticIncrement,
    animateAddToCart,
    showToast,
  } = useCartUi();

  const initialSku =
    product.skus.find((sku) => sku.id === product.defaultSkuId) ?? product.skus[0] ?? null;
  const hasOptionGroups = product.optionGroups.length > 0;

  const selectedSku = useMemo(
    () => findMatchingSku(product.skus, selectedOptions, product.optionGroups),
    [product.optionGroups, product.skus, selectedOptions],
  );

  const currentSku = selectedSku ?? initialSku;
  const effectiveSkuForPurchase =
    hasOptionGroups && hasOptionInteraction ? selectedSku : currentSku;

  const maxQuantity = effectiveSkuForPurchase?.inStock ? effectiveSkuForPurchase.availableQuantity : 0;
  const disableIncrease =
    !effectiveSkuForPurchase || !effectiveSkuForPurchase.inStock || quantity >= maxQuantity;
  const purchaseDisabled = !effectiveSkuForPurchase || !effectiveSkuForPurchase.inStock;
  const quantityForSubmission =
    effectiveSkuForPurchase && effectiveSkuForPurchase.inStock
      ? Math.max(1, Math.min(quantity, effectiveSkuForPurchase.availableQuantity))
      : 1;
  const totalAmount =
    effectiveSkuForPurchase && quantityForSubmission > 0
      ? getTotalAmount(effectiveSkuForPurchase.priceAmount, quantityForSubmission)
      : effectiveSkuForPurchase?.priceAmount ?? "0";
  const saveAmount = getSaveAmount(product, effectiveSkuForPurchase?.id);

  useEffect(() => {
    if (maxQuantity > 0 && quantity > maxQuantity) {
      setQuantity(maxQuantity);
    }
  }, [maxQuantity, quantity]);

  useEffect(() => {
    if (initialCartCount !== undefined) {
      setCartCountFromServer(initialCartCount);
    }
  }, [initialCartCount, setCartCountFromServer]);

  async function handlePurchase(mode: "add" | "buy-now", event: React.MouseEvent<HTMLButtonElement>) {
    if (!effectiveSkuForPurchase || purchaseDisabled || pendingAction) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const shouldAnimate = mode === "add";
    const rollback = shouldAnimate ? applyOptimisticIncrement(quantityForSubmission) : null;

    setPendingAction(mode);
    setLocalActionError(null);

    try {
      const cart = await buyerApi.addCartItem({
        skuId: effectiveSkuForPurchase.id,
        quantity: quantityForSubmission,
      });
      const nextCartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCountFromServer(nextCartCount);

      if (mode === "add") {
        animateAddToCart({ startX, startY });
        showToast("商品已加入购物车", "success");
      } else {
        router.push("/cart");
        return;
      }
    } catch (error) {
      rollback?.();
      const message = getApiErrorMessage(error, "加入购物车失败，请稍后重试。");
      setLocalActionError(message);
      showToast(message, "error");
    } finally {
      setPendingAction(null);
    }
  }

  const resolvedActionError = localActionError ?? actionError;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <Link href="/" className={styles.backLink}>
            ← 返回商品列表
          </Link>
          {showHeroImage && product.primaryImageUrl ? (
            <Image
              src={product.primaryImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 430px"
              className={styles.heroImage}
              onError={() => setShowHeroImage(false)}
            />
          ) : (
            <div className={styles.heroPlaceholder}>暂无商品主图</div>
          )}
          <p className={styles.zoomHint}>图片可放大查看，细节更清晰</p>
        </section>

        <section className={styles.content}>
          {resolvedActionError ? (
            <article className={styles.actionErrorCard}>
              <p>{resolvedActionError}</p>
            </article>
          ) : null}

          <div className={styles.tagRow}>
            <span className={styles.tag}>{product.status}</span>
            {saveAmount ? <span className={styles.tagSale}>限时优惠</span> : null}
          </div>

          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.metaRow}>
            <span>⭐ 4.8</span>
            <span>1.2k+ 评价</span>
            <span className={effectiveSkuForPurchase?.inStock ? styles.stockIn : styles.stockOut}>
              {effectiveSkuForPurchase?.inStock ? "现货可发" : "暂时缺货"}
            </span>
          </div>

          {effectiveSkuForPurchase ? (
            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>
                {formatMoney(effectiveSkuForPurchase.priceAmount, effectiveSkuForPurchase.currencyCode)}
              </span>
              {effectiveSkuForPurchase.originalPriceAmount ? (
                <span className={styles.originalPrice}>
                  {formatMoney(
                    effectiveSkuForPurchase.originalPriceAmount,
                    effectiveSkuForPurchase.currencyCode,
                  )}
                </span>
              ) : null}
              {saveAmount ? (
                <span className={styles.saveAmount}>
                  立省 {formatMoney(saveAmount, effectiveSkuForPurchase.currencyCode)}
                </span>
              ) : null}
            </div>
          ) : null}

          {product.optionGroups.map((group) => (
            <section className={styles.optionGroup} key={group.code}>
              <h2 className={styles.optionTitle}>{group.label}</h2>
              <div className={styles.optionValues}>
                {group.values.map((value) => {
                  const isActive = selectedOptions[group.code] === value.value;
                  const isReachable = isOptionValueReachable(
                    product.skus,
                    selectedOptions,
                    group.code,
                    value.value,
                  );

                  return (
                    <button
                      key={value.value}
                      type="button"
                      className={`${styles.optionValue} ${isActive ? styles.optionValueActive : ""}`}
                      disabled={!isReachable}
                      onClick={() => {
                        setHasOptionInteraction(true);
                        setSelectedOptions((previous) => ({
                          ...previous,
                          [group.code]: value.value,
                        }));
                      }}
                    >
                      {value.label}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {!selectedSku && hasOptionGroups ? (
            <p className={styles.optionWarning}>当前选项组合无可售 SKU，请调整规格后重试。</p>
          ) : null}

          <article className={styles.card}>
            <h3 className={styles.cardTitle}>商家信息</h3>
            <p className={styles.cardBody}>
              {product.merchantName} · {product.merchantType}
            </p>
            <p className={styles.cardMuted}>Accra, Ghana · 今日在线</p>
            <button type="button" className={styles.chatButton}>
              联系商家
            </button>
          </article>

          <article className={styles.card}>
            <h3 className={styles.cardTitle}>配送服务</h3>
            <p className={styles.cardBody}>预计 1-3 天送达，支持门店自提与同城配送。</p>
          </article>

          <section className={styles.badges}>
            <span className={styles.badge}>正品保障</span>
            <span className={styles.badge}>闪电退款</span>
            <span className={styles.badge}>安全支付</span>
          </section>

          <section className={styles.descriptionSection}>
            <h2 className={styles.descriptionTitle}>商品描述</h2>
            <p className={styles.descriptionText}>{product.description || "暂无商品描述。"}</p>
          </section>
        </section>

        <footer className={styles.bottomBar}>
          <Link href="/cart" ref={registerCartAnchor} className={styles.cartShortcut}>
            <span className={styles.cartShortcutIcon}>🛒</span>
            {cartCount > 0 ? (
              <span
                className={`${styles.cartShortcutBadge} ${
                  isCartBadgeBouncing ? styles.cartShortcutBadgeBounce : ""
                }`}
              >
                {cartCount}
              </span>
            ) : null}
          </Link>

          <div className={styles.quantityGroup}>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
            >
              −
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => setQuantity((previous) => previous + 1)}
              disabled={disableIncrease}
            >
              +
            </button>
          </div>

          {effectiveSkuForPurchase ? (
            <div className={styles.totalBlock}>
              <span className={styles.totalLabel}>合计</span>
              <span className={styles.totalValue}>
                {formatMoney(totalAmount, effectiveSkuForPurchase.currencyCode)}
              </span>
            </div>
          ) : null}

          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.addToCartButton}
              disabled={purchaseDisabled || pendingAction !== null}
              onClick={(event) => {
                void handlePurchase("add", event);
              }}
            >
              {pendingAction === "add" ? "加入中..." : "加入购物车"}
            </button>

            <button
              type="button"
              className={styles.buyNowButton}
              disabled={purchaseDisabled || pendingAction !== null}
              onClick={(event) => {
                void handlePurchase("buy-now", event);
              }}
            >
              {pendingAction === "buy-now" ? "处理中..." : "立即购买"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
