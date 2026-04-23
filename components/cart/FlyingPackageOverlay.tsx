"use client";

import type { CSSProperties } from "react";

import styles from "./cart-ui.module.css";

export type CartFlightAnimation = {
  id: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  midX: number;
  arcY: number;
};

type FlyingPackageOverlayProps = {
  items: CartFlightAnimation[];
};

export function FlyingPackageOverlay({ items }: FlyingPackageOverlayProps) {
  return (
    <div className={styles.overlay} aria-hidden="true">
      {items.map((item) => {
        const style = {
          "--start-x": item.startX,
          "--start-y": item.startY,
          "--delta-x": item.deltaX,
          "--delta-y": item.deltaY,
          "--mid-x": item.midX,
          "--arc-y": item.arcY,
        } as CSSProperties;

        return (
          <div key={item.id} className={styles.flight} style={style}>
            <div className={styles.package}>
              <span className={styles.packageLid} />
              <span className={styles.packageRibbonV} />
              <span className={styles.packageRibbonH} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
