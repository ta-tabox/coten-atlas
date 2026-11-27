import { describe, expect, it } from "vitest";
import {
  CANDIDATE_DISTANCE_PX,
  candidateSeriesIdsOf,
} from "@/lib/map/overlap-candidates";

const PRESSED = { x: 100, y: 100 };

describe("candidateSeriesIdsOf", () => {
  it("判定の範囲に点が無ければ空配列を返す", () => {
    expect(candidateSeriesIdsOf(PRESSED, [])).toEqual([]);
  });

  it("同じ座標の 2 シリーズの点は、両方が候補になる", () => {
    const ids = candidateSeriesIdsOf(PRESSED, [
      { x: 100, y: 100, seriesId: "a" },
      { x: 100, y: 100, seriesId: "b" },
    ]);

    expect([...ids].sort()).toEqual(["a", "b"]);
  });

  it("基準の点から中心間 12px ちょうどの点は候補に入り、12px を超える点は入らない", () => {
    const ids = candidateSeriesIdsOf(PRESSED, [
      { x: 100, y: 100, seriesId: "base" },
      { x: 100 + CANDIDATE_DISTANCE_PX, y: 100, seriesId: "edge" },
      { x: 100 + CANDIDATE_DISTANCE_PX + 0.5, y: 100, seriesId: "far" },
    ]);

    expect(ids).toEqual(["base", "edge"]);
  });

  it("押した位置から遠い点が基準を挟んで 12px 以内でも、基準の点から 12px を超えれば入らない", () => {
    const ids = candidateSeriesIdsOf(PRESSED, [
      { x: 89, y: 100, seriesId: "left" },
      { x: 102, y: 100, seriesId: "base" },
      { x: 114, y: 100, seriesId: "right" },
    ]);

    expect(ids).toEqual(["base", "right"]);
  });

  it("同じシリーズの点が 2 つあっても、seriesId は 1 回だけ返る", () => {
    const ids = candidateSeriesIdsOf(PRESSED, [
      { x: 100, y: 100, seriesId: "a" },
      { x: 104, y: 100, seriesId: "a" },
    ]);

    expect(ids).toEqual(["a"]);
  });

  it("押した位置に近い順に返す", () => {
    const ids = candidateSeriesIdsOf(PRESSED, [
      { x: 108, y: 100, seriesId: "far" },
      { x: 101, y: 100, seriesId: "near" },
      { x: 104, y: 100, seriesId: "mid" },
    ]);

    expect(ids).toEqual(["near", "mid", "far"]);
  });
});
