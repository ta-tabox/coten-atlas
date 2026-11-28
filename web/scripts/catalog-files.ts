/**
 * 同期の入口（`sync-feed.ts`・`backfill-apple-podcasts.ts`）が読み書きする `catalog/` のファイルのパスを置く。
 * ファイルの中身の読み書きは持たず、`scripts/json-file.ts` が持つ。
 *
 * パスは `pnpm` の作業ディレクトリ（`web/`）から辿る。
 * スクリプトは `dist/` へ出力してから走るので、`import.meta.url` から辿ると出力先の深さの分だけずれた場所を指す。
 * 実行の入口が `pnpm` の scripts なので、`pnpm` が保証する作業ディレクトリの方が動かない。
 */

import fs from "node:fs";
import path from "node:path";

const CATALOG_DIR = path.resolve(process.cwd(), "../catalog");

export const EPISODES_FILE = path.join(CATALOG_DIR, "episodes.json");

export const SERIES_FILE = path.join(CATALOG_DIR, "series.json");

export const SEASON_CORRECTIONS_FILE = path.join(
  CATALOG_DIR,
  "season-corrections.json",
);

/**
 * `catalog/` を指せていることを確かめる。
 *
 * 作業ディレクトリが違うと、書き出しは黙って別の場所へ `catalog/` を作り、全回をそこへ置く。
 * `eras.json` は追跡されていて必ず在るので、これが無い場所は `catalog/` ではなく、`web/` から走らせるよう添えて throw する。
 */
export function assertCatalogDir(): void {
  if (fs.existsSync(path.join(CATALOG_DIR, "eras.json"))) {
    return;
  }

  throw new Error(
    `catalog/ が見つからない: ${CATALOG_DIR}（pnpm の scripts は web/ から走らせる）`,
  );
}
