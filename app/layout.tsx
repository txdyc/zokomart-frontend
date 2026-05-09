import type { ReactNode } from "react";

import { AuthProvider } from "../components/auth/AuthProvider";
import { CartUiProvider } from "../components/cart/CartUiProvider";
import TabBar from "../components/TabBar";
import styles from "./layout.module.css";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body className={styles.body}>
        <AuthProvider>
          <CartUiProvider>
            <main className={styles.main}>{children}</main>
            <TabBar />
          </CartUiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
