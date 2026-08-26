import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "coten-atlas",
  description: "コテンラジオのシリーズを世界地図と時系列にマッピングする",
};

/**
 * 全ページ共通の外枠。
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
