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
  return relatedSeriesOf(seriesList, origin).map((series) => series.id);
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

const GANDHI = seriesOf({
  id: "gandhi",
  region: "南アジア",
  timeRange: { start: 1869, end: 1948 },
  tags: ["人物", "思想", "宗教", "政治"],
});

const GOGH = seriesOf({
  id: "gogh",
  region: "ヨーロッパ",
  timeRange: { start: 1853, end: 1890 },
  tags: ["人物", "美術"],
});

describe("relatedSeriesOf", () => {
  it("tags を共有するシリーズを、主題のタグの一致が多い順に並べ、種別のタグだけの一致は後ろに置く", () => {
    expect(relatedIdsOf([YOSHIDA, GOGH, GANDHI, TAKASUGI], YOSHIDA)).toEqual([
      "takasugi-shinsaku",
      "gandhi",
      "gogh",
    ]);
  });

  it("主題のタグの一致数が同じなら、region が同じシリーズを前に置く", () => {
    const shoheiko = seriesOf({
      id: "shoheiko",
      region: "日本",
      timeRange: { start: 1790, end: 1871 },
      tags: ["集団", "教育"],
    });

    expect(relatedIdsOf([YOSHIDA, GANDHI, shoheiko], YOSHIDA)).toEqual([
      "shoheiko",
      "gandhi",
    ]);
  });

  it("tags を共有しなくても region が同じシリーズは並べ、近さが同じなら年代の近い方を前に置く", () => {
    const kofun = seriesOf({
      id: "kofun",
      region: "日本",
      timeRange: { start: 250, end: 600 },
      tags: ["集団", "美術"],
    });
    const hokusai = seriesOf({
      id: "hokusai",
      region: "日本",
      timeRange: { start: 1760, end: 1849 },
      tags: ["集団", "美術"],
    });

    expect(relatedIdsOf([kofun, hokusai, GOGH], TAKASUGI)).toEqual([
      "hokusai",
      "kofun",
      "gogh",
    ]);
  });

  it(`関連するシリーズが ${RELATED_SERIES_LIMIT} 件を超えても ${RELATED_SERIES_LIMIT} 件までしか返さない`, () => {
    const japanese = ["a", "b", "c", "d", "e"].map((id) =>
      seriesOf({
        id,
        region: "日本",
        timeRange: { start: 1800, end: 1850 },
        tags: ["集団"],
      }),
    );

    expect(relatedSeriesOf([YOSHIDA, ...japanese], YOSHIDA)).toHaveLength(
      RELATED_SERIES_LIMIT,
    );
  });

  it("tags も region も他のシリーズと共有しないシリーズには空配列を返す", () => {
    const okane = seriesOf({
      id: "okane-no-rekishi",
      region: "地域なし",
      timeRange: TIME_RANGE_UNTIMED,
      tags: ["概念史", "経済"],
    });
    const sei = seriesOf({
      id: "sei-no-rekishi",
      region: "地域なし",
      timeRange: TIME_RANGE_UNTIMED,
      tags: ["人物", "性"],
    });

    expect(relatedSeriesOf([YOSHIDA, GOGH, okane, sei], okane)).toEqual([]);
  });

  it("region が地域なしのシリーズどうしは、region の一致として数えない", () => {
    const kyoiku = seriesOf({
      id: "kyoiku-no-rekishi",
      region: "地域なし",
      timeRange: TIME_RANGE_UNTIMED,
      tags: ["概念史", "教育"],
    });
    const okane = seriesOf({
      id: "okane-no-rekishi",
      region: "地域なし",
      timeRange: TIME_RANGE_UNTIMED,
      tags: ["人物", "経済"],
    });

    expect(relatedIdsOf([kyoiku, okane, YOSHIDA], kyoiku)).toEqual([
      "yoshida-shoin",
    ]);
  });
});
