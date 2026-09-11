---
name: series-survey
description: 配信フィードに回が在るのに `catalog/series.json` にまだ無い season（シリーズ未作成の season）を束ね、各 season のシリーズのエントリを `catalog/series.json` と `catalog/loci.geojson` へ起こし、マージできる PR まで進める作業の順序。未作成の season の拾い方、配信フィードで年代・地域・拠点を確かめる読み方、skill `series-vocabulary` で決めた値の書き方、PR の開き方、`@historian` の裏どりの呼び方、典拠の写し方、並行する PR との数え直し、人間が仮決定を採用した後に skill `history-review` で見直しの issue を切り出すまでを、この順に行う。「シーズン調査」「未作成の season を載せる」「新しいシリーズのエントリを起こす」「series.json へシリーズを足して PR にする」「@historian を呼ぶ」「裏どりの結果を典拠に写す」「並行する PR と数え直す」「main を取り込んで当て直す」が合図。値そのものの選び方は skill `series-vocabulary` が持ち、このスキルは持たない。
---

# シーズン調査 — エピソードの season からシリーズのエントリを起こす手順

配信フィードの回は `itunes:season` を持ち、`catalog/series.json` にその season のシリーズが在れば、`pnpm sync` がその回に `seriesId` を付ける。
シリーズ未作成の season の回は、誰かがその season を調べてエントリを起こすまで、地図にも一覧にも出ない。
このスキルは、未作成の season を束ね、エントリを起こし、典拠を残して、PR をマージできるまでの順序を持つ。

複数の束を並行するセッションで同時に進めると、値を決めることより、並行する PR との突き合わせと、裏どりの待ち方で手戻りが出る。
このスキルは、その突き合わせと待ち方も持つ。

値の選び方（`title`・`id`・`anchor`・`kind`・`region`・`tags`・事物の `id`・`timeRange` を年で書くか）の正本は skill `series-vocabulary` で、このスキルは規則を写さない。
典拠のファイルの節の並びと典拠の格は `docs/sources/README.md` が持つ。
裏どりのワークフローの仕組みは `docs/HARNESS.md`「歴史の裏どりを呼ぶ」が持つ。

## 流れ

| 順 | 手順 | 出すもの |
|---|---|---|
| 1 | 束を決めて着手する | 対象の season とシリーズ名の表、main から切ったブランチ |
| 2 | 現物を数える | 主題の語と事物の `id` の一覧（並行する PR のブランチを含む） |
| 3 | 配信フィードを読む | 各シリーズが扱う年代・地域・拠点のメモ |
| 4 | 値を決めて書く | `feat(catalog):` のコミット |
| 5 | PR を開く | PR |
| 6 | 裏どりを呼ぶ | `@historian` の結果のコメント |
| 7 | 典拠を写す | `fix(catalog):` と `docs(sources):` のコミット |
| 8 | 数え直して PR 本文を直す | 重なりを名指した PR 本文 |
| 9 | 規則の論点を切り出す | ラベル `design` の issue（当たったときだけ） |
| 10 | main を取り込む | マージコミット（他の PR が main に入るたび） |
| 11 | 仮決定を採用して見直しを切り出す | skill `history-review` の成果物 |
| 12 | マージする | 人間が指示したときだけ |

裏どりの結果を待つ間（手順 6 の後）は、次の束の手順 1〜5 へ進んでよい。
9 と 10 は、当たった時点で割り込ませる。

## 1. 束を決めて着手する

1. `git fetch origin` の後、比べる相手のブランチを並べる。
   main に加えて、`catalog/series.json` を触る開いた PR のブランチも入れる。
   他の PR が足した season・主題の語・事物の `id` は、main へ入るまで main の現物に現れないためである

```bash
git fetch origin
refs=(origin/main)
for b in $(gh pr list --state open --json headRefName,files \
  --jq '.[] | select(any(.files[]; .path == "catalog/series.json")) | .headRefName'); do
  refs+=("origin/$b")
done
```

2. シリーズ未作成の season を数える。
   `catalog/episodes.json` の `seriesId` は次に `pnpm sync` を回すまで古いので、`seriesId` が空の回を数えず、回の season の集合と `series.json` の season の集合の差を取る。
   題が `【番外編＃` で始まる回は、season を持っていても割当から落ちる（`web/src/lib/feed/assign.ts`）ので除く

