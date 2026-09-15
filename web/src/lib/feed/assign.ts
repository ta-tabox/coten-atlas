/**
 * フィードの 1 件をどのシリーズへ割り当てるかを決める純関数を置く。
 * 訂正表とシリーズ一覧の読み込みは持たず、`scripts/sync-feed.ts` が持つ。
 *
 * 割当に使う season は、訂正表・題名の先頭の `【NN-M】` の `NN`・`itunes:season` の順に、最初に決まったものを使う。
 * 題名の末尾の `【COTEN RADIO ○○編N】` は、`編` が無い回・前後編の回・開き `【` が欠落した回があるので、シリーズ名を取り出して当てにいかない。
 * どの順でも season が決まらない回は未割当のまま残り、機械で拾えないものをここで推測しない。
 * 順序の理由は `docs/adr/0046-season-assignment-precedence.md` が持つ。
 *
 * 入口は seasonKeyOf と seriesIdOf。
 */

import type { FeedItem } from "@/lib/feed/schema";
import type { SeasonCorrectionList } from "@/lib/schema/season-correction";
import type { SeriesList } from "@/lib/schema/series";

/**
 * 番外編の題名の書き出し。
 *
 * `itunes:season` に番外編の通し番号（115・116・117）が入っている回が 3 件あり、シリーズの season 番号と同じ空間に見える。
 * 番号では見分けが付かないので、題名のこの書き出しで除く。
 *
 * これは割当でなく除外にだけ使う。
 * 取りこぼしたときに起きるのは未割当のまま残るべき回が残らないことで、シリーズを誤って名乗ることではない。
 */
const BONUS_TITLE_PREFIX = "【番外編＃";

/**
 * 題名の先頭の `【NN-M】` に当たる正規表現。
 * `NN` はシリーズの番号、`M` はシリーズ内の回の番号で、割当には `NN` だけを使う。
 */
const TITLE_SEASON_PATTERN = /^【([1-9]\d*)-\d+】/;

/**
 * フィードの 1 件の割当に使う season と、その season をどの情報から決めたか。
 *
 * `seasonKeyOf` が作り、同期が `seriesIdOf` へ渡す。
 * `source` が `"feed"` の回は題名から番号を読めなかった回なので、同期が警告に使う。
 * `"none"` は、番外編か、題名にも `itunes:season` にも番号が無い回である。
 */
export type SeasonKey =
  | { source: "correction"; season: number | null }
  | { source: "title"; season: number }
  | { source: "feed"; season: number }
  | { source: "none"; season: null };

/**
 * フィードの 1 件 `item` の割当に使う season を、訂正表 `corrections`・題名の先頭の `【NN-M】`・`itunes:season` の順に決めて返す。
 *
 * 番外編はどの順より先に除くので、訂正表に行を書いても season は決まらない。
 */
export function seasonKeyOf(
  item: FeedItem,
  corrections: SeasonCorrectionList,
): SeasonKey {
  if (item.title.startsWith(BONUS_TITLE_PREFIX)) {
    return { source: "none", season: null };
  }

  const correction = corrections.find(({ guid }) => guid === item.guid);

  if (correction !== undefined) {
    return { source: "correction", season: correction.season };
  }

  const titleSeason = titleSeasonOf(item.title);

  if (titleSeason !== null) {
    return { source: "title", season: titleSeason };
  }

  if (item.season !== null) {
    return { source: "feed", season: item.season };
  }

  return { source: "none", season: null };
}

/**
 * `season` を持つシリーズの id を `series` から返す。
 * `season` が null か、どのシリーズも `season` を持たなければ null で、呼ぶ側が未割当として扱う。
 */
export function seriesIdOf(
  season: number | null,
  series: SeriesList,
): string | null {
  if (season === null) {
    return null;
  }

  return seasonIndexOf(series).get(season) ?? null;
}

/**
 * 題名 `title` の先頭の `【NN-M】` から `NN` を返す。
 * `title` が `【NN-M】` で始まらなければ null。
 */
function titleSeasonOf(title: string): number | null {
  const match = TITLE_SEASON_PATTERN.exec(title);

  if (match === null) {
    return null;
  }

  return Number(match[1]);
}

/**
 * season からシリーズの id を検索する索引。
 *
 * season がシリーズ間で一意であることは `seriesListSchema` が見ているので、ここで衝突を数え直さない。
 */
function seasonIndexOf(series: SeriesList): Map<number, string> {
  return new Map(series.map(({ season, id }) => [season, id]));
}
