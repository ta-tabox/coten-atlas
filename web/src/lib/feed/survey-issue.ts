/**
 * 未作成の season 1 件から、シーズン調査の issue の題と本文を組む純関数を置く。
 * 未作成の season の求め方は持たず、`uncreated-seasons.ts` が持つ。
 *
 * 題は `シーズン調査: <シリーズ名>編（season <N>）` の形にする。
 * skill `series-survey` の手順 1 は並行するセッションの宣言を題の `シーズン調査:` で探すので、接頭辞を変えると手順 1 が issue を見落とす。
 *
 * 入口は toSurveyIssue。
 */

import {
  seasonLabelOf,
  type UncreatedSeason,
} from "@/lib/feed/uncreated-seasons";

/**
 * シリーズ名が取れなかった season の題で、シリーズ名の位置に置く語。
 */
const UNKNOWN_SERIES_NAME = "（シリーズ名は未確定）";

/**
 * 起票する issue の題と本文。
 * `toSurveyIssue` が作り、`scripts/find-uncreated-seasons.ts` が JSON で標準出力へ書く。
 */
export type SurveyIssue = {
  title: string;
  body: string;
};

/**
 * 未作成の season（`season`）から、シーズン調査の issue の題と本文を作る。
 */
export function toSurveyIssue(season: UncreatedSeason): SurveyIssue {
  return { title: titleOf(season), body: bodyOf(season) };
}

/**
 * 未作成の season（`season`）の issue の題を返す。
 * シリーズ名が null なら、シリーズ名の位置に `UNKNOWN_SERIES_NAME` を置く。
 */
function titleOf({ season, seriesName }: UncreatedSeason): string {
  const name = seriesName === null ? UNKNOWN_SERIES_NAME : `${seriesName}編`;

  return `シーズン調査: ${name}${seasonLabelOf(season)}`;
}

/**
 * 未作成の season（`season`）の issue の本文を、前提・目的・事実・対象・作るもの・触らないもの・完了条件・人間の判定の節で組む。
 */
function bodyOf({
  season,
  seriesName,
  episodeCount,
  firstEpisode,
}: UncreatedSeason): string {
  const seriesCell = seriesName ?? UNKNOWN_SERIES_NAME;

  return `**前提**: なし ／ **担当**: Claude（仮決定の採用とマージは人間） ／ **参照**: skill \`series-survey\`、skill \`series-vocabulary\`、\`docs/sources/README.md\`、\`docs/HARNESS.md\`「歴史の裏どりを呼ぶ」

この issue は、ワークフロー \`.github/workflows/uncreated-seasons.yml\`（シリーズ未作成の season の定期検出）が起票した。

## 目的

配信フィードに現れた season ${season} のシリーズを \`catalog/series.json\` へ載せる。
\`docs/ROADMAP.md\` の完了条件の閾値の 1 番目は、判定する時点のフィードで数えた全シリーズが \`series.json\` に在ることなので、この season を載せて閾値を満たし直す。

## 事実（起票した時点の配信フィード）

- \`catalog/series.json\` に season ${season} のシリーズは無い
- season ${season} の回は ${episodeCount} 回ある
- 最初の回の題は「${firstEpisode.title}」で、\`pubDate\` は \`${firstEpisode.pubDate}\` である

## 対象（1 件）

| season | シリーズ |
|---|---|
| ${season} | ${seriesCell} |

## 作るもの

skill \`series-survey\` の手順 1〜8 に従う。

- \`catalog/series.json\` へ 1 要素と、代表点を置くなら \`catalog/loci.geojson\` へ 1 要素（\`feat(catalog):\`）
- \`@historian\` の裏どりの結果を見て決めた値と、\`docs/sources/<シリーズ id>.md\`（\`fix(catalog):\`・\`docs(sources):\`）

配信が進むと主題の範囲（\`timeRange\`・代表点・\`region\`）が変わりうるので、配信済みの回から仮決定した値は、PR 本文の「残したもの」と典拠のファイルの「仮決定と論点」節に書く。

## 触らないもの

- 既存のシリーズの値。
  見直しはラベル \`history-review\` の issue が扱う
- skill \`series-vocabulary\` の規則。
  規則が候補を一つに絞らない論点に当たったら、skill \`series-survey\` の手順 9 で issue を切り出す

## 完了条件（機械判定）

- \`web/\` で \`pnpm check\` が緑
- \`catalog/series.json\` に season ${season} の要素が在る
- \`docs/sources/<シリーズ id>.md\` が在る

## 人間の判定

仮決定の採用（skill \`series-survey\` の手順 11）。
採用の後に見直す論点があれば、skill \`history-review\` で 1 シリーズ 1 件の issue に切り出す。
`;
}
