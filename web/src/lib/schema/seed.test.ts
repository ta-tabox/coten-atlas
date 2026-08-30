/**
 * `data/series.geojson` のシードが S2 の狙いを満たしているかを見る。
 *
 * 見るのはスキーマが見ない観点だけである。
 * 現物が `seriesCollectionSchema` を通ることと `id`・`season` が一意であることは `tests/data.test.ts` とスキーマ自身が既に落とすので、ここでは数えない。
 *
 * 描画のスタイル分岐は `kind` に依存し、その集合は実データを一度作らないと確定しない（`ROADMAP.md` の S2）。
 * 4 種が現物に揃っていなければ、スタイルの分岐は実例を持たない枝を書くことになる。
 *
 * jsdom では `import.meta.url` が file URL にならないので、環境を node に指定してある。
 *
 * @vitest-environment node
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  parseSeries,
  type SeriesCollection,
  seriesKindSchema,
} from "@/lib/schema/series";

/**
 * シードの現物。
 * リポジトリのルート直下で、`web/` の外にある。
 */
const SERIES_FILE = fileURLToPath(
  new URL("../../../../data/series.geojson", import.meta.url),
);

/**
 * シードとして数える件数の幅。
 * ちょうどの数を固定すると 1 件足すたびにここを直すだけの作業が出るので、幅で持つ。
 * 下限は 4 種の kind を出したうえで地理と時代が散っていると言える数で、上限を超えたものはもう叩き台ではなく、この検査が守っている前提の外にある。
 */
const SEED_COUNT = { min: 8, max: 12 };

/** シードを読んで検査に通したもの。 */
function seedSeries(): SeriesCollection {
  return parseSeries(JSON.parse(fs.readFileSync(SERIES_FILE, "utf8")));
}

describe("data/series.geojson のシード", () => {
  it("kind 4 種がすべて出現する", () => {
    const appeared = new Set(
      seedSeries().features.map((feature) => feature.properties.kind),
    );

    expect([...appeared].sort()).toEqual([...seriesKindSchema.options].sort());
  });

  it("件数が 10 件前後ある", () => {
    const count = seedSeries().features.length;

    expect(count).toBeGreaterThanOrEqual(SEED_COUNT.min);
    expect(count).toBeLessThanOrEqual(SEED_COUNT.max);
  });
});
