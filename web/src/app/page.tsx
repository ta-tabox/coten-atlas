/**
 * アプリのトップに立つページ。
 * 全画面のベースマップと、その上に載るシリーズの代表点を置く。
 *
 * `catalog/` を読むのはここだけである。
 * Server Component が `node:fs` で読み、地図へ渡す形をビルド時に組む（docs/ARCHITECTURE.md §3「配り方」）。
 * `"use client"` を付けると `node:fs` へ届かなくなる。
 * エピソードだけはこの経路に乗らず、地図が載った後に `MapCanvas` が fetch する（同§）。
 */

import MapCanvas from "@/components/MapCanvas";
import { loadLoci, loadSeries } from "@/lib/catalog-dir";
import { toMapLoci } from "@/lib/map/loci";

export default function Page() {
  const series = loadSeries();

  return <MapCanvas loci={toMapLoci(loadLoci(), series)} series={series} />;
}
