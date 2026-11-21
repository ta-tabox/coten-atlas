/**
 * 検証するのは、スワイプが隣の段へ移ることと、端の段で動かないこと、タップが段を 1 つずつ上げて一周することである。
 */

import { describe, expect, it } from "vitest";
import {
  fullHeightPx,
  listHeightPx,
  nextSheetStage,
  stepSheetStage,
} from "@/lib/map/sheet";

describe("stepSheetStage", () => {
  it("上へスワイプすると、1 つ高い段を返す", () => {
    expect(stepSheetStage("closed", "up")).toBe("era");
    expect(stepSheetStage("era", "up")).toBe("list");
    expect(stepSheetStage("list", "up")).toBe("full");
  });

  it("下へスワイプすると、1 つ低い段を返す", () => {
    expect(stepSheetStage("full", "down")).toBe("list");
    expect(stepSheetStage("list", "down")).toBe("era");
    expect(stepSheetStage("era", "down")).toBe("closed");
  });

  it("一番高い段で上へ、一番低い段で下へスワイプしても、同じ段を返す", () => {
    expect(stepSheetStage("full", "up")).toBe("full");
    expect(stepSheetStage("closed", "down")).toBe("closed");
  });
});

describe("nextSheetStage", () => {
  it("低い方から 1 段ずつ上がり、full からは closed へ戻る", () => {
    expect(nextSheetStage("closed")).toBe("era");
    expect(nextSheetStage("era")).toBe("list");
    expect(nextSheetStage("list")).toBe("full");
    expect(nextSheetStage("full")).toBe("closed");
  });
});

describe("listHeightPx", () => {
  it("画面の高さの半分を返す", () => {
    expect(listHeightPx(800)).toBe(400);
  });
});

describe("fullHeightPx", () => {
  it("画面の高さから、ルートの文字の大きさ 16px の 5.5 倍を差し引いた高さを返す", () => {
    expect(fullHeightPx(800, 16)).toBe(712);
  });

  it("ルートの文字の大きさが変わると、差し引く高さも比例して変わる", () => {
    expect(fullHeightPx(800, 20)).toBe(690);
  });
});
