"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCartUi } from "../../components/cart/useCartUi";
import { buyerApi } from "../../lib/api";
import type { CartResponse } from "../../lib/types";
import { formatMoney, getApiErrorMessage } from "../../lib/view";
import styles from "./page.module.css";

type CartPageClientProps = {
  initialCart: CartResponse;
  bannerText?: string | null;
  bannerTone?: "success" | "error";
};

function getTotalQuantity(cart: CartResponse) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function CartPageClient({
  initialCart,
  bannerText,
  bannerTone = "success",
}: CartPageClientProps) {
  const [cart, setCart] = useState(initialCart);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const {
    cartCount,
    registerCartAnchor,
    isCartBadgeBouncing,
    setCartCountFromServer,
    showToast,
  } = useCartUi();

  useEffect(() => {
    setCart(initialCart);
    setCartCountFromServer(getTotalQuantity(initialCart));
  }, [initialCart, setCartCountFromServer]);

  const totalQuantity = useMemo(() => getTotalQuantity(cart), [cart]);

  async function handleQuantityChange(itemId: string, nextQuantity: number) {
    if (pendingItemId || nextQuantity < 1) {
      return;
    }

    setPendingItemId(itemId);
    setLocalError(null);

    try {
      const nextCart = await buyerApi.updateCartItem(itemId, { quantity: nextQuantity });
      setCart(nextCart);
      setCartCountFromServer(getTotalQuantity(nextCart));
      showToast("购物车数量已更新", "success");
    } catch (error) {
      const message = getApiErrorMessage(error, "购物车更新失败，请稍后重试。");
      setLocalError(message);
      showToast(message, "error");
    } finally {
      setPendingItemId(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.phoneFrame}>
        <div className={styles.scrollArea}>
          <header className={styles.topBar}>
            <div>
              <h1 className={styles.heading}>My Basket</h1>
              <p className={styles.headingMeta}>{totalQuantity} items in your cart</p>
            </div>
            <button className={styles.topAction} type="button" aria-label="Manage basket">
              🗑️
            </button>
          </header>

          <div className={styles.content}>
            <section className={styles.deliveryBar}>
              <div className={styles.deliveryLeft}>
                <span className={styles.deliveryIcon}>📍</span>
                <span>East Legon, Accra · Delivery: GH₵ FREE</span>
              </div>
              <button className={styles.deliveryAction} type="button">
                Change
              </button>
            </section>

            {bannerText ? (
              <section
                className={`${styles.banner} ${
                  bannerTone === "error" ? styles.bannerError : styles.bannerSuccess
                }`}
              >
                {bannerText}
              </section>
            ) : null}

            {localError ? <section className={styles.errorBanner}>{localError}</section> : null}

            <section className={styles.cards}>
              {cart.items.length === 0 ? (
                <article className={styles.emptyCard}>
                  <p className={styles.emptyTitle}>Your basket is empty</p>
                  <p className={styles.emptyText}>Go back to the storefront and add something good.</p>
                </article>
              ) : (
                cart.items.map((item) => {
                  const isPending = pendingItemId === item.id;

                  return (
                    <article key={item.id} className={styles.itemCard}>
                      <div className={styles.itemTop}>
                        <div className={styles.itemImage}>
                          <span>{item.productName.slice(0, 1)}</span>
                        </div>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemHead}>
                            <Link href={`/products/${item.productId}`} className={styles.itemTitle}>
                              {item.productName}
                            </Link>
                            <button className={styles.itemDelete} type="button" aria-label="Remove item">
                              🗑️
                            </button>
                          </div>
                          <p className={styles.itemMerchant}>by {item.skuName}</p>
                          <div className={styles.itemBottom}>
                            <p className={styles.itemPrice}>
                              {formatMoney(item.referencePriceAmount, item.currencyCode)}
                            </p>
                            <div className={styles.stepper}>
                              <button
                                className={styles.stepperButton}
                                type="button"
                                disabled={isPending || item.quantity <= 1}
                                onClick={() => {
                                  void handleQuantityChange(item.id, item.quantity - 1);
                                }}
                              >
                                −
                              </button>
                              <span className={styles.stepperValue}>{item.quantity}</span>
                              <button
                                className={styles.stepperButtonPrimary}
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                  void handleQuantityChange(item.id, item.quantity + 1);
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.itemMetaBar}>
                        <span>🏪 {item.productName.split(" ")[0] || "ZokoMart Seller"}</span>
                        <span>Ships in 2-4 days</span>
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelTitleRow}>
                <span className={styles.panelIcon}>🏷️</span>
                <h2 className={styles.panelTitle}>Promo Code</h2>
              </div>
              <div className={styles.promoRow}>
                <div className={styles.promoInput}>Enter code (try ZOKOMART10)</div>
                <button className={styles.applyButton} type="button">
                  Apply
                </button>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Order Summary</h2>
              <div className={styles.summaryRow}>
                <span>Subtotal ({totalQuantity} items)</span>
                <span>{formatMoney(cart.referenceTotalAmount, cart.currencyCode)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery Fee</span>
                <span className={styles.freeText}>FREE 🎉</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span className={styles.totalValue}>
                  {formatMoney(cart.referenceTotalAmount, cart.currencyCode)}
                </span>
              </div>
            </section>

            <section className={styles.momoBar}>
              <span className={styles.momoEmoji}>💛</span>
              <p>Pay easily with MTN MoMo — Ghana&apos;s #1 mobile payment</p>
            </section>

            <div className={styles.checkoutBlock}>
              <button type="button" className={styles.checkoutButton}>
                Proceed to Checkout <span aria-hidden="true">›</span>
              </button>
              <Link href="/" className={styles.continueLink}>
                ← Continue Shopping
              </Link>
            </div>
          </div>

          <nav aria-label="Bottom Navigation" className={styles.bottomNav}>
            <Link href="/" className={styles.navItem}>
              <span className={styles.navIconWrap}>
                <span className={styles.navIcon}>⌂</span>
              </span>
              <span className={styles.navLabel}>Home</span>
            </Link>
            <Link href="/#top-categories" className={styles.navItem}>
              <span className={styles.navIconWrap}>
                <span className={styles.navIcon}>⊞</span>
              </span>
              <span className={styles.navLabel}>Categories</span>
            </Link>
            <Link href="/#messages" className={styles.navItem}>
              <span className={styles.navIconWrap}>
                <span className={styles.navIcon}>✉</span>
                <span className={styles.navBadge}>3</span>
              </span>
              <span className={styles.navLabel}>Messages</span>
            </Link>
            <Link href="/cart" className={`${styles.navItem} ${styles.navItemActive}`}>
              <span ref={registerCartAnchor} className={styles.navIconWrap}>
                <span className={styles.navIcon}>🛒</span>
                {cartCount > 0 ? (
                  <span
                    className={`${styles.navBadge} ${
                      isCartBadgeBouncing ? styles.navBadgeBounce : ""
                    }`}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </span>
              <span className={styles.navLabel}>Cart</span>
            </Link>
            <Link href="/me" className={styles.navItem}>
              <span className={styles.navIconWrap}>
                <span className={styles.navIcon}>◌</span>
              </span>
              <span className={styles.navLabel}>Me</span>
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
