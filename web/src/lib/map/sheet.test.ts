/**
 * 検証するのは、離した位置の高さに最も近い段が選ばれることと、タップが段を 1 つずつ上げて一周することである。
 */

import { describe, expect, it } from "vitest";
import { nextSheetStage, sheetStageOf } from "@/lib/map/sheet";

const STAGE_HEIGHTS = { closed: 48, era: 160, list: 400, full: 720 };

/** `releasedHeight` で離したときに選ばれる段を返す。 */
function stageAt(releasedHeight: number) {
  return sheetStageOf({ releasedHeight, stageHeights: STAGE_HEIGHTS });
}

describe("sheetStageOf", () => {
  it("段の高さちょうどで離すと、その段を返す", () => {
    expect(stageAt(48)).toBe("closed");
    expect(stageAt(160)).toBe("era");
    expect(stageAt(400)).toBe("list");
    expect(stageAt(720)).toBe("full");
  });

  it("2 つの段の中点より低い位置で離すと、低い方の段を返す", () => {
    expect(stageAt(103)).toBe("closed");
    expect(stageAt(279)).toBe("era");
    expect(stageAt(559)).toBe("list");
  });

  it("2 つの段の中点ちょうどで離すと、高い方の段を返す", () => {
    expect(stageAt(104)).toBe("era");
    expect(stageAt(280)).toBe("list");
    expect(stageAt(560)).toBe("full");
  });

  it("一番低い段より下、一番高い段より上で離しても、端の段を返す", () => {
    expect(stageAt(0)).toBe("closed");
    expect(stageAt(900)).toBe("full");
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
