"use client";

/**
 * 管理画面でシリーズの全件を、選択のボタンの列として表示する部品を置く。
 *
 * 選択も保存も持たない。
 * 選択中のシリーズと座標が変わった代表点は props で受け取り、押されたシリーズの id は `onSelect`、戻す代表点は `onReset` で返す。
 */

import SeriesPickerItem from "@/components/admin/SeriesPickerItem";
import type { MovedLocus } from "@/lib/catalog-editor/moved-loci";
import type { SeriesList } from "@/lib/schema/series";

type SeriesPickerProps = {
  /** 並べるシリーズの全件。 */
  seriesList: SeriesList;
  /**
   * 選択中のシリーズの id。
   * 選択が無ければ null。
   */
  selectedSeriesId: string | null;
  /** 座標が最後のコミットから変わった事物を、事物の `id` で取得する表。 */
  movedLociById: ReadonlyMap<string, MovedLocus>;
  /** シリーズが押されたときに、その id を渡して呼ぶ。 */
  onSelect: (seriesId: string) => void;
  /** 元に戻すボタンが押されたときに、戻す代表点を渡して呼ぶ。 */
  onReset: (movedAnchor: MovedLocus) => void;
};

/** シリーズの全件（`seriesList`）を、座標が変わった代表点の変更前と変更後を添えて並べる。 */
export default function SeriesPicker({
  seriesList,
  selectedSeriesId,
  movedLociById,
  onSelect,
  onReset,
}: SeriesPickerProps) {
  return (
    <ul className="flex flex-col gap-0.5 overflow-y-auto">
      {seriesList.map((series) => (
        <li key={series.id}>
          <SeriesPickerItem
            series={series}
            isSelected={series.id === selectedSeriesId}
            movedAnchor={movedLociById.get(series.anchor)}
            onSelect={onSelect}
            onReset={onReset}
          />
        </li>
      ))}
    </ul>
  );
}
