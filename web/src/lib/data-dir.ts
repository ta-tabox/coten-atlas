/**
 * `data/` のファイルを読んで、検査に通した値で返す。
 *
 * `data/` はルート側にあって `tsconfig.json` の `include` の外にあり、`resolveJsonModule` が効くのは `.json` だけなので、素の `import` では読めない。
 * `fs` なら解決の設定が要らず、`tests/data.test.ts` と同じ読み口になる（ARCHITECTURE.md §3「配り方」）。
 * `fs` で読んだ値は型を持たないので、検査を外すと `as` で型を名乗ることになる。
 *
 * 呼べるのは Server Component だけである。
 * `"use client"` を付けた層からは `node:fs` へ届かない。
 *
 * 在り処は `web/` からの相対で引く。
 * `tests/data.test.ts` と同じ `new URL("...", import.meta.url)` はここでは使えない。
 * Turbopack がその形をアセット参照と読んでビルド時に解決しにいき、`data/` は `web/` の外なので Module not found で落ちる。
 *
 * エピソードはここが読まない。
 * 詳細カードを開くまで要らないので、`public/` へ複製して実行時に fetch する（同§）。
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