```bash
comm -23 \
  <(git show origin/main:catalog/episodes.json \
      | jq -r '.episodes[] | select(.season != null and (.title | startswith("【番外編＃") | not)) | .season' | sort -u) \
  <(for r in "${refs[@]}"; do git show "${r}:catalog/series.json" | jq -r '.[].season'; done | sort -u) \
  | sort -n
```

`catalog/episodes.json` は最後に `pnpm sync` を回した時点の配信までしか持たない。
それより後に始まった season は、手順 3 のコマンドで配信フィードの season を直接並べて拾う。

3. 各 season のシリーズ名を、その season の回の題から取る。
   題は `【<season>-<回>】…【COTEN RADIO <シリーズ名>編<回>】` の形で、ショートの回は `COTEN RADIOショート` と書かれる

```bash
git show origin/main:catalog/episodes.json \
  | jq -r '[.episodes[] | select(.season == <season>)] | sort_by(.pubDate) | .[0].title'
```

4. 1 本の PR で扱う season の束を決める。
   並行するセッションで進めるなら、時代で束ねると、`timeRange` の重なりと、同じ地名の取り合いが束の間で減る。
   束を issue にするなら、本文に season とシリーズ名の対象表を置く
5. `origin/main` からブランチ `feat/series-<束の名前>` を切る

## 2. 現物を数える

skill `series-vocabulary` の手順 1 の集計を、手順 1 で並べた `refs` のブランチまで広げる。
リポジトリのルートで実行する。

```bash
# 主題の語（シリーズ id ごとに重複を除いて数える）
for r in "${refs[@]}"; do git show "${r}:catalog/series.json" | jq -c '.[] | {id, tags}'; done \
  | sort -u | jq -r '.tags[]' | sort | uniq -c | sort -rn
# 事物の id と、ブランチの間で重なる id
for r in "${refs[@]}"; do git show "${r}:catalog/loci.geojson" | jq -r '.features[] | "\(.properties.id) \(.properties.seriesId)"'; done \
  | sort -u | awk '{c[$1]++; s[$1]=s[$1]" "$2} END {for (k in c) if (c[k]>1) print "DUP", k, s[k]}'
```

zsh では `$r:catalog` の `:c` が変数の修飾子として読まれるので、`${r}:catalog` と書く。

## 3. 配信フィードを読む

各シリーズが扱う年代・地域・拠点を、配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`）の各回の説明で確かめる。

- フィードはファイルに保存せず、`curl` の出力をパイプで絞って読む
- 説明文は値を決める材料で、PR 本文や典拠のファイルに引用しない（ADR-0008）。
  書くときは「第 N〜M 回が〜を扱う」と要約する
- 各回の説明の「今回のお話」の節だけを取り出す。
  古い回は同じシリーズ紹介を毎回繰り返すので、`【ポイント】` があればそこから後だけを残す
- `itunes:season` だけで絞らない。
  シリーズの回に別の season が付いていることがある（サラディンと十字軍の 40-6 と 40-10 は season 37）ので、題でも拾う

```bash
curl -s https://anchor.fm/s/8c2088c/podcast/rss | python3 -c '
import sys, re, html, xml.etree.ElementTree as ET
ns = {"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"}
seasons = set(sys.argv[1].split(",")); word = sys.argv[2]
for it in ET.parse(sys.stdin).getroot().iter("item"):
    s = it.findtext("itunes:season", namespaces=ns); title = it.findtext("title") or ""
    if s not in seasons and not (word and word in title):
        continue
    t = html.unescape(re.sub(r"<[^>]+>", "", re.sub(r"<br ?/?>|</p>", "\n", it.findtext("description") or "")))
    m = re.search(r"今回のお話\s*:+(.*?)(:{5,}|※番組内)", t, re.S)
    body = m.group(1) if m else t
    if "【ポイント】" in body:
        body = body[body.index("【ポイント】"):]
    print(title, "\n ", re.sub(r"\s*\n\s*", "／", body.strip())[:400])
