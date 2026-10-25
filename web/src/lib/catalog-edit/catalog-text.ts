/**
 * シリーズと事物の全件から、`catalog/` のファイルへ書く文字列を作る純関数を置く。
 * ファイルへの書き込みは持たず、`@/lib/catalog-dir` が持つ。
 *
 * `catalog/` は人が手で書く書式で、一件ごとの欄は改行し、欄の値（`timeRange`・`geometry`・`tags` など）は 1 行に収める。
 * `JSON.stringify(value, null, 2)` で書くと欄の値まで展開され、一件を直しただけの保存でも差分が全件に広がる。
 * 例えば `"tags": ["人物", "戦争"]` は 1 行のまま書き、配列の要素ごとに改行しない。
 */

import type { LocusCollection } from "@/lib/schema/locus";
import type { SeriesList } from "@/lib/schema/series";

/** 改行して書く配列と object の、一段ごとの字下げ。 */
const INDENT = "  ";

/**
 * 要素ごとに改行して書く位置。
 * 位置は根からの key をドットで繋いだもので、配列の要素は `*`、根は空文字で表す。
 * ここに無い位置の値は 1 行に収める。
 */
const EXPANDED_PATHS = {
  series: new Set(["", "*"]),
  loci: new Set(["", "features", "features.*", "features.*.properties"]),
};

/** `value` が配列でない object かを返す。 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `parent` の位置の下で、`key` の子が占める位置を返す。 */
function childPathOf(parent: string, key: string): string {
  return parent === "" ? key : `${parent}.${key}`;
}

/**
 * `value` を 1 行の JSON にする。
 * 区切りの `,` と `:` の後に空白を 1 つ置き、空でない object は波括弧の内側にも空白を置く（`{ "start": 1830, "end": 1859 }`）。
 */
function toInlineText(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(toInlineText).join(", ")}]`;
  }

  if (isPlainObject(value)) {
    const members = Object.entries(value).map(
      ([key, member]) => `${JSON.stringify(key)}: ${toInlineText(member)}`,
    );

    return members.length === 0 ? "{}" : `{ ${members.join(", ")} }`;
  }

  return JSON.stringify(value);
}

/**
 * `value` を JSON にし、末尾に改行を 1 つ付けて返す。
 * `expandedPaths` に載った位置の配列と object だけを要素ごとに改行し、残りは `toInlineText` で 1 行に収める。
 */
function toCatalogText(
  value: unknown,
  expandedPaths: ReadonlySet<string>,
): string {
  function write(current: unknown, path: string, indent: string): string {
    if (!expandedPaths.has(path)) {
      return toInlineText(current);
    }

    const inner = `${indent}${INDENT}`;

    if (Array.isArray(current) && current.length > 0) {
      const items = current.map(
        (item) => `${inner}${write(item, childPathOf(path, "*"), inner)}`,
      );

      return `[\n${items.join(",\n")}\n${indent}]`;
    }

    if (isPlainObject(current) && Object.keys(current).length > 0) {
      const members = Object.entries(current).map(
        ([key, member]) =>
          `${inner}${JSON.stringify(key)}: ${write(member, childPathOf(path, key), inner)}`,
      );

      return `{\n${members.join(",\n")}\n${indent}}`;
    }

    return toInlineText(current);
  }

  return `${write(value, "", "")}\n`;
}

/** シリーズの全件を、`catalog/series.json` の書式の文字列にする。 */
export function toSeriesJsonText(series: SeriesList): string {
  return toCatalogText(series, EXPANDED_PATHS.series);
}

/** 事物の全件を、`catalog/loci.geojson` の書式の文字列にする。 */
export function toLociGeoJsonText(loci: LocusCollection): string {
  return toCatalogText(loci, EXPANDED_PATHS.loci);
}
