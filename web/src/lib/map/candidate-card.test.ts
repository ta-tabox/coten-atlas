import { describe, expect, it } from "vitest";
import {
  CANDIDATE_CARD_MARGIN_PX,
  CANDIDATE_CARD_WIDTH_PX,
  candidateCardLeftOf,
} from "@/lib/map/candidate-card";

describe("candidateCardLeftOf", () => {
  it("画面に収まるとき、枠を代表点の水平の中央に置く", () => {
    expect(candidateCardLeftOf(200, 390)).toBe(
      200 - CANDIDATE_CARD_WIDTH_PX / 2,
    );
  });

  it("左の端からはみ出すとき、左の余白の位置へずらす", () => {
    expect(candidateCardLeftOf(10, 390)).toBe(CANDIDATE_CARD_MARGIN_PX);
  });

  it("右の端からはみ出すとき、右の余白の内側へずらす", () => {
    expect(candidateCardLeftOf(380, 390)).toBe(
      390 - CANDIDATE_CARD_WIDTH_PX - CANDIDATE_CARD_MARGIN_PX,
    );
  });
});
