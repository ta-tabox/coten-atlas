/**
 * 検証するのは、スワイプが隣の段へ移ることと、端の段で動かないこと、タップが段を 1 つずつ上げて一周することである。
 */

import { describe, expect, it } from "vitest";
import { nextSheetStage, stepSheetStage } from "@/lib/map/sheet";

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
