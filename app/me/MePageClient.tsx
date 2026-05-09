"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../components/auth/useAuth";
import { resolveAssetUrl } from "../../lib/api";
import type { BuyerMeRecentOrder, BuyerMeResponse, BuyerMeTransaction } from "../../lib/types";
import { formatMoney } from "../../lib/view";
import styles from "./page.module.css";

type MePageClientProps = {
  initialMe: BuyerMeResponse;
};

type MenuItem = {
  label: string;
  icon: string;
  href: string;
  hint?: string;
  danger?: boolean;
};

const ACCOUNT_MENU: Array<(me: BuyerMeResponse) => MenuItem> = [
  (me) => ({ label: "My Orders", icon: "📦", href: "/orders", hint: me.menuHints.activeOrdersLabel }),
  (me) => ({ label: "Wishlist", icon: "♡", href: "/wishlist", hint: me.menuHints.wishlistLabel }),
  (me) => ({ label: "Saved Addresses", icon: "⌖", href: "/addresses?from=me", hint: me.menuHints.savedAddressesLabel }),
  (me) => ({ label: "Vouchers & Coupons", icon: "🏷️", href: "#vouchers", hint: me.menuHints.activeVouchersLabel }),
  () => ({ label: "My Reviews", icon: "☆", href: "#reviews" }),
];

const SETTINGS_MENU: MenuItem[] = [
  { label: "Notifications", icon: "🔔", href: "#notifications" },
  { label: "Privacy & Security", icon: "🔐", href: "#privacy" },
  { label: "Help Center", icon: "?", href: "#help" },
  { label: "Sign Out", icon: "↪", href: "#sign-out", danger: true },
];

function StatButton({
  icon,
  value,
  label,
  href,
}: {
  icon: string;
  value: number;
  label: string;
  href?: string;
}) {
  return (
    <Link className={styles.statButton} href={href ?? `#${label.toLowerCase()}`}>
      <span className={styles.statIcon}>{icon}</span>
      <strong>{value}</strong>
      <span>{label}</span>
    </Link>
  );
}

function TransactionRow({ transaction }: { transaction: BuyerMeTransaction }) {
  const isCredit = transaction.direction === "CREDIT";

  return (
    <article className={styles.transactionRow}>
      <div className={styles.transactionIcon}>{isCredit ? "💰" : "🛒"}</div>
      <div className={styles.rowBody}>
        <h3>{transaction.title}</h3>
        <p>{transaction.displayDateLabel}</p>
      </div>
      <strong className={isCredit ? styles.creditAmount : styles.debitAmount}>
        {transaction.amountLabel}
      </strong>
    </article>
  );
}

function OrderRow({ order }: { order: BuyerMeRecentOrder }) {
  const imageUrl = resolveAssetUrl(order.thumbnailUrl);

  return (
    <Link href={`/orders/${order.id}`} className={styles.orderRow}>
      <div className={styles.orderImage}>
        {imageUrl ? <img alt={order.orderNumber} src={imageUrl} /> : <span>ZM</span>}
      </div>
      <div className={styles.rowBody}>
        <h3>{order.orderNumber}</h3>
        <p>{order.displayDateLabel}</p>
      </div>
      <div className={styles.orderMeta}>
        <strong>{formatMoney(order.totalAmount, order.currencyCode)}</strong>
        <span>{order.statusLabel}</span>
      </div>
    </Link>
  );
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <section className={styles.menuCard}>
      <h2>{title}</h2>
      {items.map((item) => (
        <a
          key={item.label}
          className={`${styles.menuItem} ${item.danger ? styles.menuItemDanger : ""}`}
          href={item.href}
        >
          <span className={styles.menuIcon}>{item.icon}</span>
          <span className={styles.menuLabel}>{item.label}</span>
          {item.hint ? <span className={styles.menuHint}>{item.hint}</span> : null}
          <span className={styles.chevron}>›</span>
        </a>
      ))}
    </section>
  );
}

