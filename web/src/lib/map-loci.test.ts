/**
 * シリーズ側の値が事物へ正しく写るかを見る。
 *
 * 相手は現物でなく手で置いた最小の組み合わせである。
 * 見たいのは写しの規則で、`data/` の中身が規則を満たすかは `tests/data.test.ts` が持つ。
 */

import { describe, expect, it } from "vitest";
import { toMapLoci } from "@/lib/map-loci";
import {
  type Locus,
  type LocusCollection,
  TIME_RANGE_OF_SERIES,
} from "@/lib/schema/locus";
import {
  ANCHOR_UNLOCATED,
  type Series,
  type SeriesList,
} from "@/lib/schema/series";

/** シリーズのうち、写しの規則に関わる欄。 */
type SeriesFixture = Pick<
  Series,
  "id" | "kind" | "anchor" | "season" | "timeRange"
>;

/** 残りの欄を埋めて、スキーマの通るシリーズにする。 */
function seriesOf(fixture: SeriesFixture): Series {
  return {
    title: fixture.id,
    summary: "",
    region: "テスト",
    links: [],
    tags: [],
    ...fixture,
  };
}

/** 事物を、座標を問わない 1 点として並べる。 */
function lociOf(...properties: Locus["properties"][]): LocusCollection {
  return {
    type: "FeatureCollection",
    features: properties.map((one) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] },
      properties: one,
    })),
  };
}

const SERIES: SeriesList = [
  seriesOf({
    id: "sparta",
    kind: "place",
    anchor: "sparta-city",
    season: 2,
    timeRange: { start: -900, end: -200 },
  }),
  seriesOf({
    id: "sekai-sandai-shukyo",
    kind: "concept",
    anchor: "mecca",
    season: 7,
    timeRange: { start: -560, end: 632 },
  }),
  seriesOf({
    id: "okane-no-rekishi",
    kind: "concept",
    anchor: ANCHOR_UNLOCATED,
    season: 12,
    timeRange: { start: -600, end: 2020 },
  }),
];

const SPARTA_CITY: Locus["properties"] = {
  id: "sparta-city",
  seriesId: "sparta",
  timeRange: TIME_RANGE_OF_SERIES,
};

const MECCA: Locus["properties"] = {
  id: "mecca",
  seriesId: "sekai-sandai-shukyo",
  timeRange: TIME_RANGE_OF_SERIES,
};

describe("toMapLoci", () => {
  it("kind をその事物のシリーズから写す", () => {
    const { features } = toMapLoci(lociOf(SPARTA_CITY, MECCA), SERIES);

    expect(features.map(({ properties }) => properties.kind)).toEqual([
      "place",
      "concept",
    ]);
  });

  it("代表点の年をシリーズの timeRange から解決する", () => {
    const { features } = toMapLoci(lociOf(SPARTA_CITY), SERIES);

    expect(features[0].properties).toMatchObject({
      timeStart: -900,
      timeEnd: -200,
    });
  });

  it("年を書いた事物はその年を持つ", () => {
    const siege: Locus["properties"] = {
      id: "sparta-siege",
      seriesId: "sparta",
      timeRange: { start: -431, end: -404 },
    };

    const { features } = toMapLoci(lociOf(siege), SERIES);

    expect(features[0].properties).toMatchObject({
      timeStart: -431,
      timeEnd: -404,
    });
  });

  it("位置なしのシリーズは現れない", () => {
    const { features } = toMapLoci(lociOf(SPARTA_CITY, MECCA), SERIES);

    expect(features.map(({ properties }) => properties.seriesId)).not.toContain(
      "okane-no-rekishi",
    );
  });

  it("geometry を書き換えない", () => {
    const loci = lociOf(SPARTA_CITY);

    const { features } = toMapLoci(loci, SERIES);

    expect(features[0].geometry).toEqual(loci.features[0].geometry);
  });

  it("seriesId の指す先が無ければ投げる", () => {
    const orphan: Locus["properties"] = {
      id: "nowhere",
      seriesId: "missing-series",
      timeRange: TIME_RANGE_OF_SERIES,
    };

    expect(() => toMapLoci(lociOf(orphan), SERIES)).toThrow("missing-series");
  });
});
