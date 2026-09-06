/**
 * アプリのトップに立つページ。
 * 全画面のベースマップと、その上に載るシリーズの代表点を置く。
 *
 * `catalog/` を読むのはここだけである。
 * Server Component が `node:fs` で読み、地図へ渡す形をビルド時に組む（ARCHITECTURE.md §3「配り方」）。
 * `"use client"` を付けると `node:fs` へ届かなくなる。
 */

import MapCanvas from "@/components/MapCanvas";
import { loadLoci, loadSeries } from "@/lib/catalog-dir";
import { toMapLoci } from "@/lib/map-loci";

export default function Page() {
  return <MapCanvas loci={toMapLoci(loadLoci(), loadSeries())} />;
}