export function MePageClient({ initialMe }: MePageClientProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isBalanceHidden, setIsBalanceHidden] = useState(
    initialMe.wallet?.isBalanceHidden ?? true,
  );
  const profileAvatar = resolveAssetUrl(initialMe.profile.avatarUrl);
  const accountItems = ACCOUNT_MENU.map((factory) => factory(initialMe));
  const balanceLabel =
    !initialMe.wallet || isBalanceHidden
      ? initialMe.wallet?.maskedBalanceLabel ?? "GH₵ ••••••"
      : formatMoney(initialMe.wallet.balanceAmount, initialMe.wallet.currencyCode);

  async function handleSignOut() {
    await logout();
    router.push("/login");
  }

  return (
    <main className={styles.page}>
      <div className={styles.phoneFrame}>
        <div className={styles.scrollArea}>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <h1>My Account</h1>
              <Link aria-label="Edit profile" className={styles.circleButton} href="/me/edit">
                ✎
              </Link>
            </div>

            <section className={styles.profileBlock}>
              <div className={styles.avatar}>
                {profileAvatar ? (
                  <img
                    alt={initialMe.profile.fullName}
                    className={styles.avatarImage}
                    height={64}
                    src={profileAvatar}
                    width={64}
                  />
                ) : (
                  <span>{initialMe.profile.fullName.slice(0, 1)}</span>
                )}
                {initialMe.profile.isVerified ? <span className={styles.avatarCheck}>✓</span> : null}
              </div>
              <div className={styles.profileText}>
                <h2>{initialMe.profile.fullName}</h2>
                <p>{initialMe.profile.phoneNumber}</p>
                <div className={styles.ratingRow}>
                  <span>⭐ {initialMe.profile.buyerRating} Buyer Rating</span>
                  {initialMe.profile.isVerified ? (
                    <strong>{initialMe.profile.verificationLabel}</strong>
                  ) : null}
                </div>
              </div>
            </section>

            <section className={styles.statsGrid}>
              <StatButton icon="📦" value={initialMe.stats.orders} label="Orders" />
              <StatButton
                icon="♥"
                value={initialMe.stats.wishlist}
                label="Wishlist"
                href="/wishlist"
              />
              <StatButton icon="⭐" value={initialMe.stats.reviews} label="Reviews" />
            </section>
          </header>

          <div className={styles.content}>
            {/*<section className={styles.walletCard}>
              <div className={styles.walletTop}>
                <div>
                  <p>{initialMe.wallet?.providerLabel ?? "MTN MOMO WALLET"}</p>
                  <span>{initialMe.wallet?.walletPhoneNumber ?? initialMe.profile.phoneNumber}</span>
                </div>
                <button
                  aria-label="Toggle wallet balance"
                  className={styles.walletEye}
                  type="button"
                  onClick={() => setIsBalanceHidden((current) => !current)}
                >
                  ⊙
                </button>
              </div>
              <strong className={styles.walletBalance}>{balanceLabel}</strong>
              <div className={styles.walletActions}>
                <a href="#send-money">💸 Send Money</a>
                <a href="#top-up">➕ Top Up</a>
                <a href="#wallet-history">📜 History</a>
              </div>
              <span aria-hidden="true" className={styles.walletHeart}>
                💛
              </span>
            </section>*/}

            {/*<section className={styles.card} id="transactions">
              <div className={styles.sectionHeader}>
                <h2>Recent Transactions</h2>
                <a href="#wallet-history">See all</a>
              </div>
              {initialMe.recentTransactions.length > 0 ? (
                initialMe.recentTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <p className={styles.emptyText}>No wallet activity yet.</p>
              )}
            </section>*/}

            <section className={styles.card} id="recent-orders">
              <div className={styles.sectionHeader}>
                <h2>Recent Orders</h2>
                <a href="#recent-orders">See all</a>
              </div>
              {initialMe.recentOrders.length > 0 ? (
                initialMe.recentOrders.map((order) => <OrderRow key={order.id} order={order} />)
              ) : (
                <p className={styles.emptyText}>No recent orders yet.</p>
              )}
            </section>

            <MenuSection title="My Account" items={accountItems} />
            <section className={styles.menuCard}>
              <h2>Settings</h2>
              {SETTINGS_MENU.map((item) =>
                item.label === "Sign Out" ? (
                  <button
                    key={item.label}
                    className={`${styles.menuItem} ${item.danger ? styles.menuItemDanger : ""}`}
                    type="button"
                    onClick={() => {
                      void handleSignOut();
                    }}
                  >
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span className={styles.menuLabel}>{item.label}</span>
                    <span className={styles.chevron}>›</span>
                  </button>
                ) : (
                  <a
                    key={item.label}
                    className={`${styles.menuItem} ${item.danger ? styles.menuItemDanger : ""}`}
                    href={item.href}
                  >
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span className={styles.menuLabel}>{item.label}</span>
                    {item.hint ? <span className={styles.menuHint}>{item.hint}</span> : null}
                    <span className={styles.chevron}>›</span>
                  </a>
                ),
              )}
            </section>

            <p className={styles.version}>ZokoMart v2.4.1 · Made with ❤️ in Accra, Ghana 🇬🇭</p>
          </div>
        </div>
      </div>
    </main>
  );
}
