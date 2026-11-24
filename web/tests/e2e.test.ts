/**
 * 見るのは `scripts/e2e.ts` のうちブラウザを立てずに済む、地図の点の画面座標を求める `screenPointOf` で、Vitest で回す。
 * ブラウザが要る側は `tests/e2e/` の spec が持つ。
 */

import { describe, expect, it } from "vitest";
import { screenPointOf } from "@scripts/e2e.ts";

/** デスクトップの幅の地図の大きさ。 */
const VIEWPORT = { width: 1440, height: 900 };

describe("screenPointOf", () => {
  const VIEW = { longitude: 20, latitude: 30, zoom: 1.6 };

  it("視野の中心の点を、padding を除いた領域の中央に描く", () => {
    const point = screenPointOf(
      { longitude: 20, latitude: 30 },
      { ...VIEW, paddingLeft: 306 },
      VIEWPORT,
    );

    expect(point.x).toBeCloseTo((306 + 1440) / 2);
    expect(point.y).toBeCloseTo(450);
  });

  it("経度が東の点を右に、緯度が北の点を上に描く", () => {
    const center = screenPointOf(
      { longitude: 20, latitude: 30 },
      { ...VIEW, paddingLeft: 0 },
      VIEWPORT,
    );
    const northEast = screenPointOf(
      { longitude: 30, latitude: 40 },
      { ...VIEW, paddingLeft: 0 },
      VIEWPORT,
    );

    expect(northEast.x).toBeGreaterThan(center.x);
    expect(northEast.y).toBeLessThan(center.y);
  });
});
