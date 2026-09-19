# HARNESS — 検証と実行環境

何をもって「動いた」と言えるか、どこで動かすか。
**なぜ**は `VISION.md`（未作成）、**どう**は `ARCHITECTURE.md`、**順序**は `ROADMAP.md`、**決定**は `docs/adr/`。

## 1. 検証の層構造

| 層 | 何を見るか | 実体 |
|---|---|---|
| **L0 型** | 型が通るか | `tsc --noEmit` |
| **L1 静的** | 規約・書式・明らかな誤り・コメントの禁止語 | `biome ci .` と `node scripts/lint-comments.ts` |
| **L2 ユニット** | 関数とコンポーネントの振る舞いと、`catalog/` の現物がスキーマに合うか | `vitest run`（+ React Testing Library、jsdom） |
| **L3 ビルド** | static export が実際に吐けるか | `next build` |
| **L4 スモーク** | 静的成果物が自足しているか（4xx・実行時エラー・canvas の寸法） | ヘッドレスの Chromium で `out/` を開く（`playwright test`） |
| **人間の目視** | 地図の見た目・スライダーの手触り・実機 | 人間が `pnpm dev` で開く |

L0〜L4 は `pnpm check` の一本にまとまっている（下記）。
番号が指すのはこの連鎖の中の位置で、安い順に並んでいる。

**人間の目視は番号を持たない。** 連鎖に居らず、close も妨げないので、番号を与えると連鎖の続きに見える。
人間の判定が close を妨げない規約は `ROADMAP.md`「完了条件は二本に分ける」が持つ。

`catalog/` の検査が L2 に居るのは、検査器が `web/src/lib/schema/` の zod スキーマそのもので、それを保証するのが同じ層の反例テストだから。
`catalog/` の検査は `web/tests/catalog.test.ts` で、ファイル名が `*.test.ts` なので `pnpm test` が拾う。
足すと同じ検査が二度走るので、連鎖へ別の段としては足さない。
`pnpm validate:catalog` はその 1 本だけを名指す切り分け用で、「これが緑なら閉じてよい」と言えるのは変わらず `pnpm check` だけである。

L3 を層に持つのは、static export にビルド時にしか壊れない失敗があり、L0〜L2 だけでは PR が緑のまま公開が落ちるためである。

L4 を層に持つのは、L3 までがどれも「配信物へ実際に到達できるか」を見ないためである。
守らせるのは自足の一点で、外部への通信は遮断する。

## 2. 判定の口

**`pnpm check` の一本**。中身は L0 → L1 → L2 → L3 → L4 の順で、安いものから落とす。
アプリは `web/` 配下なので、**打つ場所も `web/` の中**。

```
cd web && pnpm check   # tsc --noEmit → biome ci . → vitest run → next build → smoke
```

L4 のスモークが連鎖の末尾に居るのは、判定の対象が `next build` の出力だからである。
ブラウザを立てるのは L4 だけで、回すのは Playwright である。
スモークは project `smoke`（`web/tests/smoke/`）で、`pnpm smoke` がそれを名指す。
操作を伴う E2E を足すときは project をもう一つ並べるので、スモークの範囲は動かない。

新しいテストの置き場は「ブラウザが要るか」で決まる。
要るなら `*.spec.ts`、要らないなら `*.test.ts`。
ファイル名が担当を決めるので、置き場所よりファイル名を間違えないほうが効く。

ブラウザのバイナリは `pnpm check` が取りに行かない。
`pnpm check` は繰り返し打つ口なので、そのたびに 356MB のダウンロードの要否を確かめに行かせない。
入っていないと L4 だけが落ちる。
`pnpm exec playwright install chromium` を一度だけ打つ。

- **赤のままコミットしない。** 回し方は「`pnpm check` → 緑ならコミット」
- 口を増やさない。切り分けのために個別スクリプトを単体で叩くのは構わないが、
  「これが緑なら閉じてよい」と言えるのは `pnpm check` だけ
- 機械判定を `pnpm check` の一本にする理由は [ADR-0045](adr/0045-pnpm-check-current-form.md) が持つ
- CI も同じ一本を回す（`.github/workflows/check.yml`）

ランタイムの版は `mise.toml` の `[tools]` が固定する（node / pnpm）。
固定を立てずに走らせると、手元と CI と意味が揃わない。

タスクは `web/package.json` の scripts が持つので、打つ場所も `web/` の中である。
`mise.toml` はルートに残って `[tools]` だけを持ち、`run = "pnpm check"` の薄いラッパは置かない。

### 到達テスト

**到達テストは、`deploy.yml` の deploy ジョブが配信の直後にページを一度取得し、HTML の `src`・`href` 属性に書かれたパスへ到達できるかを検証する。**
ブラウザは立てない。
検証の範囲と L4 との分担を決めた理由は [ADR-0036](adr/0036-post-deploy-reachability.md) が持つ。

**到達テストは、close してよいかの判定に使わない。**
走るのが main へ入った後なので、失敗しても close の判定には間に合わない。

### PR に付く run

