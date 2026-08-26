/**
 * 全ページを包む外枠。
 * `<html>` の言語属性と、サイト全体で一つしか無いメタデータだけを持つ。
 * 画面ごとの構造は各ページの側に置く。
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "coten-atlas",
  description: "コテンラジオのシリーズを世界地図と時系列にマッピングする",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
