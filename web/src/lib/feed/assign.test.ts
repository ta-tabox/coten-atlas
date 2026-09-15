import { describe, expect, it } from "vitest";
import {
  listUncorrectedSeasonMismatches,
  seasonKeyOf,
  seriesIdOf,
} from "@/lib/feed/assign";
import type { FeedItem } from "@/lib/feed/schema";
import type { SeasonCorrectionList } from "@/lib/schema/season-correction";
import type { Series } from "@/lib/schema/series";

/** 割当だけを見たいので、代表点と年代は当たり障りのない値で埋める。 */
function series(id: string, season: number): Series {
  return {
    id,
    title: id,
    anchor: `${id}-anchor`,
    timeRange: { start: -27, end: 180 },
    summary: "",
    region: "ヨーロッパ",
    season,
    links: [],
    tags: ["集団"],
  };
}

/**
 * フィードの 1 件。
 * guid・題名・season だけが割当に効く。
 */
function item(overrides: Partial<FeedItem>): FeedItem {
  return {
    guid: "4d80b4a3-deee-41f3-8045-d06ade19132f",
    title: "【66-10】五賢帝時代はじまる！【COTEN RADIO 帝政ローマ編10】",
    link: "https://podcasters.spotify.com/pod/show/coten/episodes/66-10",
    pubDate: "2026-08-19T21:00:00.000Z",
    audioUrl: "https://anchor.fm/s/8c2088c/podcast/play/122753786/episode.mp3",
    season: 66,
    episodeNumber: 10,
    durationSec: 3168,
    ...overrides,
  };
}

/**
 * 配信フィードで `itunes:season` が誤っているか欠けている 4 回。
 * guid・題名・`itunes:season` は配信フィードの値をそのまま写してある。
 */
const MISLABELED_ITEMS = {
  saladinBirth: item({
    guid: "de11d2d5-62dc-4c83-923b-419b71c94193",
    title:
      "【40-6】生まれてすぐに一族追放！紆余曲折ありすぎ英雄 サラディンの生い立ち【COTEN RADIO サラディンと十字軍編6】",
    season: 37,
  }),
  thirdCrusade: item({
    guid: "01380357-2e63-44a5-9ec0-cf4bff99c417",
    title:
      "【40-10】第3回十字軍とサラディン軍 〜白旗振るまで帰れません！チキチキ耐久サバイバル〜【COTEN RADIO サラディンと十字軍編10】",
    season: 37,
  }),
  lincolnFaith: item({
    guid: "5cf8dce5-c57e-4806-b570-eb187e37e979",
    title:
      "【62-2】信仰は我らが命！アメリカをかたどる宗教の枠組み 〜皆を束ねる未来への約束〜【COTEN RADIO リンカン編2】",
    season: null,
  }),
  westernFrontier: item({
    guid: "99e7622f-73ae-4690-ba43-2ec23cfe9b4d",
    title:
      "【15-8】アメリカ西部開拓時代 ― 許されざる者達の狂宴【COTEN RADIO アメリカ開拓史編8】",
    season: null,
  }),
};

/** 4 回の割当先と、4 回を取り違えたときに割り当たるシリーズ。 */
const SERIES = [
  series("america-kaitakushi", 15),
  series("shogai-no-rekishi", 37),
  series("saladin-to-jujigun", 40),
  series("lincoln", 62),
];

/** 空の訂正表。 */
const NO_CORRECTIONS: SeasonCorrectionList = [];

