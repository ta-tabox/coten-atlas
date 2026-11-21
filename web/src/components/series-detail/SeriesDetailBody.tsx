"use client";

/**
 * 地図か一覧で選ばれたシリーズ 1 件の年代・概要・エピソードの一覧を、枠を持たずに描く。
 *
 * 取得も絞り込みもしない。
 * 表示するのは props で受け取った `Series` と `EpisodesState` だけで、絞り込みは `@/lib/episodes`、年の整形は `@/lib/format` が担当する。
 *
 * MapLibre の Popup を使わない理由は docs/adr/20260831-map-dom-boundary.md が正。
 */

import ListenLinks from "@/components/series-detail/ListenLinks";
import YouTubeChannelLink from "@/components/series-detail/YouTubeChannelLink";
import type { EpisodesState } from "@/lib/episodes";
import { formatTimeRange } from "@/lib/format";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

/**
 * 枠（`SeriesDetailCard` の `aside` か、シート）の `aria-labelledby` が参照する、`h2` の id。
 * 同時に開くカードは 1 枚なので固定値でよい。
 */
export const SERIES_DETAIL_TITLE_ID = "series-detail-title";

/** エピソードの一覧の代わりに表示する 1 行の className。 */
const NOTE_CLASS = "mt-2 text-[0.9rem] text-ink-muted";

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

  // overflow-y-auto だけを指定すると CSS が横の overflow も auto に変えて横スクロールバーが出るので、overflow-x-hidden を明示する。
  return (
    <ol className="mt-2 flex flex-col gap-1.5 overflow-x-hidden overflow-y-auto overscroll-contain pr-1.5 text-[0.9rem]">
      {state.episodes.map((episode) => (
        <li
          key={episode.guid}
          className="flex items-center gap-2 rounded-control border border-rule py-1 pr-1 pl-3"
        >
          <span title={episode.title} className="line-clamp-2 min-w-0 grow">
            {episode.title}
          </span>
          <ListenLinks episode={episode} />
        </li>
      ))}
    </ol>
  );
}

type SeriesDetailBodyProps = {
  series: Series;
  /** `series` に割り当てられたエピソードと、その取得の状態。 */
  episodes: EpisodesState;
  onClose: () => void;
};

/**
 * `series` の名前・年代と、`episodes` の状態に応じたエピソードの区画を縦に並べて描く。
 * 縦のスクロールはエピソードの一覧だけに限る。
 *
 * 全体をスクロールさせると、エピソードの多いシリーズでシリーズ名と年代が画面の外に出る。
 */
export default function SeriesDetailBody({
  series,
  episodes,
  onClose,
}: SeriesDetailBodyProps) {
  return (
    <>
      <header className="flex items-start gap-3 border-b border-rule pb-3">
        <div className="grow">
          <h2
            id={SERIES_DETAIL_TITLE_ID}
            className="font-heading text-[1.2rem] font-bold text-heading"
          >
            {series.title}
          </h2>

          {/* timeRange が TIME_RANGE_UNTIMED のシリーズは年を持たないので、年代の行を出さない。 */}
          {series.timeRange !== TIME_RANGE_UNTIMED && (
            <p className="mt-1 text-[0.85rem] text-ink-muted">
              {formatTimeRange(series.timeRange)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="詳細を閉じる"
          className="-mr-1.5 flex-none rounded-control px-1.5 text-[1.1rem] text-ink-muted hover:bg-rule/40 hover:text-ink"
        >
          ×
        </button>
      </header>

      <section className="mt-4 flex min-h-0 flex-col">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-[0.85rem] tracking-[0.04em] text-ink-muted">
            エピソード
          </h3>
          <YouTubeChannelLink />
        </div>

        <EpisodeList state={episodes} />
      </section>
    </>
  );
}
