"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { FlyingPackageOverlay, type CartFlightAnimation } from "./FlyingPackageOverlay";
import styles from "./cart-ui.module.css";

type AddCartAnimationRequest = {
  startX: number;
  startY: number;
};

type ToastTone = "success" | "error";

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
} | null;

export type CartUiContextValue = {
  cartCount: number;
  isCartBadgeBouncing: boolean;
  registerCartAnchor: (element: HTMLElement | null) => void;
  setCartCountFromServer: (count: number) => void;
  applyOptimisticIncrement: (quantity: number) => () => void;
  animateAddToCart: (request: AddCartAnimationRequest) => void;
  showToast: (message: string, tone?: ToastTone) => void;
};

export const CartUiContext = createContext<CartUiContextValue | null>(null);

function getFallbackTarget() {
  if (typeof window === "undefined") {
    return { x: 300, y: 720 };
  }

  return {
    x: window.innerWidth * 0.78,
    y: window.innerHeight - 44,
  };
}

export function CartUiProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [isCartBadgeBouncing, setIsCartBadgeBouncing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [animations, setAnimations] = useState<CartFlightAnimation[]>([]);

  const cartAnchorRef = useRef<HTMLElement | null>(null);
  const animationIdRef = useRef(0);
  const toastIdRef = useRef(0);
  const badgeBounceTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const triggerBadgeBounce = useCallback(() => {
    if (badgeBounceTimeoutRef.current) {
      window.clearTimeout(badgeBounceTimeoutRef.current);
    }

    setIsCartBadgeBouncing(true);
    badgeBounceTimeoutRef.current = window.setTimeout(() => {
      setIsCartBadgeBouncing(false);
      badgeBounceTimeoutRef.current = null;
    }, 260);
  }, []);

  const registerCartAnchor = useCallback((element: HTMLElement | null) => {
    cartAnchorRef.current = element;
  }, []);

  const setCartCountFromServer = useCallback((count: number) => {
    setCartCount(Math.max(0, count));
  }, []);

  const applyOptimisticIncrement = useCallback(
    (quantity: number) => {
      const normalizedQuantity = Math.max(0, quantity);
      setCartCount((previous) => previous + normalizedQuantity);
      if (normalizedQuantity > 0) {
        triggerBadgeBounce();
      }

      return () => {
        setCartCount((previous) => Math.max(0, previous - normalizedQuantity));
      };
    },
    [triggerBadgeBounce],
  );

  const animateAddToCart = useCallback((request: AddCartAnimationRequest) => {
    const anchorRect = cartAnchorRef.current?.getBoundingClientRect();
    const fallback = getFallbackTarget();
    const endX = anchorRect ? anchorRect.left + anchorRect.width / 2 : fallback.x;
    const endY = anchorRect ? anchorRect.top + anchorRect.height / 2 : fallback.y;
    const deltaX = endX - request.startX;
    const deltaY = endY - request.startY;
    const animationId = animationIdRef.current++;

    setAnimations((previous) => [
      ...previous,
      {
        id: animationId,
        startX: request.startX,
        startY: request.startY,
        deltaX,
        deltaY,
        midX: deltaX * 0.46,
        arcY: -Math.max(120, Math.abs(deltaY) * 0.55),
      },
    ]);

    window.setTimeout(() => {
      setAnimations((previous) => previous.filter((item) => item.id !== animationId));
    }, 760);
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    const nextId = ++toastIdRef.current;
    setToast({ id: nextId, message, tone });
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast((current) => (current?.id === toast.id ? null : current));
      toastTimeoutRef.current = null;
    }, 2200);

    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, [toast]);

  useEffect(() => {
    return () => {
      if (badgeBounceTimeoutRef.current) {
        window.clearTimeout(badgeBounceTimeoutRef.current);
      }

      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const value = useMemo<CartUiContextValue>(
    () => ({
      cartCount,
      isCartBadgeBouncing,
      registerCartAnchor,
      setCartCountFromServer,
      applyOptimisticIncrement,
      animateAddToCart,
      showToast,
    }),
    [
      applyOptimisticIncrement,
      animateAddToCart,
      cartCount,
      isCartBadgeBouncing,
      registerCartAnchor,
      setCartCountFromServer,
      showToast,
    ],
  );

  return (
    <CartUiContext.Provider value={value}>
      {children}
      <FlyingPackageOverlay items={animations} />
      {toast ? (
        <div
          className={`${styles.toast} ${
            toast.tone === "success" ? styles.toastSuccess : styles.toastError
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}
    </CartUiContext.Provider>
  );
}
