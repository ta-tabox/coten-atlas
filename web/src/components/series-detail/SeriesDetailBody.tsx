"use client";

/**
 * 選ばれたシリーズ 1 件の名前・年代・エピソードの一覧・関連するシリーズの中身だけを描く。
 * 外枠は持たない。
 *
 * 取得も絞り込みもしない。
 * 表示するのは props で受け取った `Series` と `EpisodesState` と関連するシリーズだけで、絞り込みは `@/lib/episodes`、年の整形は `@/lib/format`、関連するシリーズの選び方は `@/lib/map/related-series` が担当する。
 *
 * MapLibre の Popup を使わない理由は docs/adr/20260831-map-dom-boundary.md が正。
 */

import ListenLinks from "@/components/series-detail/ListenLinks";
import RelatedSeriesRow from "@/components/series-detail/RelatedSeriesRow";
import SeriesLabels from "@/components/series-detail/SeriesLabels";
import SeriesPeriod from "@/components/series-detail/SeriesPeriod";
import SeriesPlace from "@/components/series-detail/SeriesPlace";
import YouTubeChannelLink from "@/components/series-detail/YouTubeChannelLink";
import { EPISODES_KIND, type EpisodesState } from "@/lib/episodes";
import type { RelatedSeries } from "@/lib/map/related-series";
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
  if (state.kind === EPISODES_KIND.loading) {
    return <p className={NOTE_CLASS}>エピソードを読み込んでいる。</p>;
  }

  if (state.kind === EPISODES_KIND.error) {
    return <p className={NOTE_CLASS}>エピソードの一覧を取れなかった。</p>;
  }

  if (state.episodes.length === 0) {
    return <p className={NOTE_CLASS}>配信一覧にこのシリーズの回がまだ無い。</p>;
  }

  // 縦のスクロールはこの一覧だけに限る。
  // 全体をスクロールさせると、エピソードの多いシリーズでシリーズ名と年代が画面の外に出る。
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
  /**
   * 代表点の事物の地名。
   * 位置なしのシリーズは null。
   */
  placeName: string | null;
  /** `series` に割り当てられたエピソードと、その取得の状態。 */
  episodes: EpisodesState;
  /** `relatedSeriesOf` が近い順に選んだ、`series` に関連するシリーズと共有したタグ。 */
  relatedSeries: RelatedSeries[];
  onSelect: (seriesId: string) => void;
  onClose: () => void;
};

/** `series` の名前・年代と地名・札の見出しと、`episodes` の状態に応じたエピソードの区画と、関連するシリーズの行を縦に並べて描く。 */
export default function SeriesDetailBody({
  series,
  placeName,
  episodes,
  relatedSeries,
  onSelect,
  onClose,
}: SeriesDetailBodyProps) {
  const period =
    series.timeRange === TIME_RANGE_UNTIMED ? null : (
      <SeriesPeriod timeRange={series.timeRange} />
    );
  const place = placeName === null ? null : <SeriesPlace name={placeName} />;

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

          {/* 年代と地名の間の縦線は、後ろの要素の ::before が持つ。幅に収まらなければ、縦線を地名の先頭に付けたまま折り返す。 */}
          {(period !== null || place !== null) && (
            <p className="mt-1 flex flex-wrap text-[0.85rem] text-ink-muted [&>*+*]:before:content-['｜']">
              {period}
              {place}
            </p>
          )}
          <SeriesLabels series={series} />
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

      <RelatedSeriesRow relatedSeries={relatedSeries} onSelect={onSelect} />
    </>
  );
}
