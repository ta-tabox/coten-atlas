/**
 * `data/` のファイルを読み、スキーマの検査に通した値だけを返す。
 * エピソードは読まない（`public/` へ複製して実行時に fetch する。ARCHITECTURE.md §3「配り方」）。
 *
 * 呼べるのは Server Component だけである。
 * `"use client"` を付けた層からは `node:fs` へ届かない。
 *
 * `fs` が返すのは `unknown` なので、検査を外すと `as` で型を騙ることになる。
 *
 * 在り処を `new URL("...", import.meta.url)` で引かない。
 * Turbopack がその形をアセット参照と読んでビルド時に解決しにいき、`data/` は `web/` の外なので Module not found で落ちる。
 * 隣の `tests/data.test.ts` が同じ形を使えているのは、vitest がその変換を掛けないからである。
 */

import fs from "node:fs";
import path from "node:path";
import { type LocusCollection, parseLoci } from "@/lib/schema/locus";
import { parseSeries, type SeriesList } from "@/lib/schema/series";

/**
 * データ層の置き場。
 * リポジトリのルート直下で、`web/` の外にある。
 * 起点は cwd なので、`next build` も `vitest` も `web/` で回す（`package.json` の scripts が正）。
 */
const DATA_DIR = path.join(process.cwd(), "..", "data");

/** `data/` 直下の 1 本を読んで JSON へ直す。 */
function readData(fileName: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8"));
}

/** シリーズ全件を検査して返す。 */
export function loadSeries(): SeriesList {
  return parseSeries(readData("series.json"));
}

/** 事物の全件を検査して返す。 */
export function loadLoci(): LocusCollection {
  return parseLoci(readData("loci.geojson"));
}
