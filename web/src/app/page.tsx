/**
 * 地図を表示するトップページ。
 * 全画面のベースマップと、その上に置くシリーズの代表点を配置する。
 *
 * `catalog/` を読むのは Page だけである。
 * Server Component が `node:fs` で読み、地図に渡す形をビルド時に組み立てる（docs/ARCHITECTURE.md §3「配り方」）。
 * `"use client"` を付けると `node:fs` に到達しない。
 * エピソードだけはビルド時に読まず、`MapCanvas` が実行時に fetch する。
 */

import MapCanvas from "@/components/MapCanvas";
import { loadLoci, loadSeries } from "@/lib/catalog-dir";
import { toMapLoci } from "@/lib/map/loci";

export default function Page() {
  const series = loadSeries();

  return <MapCanvas loci={toMapLoci(loadLoci(), series)} series={series} />;
}
