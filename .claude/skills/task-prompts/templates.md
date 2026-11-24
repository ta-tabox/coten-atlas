# プロンプトの型

skill `task-prompts` の手順 6 が使う。
`<...>` は変数で、プロンプトを出すときに値へ置き換える。
「（あれば）」の行は、当たる事実が無ければ消す。

## 単独のセッション

````markdown
#<N>（<issue の題>）に着手する。
本文と全コメントを `gh api repos/ta-tabox/coten-atlas/issues/<N>` と `.../issues/<N>/comments` で読み、本文の「作るもの」「触らないもの」「完了条件」に従う。
<本文が参照する決定のコメントや ADR のうち、着手に要るもの>も読む。

- 着手の前に `gh api repos/ta-tabox/coten-atlas/issues/<前提の番号> -q .state` で前提の issue が `closed` であることを確かめ、閉じていなければそのことを書いて止まる（あれば）
- `CLAUDE.md`・`.claude/rules/`・`docs/ROADMAP.md` に従い、コードを書く前に skill `coding-standards`・`karpathy-guidelines`・`ponytail` を開く
- <本文の事実のうち、先に main へ入った PR が変えたもの>（あれば）
- <本文に無く、着手のときに決めることと、決めた理由を書く先>（あれば）
- 区切りごとに `web/` で `pnpm check` を回し、緑ならコミットする
- 書き終えたら skill `review-checklist` を当て、push して PR を作る（PR の作成はこのプロンプトで指示する）
  GraphQL は使えないので、`gh api repos/ta-tabox/coten-atlas/pulls -f title=... -f head=<ブランチ> -f base=main -f body=...` で作る
  本文に `closes #<N>` を書き、`.github/pull_request_template.md` の見出しに従う
  <PR に載せるスクリーンショットや出力>（あれば）

並行して <並行する issue の番号と名前> が別のセッションで進む。
<重なるファイルと、相手が触る行>（あれば）
push の前に main を fetch し、先に入った PR があれば取り込んで衝突を解く。
````

## オーケストレーター

`````markdown
このセッションはオーケストレーターとして、順序を持つ <件数> つの issue を <#A → #B → …> の順にサブセッションへ渡す。
コードは書かず、検証もしない。
人間が送る指示でだけ動き、指示が無い間はターンを終えたまま待つ。

| 順 | issue | ブランチ | 初めの PR の base | モデル |
|---|---|---|---|---|
| 1 | #<A>（<題>） | `<型>/<A>-<短い名前>` | `main` | `<モデル>` |
| 2 | #<B>（<題>） | `<型>/<B>-<短い名前>` | 順 1 のブランチ | `<モデル>` |

<既定から変えたサブのモデルの理由を一文ずつ>
Haiku は使わない。
PR の本文とコミットの本文が `.claude/rules/writing.md` の規律を満たさないと、人間の差し戻しで費用が逆転するからである。

## 最初にすること
1. <着手の条件の issue> が `closed` であることを `gh api repos/ta-tabox/coten-atlas/issues/<番号> -q .state` で確かめ、`closed` でなければそのことを一文書いてターンを終える（あれば）
2. 順 1 のサブを、下の「サブの立て方」で立てる
3. 立てたサブのセッション ID とブランチを一行書いて、ターンを終える

## 人間の指示

| 指示 | すること |
|---|---|
| `次へ` | `gh api 'repos/ta-tabox/coten-atlas/pulls?head=ta-tabox:<前の順のブランチ>&state=all'` を 1 回呼び、前の順の PR が在ることだけを確かめる。在れば次の順のサブを立て、セッション ID を一行書いてターンを終える。無ければ無いと一文書いてターンを終える |
| `マージした #<PR 番号>` | その PR の次の順の PR の base を `gh api -X PATCH repos/ta-tabox/coten-atlas/pulls/<番号> -f base=main` で main へ替える。次の順以降のブランチへ、前から順に main を `git merge --no-edit` し、`web/` で `pnpm check` が緑なら通常の push をする |
| `直した #<PR 番号>` | その PR のブランチを、次の順のブランチへ `git merge --no-edit` する。さらに後ろの順があれば、同じく一つ前のブランチを merge する。`web/` で `pnpm check` が緑なら通常の push をする |
| `状況` | 組の PR の番号・base・状態（open・merged）を `gh api` で取得し、表で書く |

