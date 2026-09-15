"use client";

/**
 * シリーズの一覧パネルを地図の左に重ねて表示し、並べたシリーズのクリックを選択として返す。
 *
 * 選択を保持しない。
 * 表示するのは props で受け取った区画と `selectedSeriesId` で、クリックしたシリーズの id は `onSelect` で返す。
 * 区画の分け方は `@/lib/map/series-panel`、年の整形は `@/lib/format` が担当する。
 * パネルの外に開閉を読む部品が無いので、開閉の状態だけはこのコンポーネントが持つ。
 *
 * MapLibre の DOM へ入れない理由は docs/adr/0022-map-dom-boundary.md が正。
 */

import { useState } from "react";
import { formatTimeRange } from "@/lib/format";
import type { SeriesPanelSections } from "@/lib/map/series-panel";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

/**
 * `aside` の `aria-labelledby` が参照する、`h2` の id。
 * 画面に置くパネルは 1 枚なので固定値でよい。
 */
const TITLE_ID = "series-panel-title";

/** 並べたシリーズ 1 件のボタンのうち、選択の有無で変わらない className。 */
const ITEM_CLASS =
  "w-full rounded-md border-l-4 px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

/**
 * 選択中のシリーズのボタンに足す className。
 * 色だけで選択を伝えないよう、左の縁の太線と太字も付ける。
 */
const SELECTED_ITEM_CLASS = "border-l-orange-700 bg-orange-50 font-bold";

/** 選択していないシリーズのボタンに足す className。 */
const UNSELECTED_ITEM_CLASS = "border-l-transparent hover:bg-zinc-100";

type SeriesPanelProps = {
  /** 地図に出ている区画と、位置なしの区画に並べるシリーズ。 */
  sections: SeriesPanelSections;
  /**
   * 選択中のシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
  /** シリーズがクリックされたときに、その id を渡して呼ぶ。 */
  onSelect: (seriesId: string) => void;
};

type SeriesSectionProps = {
  /**
   * 区画の見出し。
   * `section` の名前にもなる。
   */
  heading: string;
  /** 見出しの下に置く、区画に何が並ぶかの説明。 */
  note: string;
  /** 区画に並べるシリーズ。 */
  series: Series[];
  /** `series` が空のときに一覧の代わりに出す文。 */
  emptyNote: string;
  /**
   * 選択中のシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
  /** シリーズがクリックされたときに、その id を渡して呼ぶ。 */
  onSelect: (seriesId: string) => void;
};

/**
 * 一覧パネルの区画 1 つを、見出し・説明・シリーズのボタンの列で表示する。
 * `series` が空なら、ボタンの列の代わりに `emptyNote` を出す。
 *
 * `timeRange` が `TIME_RANGE_UNTIMED` のシリーズは年を持たないので、年代の行を出さない。
 */
function SeriesSection({
  heading,
  note,
  series,
  emptyNote,
  selectedSeriesId,
  onSelect,
}: SeriesSectionProps) {
  const headingId = `series-panel-section-${heading}`;

  return (
    <section aria-labelledby={headingId} className="mt-3 first:mt-0">
      <h3
        id={headingId}
        className="px-2 text-[0.8rem] tracking-[0.04em] text-zinc-500"
      >
        {heading}
        <span className="ml-1.5 tabular-nums">{series.length}件</span>
      </h3>
      <p className="px-2 text-[0.75rem] leading-[1.5] text-zinc-500">{note}</p>

      {series.length === 0 ? (
        <p className="mt-1.5 px-2 text-[0.85rem] text-zinc-500">{emptyNote}</p>
      ) : (
        <ul className="mt-1.5 flex flex-col gap-0.5">
          {series.map((one) => {
            const isSelected = one.id === selectedSeriesId;

            return (
              <li key={one.id}>
                <button
                  type="button"
                  onClick={() => onSelect(one.id)}
                  aria-current={isSelected ? "true" : undefined}
                  className={`${ITEM_CLASS} ${isSelected ? SELECTED_ITEM_CLASS : UNSELECTED_ITEM_CLASS}`}
                >
                  <span className="block text-[0.9rem]">{one.title}</span>
                  {one.timeRange !== TIME_RANGE_UNTIMED && (
                    <span className="block text-[0.75rem] font-normal text-zinc-500 tabular-nums">
                      {formatTimeRange(one.timeRange)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/**
 * 地図に出ているシリーズと位置なしのシリーズを、別々の区画に並べた一覧パネルを表示する。
 * 閉じている間は、パネルの代わりに開くボタンだけを出す。
 *
 * パネルの高さは、画面の下に重なる era スライダーの上端より下へ伸ばさない。
 */
export default function SeriesPanel({
  sections,
  selectedSeriesId,
  onSelect,
}: SeriesPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={false}
        className="absolute top-4 left-4 z-10 rounded-lg bg-white/95 px-4 py-2 font-sans text-[0.9rem] font-bold text-zinc-900 shadow-lg hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        シリーズ一覧を開く
      </button>
    );
  }

  return (
    <aside
      aria-labelledby={TITLE_ID}
      className="absolute top-4 left-4 z-10 flex max-h-[calc(100dvh-12rem)] w-[18rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg bg-white/95 py-3 font-sans leading-[1.6] text-zinc-900 shadow-lg"
    >
      <header className="flex items-center gap-3 border-b border-zinc-200 px-4 pb-2">
        <h2 id={TITLE_ID} className="grow text-[1rem] font-bold">
          シリーズ一覧
        </h2>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-expanded={true}
          aria-label="一覧を閉じる"
          className="-mr-1.5 flex-none rounded px-1.5 text-[1.1rem] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          ×
        </button>
      </header>

      {/* overflow-x-hidden を明示する。 */}
      {/* overflow-y-auto だけを指定すると、CSS が横の overflow も auto に変えて横スクロールバーが出る。 */}
      <div className="min-h-0 overflow-x-hidden overflow-y-auto px-2 pt-3">
        <SeriesSection
          heading="地図に出ているシリーズ"
          note="スライダーが指す時代に重なるシリーズを、始まりの年の順に並べている。"
          series={sections.onMap}
          emptyNote="この時代に地図に出ているシリーズは無い。"
          selectedSeriesId={selectedSeriesId}
          onSelect={onSelect}
        />
        <SeriesSection
          heading="場所や時代をまたぐシリーズ"
          note="一つの場所や時代に収まらない主題を扱うシリーズ。スライダーの時代によらず、いつでもここから選べる。"
          series={sections.unlocated}
          emptyNote="場所や時代をまたぐシリーズは無い。"
          selectedSeriesId={selectedSeriesId}
          onSelect={onSelect}
        />
      </div>
    </aside>
  );
}
