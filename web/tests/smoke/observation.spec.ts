/**
 * スモークの陽性対照。
 * `violationsOf` がどれだけ正しくても、事故が `failedRequests` へ乗らなければ素通りする。
 *
 * 実物の `out/` を使う陽性テスト（worker を退避して赤になること）は #66 の受け入れ手順が持つので、ここは小さなフィクスチャで同じ形を作る。
 *
 * 二本を対にしてあるのが要点である。
 * 観測が常に空を返すようになれば片方が落ち、何にでも反応するようになればもう片方が落ちる。
 */

import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { observe } from "@scripts/smoke";

function fixture(name: string): string {
  return fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
}

test("配信物に欠けがあれば failedRequests に出る", async ({ page }) => {
  const observation = await observe(page, fixture("export-missing-asset"));

  expect(observation.failedRequests).toEqual(["404 /coten-atlas/missing.js"]);
});

test("自足した配信物なら failedRequests は空", async ({ page }) => {
  const observation = await observe(page, fixture("export-self-contained"));

  expect(observation.failedRequests).toEqual([]);
});
