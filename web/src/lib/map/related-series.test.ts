/**
 * 選択中のシリーズに関連するシリーズの選び方・並べる順・件数の上限を見る。
 *
 * 相手は現物でなく手で置いた最小の組み合わせである。
 */

import { describe, expect, it } from "vitest";
import {
  RELATED_SERIES_LIMIT,
  relatedSeriesOf,
} from "@/lib/map/related-series";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

/** シリーズのうち、関連の判定に関わる欄。 */
type SeriesFixture = Pick<Series, "id" | "region" | "timeRange" | "tags">;

/** 残りの欄を埋めて、スキーマの通るシリーズにする。 */
function seriesOf(fixture: SeriesFixture): Series {
  return {
    title: fixture.id,
    anchor: `${fixture.id}-anchor`,
    season: 1,
    links: {},
    ...fixture,
  };
}

/** `seriesList` から `origin` に関連するシリーズの id を、並んだ順に返す。 */
function relatedIdsOf(seriesList: Series[], origin: Series): string[] {
  return relatedSeriesOf(seriesList, origin).map(({ series }) => series.id);
}

const YOSHIDA = seriesOf({
  id: "yoshida-shoin",
  region: "日本",
  timeRange: { start: 1830, end: 1859 },
  tags: ["人物", "幕末", "思想", "教育"],
});

const TAKASUGI = seriesOf({
  id: "takasugi-shinsaku",
  region: "日本",
  timeRange: { start: 1839, end: 1867 },
  tags: ["人物", "幕末", "戦争"],
});

const ITO_NOE = seriesOf({
  id: "ito-noe",
  region: "日本",
  timeRange: { start: 1895, end: 1923 },
  tags: ["人物", "性", "思想", "メディア"],
});

const HELEN_KELLER = seriesOf({
  id: "helen-keller",
  region: "北アメリカ",
  timeRange: { start: 1880, end: 1968 },
  tags: ["人物", "障害", "教育", "福祉"],
});

describe("relatedSeriesOf", () => {
  it("狭いタグを共有するシリーズを、共有する数が多い順に並べる", () => {
    const shoukasonjuku = seriesOf({
      id: "shoukasonjuku",
      region: "日本",
      timeRange: { start: 1842, end: 1858 },
      tags: ["集団", "幕末", "教育"],
    });

    expect(
      relatedIdsOf([TAKASUGI, shoukasonjuku, HELEN_KELLER], YOSHIDA),
    ).toEqual(["shoukasonjuku", "takasugi-shinsaku", "helen-keller"]);
  });

  it("関連するシリーズごとに、共有した狭いタグを起点のシリーズの tags の順で返し、種別のタグと広いタグは含めない", () => {
    const shoukasonjuku = seriesOf({
      id: "shoukasonjuku",
      region: "日本",
      timeRange: { start: 1842, end: 1858 },
      tags: ["人物", "教育", "思想", "幕末"],
    });

    expect(relatedSeriesOf([shoukasonjuku], YOSHIDA)).toEqual([
      { series: shoukasonjuku, sharedTags: ["幕末", "教育"] },
    ]);
  });

  it("共有する狭いタグの数が同じなら、年代の中点が近いシリーズを前に置き、時期を持たないシリーズを最後に置く", () => {
    const kyoiku = seriesOf({
      id: "kyoiku-no-rekishi",
      region: "地域なし",
      timeRange: TIME_RANGE_UNTIMED,
      tags: ["概念史", "教育"],
    });
    const terakoya = seriesOf({
      id: "terakoya",
      region: "日本",
      timeRange: { start: 1800, end: 1870 },
      tags: ["集団", "教育"],
    });

    expect(relatedIdsOf([kyoiku, HELEN_KELLER, terakoya], YOSHIDA)).toEqual([
      "terakoya",
      "helen-keller",
      "kyoiku-no-rekishi",
    ]);
  });

  it("region が同じでも、狭いタグを共有しないシリーズは並べない", () => {
    const saicho = seriesOf({
      id: "saicho-to-kukai",
      region: "日本",
      timeRange: { start: 767, end: 835 },
      tags: ["人物", "宗教"],
    });

    expect(relatedIdsOf([saicho, TAKASUGI], YOSHIDA)).toEqual([
      "takasugi-shinsaku",
    ]);
  });

  it("種別のタグと広いタグだけを共有するシリーズは並べない", () => {
    expect(relatedIdsOf([ITO_NOE, TAKASUGI], YOSHIDA)).toEqual([
      "takasugi-shinsaku",
    ]);
  });

  it(`関連するシリーズが ${RELATED_SERIES_LIMIT} 件を超えても ${RELATED_SERIES_LIMIT} 件までしか返さない`, () => {
    const bakumatsu = ["a", "b", "c", "d", "e"].map((id) =>
      seriesOf({
        id,
        region: "日本",
        timeRange: { start: 1850, end: 1870 },
        tags: ["人物", "幕末"],
      }),
    );

    expect(relatedSeriesOf([YOSHIDA, ...bakumatsu], YOSHIDA)).toHaveLength(
      RELATED_SERIES_LIMIT,
    );
  });

  it("狭いタグを他のシリーズと共有しないシリーズには空配列を返す", () => {
    const hitler = seriesOf({
      id: "hitler",
      region: "ヨーロッパ",
      timeRange: { start: 1889, end: 1945 },
      tags: ["人物", "戦争"],
    });
    const friedrich = seriesOf({
      id: "friedrich-daio",
      region: "ヨーロッパ",
      timeRange: { start: 1712, end: 1786 },
      tags: ["人物", "戦争", "思想", "政治"],
    });

    expect(relatedSeriesOf([hitler, friedrich, YOSHIDA], hitler)).toEqual([]);
  });
});
