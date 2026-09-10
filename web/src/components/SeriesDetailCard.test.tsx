/**
 * 検証するのは、props の `Series` と `EpisodesState` から何が表示されるかである。
 * props に何を渡すかを決める配線は `MapCanvas.test.tsx` が検証する。
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SeriesDetailCard from "@/components/SeriesDetailCard";
import type { Episode } from "@/lib/schema/episode";
import type { Series } from "@/lib/schema/series";

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
  kind: "place",
  anchor: "sparta-city",
  timeRange: { start: -900, end: -200 },
  summary: "軍事に全振りした都市国家の話。",
  region: "ヨーロッパ",
  season: 2,
  links: [],
  tags: ["集団"],
};

const EPISODE_URL =
  "https://podcasters.spotify.com/pod/show/coten/episodes/2-1-e3m0l9q";

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
    expect(screen.getByText("紀元前900年〜紀元前200年")).toBeVisible();
    expect(screen.getByText(SPARTA.summary)).toBeVisible();
  });

  it("エピソードのリンクをその回の配信ページへ向ける", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loaded", episodes: EPISODES }}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("link", {
        name: "【2-1】スパルタ編1（新しいタブで開く）",
      }),
    ).toHaveAttribute("href", EPISODE_URL);
  });

  it("エピソードのリンクを、opener と Referer を渡さずに別タブで開く", () => {
    render(
      <SeriesDetailCard
        series={SPARTA}
        episodes={{ kind: "loaded", episodes: EPISODES }}
        onClose={vi.fn()}
      />,
    );

    const link = screen.getByRole("link", {
      name: "【2-1】スパルタ編1（新しいタブで開く）",
    });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")?.split(" ")).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
  });

  it("配信リンクを持たない回は番組そのものへ向ける", () => {
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
      screen.getByRole("link", { name: "リンク無しの回（新しいタブで開く）" }),
    ).toHaveAttribute(
      "href",
      "https://open.spotify.com/show/3qiAapMhh8UgWVfDWTSq2f",
    );
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
