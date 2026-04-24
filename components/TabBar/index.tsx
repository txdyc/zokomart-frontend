"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { buyerApi } from "../../lib/api";
import { useCartUi } from "../cart/useCartUi";
import styles from "./style.module.css";

type TabId = "home" | "category" | "messages" | "cart" | "me";

type TabItem = {
  id: TabId;
  label: string;
  href: string;
  icon: string;
  badgeCount?: number;
};

const TAB_ITEMS: TabItem[] = [
  { id: "home", label: "Home", href: "/", icon: "⌂" },
  { id: "category", label: "Category", href: "/#top-categories", icon: "⊞" },
  { id: "messages", label: "Messages", href: "/#messages", icon: "✉", badgeCount: 3 },
  { id: "cart", label: "Cart", href: "/cart", icon: "🛒" },
  { id: "me", label: "Me", href: "/me", icon: "◌" },
];

function getTotalQuantity(items: Array<{ quantity: number }>) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function shouldHideTabBar(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/checkout" ||
    pathname.startsWith("/merchant") ||
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/products/")
  );
}

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const {
    cartCount,
    isCartBadgeBouncing,
    registerCartAnchor,
    setCartCountFromServer,
  } = useCartUi();

  const isHidden = shouldHideTabBar(pathname);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncHash = () => {
      setHash(window.location.hash);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
    };
  }, [pathname]);

  useEffect(() => {
    if (isHidden) {
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
  }, [isHidden, pathname, setCartCountFromServer]);

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
      return pathname === "/" && hash !== "#top-categories" && hash !== "#messages";
    }

    if (tabId === "category") {
      return pathname === "/" && hash === "#top-categories";
    }

    if (tabId === "messages") {
      return pathname === "/" && hash === "#messages";
    }

    if (tabId === "cart") {
      return pathname === "/cart";
    }

    return pathname === "/me";
  }

  function handleNavigate(item: TabItem) {
    if (item.id === "me") {
      const token =
        typeof window === "undefined" ? null : window.localStorage.getItem("token");

      if (!token) {
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
                <span className={styles.icon}>{item.icon}</span>
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
