/**
 * 代表点の座標を地図のドラッグで直す管理画面のページを置く。
 * `next dev` でだけ立ち、`next build` の成果物には入らない（拡張子の扱いは `next.config.ts` が正）。
 *
 * 開くたびに `catalog/` を読み直すので、保存の後に再読み込みすれば保存したファイルの値が出る。
 */

import AnchorEditor from "@/components/admin/AnchorEditor";
import { loadLoci, loadSeries } from "@/lib/catalog-dir";

/** `catalog/` から読んだシリーズと事物の全件を `AnchorEditor` へ渡し、管理画面を描く。 */
export default function AdminPage() {
  return <AnchorEditor series={loadSeries()} initialLoci={loadLoci()} />;
}
