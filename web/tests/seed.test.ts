/**
 * `data/series.json` のシードが S2 の狙いを満たしているかを見る。
 *
 * 見るのはスキーマが見ない観点だけである。
 * 現物が `seriesListSchema` を通ること、`id`・`season` の一意性、`timeRange` が era 空間と重なることは隣の `data.test.ts` が既に落とすので、ここでは数えない。
 *
 * 描画は `kind` の 2 値で濃さを分け（docs/adr/0023-kind-place-or-concept.md）、位置なしのシリーズは地図に出さず一覧の別区画へ回す（docs/adr/0026-two-phase-location.md）。
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
  seriesKindSchema,
} from "@/lib/schema/series";

/**
 * シードの現物。
 * `data/` はリポジトリのルート直下で `web/` の外にあり、`tsconfig.json` の別名は `web/` の中しか解決しないので、辿る手は相対パスしか無い。
 * 段数を数え間違えても型では赤くならないため、隣の `data.test.ts` と同じ深さに置いて同じパスの形にしてある。
 */
const SERIES_FILE = fileURLToPath(
  new URL("../../data/series.json", import.meta.url),
);

/**
 * シードとして数える件数の幅。
 * ちょうどの数を固定すると 1 件足すたびにここを直すだけの作業が出るので、幅で持つ。
 * 下限は地理と時代が散っていると言えるだけの数で、上限を超えたものはもう叩き台ではなく、この検査が守っている前提の外にある。
 */
const SEED_COUNT = { min: 8, max: 12 };

/** シードを読んで検査に通したもの。 */
function seedSeries(): SeriesList {
  return parseSeries(JSON.parse(fs.readFileSync(SERIES_FILE, "utf8")));
}

describe("data/series.json のシード", () => {
  it("kind の 2 値がどちらも出現する", () => {
    const appeared = new Set(seedSeries().map((series) => series.kind));

    expect([...appeared].sort()).toEqual([...seriesKindSchema.options].sort());
  });

  it("代表点を持つシリーズと位置なしのシリーズの両方がある", () => {
    const anchors = seedSeries().map((series) => series.anchor);

    expect(anchors.filter((anchor) => anchor === ANCHOR_UNLOCATED)).not.toEqual(
      [],
    );
    expect(anchors.filter((anchor) => anchor !== ANCHOR_UNLOCATED)).not.toEqual(
      [],
    );
  });

  it("件数が 10 件前後ある", () => {
    const count = seedSeries().length;

    expect(count).toBeGreaterThanOrEqual(SEED_COUNT.min);
    expect(count).toBeLessThanOrEqual(SEED_COUNT.max);
  });
});
