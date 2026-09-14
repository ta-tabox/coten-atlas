/**
 * 地図を表示するトップページ。
 * 全画面のベースマップと、その上に置くシリーズの代表点を配置する。
 *
 * Server Component が `node:fs` で `catalog/` を読み、地図に渡す形をビルド時に組み立てる（docs/ARCHITECTURE.md §3「配り方」）。
 * `catalog/` を読んでよいモジュールの正は `.claude/rules/layers.md`。
 * エピソードだけはビルド時に読まず、`MapCanvas` が実行時に fetch する。
 *
 * `presentEnd` もビルドした時点の年で確定させ、ブラウザの時計を読まない。
 * ブラウザの時計を読まない理由は docs/adr/0040-era-fade-wiring.md が持つ。
 */

import MapCanvas from "@/components/MapCanvas";
import { loadEras, loadLoci, loadSeries } from "@/lib/catalog-dir";
import { presentEndOf } from "@/lib/era/scale";
import { toMapLoci } from "@/lib/map/loci";

/** `catalog/` から読んだシリーズ・事物・時代区分とビルドした時点の年を `MapCanvas` へ渡し、地図のトップページを描く。 */
export default function Page() {
  const series = loadSeries();

  return (
    <MapCanvas
      loci={toMapLoci(loadLoci(), series)}
      series={series}
      eras={loadEras()}
      presentEnd={presentEndOf(new Date())}
    />
  );
}
