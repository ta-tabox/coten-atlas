/**
 * 検証するのは `episodesForSeries` の絞り込みと、`fetchEpisodes` が失敗したときの戻り値である。
 * 配信された `episodes.json` に実際に到達できるかは `tests/smoke/` が検証する。
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { episodesForSeries, fetchEpisodes } from "@/lib/episodes";
import type { Episode } from "@/lib/schema/episode";

/** エピソードのうち、割当と並びに関わる欄。 */
type EpisodeFixture = Pick<Episode, "guid" | "pubDate" | "seriesId">;

/** `fixture` の残りの欄を埋めて、スキーマを通る `Episode` を返す。 */
function episodeOf(fixture: EpisodeFixture): Episode {
  return {
    title: fixture.guid,
    season: fixture.seriesId === null ? null : 1,
    links: [],
    ...fixture,
  };
}

/** 2 つのシリーズの回と、どこにも割り当たっていない回を混ぜたもの。 */
const EPISODES: Episode[] = [
  episodeOf({
    guid: "sparta-2",
    pubDate: "2026-08-19T21:00:00.000Z",
    seriesId: "sparta",
  }),
  episodeOf({
    guid: "roma-1",
    pubDate: "2026-08-12T21:00:00.000Z",
    seriesId: "teisei-roma",
  }),
  episodeOf({
    // 秒の小数部を書かない形。
    // 文字列のまま比べると sparta-2 より後ろへ回る。
    guid: "sparta-1",
    pubDate: "2026-08-05T21:00:00Z",
    seriesId: "sparta",
  }),
  episodeOf({
    guid: "bangai",
    pubDate: "2026-08-26T21:00:00.000Z",
    seriesId: null,
  }),
];

/** 検査を通る最小の episodes.json。 */
const COLLECTION = {
  syncedAt: "2026-09-07T00:00:00.000Z",
  episodes: EPISODES,
};

/** グローバルの `fetch` を、`response` を返すモックに差し替える。 */
function stubFetch(response: Partial<Response>): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(response as Response)),
  );
}

describe("episodesForSeries", () => {
  it("そのシリーズの回だけを配信の古い順に返す", () => {
    expect(
      episodesForSeries(EPISODES, "sparta").map((episode) => episode.guid),
    ).toEqual(["sparta-1", "sparta-2"]);
  });

  it("1 件も割り当たっていないシリーズには空を返す", () => {
    expect(episodesForSeries(EPISODES, "sengoku")).toEqual([]);
  });
});

describe("fetchEpisodes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("配信された全件を検査に通して返す", async () => {
    stubFetch({ ok: true, json: () => Promise.resolve(COLLECTION) });

    expect(await fetchEpisodes()).toEqual({
      kind: "loaded",
      episodes: EPISODES,
    });
  });

  it("取れなければ error を返し、取れなかったことを console.error へ出す", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    stubFetch({ ok: false, status: 404, statusText: "Not Found" });

    expect(await fetchEpisodes()).toEqual({ kind: "error" });
    expect(logged).toHaveBeenCalled();
  });
});
