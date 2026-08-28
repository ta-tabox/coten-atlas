/**
 * 全ページを包む外枠。
 * `<html>` の言語属性と、サイト全体で一つしか無いメタデータだけを持つ。
 * 画面ごとの構造は各ページの側に置く。
 */

// MapLibre の attribution とコントロールは、この CSS が位置と背景を与える。
// 読み込まないと地図の上に素の文字が乗る。
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
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
