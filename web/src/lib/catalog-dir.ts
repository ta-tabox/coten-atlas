/**
 * `catalog/` のファイルを読み、スキーマの検査に通した値だけを返す。
 * 管理画面の保存も、スキーマとファイルをまたぐ参照の検査に通した値だけを書く。
 * エピソードは読まない（`public/` へ複製して実行時に fetch する。docs/ARCHITECTURE.md §3「配り方」）。
 *
 * このモジュールを呼んでよい相手の正は `.claude/rules/layers.md`。
 *
 * `fs` が返すのは `unknown` なので、検査を外すと `as` で型を騙ることになる。
 *
 * 在り処を `new URL("...", import.meta.url)` で引かない。
 * Turbopack がその形をアセット参照と読んでビルド時に解決しにいき、`catalog/` は `web/` の外なので Module not found で落ちる。
 * 隣の `tests/catalog.test.ts` が同じ形を使えているのは、vitest がその変換を掛けないからである。
 */

import fs from "node:fs";
import path from "node:path";
import { toLociGeoJsonText } from "@/lib/catalog-edit/catalog-text";
import { type EraList, parseEras } from "@/lib/schema/era";
import { type LocusCollection, parseLoci } from "@/lib/schema/locus";
import {
  brokenAnchors,
  brokenLocusSeriesReferences,
  lociOutsideSeriesTimeRange,
} from "@/lib/schema/references";
import { parseSeries, type SeriesList } from "@/lib/schema/series";

/**
 * 目録（`catalog/`）の置き場。
 * リポジトリのルート直下で、`web/` の外にある。
 * 起点は cwd なので、`next build` も `vitest` も `web/` で回す（`package.json` の scripts が正）。
 *
 * 読み書きの関数が引数で別の置き場を受けるのは、保存のテストが現物を書き換えずに済むようにするためである。
 */
const CATALOG_DIR = path.join(process.cwd(), "..", "catalog");

/** 目録の置き場（`dir`）の直下の 1 本を読んで JSON へ直す。 */
function readCatalogFile(fileName: string, dir: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(dir, fileName), "utf8"));
}

/**
 * 目録の置き場（`dir`）の直下の 1 本を `text` で置き換える。
 *
 * 書き込みの途中で落ちても壊れたファイルが残らないよう、一時ファイルへ書いてから rename する。
 * rename が atomic なのは同じファイルシステムの上だけなので、一時ファイルは書き込み先と同じディレクトリへ置く。
 */
function writeCatalogFile(fileName: string, text: string, dir: string): void {
  const file = path.join(dir, fileName);
  const temporary = `${file}.tmp`;

  fs.writeFileSync(temporary, text);
  fs.renameSync(temporary, file);
}

/** シリーズ全件を検査して返す。 */
export function loadSeries(dir = CATALOG_DIR): SeriesList {
  return parseSeries(readCatalogFile("series.json", dir));
}

/** 事物の全件を検査して返す。 */
export function loadLoci(dir = CATALOG_DIR): LocusCollection {
  return parseLoci(readCatalogFile("loci.geojson", dir));
}

/** 時代区分の全件を検査して返す。 */
export function loadEras(): EraList {
  return parseEras(readCatalogFile("eras.json", CATALOG_DIR));
}

/**
 * 事物の全件（`loci`）をスキーマとシリーズとの参照の検査に通し、通れば `loci.geojson` を置き換える。
 * 書いたときは空配列を、検査に通らず書かなかったときは理由の文の配列を返す。
 *
 * `loci` は要求から組み立てた値で、範囲外の座標や壊れた参照を含みうるので、型が付いていても検査をやり直す。
 */
export function saveLoci(loci: LocusCollection, dir = CATALOG_DIR): string[] {
  let parsed: LocusCollection;

  try {
    parsed = parseLoci(loci);
  } catch (error) {
    // parseLoci が throw するのは検査の理由を持つ Error だけで、それ以外は想定外なので投げ直す。
    if (!(error instanceof Error)) {
      throw error;
    }

    return [error.message];
  }

  const series = loadSeries(dir);
  const problems = [
    ...brokenAnchors(series, parsed),
    ...brokenLocusSeriesReferences(parsed, series),
    ...lociOutsideSeriesTimeRange(parsed, series),
  ];

  if (problems.length > 0) {
    return problems;
  }

  writeCatalogFile("loci.geojson", toLociGeoJsonText(parsed), dir);

  return [];
}