' "<season をカンマ区切りで>" "<題で拾う語。無ければ空>"
```

## 4. 値を決めて書く

1. skill `series-vocabulary` の手順 1〜8 を、シリーズごとに上から当てる
2. 束を時代で割っているなら、`timeRange` が束の時代に収まらないシリーズは、別の束へ移してよい。
   移す先が並行するセッションの束なら、移す前にその PR か issue へコメントし、両方の対象表を直す
3. `catalog/series.json` と `catalog/loci.geojson` へ、`season` の順に要素を足す
4. `web/` で `pnpm check` を緑にし、`feat(catalog): <束の名前>の N シリーズを載せる` でコミットする

`catalog/` の 2 ファイルは、`timeRange` と `geometry` を 1 行の object で書く書式である。
`web/` の biome は `catalog/` を整形しないので、ファイル全体を `JSON.stringify` や `json.dump` で書き出すと既存の要素まで展開され、差分が全件に広がる。
既存の要素と同じ雛形で各要素を書き出し、`git diff --numstat catalog/` で削除の行数が 0 であることを確かめる。

## 5. PR を開く

値を書いたら、裏どりを待たずに PR を開いて push する。
並行するセッションが手順 1 と手順 2 で、このブランチの season・主題の語・事物の `id` を読むためである。

- 本文は `.github/pull_request_template.md` の節に沿う。
  束を issue にしたなら `closes #<issue>` を書く
- 「判断したこと」には、代表点（選んだ理由と他の候補）・`region`（当てた表の行）・`timeRange`・`id` の表記・足した主題の語を表で並べる
- 手本は PR #167（中世の 11 シリーズを series.json へ載せる）と PR #169（近世の 8 シリーズを series.json へ載せる）である
- 典拠のファイルはまだ作らない。
  ファイルが在ることが裏どり済みの印になる

## 6. 裏どりを呼ぶ

1. PR へ `@historian` のコメントを付ける。
   本文には、対象のシリーズの `timeRange`・`region`・`anchor`・座標（経度, 緯度）・選び方を表で並べ、特に見てほしい点を名指す。
   起動語に `@claude` を含めない
2. コメントが起こした run を拾う。
   `claude-history-review.yml` はコメントの投稿のたびに run を起こし、PR に付く bot のコメント（自動レビューの進捗や結果）が起こした run は `skipped` で終わる。
   そのため直近の 1 件を取ると、依頼の run でなく bot のコメントの run を拾うことがある

```bash
since=$(date -u +%Y-%m-%dT%H:%M:%SZ)
gh pr comment <PR番号> --body-file <依頼文のファイル>
for i in $(seq 1 30); do
  id=$(gh run list --workflow claude-history-review.yml --limit 10 --json databaseId,createdAt,conclusion,displayTitle \
    --jq "[.[] | select(.createdAt >= \"$since\" and .conclusion != \"skipped\" and (.displayTitle | startswith(\"<PR の題の頭>\")))] | last | .databaseId // empty")
  [ -n "$id" ] && break
  sleep 5
done
echo "run=$id"
```

3. `gh run watch <run-id> --exit-status` をバックグラウンドで待つ。
   完了の通知が来るので、状態を繰り返し叩くループを書かない
4. 結果は claude[bot] のコメントに在る

```bash
gh api repos/ta-tabox/coten-atlas/issues/<PR番号>/comments --paginate \
  --jq '.[] | select(.user.login == "claude[bot]") | "=== \(.id) \(.created_at)\n\(.body)"'
```

拠点や舞台が複数あるときに、どれを事績の中心とするかは番組の内容の判断で、裏どりでは決まらない。
依頼文では候補の地点の事実と座標だけを確かめさせ、どれを選ぶかは判定させない。

## 7. 典拠を写す

1. 返った指摘を見て、`catalog/` の値を 1 つに決める。
   座標を直すなら `fix(catalog):` の 1 コミットにする
2. 対象の全シリーズについて `docs/sources/<シリーズ id>.md` を書き、`docs(sources):` の 1 コミットにする。
   節の並びは `docs/sources/README.md` に従う
3. 「仮決定と論点」節は、Claude の仮決定として、並立する説と覆りうる根拠を表に残す
4. 「裏どりの出所」表には、`@historian` の結果のコメントの URL を置く。
   同じ欄を二度裏どりしたら、どちらの回の典拠が正かを書く
5. 裏どりで確かめられなかった座標や事実は、確かめられなかったと書く

