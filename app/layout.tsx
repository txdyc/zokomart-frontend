import type { ReactNode } from "react";

import { CartUiProvider } from "../components/cart/CartUiProvider";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          background: "#1f2937",
          color: "#111111",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <CartUiProvider>{children}</CartUiProvider>
      </body>
    </html>
  );
}