- 衝突したら自分では解かず、`git merge --abort` で戻してから、そのブランチのサブへ `send_message` で「main（または前のブランチ）を取り込んで衝突を解き、push して止まる」と頼む
- `catalog/episodes.json` の衝突は、サブに `pnpm sync` で書き直させる（あれば）
- `pnpm check` が赤なら push せず、そのブランチのサブへ同じく頼む
- `--force-with-lease` を含む force push と PR のマージはしない
- 返答は、したことを 1〜3 行で書くだけにする
- `pnpm check` の出力は、緑なら最後の数行だけを読む
- 同じサブへ 2 回頼んでも緑にならなければ、そのサブを止め、同じブランチの先端から `claude-opus-5-5` のサブを立て直す

## 順 <最後の順> の着手の条件（あれば）
<組の外で閉じているべき issue の番号の一覧>がすべて `closed` であること。
満たさなければ、`次へ` を受けてもサブを立てず、開いている issue の番号だけを一行で書く。

## サブの立て方
`create_session` を次の値で呼ぶ。

- `source_url` は `https://github.com/ta-tabox/coten-atlas`
- `source_revision` は、順 1 なら `main`、それ以降は前の順のブランチ
  前の順の PR が既にマージされていれば `main`
- `outcome_branch` は上の表のブランチ
- `model` は上の表の値
- `effort` と `permission_mode` は渡さない
- `prompt` は、下の「サブへ渡すプロンプト」の共通部と該当する順の節を 1 つにつないだもの
  `<PR の base>` は `source_revision` と同じ値にする

## サブへ渡すプロンプト

### 共通部
````markdown
issue #<N> を実装し、PR を作って止まる。
このセッションは、<#A → #B → …> の順に積む PR のうちの 1 本を持つ。
オーケストレーターへの報告はしない。

- issue の本文と全コメントを `gh api repos/ta-tabox/coten-atlas/issues/<N>` と `.../issues/<N>/comments` で読み、本文の「作るもの」「触らないもの」「完了条件」に従う
  本文が参照する決定のコメントも読む
- `CLAUDE.md`・`.claude/rules/`・`docs/ROADMAP.md` に従い、コードを書く前に skill `coding-standards`・`karpathy-guidelines`・`ponytail` を開く
- 区切りごとに `web/` で `pnpm check` を回し、緑ならコミットする

## PR の前に自分で確かめること
- `web/` で `pnpm check` が緑
- issue の本文の「完了条件（機械判定）」の各項が満たされている
- `git log <PR の base>..HEAD` のコミットの粒度と本文が `.claude/rules/writing.md`「コミットの粒度」「コミットの本文」に合っている
- 差分に skill `review-checklist` の表を当て、当たった型が無い

## PR
- ブランチ `<ブランチ>` へ push し、base を `<PR の base>` にして PR を作る（PR の作成はこのプロンプトで指示する）
  GraphQL は使えないので、`gh api repos/ta-tabox/coten-atlas/pulls -f title=... -f head=<ブランチ> -f base=<PR の base> -f body=...` で作る
  本文に `closes #<N>` を書き、`.github/pull_request_template.md` の見出しに従う
  本文の冒頭に、<#A → #B → …> の順に積んでいることと、前の PR の後にマージすることを書く
- PR を作ったら、PR の URL を一行書いて止まる
- 後で人間かオーケストレーターから修正か衝突の解消を頼まれたら、直して `pnpm check` を緑にし、通常の push をして止まる
- PR のマージと、`--force-with-lease` を含む force push はしない
````

### 順 1（#<A>）
````markdown
- `<N>` は <A>、`<ブランチ>` は `<順 1 のブランチ>`
- <本文に無く、この issue で守ること・決めること・PR に載せるもの>
- <並行するセッションと重なるファイルと行>（あれば）
````
`````
