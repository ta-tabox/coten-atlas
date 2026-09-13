/**
 * `catalog/series.json` の現物が、描画の分岐の枝をどちらも持っているかを見る。
 *
 * 見るのはスキーマが見ない観点だけである。
 * 現物が `seriesListSchema` を通ること、`id`・`season` の一意性、`timeRange` が era 空間に収まることは隣の `catalog.test.ts` が既に検査するので、ここでは数えない。
 *
 * 描画は、代表点を持つシリーズを地図に出し、位置なしのシリーズを地図に出さず一覧の別区画へ回す（docs/adr/0026-two-phase-location.md）。
 * 分岐の枝に対応する現物が無いと、その枝は一度も描かれないまま描画のステップへ渡り、見た目の検証からも漏れる。
 *
 * jsdom では `import.meta.url` が file URL にならないので、環境を node に指定してある。
 *
 * @vitest-environment node
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ANCHOR_UNLOCATED,
  parseSeries,
  type SeriesList,
} from "@/lib/schema/series";

/**
 * シードの現物。
 * `catalog/` はリポジトリのルート直下で `web/` の外にあり、`tsconfig.json` の別名は `web/` の中しか解決しないので、辿る手は相対パスしか無い。
 * 段数を数え間違えても型では赤くならないため、隣の `catalog.test.ts` と同じ深さに置いて同じパスの形にしてある。
 */
const SERIES_FILE = fileURLToPath(
  new URL("../../catalog/series.json", import.meta.url),
);

/** シードを読んで検査に通したもの。 */
function seedSeries(): SeriesList {
  return parseSeries(JSON.parse(fs.readFileSync(SERIES_FILE, "utf8")));
}

describe("catalog/series.json のシード", () => {
  it("代表点を持つシリーズと位置なしのシリーズの両方がある", () => {
    const anchors = seedSeries().map((series) => series.anchor);

    expect(anchors.filter((anchor) => anchor === ANCHOR_UNLOCATED)).not.toEqual(
      [],
    );
    expect(anchors.filter((anchor) => anchor !== ANCHOR_UNLOCATED)).not.toEqual(
      [],
    );
  });
});
