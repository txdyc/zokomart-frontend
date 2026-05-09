"use client";

import { type ReactNode, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../auth/useAuth";
import { buyerApi } from "../../lib/api";
import { useCartUi } from "../cart/useCartUi";
import styles from "./style.module.css";

type TabId = "home" | "category" | "cart" | "me";

type TabItem = {
  id: TabId;
  label: string;
  href: string;
  Icon: () => ReactNode;
  badgeCount?: number;
};

const HomeIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 22 22" className={styles.svgIcon}>
    <path
      d="M3.67 9.36 11 3.21l7.33 6.15"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.65"
    />
    <path
      d="M5.5 8.25v9.17h11V8.25"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.65"
    />
    <path
      d="M9.17 17.42V12.83h3.66v4.59"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.65"
    />
  </svg>
);

const CategoriesIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 22 22" className={styles.svgIcon}>
    <rect
      x="4.13"
      y="4.13"
      width="13.75"
      height="13.75"
      rx="1.38"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
    />
    <path
      d="M11 4.13v13.75M4.13 11h13.75"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.65"
    />
  </svg>
);

const CartIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 22 22" className={styles.svgIcon}>
    <path
      d="M3.21 4.58h1.92l1.38 8.2a2.06 2.06 0 0 0 2.03 1.72h6.54a2.06 2.06 0 0 0 1.99-1.53l1.01-3.8H6.05"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.65"
    />
    <circle cx="8.71" cy="17.42" r="1.15" fill="currentColor" />
    <circle cx="15.13" cy="17.42" r="1.15" fill="currentColor" />
  </svg>
);

const MeIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 22 22" className={styles.svgIcon}>
    <circle
      cx="11"
      cy="7.33"
      r="3.21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
    />
    <path
      d="M5.5 17.88c.86-2.57 2.67-4.04 5.5-4.04s4.64 1.47 5.5 4.04"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.65"
    />
  </svg>
);

const TAB_ITEMS: TabItem[] = [
  { id: "home", label: "Home", href: "/", Icon: HomeIcon },
  { id: "category", label: "Categories", href: "/categories", Icon: CategoriesIcon },
  { id: "cart", label: "Cart", href: "/cart", Icon: CartIcon },
  { id: "me", label: "Me", href: "/me", Icon: MeIcon },
];

function getTotalQuantity(items: Array<{ quantity: number }>) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function shouldHideTabBar(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/checkout" ||
    pathname.startsWith("/merchant") ||
    pathname.startsWith("/me/") ||
    pathname === "/addresses" ||
    pathname.startsWith("/addresses/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/wishlist" ||
    pathname.startsWith("/products/") ||
    pathname.startsWith("/messages/")
  );
}

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isRestoring } = useAuth();
  const {
    cartCount,
    isCartBadgeBouncing,
    registerCartAnchor,
    setCartCountFromServer,
  } = useCartUi();

  const isHidden = shouldHideTabBar(pathname);

  useEffect(() => {
    if (isHidden || !isAuthenticated) {
      if (!isAuthenticated) {
        setCartCountFromServer(0);
      }
      return undefined;
    }

    let cancelled = false;

    void buyerApi
      .getCart()
      .then((cart) => {
        if (!cancelled) {
          setCartCountFromServer(getTotalQuantity(cart.items));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isHidden, pathname, setCartCountFromServer]);

  const items = useMemo(() => {
    return TAB_ITEMS.map((item) =>
      item.id === "cart" ? { ...item, badgeCount: cartCount } : item,
    );
  }, [cartCount]);

  if (isHidden) {
    return null;
  }

  function isActive(tabId: TabId) {
    if (tabId === "home") {
      return pathname === "/";
    }

    if (tabId === "category") {
      return (
        pathname === "/categories" ||
        pathname.startsWith("/categories/") ||
        pathname.startsWith("/category/")
      );
    }

    if (tabId === "cart") {
      return pathname === "/cart";
    }

    return pathname === "/me";
  }

  function handleNavigate(item: TabItem) {
    if (item.id === "me") {
      if (!isAuthenticated && !isRestoring) {
        router.push("/login?redirect=%2Fme");
        return;
      }
    }

    router.push(item.href);
  }

  return (
    <div className={styles.shell}>
      <nav aria-label="Global Bottom Navigation" className={styles.nav}>
        {items.map((item) => {
          const active = isActive(item.id);

          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.item} ${active ? styles.itemActive : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => handleNavigate(item)}
            >
              <span
                ref={item.id === "cart" ? registerCartAnchor : undefined}
                className={styles.iconWrap}
              >
                <item.Icon />
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span
                    className={`${styles.badge} ${
                      item.id === "cart" && isCartBadgeBouncing ? styles.badgeBounce : ""
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                ) : null}
              </span>
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
