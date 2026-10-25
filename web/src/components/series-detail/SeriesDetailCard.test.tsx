/**
 * 検証するのは、props の `Series` と `EpisodesState` から何が表示されるかである。
 * props に何を渡すかを決める配線は `MapCanvas.test.tsx` が検証する。
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeriesDetailCard from "@/components/series-detail/SeriesDetailCard";
import { listenUrlOf } from "@/lib/links/listen-url";
import type { Episode } from "@/lib/schema/episode";
import {
  ANCHOR_UNLOCATED,
  type Series,
  TIME_RANGE_UNTIMED,
} from "@/lib/schema/series";

/** エピソードのうち、カードが読む欄。 */
type EpisodeFixture = Pick<Episode, "guid" | "title" | "links">;

/** `fixture` の残りの欄を埋めて、スキーマを通る `Episode` を返す。 */
function episodeOf(fixture: EpisodeFixture): Episode {
  return {
    pubDate: "2026-08-19T21:00:00.000Z",
    season: 2,
    seriesId: "sparta",
    ...fixture,
  };
}

const SPARTA: Series = {
  id: "sparta",
  title: "スパルタ",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "軍事に全振りした都市国家の話。",
  region: "ヨーロッパ",
  season: 2,
  links: [],
  tags: ["集団"],
};

const EPISODE_URL = "https://open.spotify.com/episode/0000000000000000000000";

const EPISODES: Episode[] = [
  episodeOf({
    guid: "sparta-1",
    title: "【2-1】スパルタ編1",
    links: [{ platform: "spotify", url: EPISODE_URL }],
  }),
];

describe("SeriesDetailCard", () => {
  it("シリーズ名・整形した年代・要約を出す", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loaded", episodes: EPISODES }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "スパルタ" })).toBeVisible();
    expect(screen.getByText("前900年〜前200年")).toBeVisible();
    expect(screen.getByText(SPARTA.summary)).toBeVisible();
  });

  it("時期を持たないシリーズは年代の行を出さない", () => {
    const okane: Series = {
      ...SPARTA,
      id: "okane-no-rekishi",
      title: "お金の歴史",
      anchor: ANCHOR_UNLOCATED,
      timeRange: TIME_RANGE_UNTIMED,
      region: "地域なし",
      season: 12,
      tags: ["経済", "概念史"],
    };

    render(
      <SeriesDetailCard
        series={okane}
        episodes={{ kind: "loaded", episodes: [] }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "お金の歴史" })).toBeVisible();
    expect(screen.queryByText(/\d+年/)).toBeNull();
  });

  it("各回に配信基盤ごとのリンクが 3 本あり、回を基盤で開く URL を指す", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loaded", episodes: EPISODES }}
        onClose={vi.fn()}
      />,
    );

    const row = screen.getByText("【2-1】スパルタ編1").closest("li");

    if (row === null) {
      throw new Error("回の行が無い");
    }

    const links = within(row).getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      listenUrlOf(EPISODES[0], "spotify"),
      listenUrlOf(EPISODES[0], "apple-podcasts"),
      listenUrlOf(EPISODES[0], "youtube"),
    ]);
    expect(links[0]).toHaveAttribute("href", EPISODE_URL);
  });

  it("リンクの名前は基盤名と、新しいタブで開くことを持つ", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loaded", episodes: EPISODES }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(
      [
        "Spotify（新しいタブで開く）",
        "Apple Podcasts（新しいタブで開く）",
        "YouTube（新しいタブで開く）",
      ],
    );
  });

  it("配信基盤のリンクを、opener と Referer を渡さずに別タブで開く", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loaded", episodes: EPISODES }}
        onClose={vi.fn()}
      />,
    );

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")?.split(" ")).toEqual(
        expect.arrayContaining(["noopener", "noreferrer"]),
      );
    }
  });

  it("配信リンクを持たない回は、3 本とも基盤の番組ページへ向ける", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{
          kind: "loaded",
          episodes: [
            episodeOf({ guid: "sparta-2", title: "リンク無しの回", links: [] }),
          ],
        }}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual([
      "https://open.spotify.com/show/3qiAapMhh8UgWVfDWTSq2f",
      "https://podcasts.apple.com/jp/podcast/id1450522865",
      "https://www.youtube.com/@cotenradio",
    ]);
  });

  it("エピソードが 0 件でもシリーズの側は出る", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loaded", episodes: [] }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "スパルタ" })).toBeVisible();
    expect(
      screen.getByText("配信一覧にこのシリーズの回がまだ無い。"),
    ).toBeVisible();
  });

  it("取得の途中は、回が無いのではなく読み込み中だと言う", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loading" }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("エピソードを読み込んでいる。")).toBeVisible();
  });

  it("取得に失敗したら、回が無いのではなく取れなかったと言う", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "error" }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("エピソードの一覧を取れなかった。")).toBeVisible();
  });

  it("閉じるボタンを押すと onClose を呼ぶ", () => {
    const onClose = vi.fn();

    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loaded", episodes: EPISODES }}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "詳細を閉じる" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
