/**
 * フィードの 1 件が、どのシリーズの回かを決める。
 *
 * 割当キーは `itunes:season` だけである（docs/adr/0018-season-as-assignment-key.md）。
 * タイトルからシリーズ名を取り出して当てにいかない。
 * `【COTEN RADIO ○○編N】` が基本形だが、`編` が無い回・前後編の回・開き `【` が欠落した回があり、正規表現は必ず取りこぼす。
 *
 * 当たらなかった回は inbox へ落ちて人間が引き受ける（docs/adr/0005-two-layer-data.md）。
 * 機械で拾えないものをここで推測しない。
 *
 * 入口は assignSeriesId。
 */

import type { FeedItem } from "@/lib/feed/schema";
import type { SeriesCollection } from "@/lib/schema/series";

/**
 * 番外編の題名の書き出し。
 *
 * `itunes:season` に番外編の通し番号（115・116・117）が入っている回が 3 件あり、シリーズの season 番号と同じ空間に見える。
 * 番号では見分けが付かないので、題名のこの書き出しで落とす。
 *
 * これは割当でなく除外にだけ使う。
 * 取りこぼしたときに起きるのは inbox へ落ちるべき回が落ちないことで、シリーズを誤って名乗ることではない。
 */
const BONUS_TITLE_PREFIX = "【番外編＃";

/**
 * エピソード 1 件に割り当てるシリーズの id を返す。
 * どのシリーズにも当たらなければ null で、呼ぶ側が inbox へ回す。
 */
export function assignSeriesId(
  item: FeedItem,
  series: SeriesCollection,
): string | null {
  if (item.title.startsWith(BONUS_TITLE_PREFIX)) {
    return null;
  }

  if (item.season === null) {
    return null;
  }

  return seasonIndexOf(series).get(item.season) ?? null;
}

/**
 * season からシリーズの id を引く索引。
 *
 * season がシリーズ間で一意であることは `seriesCollectionSchema` が見ているので、ここで衝突を数え直さない。
 * 索引は呼ばれるたびに組み直す。
 * シリーズは 66 件で、同期は 1 日に 1 度しか走らない。
 */
function seasonIndexOf(series: SeriesCollection): Map<number, string> {
  return new Map(
    series.features.map((feature) => [
      feature.properties.season,
      feature.properties.id,
    ]),
  );
}
