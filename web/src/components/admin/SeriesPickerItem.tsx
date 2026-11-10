"use client";

/**
 * 管理画面のシリーズの一覧に並べるシリーズ 1 件を、選択のボタンとして表示する部品を置く。
 * 代表点の座標が最後のコミットから変わっていれば、変更前と変更後の座標と、変更前へ戻すボタンも並べる。
 *
 * 選択も保存も持たない。
 * 押されたシリーズの id は `onSelect`、戻す代表点は `onReset` で返す。
 */

import type { MovedLocus } from "@/lib/catalog-editor/moved-loci";
import { formatCoordinates } from "@/lib/format";
import { ANCHOR_UNLOCATED, type Series } from "@/lib/schema/series";

type SeriesPickerItemProps = {
  /** 表示するシリーズ。 */
  series: Series;
  /** `series` が選択中か。 */
  isSelected: boolean;
  /**
   * `series` の代表点の、変更前と変更後の座標。
   * 座標が変わっていなければ undefined。
   */
  movedAnchor: MovedLocus | undefined;
  /** シリーズの名前のボタンが押されたときに、`series` の id を渡して呼ぶ。 */
  onSelect: (seriesId: string) => void;
  /** 元に戻すボタンが押されたときに、`movedAnchor` を渡して呼ぶ。 */
  onReset: (movedAnchor: MovedLocus) => void;
};

/**
 * `series` の名前と代表点の `id` を、押すと `onSelect` を呼ぶボタンで表示する。
 * 位置なしのシリーズは代表点の代わりに「位置なし」と出す。
 */
export default function SeriesPickerItem({
  series,
  isSelected,
  movedAnchor,
  onSelect,
  onReset,
}: SeriesPickerItemProps) {
  return (
    <div
      className={`rounded-md border-l-4 ${isSelected ? "border-l-orange-700 bg-orange-100/70" : "border-l-transparent"}`}
    >
      <button
        type="button"
        onClick={() => onSelect(series.id)}
        aria-current={isSelected ? "true" : undefined}
        className={`w-full rounded-md px-3 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${isSelected ? "font-bold" : "hover:bg-white/60"}`}
      >
        <span className="block text-[0.85rem]">{series.title}</span>
        <span className="block text-[0.7rem] font-normal text-zinc-600">
          {series.anchor === ANCHOR_UNLOCATED ? "位置なし" : series.anchor}
        </span>
      </button>
      {movedAnchor !== undefined && (
        <div
          data-moved-anchor={movedAnchor.id}
          className="flex flex-col gap-1 px-3 pb-2 text-[0.7rem] text-zinc-700 tabular-nums"
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-2">
            <dt>変更前</dt>
            <dd>{formatCoordinates(movedAnchor.before)}</dd>
            <dt>変更後</dt>
            <dd>{formatCoordinates(movedAnchor.after)}</dd>
          </dl>
          <button
            type="button"
            onClick={() => onReset(movedAnchor)}
            className="self-start rounded border border-zinc-400 bg-white px-2 py-0.5 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            元に戻す
          </button>
        </div>
      )}
    </div>
  );
}
