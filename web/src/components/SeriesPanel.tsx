"use client";

/**
 * シリーズの一覧パネルを、地図に出ているシリーズの区画と位置なしのシリーズの区画に分けて表示し、シリーズの押下を選択として返す。
 *
 * 選択を保持しない。
 * 選択は props で受け取り、押されたシリーズの id は `onSelect` で返す。
 * どのシリーズをどちらの区画に入れるかは `@/lib/map/series-panel` が決める。
 */

import { useId, useState } from "react";
import SeriesPanelSection from "@/components/SeriesPanelSection";
import type { SeriesPanelSections } from "@/lib/map/series-panel";

type SeriesPanelProps = {
  /** 地図に出ている区画と、位置なしの区画に並べるシリーズ。 */
  sections: SeriesPanelSections;
  /**
   * 選択中のシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
  /** シリーズが押されたときに、その id を渡して呼ぶ。 */
  onSelect: (seriesId: string) => void;
};

/**
 * 二つの区画を並べた一覧パネルを表示する。
 * 閉じている間は、一覧の代わりに開くボタンだけを出す。
 */
export default function SeriesPanel({
  sections,
  selectedSeriesId,
  onSelect,
}: SeriesPanelProps) {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(true);

  // パネル全体を閉じて開き直しても区画の開閉を残すので、区画ごとの開閉も SeriesPanelSection でなくここに置く。
  const [isOnMapExpanded, setIsOnMapExpanded] = useState(true);
  const [isUnlocatedExpanded, setIsUnlocatedExpanded] = useState(true);

  // 地図の円（`SERIES_CIRCLE_LAYER` の `circle-color`）と同じ色で塗った丸で、地図に点があることを示す。
  const onMapMarker = (
    <span className="block size-2.5 rounded-full bg-[#1f5673]" />
  );

  // 塗りの無い点線の輪で、地図に点を持たないことを示す。
  const unlocatedMarker = (
    <span className="block size-2.5 rounded-full border border-dashed border-zinc-600" />
  );

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/50 bg-white/45 font-sans text-zinc-900 shadow-lg shadow-black/5 backdrop-blur-md backdrop-saturate-150">
      {isOpen ? (
        <aside
          aria-labelledby={titleId}
          className="flex min-h-0 w-[18rem] max-w-full flex-col py-3 leading-[1.6]"
        >
          <header className="flex items-center gap-3 border-b border-zinc-900/10 px-4 pb-2">
            <h2 id={titleId} className="grow text-[1rem] font-bold">
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
          <div className="flex min-h-0 flex-col gap-3 overflow-x-hidden overflow-y-auto px-2 pt-3 pb-1">
            <SeriesPanelSection
              heading="地図に出ているシリーズ"
              marker={onMapMarker}
              note="スライダーが指す時代に重なるシリーズを、始まりの年の順に並べている。"
              series={sections.onMap}
              emptyNote="この時代に地図に出ているシリーズは無い。"
              selectedSeriesId={selectedSeriesId}
              onSelect={onSelect}
              isExpanded={isOnMapExpanded}
              onToggle={() => setIsOnMapExpanded(!isOnMapExpanded)}
            />
            <SeriesPanelSection
              heading="場所や時代をまたぐシリーズ"
              marker={unlocatedMarker}
              note="一つの場所や時代に収まらない主題を扱うシリーズ。スライダーの時代によらず、いつでもここから選べる。"
              series={sections.unlocated}
              emptyNote="場所や時代をまたぐシリーズは無い。"
              selectedSeriesId={selectedSeriesId}
              onSelect={onSelect}
              isExpanded={isUnlocatedExpanded}
              onToggle={() => setIsUnlocatedExpanded(!isUnlocatedExpanded)}
            />
          </div>
        </aside>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          className="px-4 py-2 text-left text-[0.9rem] font-bold hover:bg-white/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700"
        >
          シリーズ一覧を開く
        </button>
      )}
    </div>
  );
}