`Check` と自動レビューは起動条件が違うので、push の後に待つものを取り違えない。

- **`Check`（`check.yml`）は PR への push ごとに走る**。`pull_request` にフィルタを置いていないので、md 一枚の変更でも回る
- **自動レビュー（`claude-code-review.yml`）は `opened` / `ready_for_review` / `reopened` でだけ走る**
  push は `synchronize` なので拾わず、レビュー指摘へ対応して push しても再レビューは来ない
  job は二つで、`claude-review` が正しさを、`claude-style-review` が規約（`.claude/rules/` と skill `coding-standards`「レビューで繰り返し指摘される型」）を差分へ当てる
- **再レビューが要るなら PR コメントで `@claude` を名指しする**（起動するのは `claude.yml` の側）
  人間が `ready_for_review` か再オープンで掛け直す手もあるが、そちらは人間の操作である
- **歴史の裏どり（`claude-history-review.yml`）は自動では走らない**
  `@historian` を含むコメントだけが起動する
- **`Lint PR body`（`lint-pr-body.yml`）は PR を開いた回と本文を編集した回に走る**
  PR 本文の禁止語を `scripts/lint-vocabulary.sh` で報告する（語の正は `.claude/rules/writing.md`「語彙と読み手」節の表）

### レビューを掛け直す

自動レビューが走るのは PR を開いた回だけなので、指摘へ対応した後の再レビューは自分で起こす。

1. 指摘を読み、同意できるものを直す
   指摘は決定ではないので、同意できないものは直さず根拠を添えて返信する
2. 指摘ごとに関心が違えばコミットを分けて push し、各インラインコメントへ返信する（返信は push の後）
3. `gh pr comment <PR番号> --body "@claude ..."` で掛け直す
   何を直したかと、どこを見てほしいかを書く
4. 完了は `gh run watch <run-id>` を**バックグラウンドで**待つ
   終了時に呼び戻されるので、状態を繰り返し叩くループを書かない
5. 新しい指摘があれば 1 へ戻る
   上限は2周で、3周目に入るなら収束していないことを人間へ報告して判断を仰ぐ

`claude.yml` の `permissions` は `contents: read` である。
Actions 経由の Claude はコメントしか残せないので、レビューへ「直しておいて」と投げても直らない。
修正を書くのは常にセッションの側になる。

### 歴史の裏どりを呼ぶ

`catalog/series.json` の `timeRange` と `catalog/loci.geojson` の座標は人手で決める値で、生没年が 50 年ずれていても `pnpm check` は緑になる。
裏どりは三本目のワークフロー（`claude-history-review.yml`）が担い、コードのレビューとは別の起動語で呼ぶ（分ける理由は [ADR-0035](adr/0035-history-review-lane.md)）。

- `gh pr comment <PR番号> --body "@historian この 6 件の timeRange と代表点を裏どりして"` で呼ぶ
  issue コメントでも同じように起動するので、`catalog/` へ載せる前に対象表へ対して呼べる
- **起動語に `@claude` を含めない**
  `claude.yml` の `if:` が `contains(github.event.comment.body, '@claude')` なので、含む語は二本を同時に起動する
- 返るのは典拠の URL を添えた指摘までで、代表点を動かすかどうかの採否は人間が決める
  `permissions` は `claude.yml` と同じ `contents: read` である
- `timeRange` が `"untimed"` のシリーズについては、年の妥当性でなく、主題が現在まで続いているか・端を史実の年で言えないかを見る
  年を書くか `"untimed"` を置くかの線は skill `series-vocabulary` の手順 7 が持つ
- **返ってきた典拠を `docs/sources/<シリーズ id>.md` へ写す**（ファイルの型と典拠の格は `docs/sources/README.md` が持つ）
  ワークフローは `contents: read` なのでファイルを書けず、写すのは人間かセッションである
  同じ欄を二度裏どりしたときは、後の回の典拠だけを残す

歴史側への指示は **`.github/historian-prompt.md`** が全文を持つ。
役割・対象・典拠の規則・報告の書式・実行の制約の 5 節で、直すのはこのファイルである。
ワークフローは `--append-system-prompt-file` でこれを渡すだけなので、YAML の側に指示は書かれていない。

**渡すのは default branch の版に固定してある。**
`claude-code-action` は open PR のとき PR ブランチへ checkout し直すので、作業ディレクトリのファイルを直に指すと PR が歴史側の指示そのものを書き換えられる。
checkout の前に `RUNNER_TEMP` へ写してから渡している。

## 3. 実行環境

手元（native fs）とリモート（Claude Code on the web）の二つで走る。差は次のとおり。

| | 手元 | リモート |
|---|---|---|
| GitHub への到達 | 到達する | セッションによっては到達しない。issue の登録・状態更新は手元で回す |
| 外向き通信 | 制限なし | **許可制**（§4） |
| commit の committer | 人間名義 | コンテナの名義のまま（署名が強制される）。author だけ人間名義へ焼く |
| 環境の準備 | 不要 | `.claude/hooks/session-start.sh` が mise とランタイムと依存を入れ、shims の PATH をセッションへ渡す（依存は `web/` で） |
| ランタイムの活性化 | シェルが mise を活性化している | フックが渡した PATH で効く（下記） |

