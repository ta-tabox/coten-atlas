/**
 * レイヤ定義は宣言的なデータなので、描画でなく定義を見る。
 * jsdom に WebGL は無く、描いた結果を確かめる手立てがこの層に無い（HARNESS.md「1. 検証の層構造」）。
 */

import { describe, expect, it } from "vitest";
import { CIRCLE_OPACITY_BY_KIND, SERIES_CIRCLE_LAYER } from "@/lib/map-style";

describe("SERIES_CIRCLE_LAYER", () => {
  it("円の濃さを kind の 2 値で分ける", () => {
    expect(SERIES_CIRCLE_LAYER.paint?.["circle-opacity"]).toEqual([
      "match",
      ["get", "kind"],
      "concept",
      CIRCLE_OPACITY_BY_KIND.concept,
      CIRCLE_OPACITY_BY_KIND.place,
    ]);
  });

  it("concept を place より薄く描く", () => {
    expect(CIRCLE_OPACITY_BY_KIND.concept).toBeLessThan(
      CIRCLE_OPACITY_BY_KIND.place,
    );
  });
});
