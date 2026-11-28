/**
 * Apple Podcasts の回の URL をまだ持たない回に、Search API で URL を補い、`catalog/episodes.json` を書き直す。
 * lookup API が返さない古い回の URL を埋める手動の補完で、`pnpm backfill-apple-podcasts` から手で回す。
 *
 * RSS は取得せず、`episodes.json` の `guid` と `seriesId` から検索語を決める。
 * 定期実行の同期（`sync-feed.ts`）が lookup API だけを使うのは、Search API の制限に当たらず、同期の時間を延ばさないためである。
 *
 * 検索の失敗は警告だけを出して次の検索語へ進み、取得できた分は書き出す。
 * 続きは同じコマンドを再び回せば、URL を持たない回に対してだけ検索する。
 */

import {
  fetchAppleEpisodesOrWarn,
  fetchAppleSearch,
} from "@scripts/apple-podcasts";
import {
  assertCatalogDir,
  EPISODES_FILE,
  SERIES_FILE,
} from "@scripts/catalog-files";
import { readJsonFile, writeJsonFile } from "@scripts/json-file";
import { listSearchTerms, withAppleUrls } from "@/lib/feed/apple-links";
import type { AppleEpisode } from "@/lib/schema/apple-podcasts";
import { parseEpisodes } from "@/lib/schema/episode";
import { parseSeries } from "@/lib/schema/series";

/**
 * 検索語ごとに Search API を呼び、`episodes.json` へ URL を補って標準出力へ件数を書く。
 * URL を持たない回が無ければ、何も取得せず書き出しもしない。
 */
async function main(): Promise<void> {
  assertCatalogDir();

  const previous = parseEpisodes(readJsonFile(EPISODES_FILE));
  const series = parseSeries(readJsonFile(SERIES_FILE));
  const terms = listSearchTerms(previous.episodes, series);

  if (terms.length === 0) {
    console.log("Apple Podcasts の回の URL を持たない回は無い");

    return;
  }

  const searched: AppleEpisode[] = [];

  for (const term of terms) {
    searched.push(
      ...(await fetchAppleEpisodesOrWarn(`Search API（${term}）`, () =>
        fetchAppleSearch(term),
      )),
    );
  }

  const episodes = withAppleUrls(previous.episodes, searched);
  const missing = (list: readonly { links: Record<string, string> }[]) =>
    list.filter(({ links }) => links["apple-podcasts"] === undefined).length;

  writeJsonFile(
    EPISODES_FILE,
    parseEpisodes({ syncedAt: previous.syncedAt, episodes }),
  );

  console.log(
    `検索語 ${terms.length} 件 / 結べなかった回 ${missing(previous.episodes)} 件 → ${missing(episodes)} 件`,
  );
}

await main();
