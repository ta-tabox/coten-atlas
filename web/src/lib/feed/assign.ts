/**
 * フィードの 1 件が、どのシリーズの回かを決める。
 *
 * 割当キーは `itunes:season` だけである（docs/adr/0018-season-as-assignment-key.md）。
 * タイトルからシリーズ名を取り出して当てにいかない。
 * `【COTEN RADIO ○○編N】` が基本形だが、`編` が無い回・前後編の回・開き `【` が欠落した回があり、正規表現は必ず取りこぼす。
 *
 * 当たらなかった回は未割当のまま残り、人間が `series.json` を足して引き受ける（docs/adr/0029-two-layer-data-without-inbox.md）。
 * 機械で拾えないものをここで推測しない。
 *
 * 入口は assignSeriesId。
 */

import type { FeedItem } from "@/lib/feed/schema";
import type { SeriesList } from "@/lib/schema/series";

/**
 * 番外編の題名の書き出し。
 *
 * `itunes:season` に番外編の通し番号（115・116・117）が入っている回が 3 件あり、シリーズの season 番号と同じ空間に見える。
 * 番号では見分けが付かないので、題名のこの書き出しで落とす。
 *
 * これは割当でなく除外にだけ使う。
 * 取りこぼしたときに起きるのは未割当のまま残るべき回が残らないことで、シリーズを誤って名乗ることではない。
 */
const BONUS_TITLE_PREFIX = "【番外編＃";

/**
 * 割当に使える season を返す。
 *
 * 番外編と `itunes:season` を持たない回は null で、`series.json` に何を書いてもこの回に割当は付かない。
 * 未割当のうちシリーズを足せば減る分と減らない分を分ける述語でもあるので、呼ぶ側は同期のサマリからも引く。
 */
export function assignableSeasonOf(item: FeedItem): number | null {
  if (item.title.startsWith(BONUS_TITLE_PREFIX)) {
    return null;
  }

  return item.season;
}

/**
 * エピソード 1 件に割り当てるシリーズの id を返す。
 * どのシリーズにも当たらなければ null で、呼ぶ側が未割当として扱う。
 */
export function assignSeriesId(
  item: FeedItem,
  series: SeriesList,
): string | null {
  const season = assignableSeasonOf(item);

  if (season === null) {
    return null;
  }

  return seasonIndexOf(series).get(season) ?? null;
}

/**
 * season からシリーズの id を引く索引。
 *
 * season がシリーズ間で一意であることは `seriesListSchema` が見ているので、ここで衝突を数え直さない。
 * 索引は呼ばれるたびに組み直す。
 * シリーズは 66 件で、同期は 1 日に 1 度しか走らない。
 */
function seasonIndexOf(series: SeriesList): Map<number, string> {
  return new Map(series.map(({ season, id }) => [season, id]));
}
