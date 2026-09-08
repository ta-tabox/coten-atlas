"use client";

/**
 * 選択された `Series` 1 件の詳細を、地図に重ねて表示するカード。
 *
 * 取得も絞り込みもしない。
 * 表示するのは props で受け取った `Series` と `EpisodesState` だけで、絞り込みは `@/lib/episodes`、年の整形は `@/lib/format` が担当する。
 *
 * MapLibre の Popup を使わない理由は docs/adr/0022-map-dom-boundary.md が正。
 */

import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";
import type { EpisodesState } from "@/lib/episodes";
import { formatTimeRange } from "@/lib/format";
import type { Episode } from "@/lib/schema/episode";
import type { Series } from "@/lib/schema/series";

/**
 * 番組全体の Spotify ページ。
 * `links` が空のエピソードは、この URL にフォールバックする。
 *
 * RSS の `<link>` は全エピソードにあるので、通常この URL は表示しない（#13（配信リンクの実測値））。
 */
const SHOW_URL = "https://open.spotify.com/show/3qiAapMhh8UgWVfDWTSq2f";

/**
 * `aside` の `aria-labelledby` が参照する、`h2` の id。
 * 同時に開くカードは 1 枚なので固定値でよい。
 */
const TITLE_ID = "series-detail-title";

/** エピソードの一覧の代わりに表示する 1 行の className。 */
const NOTE_CLASS = "mt-2 text-[0.9rem] text-zinc-500";

type SeriesDetailCardProps = {
  /** 開いているシリーズ。 */
  series: Series;
  /** `series` に割り当てられたエピソードと、その取得の状態。 */
  episodes: EpisodesState;
  /** 閉じるボタンが押されたときに呼ぶ。 */
  onClose: () => void;
};

/**
 * `episode` を Spotify で開く URL を返す。
 * `platform` が `"spotify"` のリンクが無ければ `SHOW_URL` を返す。
 *
 * `find` の 1 件で足りる理由は `@/lib/schema/link` が正。
 */
function spotifyUrlOf(episode: Episode): string {
  const link = episode.links.find((one) => one.platform === "spotify");

  return link?.url ?? SHOW_URL;
}

/**
 * エピソードの区画を、`state` ごとに別の内容で表示する。
 * `loading` と `error` と 0 件には、それぞれ違う文言を出す。
 *
 * 三つとも一覧が出ない同じ見た目になるので、文言を共有すると取得の失敗が「まだ配信されていない」と読める。
 * 題号は最長 80 字あるので `line-clamp-2` で 2 行に切り、全文は `title` 属性に残す。
 */
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

  // overflow-x-hidden を明示する。
  // overflow-y-auto だけを指定すると、CSS が横の overflow も auto に変えて横スクロールバーが出る。
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

/**
 * シリーズの詳細カードを表示する。
 * 縦のスクロールはエピソードの一覧だけに限る。
 *
 * カード全体をスクロールさせると、エピソードの多いシリーズでシリーズ名と年代が画面の外に出る。
 */
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
