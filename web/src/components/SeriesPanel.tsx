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

/**
 * パネルと、閉じている間の開くボタンに共通の、背景をぼかした半透明の見た目の className。
 * `EraSlider` の外枠と同じ値にして、地図に重なる部品の見た目を揃える。
 */
const GLASS_CLASS =
  "border border-white/50 bg-white/45 shadow-lg shadow-black/5 backdrop-blur-md backdrop-saturate-150";

/**
 * 地図に出ている区画の見出しの頭に置く、塗りつぶした丸の className。
 * 色は `@/lib/map/series-layer` の `SERIES_CIRCLE_LAYER` の `circle-color` と同じ値にして、地図の点と対応させる。
 */
const ON_MAP_MARKER_CLASS = "size-2.5 rounded-full bg-[#1f5673]";

/**
 * 位置なしの区画の見出しの頭に置く、点線の輪の className。
 * 地図に点を持たないことを、塗りの無い形で示す。
 */
const UNLOCATED_MARKER_CLASS =
  "size-2.5 rounded-full border border-dashed border-zinc-600";

/** 並べたシリーズ 1 件のボタンのうち、選択の有無で変わらない className。 */
const ITEM_CLASS =
  "w-full rounded-md border-l-4 px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

/**
 * 選択中のシリーズのボタンに足す className。
 * 色だけで選択を伝えないよう、左の縁の太線と太字も付ける。
 */
const SELECTED_ITEM_CLASS = "border-l-orange-700 bg-orange-100/70 font-bold";

/** 選択していないシリーズのボタンに足す className。 */
const UNSELECTED_ITEM_CLASS = "border-l-transparent hover:bg-white/60";

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
  /** 見出しの頭に置く記号の className。 */
  markerClass: string;
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
 * 一覧パネルの区画 1 つを、枠の中に見出し・説明・シリーズのボタンの列で表示する。
 * `series` が空なら、ボタンの列の代わりに `emptyNote` を出す。
 *
 * `timeRange` が `TIME_RANGE_UNTIMED` のシリーズは年を持たないので、年代の行を出さない。
 */
function SeriesSection({
  heading,
  markerClass,
  note,
  series,
  emptyNote,
  selectedSeriesId,
  onSelect,
}: SeriesSectionProps) {
  const headingId = `series-panel-section-${heading}`;

  return (
    <section
      aria-labelledby={headingId}
      className="shrink-0 rounded-lg border border-white/60 bg-white/35 px-1 py-2"
    >
      <h3
        id={headingId}
        className="flex items-center gap-2 px-2 text-[0.8rem] font-bold text-zinc-800"
      >
        <span aria-hidden="true" className={`flex-none ${markerClass}`} />
        <span className="min-w-0">{heading}</span>
        <span className="ml-auto flex-none text-[0.75rem] font-normal whitespace-nowrap text-zinc-600 tabular-nums">
          {series.length}件
        </span>
      </h3>
      <p className="mt-0.5 px-2 text-[0.75rem] leading-[1.5] text-zinc-600">
        {note}
      </p>

      {series.length === 0 ? (
        <p className="mt-1.5 px-2 text-[0.85rem] text-zinc-600">{emptyNote}</p>
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
                    <span className="block text-[0.75rem] font-normal text-zinc-600 tabular-nums">
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
        className={`absolute top-4 left-4 z-10 rounded-xl px-4 py-2 font-sans text-[0.9rem] font-bold text-zinc-900 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${GLASS_CLASS}`}
      >
        シリーズ一覧を開く
      </button>
    );
  }

  return (
    <aside
      aria-labelledby={TITLE_ID}
      className={`absolute top-4 left-4 z-10 flex max-h-[calc(100dvh-12rem)] w-[18rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl py-3 font-sans leading-[1.6] text-zinc-900 ${GLASS_CLASS}`}
    >
      <header className="flex items-center gap-3 border-b border-zinc-900/10 px-4 pb-2">
        <h2 id={TITLE_ID} className="grow text-[1rem] font-bold">
          シリーズ一覧
        </h2>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-expanded={true}
          aria-label="一覧を閉じる"
          className="-mr-1.5 flex-none rounded px-1.5 text-[1.1rem] text-zinc-600 hover:bg-white/60 hover:text-zinc-900"
        >
          ×
        </button>
      </header>

      {/* overflow-x-hidden を明示する。 */}
      {/* overflow-y-auto だけを指定すると、CSS が横の overflow も auto に変えて横スクロールバーが出る。 */}
      <div className="flex min-h-0 flex-col gap-3 overflow-x-hidden overflow-y-auto px-3 pt-3 pb-1">
        <SeriesSection
          heading="地図に出ているシリーズ"
          markerClass={ON_MAP_MARKER_CLASS}
          note="スライダーが指す時代に重なるシリーズを、始まりの年の順に並べている。"
          series={sections.onMap}
          emptyNote="この時代に地図に出ているシリーズは無い。"
          selectedSeriesId={selectedSeriesId}
          onSelect={onSelect}
        />
        <SeriesSection
          heading="場所や時代をまたぐシリーズ"
          markerClass={UNLOCATED_MARKER_CLASS}
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