describe("seasonKeyOf", () => {
  it("訂正表に guid が在る回は、題名と itunes:season より訂正表の season を使う", () => {
    const corrections: SeasonCorrectionList = [
      {
        guid: MISLABELED_ITEMS.saladinBirth.guid,
        season: 62,
        reason: "訂正表が題名と itunes:season より先に効くことを確かめる",
      },
    ];

    expect(seasonKeyOf(MISLABELED_ITEMS.saladinBirth, corrections)).toEqual({
      source: "correction",
      season: 62,
    });
  });

  it("訂正表で season を null にした回は、題名が【NN-M】で始まっても season を決めない", () => {
    const corrections: SeasonCorrectionList = [
      {
        guid: MISLABELED_ITEMS.saladinBirth.guid,
        season: null,
        reason: "訂正表で割り当てないとした回が未割当になることを確かめる",
      },
    ];

    expect(seasonKeyOf(MISLABELED_ITEMS.saladinBirth, corrections)).toEqual({
      source: "correction",
      season: null,
    });
  });

  it("題名が【NN-M】で始まる回は、itunes:season が別の番号でも NN を使う", () => {
    expect(seasonKeyOf(MISLABELED_ITEMS.saladinBirth, NO_CORRECTIONS)).toEqual({
      source: "title",
      season: 40,
    });
  });

  it("題名が【NN-M】で始まる回は、itunes:season が無くても NN を使う", () => {
    expect(seasonKeyOf(MISLABELED_ITEMS.lincolnFaith, NO_CORRECTIONS)).toEqual({
      source: "title",
      season: 62,
    });
  });

  it("題名が【NN-M】で始まらない回は itunes:season を使う", () => {
    const untitled = item({ title: "COTEN RADIO 帝政ローマ編10", season: 66 });

    expect(seasonKeyOf(untitled, NO_CORRECTIONS)).toEqual({
      source: "feed",
      season: 66,
    });
  });

  it("番外編は、訂正表に行が在っても season を決めない", () => {
    const bonus = item({
      title: "【番外編＃115】中川政七商店とコテンラジオ",
      season: 115,
    });
    const corrections: SeasonCorrectionList = [
      {
        guid: bonus.guid,
        season: 66,
        reason: "番外編の除外が訂正表より先に効くことを確かめる",
      },
    ];

    expect(seasonKeyOf(bonus, corrections)).toEqual({
      source: "none",
      season: null,
    });
  });

  it("題名にも itunes:season にも番号が無い回は season を決めない", () => {
    const special = item({ title: "【特別編】年末のごあいさつ", season: null });

    expect(seasonKeyOf(special, NO_CORRECTIONS)).toEqual({
      source: "none",
      season: null,
    });
  });
});

describe("seriesIdOf", () => {
  it.each([
    {
      label: "【40-6】",
      mislabeled: MISLABELED_ITEMS.saladinBirth,
      seriesId: "saladin-to-jujigun",
    },
    {
      label: "【40-10】",
      mislabeled: MISLABELED_ITEMS.thirdCrusade,
      seriesId: "saladin-to-jujigun",
    },
    {
      label: "【62-2】",
      mislabeled: MISLABELED_ITEMS.lincolnFaith,
      seriesId: "lincoln",
    },
    {
      label: "【15-8】",
      mislabeled: MISLABELED_ITEMS.westernFrontier,
      seriesId: "america-kaitakushi",
    },
  ])(
    "訂正表が空でも、$label を $seriesId へ割り当てる",
    ({ mislabeled, seriesId }) => {
      const { season } = seasonKeyOf(mislabeled, NO_CORRECTIONS);

      expect(seriesIdOf(season, SERIES)).toBe(seriesId);
    },
  );

  it("season を持つシリーズが無ければ null を返す", () => {
    expect(seriesIdOf(65, SERIES)).toBeNull();
  });

  it("season が null なら、シリーズが在っても null を返す", () => {
    expect(seriesIdOf(null, SERIES)).toBeNull();
  });

  it("シリーズが 1 件も無ければ null を返す", () => {
    expect(seriesIdOf(66, [])).toBeNull();
  });
});

describe("listUncorrectedSeasonMismatches", () => {
  it("題名の NN と itunes:season が食い違い、訂正表に行が無い回を返す", () => {
    const mismatches = listUncorrectedSeasonMismatches(
      [MISLABELED_ITEMS.saladinBirth, item({})],
      NO_CORRECTIONS,
    );

    expect(mismatches).toEqual([MISLABELED_ITEMS.saladinBirth]);
  });

  it("訂正表に行が在る回は、食い違っていても返さない", () => {
    const corrections: SeasonCorrectionList = [
      {
        guid: MISLABELED_ITEMS.saladinBirth.guid,
        season: 40,
        reason: "訂正表に書いた回が食い違いから外れることを確かめる",
      },
    ];

    expect(
      listUncorrectedSeasonMismatches(
        [MISLABELED_ITEMS.saladinBirth],
        corrections,
      ),
    ).toEqual([]);
  });

  it("itunes:season を持たない回は、題名が【NN-M】で始まっても返さない", () => {
    expect(
      listUncorrectedSeasonMismatches(
        [MISLABELED_ITEMS.lincolnFaith],
        NO_CORRECTIONS,
      ),
    ).toEqual([]);
  });

  it("番外編は、itunes:season に通し番号を持っていても返さない", () => {
    const bonus = item({
      title: "【番外編＃115】中川政七商店とコテンラジオ",
      season: 115,
    });

    expect(listUncorrectedSeasonMismatches([bonus], NO_CORRECTIONS)).toEqual(
      [],
    );
  });
});
