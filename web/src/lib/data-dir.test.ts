/**
 * `data/` の現物へ読み込み口が届くかを見る。
 *
 * 現物がスキーマに合っているかは `tests/data.test.ts` が持つので、ここが見るのは在り処の解決だけである。
 * `data/` は `web/` の外にあり、ここが唯一その位置を知っている場所なので、置き場が動けば型でも lint でも赤くならないまま実行時に落ちる。
 */

import { describe, expect, it } from "vitest";
import { loadLoci, loadSeries } from "@/lib/data-dir";

describe("loadSeries", () => {
  it("現物を読んで検査に通す", () => {
    expect(loadSeries().length).toBeGreaterThan(0);
  });
});

describe("loadLoci", () => {
  it("現物を読んで検査に通す", () => {
    expect(loadLoci().features.length).toBeGreaterThan(0);
  });
});
