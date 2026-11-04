/**
 * シリーズと事物の全件から作る `catalog/` の書式の文字列を見る。
 *
 * 相手は手で置いた最小の値である。
 * 現物のファイルとバイト単位で一致するかは `tests/catalog.test.ts` が見る。
 */

import { describe, expect, it } from "vitest";
import {
  toLociGeoJsonText,
  toSeriesJsonText,
} from "@/lib/catalog-edit/catalog-text";
import type { LocusCollection } from "@/lib/schema/locus";
import type { SeriesList } from "@/lib/schema/series";

describe("toSeriesJsonText", () => {
  it("シリーズは欄ごとに改行し、timeRange と tags は 1 行に収める", () => {
    const series: SeriesList = [
      {
        id: "sparta",
        title: "スパルタ",
        anchor: "sparta-city",
        timeRange: { start: -900, end: -200 },
        summary: "",
        region: "ヨーロッパ",
        season: 2,
        links: [],
        tags: ["集団", "戦争"],
      },
    ];

    expect(toSeriesJsonText(series)).toBe(
      [
        "[",
        "  {",
        '    "id": "sparta",',
        '    "title": "スパルタ",',
        '    "anchor": "sparta-city",',
        '    "timeRange": { "start": -900, "end": -200 },',
        '    "summary": "",',
        '    "region": "ヨーロッパ",',
        '    "season": 2,',
        '    "links": [],',
        '    "tags": ["集団", "戦争"]',
        "  }",
        "]",
        "",
      ].join("\n"),
    );
  });

  it("シリーズが 1 件も無ければ空の配列を 1 行で書く", () => {
    expect(toSeriesJsonText([])).toBe("[]\n");
  });
});

describe("toLociGeoJsonText", () => {
  it("事物は properties を欄ごとに改行し、geometry は 1 行に収める", () => {
    const loci: LocusCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [131.399, 34.408] },
          properties: {
            id: "hagi",
            seriesId: "yoshida-shoin",
            timeRange: "series",
          },
        },
      ],
    };

    expect(toLociGeoJsonText(loci)).toBe(
      [
        "{",
        '  "type": "FeatureCollection",',
        '  "features": [',
        "    {",
        '      "type": "Feature",',
        '      "geometry": { "type": "Point", "coordinates": [131.399, 34.408] },',
        '      "properties": {',
        '        "id": "hagi",',
        '        "seriesId": "yoshida-shoin",',
        '        "timeRange": "series"',
        "      }",
        "    }",
        "  ]",
        "}",
        "",
      ].join("\n"),
    );
  });
});
