/**
 * Apple Podcasts の回の URL をまだ持たない回に、Search API で URL を補い、`catalog/episodes.json` を書き直す。
 * lookup API が返さない古い回の URL を埋める手動の補完で、`pnpm backfill-apple-podcasts` から手で回す。
 *
 * RSS は取得せず、`episodes.json` の URL を持たない回を、回の題で 1 回ずつ検索する。
 * 検索結果のうち `guid` が一致する回の URL だけをその回へ入れるので、検索語に近い他の回の URL が混ざらない。
 * 定期実行の同期（`sync-feed.ts`）が lookup API だけを使うのは、Search API の制限に当たらず、同期の時間を延ばさないためである。
 *
 * 検索の失敗は警告だけを出して次の回へ進み、取得できた分は書き出す。
 * 続きは同じコマンドを再び回せば、URL を持たない回に対してだけ検索する。
 */

import { fetchAppleSearch } from "@scripts/apple-podcasts";
import { assertCatalogDir, EPISODES_FILE } from "@scripts/catalog-files";
import { readJsonFile, writeJsonFile } from "@scripts/json-file";
import {
  findAppleEpisode,
  listUnlinkedEpisodes,
  setAppleUrls,
} from "@/lib/feed/apple-links";
import type { AppleEpisode } from "@/lib/schema/apple-podcasts";
import { parseEpisodes } from "@/lib/schema/episode";

/**
 * URL を持たない回を題で検索し、見つかった回の URL を `episodes.json` へ書いて、標準出力へ件数を書く。
 * URL を持たない回が無ければ、何も取得せず書き出しもしない。
 */
async function main(): Promise<void> {
  assertCatalogDir();

  const previous = parseEpisodes(readJsonFile(EPISODES_FILE));
  const targets = listUnlinkedEpisodes(previous.episodes);

  if (targets.length === 0) {
    console.log("Apple Podcasts の回の URL を持たない回は無い");

    return;
  }

  const matchedEpisodes: AppleEpisode[] = [];

  for (const target of targets) {
    const found = await fetchAppleSearch(target.title);
    const matched = findAppleEpisode(found, target.guid);

    if (matched !== undefined) {
      matchedEpisodes.push(matched);
    }
  }

  const episodes = setAppleUrls(previous.episodes, matchedEpisodes);

  writeJsonFile(
    EPISODES_FILE,
    parseEpisodes({ syncedAt: previous.syncedAt, episodes }),
  );

  console.log(
    `URL を持たない回 検索前 ${targets.length} 件 → 検索後 ${listUnlinkedEpisodes(episodes).length} 件`,
  );
}

await main();
