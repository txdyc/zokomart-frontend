"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import styles from "./page.module.css";

type OrderTabId = "all" | "to-pay" | "preparing" | "on-the-way" | "completed" | "after-sale";
type StatusTone = "payment" | "preparing" | "way" | "completed" | "afterSale";
type PromoTone = "gold" | "rating" | "cashback";
type ActionTone = "default" | "primary";

type OrderItem = {
  title: string;
  variant: string;
  price: string;
  quantity: number;
  image: string;
  imageAlt: string;
};

type OrderProgress = {
  currentStep: number;
  activeLabel: "Paid" | "Packed" | "Shipped" | "Delivered";
};

type OrderAction = {
  label: string;
  tone?: ActionTone;
};

type OrderPromo = {
  text: string;
  buttonLabel: string;
  tone: PromoTone;
};

type ShippingInfo = {
  title: string;
  tracking: string;
};

type Order = {
  id: string;
  sellerName: string;
  isVerified?: boolean;
  category: Exclude<OrderTabId, "all">;
  statusLabel: string;
  statusTone: StatusTone;
  countdown?: string;
  afterSaleLabel?: string;
  progress?: OrderProgress;
  shipping?: ShippingInfo;
  items: OrderItem[];
  metaLabel: string;
  orderedAt: string;
  subtotal: string;
  summaryLabel: string;
  total: string;
  promo?: OrderPromo;
  actions: OrderAction[];
};

const ORDER_TABS: Array<{ id: OrderTabId; label: string; count: number; icon: string }> = [
  { id: "all", label: "All", count: 8, icon: "▧" },
  { id: "to-pay", label: "To Pay", count: 1, icon: "◷" },
  { id: "preparing", label: "Preparing", count: 1, icon: "↻" },
  { id: "on-the-way", label: "On the Way", count: 2, icon: "▱" },
  { id: "completed", label: "Completed", count: 3, icon: "✓" },
  { id: "after-sale", label: "After-Sale", count: 1, icon: "◇" },
];

