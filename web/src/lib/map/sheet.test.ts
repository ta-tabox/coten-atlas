/**
 * 検証するのは、離した位置の高さが 2 つの段の中点のどちら側にあるかで段が決まることである。
 */

import { describe, expect, it } from "vitest";
import { sheetStageOf } from "@/lib/map/sheet";

const HEIGHTS = { closedHeight: 48, openHeight: 448 };

describe("sheetStageOf", () => {
  it("中点より低い位置で離すと closed を返す", () => {
    expect(sheetStageOf({ ...HEIGHTS, releasedHeight: 247 })).toBe("closed");
  });

  it("中点ちょうどで離すと open を返す", () => {
    expect(sheetStageOf({ ...HEIGHTS, releasedHeight: 248 })).toBe("open");
  });

  it("中点より高い位置で離すと open を返す", () => {
    expect(sheetStageOf({ ...HEIGHTS, releasedHeight: 249 })).toBe("open");
  });

  it("閉じた段の高さで離すと closed を返す", () => {
    expect(sheetStageOf({ ...HEIGHTS, releasedHeight: 48 })).toBe("closed");
  });

  it("開いた段の高さで離すと open を返す", () => {
    expect(sheetStageOf({ ...HEIGHTS, releasedHeight: 448 })).toBe("open");
  });
});
