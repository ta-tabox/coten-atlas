"use client";

/**
 * 選ばれたシリーズ 1 件の詳細を、地図の上へ載せるカード。
 *
 * 取得も絞り込みもしない。
 * 渡された 1 件と、そのシリーズのエピソードだけを描く（絞り込みは `@/lib/episodes`、年の整形は `@/lib/format`）。
 *
 * エピソードの区画は取得中・取得の失敗・0 件を書き分ける。
 * どれも一覧が出ないという同じ見た目になるので、区別しないと「取れなかった」が「まだ配信されていない」として残る。
 *
 * 縦に溢れるのはエピソードの一覧だけである。
 * カードごとスクロールさせると、回数の多いシリーズでシリーズ名と年代が画面の外へ出る。
 *
 * 横へは送らない。
 * 題号は最長 80 字あって折り返すと 1 件で 4 行を超えるので、2 行で切って続きを `title` 属性へ逃がす。
 * 切らずに `overflow-y-auto` だけを置くと、CSS が横の overflow も auto へ倒すので横スクロールバーが出る。
 *
 * MapLibre の Popup を使わない。
 * 地図由来の DOM は canvas と attribution に閉じてあり、そこへ入った Tailwind のユーティリティは素のカスケードに負ける（docs/adr/0022-map-dom-boundary.md）。
 */

import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";
import type { EpisodesState } from "@/lib/episodes";
import { formatTimeRange } from "@/lib/format";
import type { Episode } from "@/lib/schema/episode";
import type { Series } from "@/lib/schema/series";

/**
 * 回のリンクを持たないエピソードの逃げ先になる、番組そのものの Spotify ページ。
 * フィードの `<link>` は全件に在るので普段は出ないが、欠けた回で導線ごと消えないようにする（#13 の実測）。
 */
const SHOW_URL = "https://open.spotify.com/show/3qiAapMhh8UgWVfDWTSq2f";

/**
 * 見出しと領域を結ぶ id。
 * 同時に開くカードは 1 枚なので固定でよい。
 */
const TITLE_ID = "series-detail-title";

/** 一覧の代わりに出す短い断りの見た目。 */
const NOTE_CLASS = "mt-2 text-[0.9rem] text-zinc-500";

type SeriesDetailCardProps = {
  /** 開いているシリーズ。 */
  series: Series;
  /**
   * そのシリーズに割り当たったエピソードと、その取得の状態。
   * 0 件でも開く。
   */
  episodes: EpisodesState;
  /** 閉じるボタンが押されたときに呼ぶ。 */
  onClose: () => void;
};

/**
 * その回を Spotify で開く URL。
 * 同じ配信基盤のリンクは 2 本持てないので、`find` の 1 本で足りる（`@/lib/schema/link`）。
 */
function spotifyUrlOf(episode: Episode): string {
  const link = episode.links.find((one) => one.platform === "spotify");

  return link?.url ?? SHOW_URL;
}

/** エピソードの区画の中身を、取得の状態ごとに描き分ける。 */
function EpisodeList({ state }: { state: EpisodesState }) {
  if (state.kind === "loading") {
    return <p className={NOTE_CLASS}>エピソードを読み込んでいる。</p>;
  }

  if (state.kind === "error") {
    return <p className={NOTE_CLASS}>エピソードの一覧を取れなかった。</p>;
  }

  if (state.episodes.length === 0) {
    return <p className={NOTE_CLASS}>配信一覧にこのシリーズの回がまだ無い。</p>;
  }

  return (
    <ol className="mt-2 flex flex-col gap-1.5 overflow-x-hidden overflow-y-auto pr-1.5 text-[0.9rem]">
      {state.episodes.map((episode) => (
        <li key={episode.guid}>
          <a
            href={spotifyUrlOf(episode)}
            title={episode.title}
            className="flex items-start gap-2 rounded-md border border-zinc-200 px-3 py-2 hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <span className="line-clamp-2 min-w-0 grow">{episode.title}</span>
            <ExternalLinkIcon className="mt-[0.3em] size-[1em] flex-none text-zinc-400" />
          </a>
        </li>
      ))}
    </ol>
  );
}

/** シリーズの詳細カードを描く。 */
export default function SeriesDetailCard({
  series,
  episodes,
  onClose,
}: SeriesDetailCardProps) {
  return (
    <aside
      aria-labelledby={TITLE_ID}
      className="absolute top-4 right-4 z-10 flex max-h-[calc(100dvh-2rem)] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg bg-white/95 px-5 py-4 font-sans leading-[1.7] text-zinc-900 shadow-lg"
    >
      <header className="flex items-start gap-3 border-b border-zinc-200 pb-3">
        <div className="grow">
          <h2 id={TITLE_ID} className="text-[1.15rem] font-bold">
            {series.title}
          </h2>

          <p className="mt-1 text-[0.85rem] text-zinc-500">
            {formatTimeRange(series.timeRange)}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="詳細を閉じる"
          className="-mr-1.5 flex-none rounded px-1.5 text-[1.1rem] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          ×
        </button>
      </header>

      {series.summary !== "" && (
        <p className="mt-3.5 text-[0.95rem]">{series.summary}</p>
      )}

      <section className="mt-4 flex min-h-0 flex-col">
        <h3 className="text-[0.8rem] tracking-[0.04em] text-zinc-500">
          エピソード
        </h3>

        <EpisodeList state={episodes} />
      </section>
    </aside>
  );
}