function createProductImage(label: string, palette: [string, string, string]) {
  const [start, middle, end] = palette;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${start}"/>
          <stop offset="0.55" stop-color="${middle}"/>
          <stop offset="1" stop-color="${end}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.22"/>
        </filter>
      </defs>
      <rect width="160" height="160" rx="28" fill="url(#bg)"/>
      <circle cx="126" cy="30" r="34" fill="#ffffff" opacity="0.22"/>
      <circle cx="36" cy="128" r="40" fill="#ffffff" opacity="0.16"/>
      <rect x="30" y="42" width="100" height="76" rx="18" fill="#ffffff" opacity="0.84" filter="url(#shadow)"/>
      <path d="M48 74h64M48 92h46" stroke="#111111" stroke-width="8" stroke-linecap="round" opacity="0.18"/>
      <text x="80" y="137" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="#ffffff">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PRODUCT_IMAGES = {
  infinix: createProductImage("HOT 40", ["#8de8ff", "#36bfd6", "#0a7892"]),
  ankara: createProductImage("ANKARA", ["#f6d365", "#f05f57", "#2f855a"]),
  bowTie: createProductImage("KENTE", ["#00a3a3", "#f6ad1b", "#152238"]),
  naturals: createProductImage("SHEA", ["#fbf0c9", "#d8a657", "#7a4c20"]),
  agro: createProductImage("FRESH", ["#c6f6d5", "#38a169", "#22543d"]),
  earbuds: createProductImage("AUDIO", ["#e2e8f0", "#64748b", "#111827"]),
  sneakers: createProductImage("KICKS", ["#ffffff", "#cbd5e1", "#94a3b8"]),
  kente: createProductImage("ROYAL", ["#1e3a8a", "#f6c453", "#7c2d12"]),
  charger: createProductImage("20W", ["#f8fafc", "#dbeafe", "#64748b"]),
};

const ORDERS: Order[] = [
  {
    id: "SK-7824",
    sellerName: "Tech City Ghana",
    isVerified: true,
    category: "to-pay",
    statusLabel: "Awaiting Payment",
    statusTone: "payment",
    countdown: "00:23:24",
    items: [
      {
        title: "Infinix Hot 40 Pro – 256GB",
        variant: "Volcanic Orange · 256GB",
        price: "GH₵ 1850.00",
        quantity: 1,
        image: PRODUCT_IMAGES.infinix,
        imageAlt: "Infinix Hot 40 Pro",
      },
    ],
    metaLabel: "7-day returns",
    orderedAt: "Apr 28, 2026 · 14:32",
    subtotal: "GH₵ 1850.00",
    summaryLabel: "1 item(s) · Free delivery",
    total: "GH₵ 1850.00",
    actions: [{ label: "Cancel" }, { label: "Pay Now", tone: "primary" }],
  },
  {
    id: "SK-7819",
    sellerName: "Makola Fashion Hub",
    isVerified: true,
    category: "preparing",
    statusLabel: "Preparing Order",
    statusTone: "preparing",
    progress: { currentStep: 1, activeLabel: "Packed" },
    items: [
      {
        title: "Ankara Print Wrap Dress",
        variant: "Red/Gold · Size M",
        price: "GH₵ 280.00",
        quantity: 1,
        image: PRODUCT_IMAGES.ankara,
        imageAlt: "Ankara Print Wrap Dress",
      },
      {
        title: "Kente Bow Tie Set",
        variant: "Classic Kente",
        price: "GH₵ 85.00",
        quantity: 2,
        image: PRODUCT_IMAGES.bowTie,
        imageAlt: "Kente Bow Tie Set",
      },
    ],
    metaLabel: "7-day returns",
    orderedAt: "Apr 25, 2026 · 09:15",
    subtotal: "GH₵ 465.00",
    summaryLabel: "3 item(s) · +GH₵15 delivery",
    total: "GH₵ 465.00",
    promo: {
      text: "You saved GH₵ 70 on this order!",
      buttonLabel: "Use",
      tone: "gold",
    },
    actions: [{ label: "Contact Seller" }, { label: "Cancel Order" }],
  },
  {
    id: "SK-7814",
    sellerName: "Ghana Naturals",
    isVerified: true,
    category: "on-the-way",
    statusLabel: "On the Way",
    statusTone: "way",
    progress: { currentStep: 2, activeLabel: "Shipped" },
    shipping: { title: "Est. delivery: Today, by 6 PM", tracking: "GH7821KA" },
    items: [
      {
        title: "Premium Shea Butter Set",
        variant: "500ml · Unrefined",
        price: "GH₵ 145.00",
        quantity: 1,
        image: PRODUCT_IMAGES.naturals,
        imageAlt: "Premium Shea Butter Set",
      },
      {
        title: "Vitamin C Serum 30ml",
        variant: "30ml · Brightening",
        price: "GH₵ 120.00",
        quantity: 1,
        image: PRODUCT_IMAGES.naturals,
        imageAlt: "Vitamin C Serum 30ml",
      },
    ],
    metaLabel: "7-day returns",
    orderedAt: "Apr 18, 2026 · 11:04",
    subtotal: "GH₵ 285.00",
    summaryLabel: "2 item(s) · +GH₵20 delivery",
    total: "GH₵ 285.00",
    actions: [
      { label: "Contact Seller" },
      { label: "Track Order" },
      { label: "Confirm Received", tone: "primary" },
    ],
  },
  {
    id: "SK-7799",
    sellerName: "Agro Fresh Market",
    category: "on-the-way",
    statusLabel: "On the Way",
    statusTone: "way",
    progress: { currentStep: 2, activeLabel: "Shipped" },
    shipping: { title: "Est. delivery: Tomorrow, Apr 29", tracking: "GH7799AF" },
    items: [
      {
        title: "Fresh Organic Yam & Plantain Bundle",
        variant: "Medium (5kg)",
        price: "GH₵ 85.00",
        quantity: 2,
        image: PRODUCT_IMAGES.agro,
        imageAlt: "Fresh Organic Yam and Plantain Bundle",
      },
    ],
    metaLabel: "Freshness guaranteed",
    orderedAt: "Apr 16, 2026 · 16:50",
    subtotal: "GH₵ 180.00",
    summaryLabel: "2 item(s) · +GH₵10 delivery",
    total: "GH₵ 180.00",
    actions: [
      { label: "Contact Seller" },
      { label: "Track Order" },
      { label: "Confirm Received", tone: "primary" },
    ],
  },
  {
    id: "SK-7787",
    sellerName: "Tech City Ghana",
    isVerified: true,
    category: "completed",
    statusLabel: "Completed",
    statusTone: "completed",
    progress: { currentStep: 3, activeLabel: "Delivered" },
    items: [
      {
        title: "Wireless Bluetooth Earbuds",
        variant: "Matte Black · ANC",
        price: "GH₵ 199.00",
        quantity: 1,
        image: PRODUCT_IMAGES.earbuds,
        imageAlt: "Wireless Bluetooth Earbuds",
      },
    ],
    metaLabel: "7-day returns",
    orderedAt: "Apr 12, 2026 · 08:30",
    subtotal: "GH₵ 199.00",
    summaryLabel: "1 item(s) · Free delivery",
    total: "GH₵ 199.00",
    promo: {
      text: "Earn GH₵ 3.00 cashback — Tap to claim",
      buttonLabel: "Claim",
      tone: "cashback",
    },
    actions: [
      { label: "More" },
      { label: "Refund / Return" },
      { label: "Buy Again", tone: "primary" },
    ],
  },
  {
    id: "SK-7771",
    sellerName: "Osu Kicks",
    isVerified: true,
    category: "completed",
    statusLabel: "Completed",
    statusTone: "completed",
    progress: { currentStep: 3, activeLabel: "Delivered" },
    items: [
      {
        title: "Classic White Sneakers",
        variant: "White · Size 43",
        price: "GH₵ 320.00",
        quantity: 1,
        image: PRODUCT_IMAGES.sneakers,
        imageAlt: "Classic White Sneakers",
      },
    ],
    metaLabel: "7-day returns",
    orderedAt: "Apr 10, 2026 · 13:20",
    subtotal: "GH₵ 335.00",
    summaryLabel: "1 item(s) · +GH₵15 delivery",
    total: "GH₵ 335.00",
    actions: [
      { label: "More" },
      { label: "Refund / Return" },
      { label: "Buy Again", tone: "primary" },
    ],
  },
  {
    id: "SK-7760",
    sellerName: "Kente Kingdom",
    isVerified: true,
    category: "completed",
    statusLabel: "Completed",
    statusTone: "completed",
    progress: { currentStep: 3, activeLabel: "Delivered" },
    items: [
      {
        title: "Kente Cloth 6 Yards Royal",
        variant: "Royal Blue & Gold",
        price: "GH₵ 450.00",
        quantity: 1,
        image: PRODUCT_IMAGES.kente,
        imageAlt: "Kente Cloth 6 Yards Royal",
      },
      {
        title: "Men's Kente Dashiki Top",
        variant: "Size L",
        price: "GH₵ 180.00",
        quantity: 1,
        image: PRODUCT_IMAGES.kente,
        imageAlt: "Men's Kente Dashiki Top",
      },
    ],
    metaLabel: "7-day returns",
    orderedAt: "Apr 5, 2026 · 10:00",
    subtotal: "GH₵ 630.00",
    summaryLabel: "2 item(s) · Free delivery",
    total: "GH₵ 630.00",
    promo: {
      text: "Rate this order — share your experience",
      buttonLabel: "Rate",
      tone: "rating",
    },
    actions: [
      { label: "More" },
      { label: "Refund / Return" },
      { label: "Buy Again", tone: "primary" },
    ],
  },
  {
    id: "SK-7728",
    sellerName: "Mobile World GH",
    isVerified: true,
    category: "after-sale",
    statusLabel: "After-Sale",
    statusTone: "afterSale",
    afterSaleLabel: "Refund Processing",
    items: [
      {
        title: "20W GaN Fast Charger",
        variant: "White · EU Plug",
        price: "GH₵ 59.00",
        quantity: 1,
        image: PRODUCT_IMAGES.charger,
        imageAlt: "20W GaN Fast Charger",
      },
    ],
    metaLabel: "7-day returns",
    orderedAt: "Mar 22, 2026 · 09:44",
    subtotal: "GH₵ 69.00",
    summaryLabel: "1 item(s) · +GH₵10 delivery",
    total: "GH₵ 69.00",
    actions: [{ label: "View Progress" }, { label: "Contact Support" }],
  },
];

const PROGRESS_STEPS = ["Paid", "Packed", "Shipped", "Delivered"] as const;

function matchesSearch(order: Order, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    order.id,
    order.sellerName,
    order.statusLabel,
    order.afterSaleLabel,
    order.metaLabel,
    order.orderedAt,
    order.total,
    order.shipping?.tracking,
    ...order.items.flatMap((item) => [item.title, item.variant, item.price]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

function StoreIcon() {
  return (
    <span aria-hidden="true" className={styles.storeIcon}>
      ▣
    </span>
  );
}

function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span className={`${styles.statusPill} ${styles[`statusPill_${tone}`]}`}>
      <span aria-hidden="true">{tone === "payment" ? "◷" : tone === "preparing" ? "↻" : tone === "way" ? "▱" : "✓"}</span>
      {label}
    </span>
  );
}

function ProgressTracker({ progress }: { progress: OrderProgress }) {
  return (
    <div
      className={`${styles.progress} ${styles[`progress_${progress.currentStep}`]}`}
      aria-label={`Order progress: ${progress.activeLabel}`}
    >
      {PROGRESS_STEPS.map((step, index) => {
        const isDone = index <= progress.currentStep;
        const isCurrent = index === progress.currentStep;

        return (
          <div className={styles.progressStep} key={step}>
            <span
              className={`${styles.progressDot} ${isDone ? styles.progressDotDone : ""}`}
              aria-hidden="true"
            >
              {isDone ? "✓" : ""}
            </span>
            <span className={`${styles.progressLabel} ${isCurrent ? styles.progressLabelActive : ""}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ProductRow({ item }: { item: OrderItem }) {
  return (
    <div className={styles.productRow}>
      <div className={styles.productImage}>
        <Image
          alt={item.imageAlt}
          fill
          sizes="80px"
          src={item.image}
          unoptimized
        />
      </div>
      <div className={styles.productInfo}>
        <h3>{item.title}</h3>
        <span className={styles.variant}>{item.variant}</span>
        <div className={styles.priceRow}>
          <strong>{item.price}</strong>
          <span>×{item.quantity}</span>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <article className={styles.orderCard}>
      <header className={styles.cardHeader}>
        <div className={styles.seller}>
          <StoreIcon />
          <strong>{order.sellerName}</strong>
          {order.isVerified ? <span className={styles.verified}>✓ Verified</span> : null}
        </div>
        <StatusPill label={order.statusLabel} tone={order.statusTone} />
      </header>

      {order.countdown ? (
        <div className={styles.countdown}>
          <span aria-hidden="true">◷</span>
          <span>
            Pay within <strong>{order.countdown}</strong> or order will be cancelled
          </span>
        </div>
      ) : null}

      {order.progress ? <ProgressTracker progress={order.progress} /> : null}

      {order.shipping ? (
        <div className={styles.shippingRow}>
          <span aria-hidden="true" className={styles.shippingIcon}>
            ▱
          </span>
          <div>
            <strong>{order.shipping.title}</strong>
            <span>
              Tracking: <b>{order.shipping.tracking}</b>
            </span>
          </div>
          <button type="button">Copy</button>
        </div>
      ) : null}

      {order.afterSaleLabel ? (
        <div className={styles.afterSaleNotice}>
          <span aria-hidden="true">◇</span>
          {order.afterSaleLabel}
        </div>
      ) : null}

      <div className={styles.products}>
        {order.items.map((item) => (
          <ProductRow key={`${order.id}-${item.title}`} item={item} />
        ))}
      </div>

      <div className={styles.metaRow}>
        <span className={styles.metaCheck}>✓</span>
        <span>{order.metaLabel}</span>
        <span className={styles.dot}>·</span>
        <span>{order.orderedAt}</span>
        <span className={styles.dot}>·</span>
        <span>{order.subtotal}</span>
      </div>

      <div className={styles.summaryRow}>
        <span>{order.summaryLabel}</span>
        <strong>
          Total: <b>{order.total}</b>
        </strong>
      </div>

      {order.promo ? (
        <div className={`${styles.promo} ${styles[`promo_${order.promo.tone}`]}`}>
          <span>{order.promo.text}</span>
          <button type="button">{order.promo.buttonLabel} ›</button>
        </div>
      ) : null}

      <footer className={styles.actions}>
        {order.actions.map((action) => (
          <button
            className={action.tone === "primary" ? styles.primaryAction : styles.secondaryAction}
            key={`${order.id}-${action.label}`}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </footer>
    </article>
  );
}

export function OrdersPageClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderTabId>("all");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);

  function submitSearch() {
    const nextQuery = searchInput.trim();

    setSearchQuery(nextQuery);
    setIsSearchVisible(false);
  }

  function handleSearchButtonClick() {
    if (!isSearchVisible) {
      setIsSearchVisible(true);
      return;
    }

    submitSearch();
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSearch();
  }

  const visibleOrders = useMemo(() => {
    const tabOrders =
      activeTab === "all" ? ORDERS : ORDERS.filter((order) => order.category === activeTab);

    return tabOrders.filter((order) => matchesSearch(order, searchQuery));
  }, [activeTab, searchQuery]);

  return (
    <main className={styles.page}>
      <section
        className={`${styles.appShell} ${isSearchVisible ? styles.appShellSearchOpen : ""}`}
        aria-label="My Orders"
      >
        <header className={styles.header}>
          <div className={styles.topBar}>
            <button className={styles.backButton} type="button" onClick={() => router.back()}>
              <span aria-hidden="true">‹</span>
              Back
            </button>
            <h1>My Orders</h1>
            <button
              aria-expanded={isSearchVisible}
              aria-label="Search orders"
              className={styles.searchButton}
              type="button"
              onClick={handleSearchButtonClick}
            >
              ⌕
            </button>
          </div>

          {isSearchVisible ? (
            <form className={styles.searchPanel} role="search" onSubmit={handleSearchSubmit}>
              <label className={styles.searchLabel} htmlFor="orders-search">
                Search orders
              </label>
              <input
                id="orders-search"
                ref={searchInputRef}
                type="search"
                value={searchInput}
                placeholder="Search seller, item, tracking..."
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </form>
          ) : null}

          <nav className={styles.tabs} aria-label="Order status filters">
            {ORDER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                  <b>{tab.count}</b>
                </button>
              );
            })}
          </nav>
        </header>

        <div className={styles.orderList}>
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}

          <div className={styles.endState}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <p>
              Showing {visibleOrders.length} of {activeTab === "all" ? 8 : visibleOrders.length} orders
              {searchQuery ? ` for "${searchQuery}"` : ""}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
