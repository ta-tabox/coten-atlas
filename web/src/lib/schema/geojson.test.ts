import { describe, expect, it } from "vitest";
import { geometrySchema } from "@/lib/schema/geojson";

describe("geometrySchema", () => {
  it("緯度と経度が入れ替わった座標を落とす", () => {
    const swapped = { type: "Point", coordinates: [34.6, 112.5] };

    expect(geometrySchema.safeParse(swapped).success).toBe(false);
  });

  it("スキーマに無いメンバーを持つ geometry を落とす", () => {
    const withBbox = {
      type: "Point",
      coordinates: [22.43, 37.07],
      bbox: [22, 37, 23, 38],
    };

    expect(geometrySchema.safeParse(withBbox).success).toBe(false);
  });

  it("空の環を持つ多角形を、投げずに落とす", () => {
    const emptyRing = { type: "Polygon", coordinates: [[]] };

    expect(geometrySchema.safeParse(emptyRing).success).toBe(false);
  });

  it("環を 1 つも持たない多角形を落とす", () => {
    const noRing = { type: "Polygon", coordinates: [] };

    expect(geometrySchema.safeParse(noRing).success).toBe(false);
  });

  it("閉じていない多角形を落とす", () => {
    const openRing = {
      type: "Polygon",
      coordinates: [
        [
          [110, 30],
          [115, 30],
          [115, 35],
          [110, 35],
        ],
      ],
    };

    expect(geometrySchema.safeParse(openRing).success).toBe(false);
  });

  it("閉じていない環を含む MultiPolygon を落とす", () => {
    const openSecond = {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [110, 30],
            [115, 30],
            [115, 35],
            [110, 30],
          ],
        ],
        [
          [
            [10, 40],
            [15, 40],
            [15, 45],
            [10, 44],
          ],
        ],
      ],
    };

    expect(geometrySchema.safeParse(openSecond).success).toBe(false);
  });

  it("面を 1 つも持たない MultiPolygon を落とす", () => {
    const empty = { type: "MultiPolygon", coordinates: [] };

    expect(geometrySchema.safeParse(empty).success).toBe(false);
  });

  it("全部の環が閉じた MultiPolygon を通す", () => {
    const twoIslands = {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [110, 30],
            [115, 30],
            [115, 35],
            [110, 30],
          ],
        ],
        [
          [
            [10, 40],
            [15, 40],
            [15, 45],
            [10, 40],
          ],
        ],
      ],
    };

    expect(geometrySchema.safeParse(twoIslands).success).toBe(true);
  });

  it("環が閉じていれば通す", () => {
    const closedRing = {
      type: "Polygon",
      coordinates: [
        [
          [110, 30],
          [115, 30],
          [115, 35],
          [110, 30],
        ],
      ],
    };

    expect(geometrySchema.safeParse(closedRing).success).toBe(true);
  });
});
