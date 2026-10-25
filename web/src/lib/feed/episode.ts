/**
 * 割当を済ませたフィードの 1 件から、`episodes.json` の 1 件を作る純関数を置く。
 *
 * 割当の規則は持たず、`src/lib/feed/assign.ts` が持つ。
 * `links` だけはフィードから作らず、前回の `episodes.json` の同じ guid の回から引き継ぐ。
 * 回ごとの配信 URL はフィードに無く、各基盤から取得して `links` へ書いた値なので、組み直すたびに捨てると取得し直すまで消える。
 */

import type { SeasonKey } from "@/lib/feed/assign";
import type { FeedItem } from "@/lib/feed/schema";
import type { Episode } from "@/lib/schema/episode";

/** フィードの 1 件と、それに決まった season とシリーズ。 */
export type Assignment = {
  item: FeedItem;
  key: SeasonKey;
  seriesId: string | null;
};

/**
 * 割当を済ませたフィードの 1 件（`assignment`）を、`episodes.json` の 1 件へ写す。
 * `links` は前回の同期のエピソード（`previous`、guid が鍵）の同じ guid の回から引き継ぎ、前回に無い回は空配列にする。
 *
 * `season` には `itunes:season` でなく割当に使った season を入れる。
 * `audioUrl`・`episodeNumber`・`durationSec` は `episodeSchema` に欄が無いので写さない。
 */
export function toEpisode(
  { item, key, seriesId }: Assignment,
  previous: ReadonlyMap<string, Episode>,
): Episode {
  return {
    guid: item.guid,
    title: item.title,
    pubDate: item.pubDate,
    season: key.season,
    seriesId,
    links: previous.get(item.guid)?.links ?? [],
  };
}