`session-start.sh` は `CLAUDE_CODE_REMOTE` で囲ってあるので手元では即 exit する。
`GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` はクラウド環境の環境変数欄が持ち、
未設定ならフックがセッションを立てずに止める。

リモートのシェルは mise を活性化しないので、**フックが shims の PATH を `CLAUDE_ENV_FILE` へ渡す**。
渡さないと `pnpm check` はイメージ同梱の node と pnpm で走り、`mise.toml` の固定が手元とも CI とも揃わない（このとき緑になっても、それは別の版で緑になったという意味しかない）。
渡し口はこの追記専用ファイルの一つだけで、フックが自分の PATH を書き換えても子プロセスの外へは出ない。
**効くのは次のセッションから**なので、フックを直した回では確かめられない。
確かめるのは `node -v` と `pnpm -v` が `mise.toml` の固定と一致するか。

## 4. コンテナの外向き通信

リモートのコンテナは外向き通信が許可制で、**環境側から塞ぐ手段が無い**。
このリポジトリが引き受けている手元との差は次の4件で、いずれも**リモートでは未検証**である。

- **`mise.run`** — 出られないので、フックは mise を npm から入れる
  mise が要るのは、`mise.toml` が固定した node と pnpm を立てるためである（§3）
- **`https://tiles.openfreemap.org`** — ベースマップのタイル。ブラウザプレビューから引く先
  出られなければ地図の見た目はリモートで確認できない
- **`https://anchor.fm/...`** — RSS（`pnpm sync` の取得先）。出られなければ同期スクリプトはリモートで動かない
- **Playwright の配信元** — L4 のスモークが立てる Chromium のバイナリ
  出られなければブラウザを入れられず、リモートでは `pnpm check` がスモークで落ちる

## 5. 設定の置き場

| 置き場 | 持つもの |
|---|---|
| `.claude/settings.json` | 権限（`permissions`）・`SessionStart` の配線 |
| `.claude/hooks/session-start.sh` | リモートの環境準備（mise の導入・ランタイム・依存・shims の PATH の受け渡し） |
| `.claude/hooks/guard-force-push.sh` | force push 系を ask へ回す PreToolUse フック |
| `.githooks/commit-msg` | コミット本文の禁止語を commit の前で止める git フック |
| `.githooks/pre-commit` | ステージした追加行の禁止語を、コミットを止めずに報告する git フック |
| `scripts/lint-vocabulary.sh` | 禁止語の検査器。git の追加行・コミット本文・PR 本文を見る |
| `.github/workflows/lint-pr-body.yml` | PR 本文の禁止語を CI で報告する |
| `.vocabulary/banned.tsv` | 禁止語の一覧。`.claude/rules/writing.md` の表の写しで、2 本の検査が読む |
| `.vocabulary/allow` | このリポジトリが定義して使う名前で、禁止語の検査から外すもの（1 行 1 語） |
| クラウド環境の環境変数欄 | `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL`（リポジトリに置けない名義） |
| `.claude/skills/` | 同梱の規約 skill。プラグインを入れていないので本体を置いてある。`karpathy-guidelines` は外部由来（出所 https://github.com/multica-ai/andrej-karpathy-skills の `skills/karpathy-guidelines/SKILL.md`、固定 2c60614、MIT。上流の更新は手で取り込む） |
| `mise.toml`（ルート） | `[tools]` のみ。ランタイム版の固定。`mise-action` もルートで読む |
| `web/package.json` | `pnpm check` を含む scripts |

リモートで効かせたい設定はリポジトリに置く。
名義のようにリポジトリへ置けないものだけがクラウド環境の環境変数欄へ行く。

`.githooks/` のフックは git の既定の `.git/hooks/` に無いので、クローンごとに `git config core.hooksPath .githooks` で有効にする。
リモートでは `session-start.sh` がこの設定を入れる。

## 6. 意図的にやらないこと

- **E2E で地図の絵を検証しない**。ヘッドレスでも描画そのものは出るが、絵を判定するには
  実タイルかそのフィクスチャが要る。L4 が守るのは配信物が自足していることまでで、
  見た目は人間の目視に残す
- **実 API を自動テストで叩かない**。RSS もタイルサーバも外部の可用性に依存するので、
  テストが外部の都合で赤くなる。取得層はフィクスチャで検証する
  L4 のスモークも同じで、タイルサーバへの通信は遮断してスタイルだけを合成のもので返す
  到達テストはこの規則の対象外とする
  検証の対象が配信された実物そのものなので、配信された実物へ到達できないことは外部の都合ではなく、この検査が検出したい事故そのものに当たる
- **`claude.yml` の `on:` を絞らない**
  起動の絞りは job 側の `if:` の一本で、`on:` を絞らない理由は [ADR-0010](adr/0010-gh-review-trigger-narrowing.md) が持つ
  run 一覧に `skipped` が並ぶのは正常なので、異常と読んで調べ直さない