一つの `catalog/` のファイルに理由の違う変更が混ざったら、`git show HEAD:<path>` から片方の変更だけを当てた版を書き出してコミットし、その後に全体の版へ戻してもう一つコミットする。

## 8. 数え直して PR 本文を直す

1. 手順 1 の `refs` を並べ直し、手順 2 の集計をもう一度回す
2. 並行する PR と同じ事物の `id` か同じ地名を要求していたら、skill `series-vocabulary` の手順 5 の「同じ地名を二つのシリーズが要求するとき」の表で、どちらが移るかを決める。
   相手の PR が移る側なら、相手の PR へコメントで知らせ、相手のブランチへは push しない
3. 並行する PR と同じ意味の主題の語を足していたら、PR 本文に名指し、どちらを直すかを人間に訊く
4. PR 本文の「検証（機械）」に裏どりの結果のリンクを、「残したもの」に数え直した重なりを書き、「人間に見てほしい」に判断が割れる点を並べる

## 9. 規則の論点を切り出す

skill `series-vocabulary` の規則が、事実を当てても候補を一つに絞らない論点に当たったら、その場で規則を決めない。

1. `gh issue list --state open --label design` で、並行するセッションが同じ論点を起こしていないかを確かめる
2. 無ければ、ラベル `design` の issue を起こす。
   本文は「事実（規則と当たった現物）」「決めること（案・決め方・起きること）」「作るもの（決まった後）」「人間の判定」の節にする
3. PR は現行の規則のまま仮決定で進め、PR 本文と典拠のファイルの「仮決定と論点」にその issue を名指す

規則が決めていない表記（辞書の見出しの引き方など、規則の読み方でなく書き方の揺れ）は issue にせず、既存の現物に揃えて、選んだ表記と根拠を PR 本文に書く。

## 10. main を取り込む

他の PR が main に入ったら、まだ入っていないこのセッションの PR のブランチへ取り込む。

1. `gh pr view <番号> --json state` で `MERGED` を確かめる
2. `git merge origin/main` で取り込む。
   rebase して force push しない
3. `catalog/series.json` と `catalog/loci.geojson` が衝突したら、両方の要素を残して `season` の順に並べ直す
4. `pnpm check` を緑にし、手順 8 をやり直す
5. main の skill `series-vocabulary` が変わっていたら、変わった規則で値と典拠のファイルを当て直す。
   代表点や事物の `id` を動かしたシリーズだけ、手順 6 で裏どりを呼び直す

## 11. 仮決定を採用して見直しを切り出す

人間が仮決定の採用を決めたら、skill `history-review` の「A. 切り出す」を行う。
PR ごとに、ゆっくり見直す論点だけを 1 シリーズ 1 件の issue にし、残りを仮決定で決着とする。

## 12. マージする

マージは人間が指示したときだけ行う。

1. `gh pr view <番号> --json mergeable,mergeStateStatus,statusCheckRollup` で、衝突が無く `check` が成功していることを確かめる
2. `gh pr merge <番号> --merge` でマージコミットとして入れる。
   ブランチの削除は戻せない操作なので、指示が無ければ行わない
3. `catalog/series.json` を触る PR がまだ開いていれば、そのブランチで手順 10 を行う

## 実行の注意

| 事象 | 起きること | 避け方 |
|---|---|---|
| ブランチを切り替える前にコミットしていない | 作業中の差分が別のブランチへ持ち越される | 切り替える前に必ずコミットする。`git stash` は他のワークツリーと共有されるので使わない。切り替えた後は、編集するファイルを読み直す |
| zsh で `status` に代入する | 読み取り専用の変数なので失敗する | 終了コードは `rc` などの名前で受ける |
| 対話を求める `cp`（`cp -i` の別名）を連鎖の中で使う | 上書きの確認で止まり、連鎖が戻らない | `command cp -f` か、Python の `shutil.copyfile` で写す |
| 1 回のコマンドで `pnpm check` を 3 回以上回す | 1 回に約 2 分かかり、コマンドの上限（600 秒）を超えてバックグラウンドへ移る | ブランチごとにコマンドを分ける |
| TTY の無い環境で `pnpm check` が止まる | pnpm の store の置き場がずれている | `CI=true pnpm install --frozen-lockfile` で入れ直す |
