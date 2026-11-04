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
入れるのは §3 の準備（`pnpm exec playwright install chromium`）である。

- **赤のままコミットしない。** 回し方は「`pnpm check` → 緑ならコミット」
- 口を増やさない。切り分けのために個別スクリプトを単体で叩くのは構わないが、
  「これが緑なら閉じてよい」と言えるのは `pnpm check` だけ
- 機械判定を `pnpm check` の一本にする理由は [ADR-20260914-pnpm-check-current-form（判定を `pnpm check` の一本にする）](adr/20260914-pnpm-check-current-form.md) が持つ
- CI も同じ一本を回す（`.github/workflows/check.yml`）

ランタイムの版は `mise.toml` の `[tools]` が固定する（node / pnpm）。
固定を立てずに走らせると、手元と CI と意味が揃わない。

タスクは `web/package.json` の scripts が持つので、打つ場所も `web/` の中である。
`mise.toml` はルートに残って `[tools]` だけを持ち、`run = "pnpm check"` の薄いラッパは置かない。

### 到達テスト

**到達テストは、`deploy.yml` の deploy ジョブが配信の直後にページを一度取得し、HTML の `src`・`href` 属性に書かれたパスへ到達できるかを検証する。**
ブラウザは立てない。
検証の範囲と L4 との分担を決めた理由は [ADR-20260907-post-deploy-reachability（配信の直後の到達テスト）](adr/20260907-post-deploy-reachability.md) が持つ。

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
裏どりは三本目のワークフロー（`claude-history-review.yml`）が担い、コードのレビューとは別の起動語で呼ぶ（分ける理由は [ADR-20260909-history-review-lane（歴史の裏どりのワークフロー）](adr/20260909-history-review-lane.md)）。

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
| GitHub への到達 | `gh` で到達する | MCP の GitHub ツールで issue と PR を扱い、`gh api` の REST を予備にする。`gh` の GraphQL はプロキシが遮断するので、`gh pr` と `gh issue` の多くは HTTP 403 になる |
| 外向き通信 | 制限なし | **許可制**（§4） |
| commit の committer | 人間名義 | コンテナの名義のまま（署名が強制される）。author だけ人間名義へ焼く |
| 環境の準備（スナップショット） | 無し | クラウド環境のセットアップスクリプト欄が `scripts/cloud-snapshot.sh` を呼び、mise・ランタイム・依存・ブラウザを入れる |
| 環境の準備（セッションごと） | `.claude/hooks/session-start.sh` が `scripts/setup.sh` を呼ぶ | `.claude/hooks/session-start.sh` が `scripts/cloud-session.sh`（名義と mise の検査・shims の PATH の受け渡し）と `scripts/setup.sh` を順に呼ぶ |
| ランタイムの活性化 | シェルが mise を活性化している | フックが渡した PATH で効く（下記） |

`session-start.sh` は `CLAUDE_CODE_REMOTE` で手元とリモートを分ける振り分けだけを持つ。
手元では `scripts/setup.sh` が途中で止まってもセッションを立て、リモートではどちらかのスクリプトが失敗したらセッションを止める。
デスクトップアプリの worktree セッションでは `CLAUDE_PROJECT_DIR` が本体を指すので、フックは標準入力の JSON の `cwd` が属する作業ツリーのスクリプトを呼ぶ。
フックの本文は本体のチェックアウトの版が走るので、フックの修正が worktree セッションに効くのは main へ取り込んだ後からである。
`GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` はクラウド環境の環境変数欄が持ち、未設定なら `scripts/cloud-session.sh` が残りの準備をせずに止める。
セットアップスクリプト欄はクラウド環境の環境変数が入る前に走るので、名義の検査はセッションごとの側が持つ。
mise が無いときも `scripts/cloud-session.sh` は止まり、`/root/coten-atlas-setup.log` に欄の段ごとの成否が残る。

リモートのシェルは mise を活性化しないので、**`scripts/cloud-session.sh` が shims の PATH を `CLAUDE_ENV_FILE` へ渡す**。
渡さないと `pnpm check` はイメージ同梱の node と pnpm で走り、`mise.toml` の固定が手元とも CI とも揃わない（このとき緑になっても、それは別の版で緑になったという意味しかない）。
セッションのシェルへ渡せるのはこの追記専用ファイルの一つだけで、フックが自分の PATH を書き換えても子プロセスの外へは出ない。
**効くのは次のセッションから**なので、フックを直した回では確かめられない。
確かめるのは `node -v` と `pnpm -v` が `mise.toml` の固定と一致するか。

### 揃えるもの

手元（リポジトリ本体と worktree）・リモート・CI は、次の同じものを揃えてから `pnpm check` を回す。
手元の準備は何度走らせても同じ状態に落ち着き、人間はリポジトリのルートで `bash scripts/setup.sh` を叩けば同じものが揃う。

| 揃えるもの | 正 | 手元 | リモート | CI |
|---|---|---|---|---|
| git のフックの向き先（相対の `.githooks`） | `.githooks/` | `scripts/setup.sh` | `scripts/setup.sh` | 揃えない |
| ランタイム | `mise.toml` | `scripts/setup.sh` | `scripts/cloud-snapshot.sh`・`scripts/setup.sh` | `mise-action` |
| 依存 | `web/pnpm-lock.yaml` | `scripts/setup.sh` | `scripts/cloud-snapshot.sh`・`scripts/setup.sh` | `check.yml` |
| pnpm の store の置き場 | `web/pnpm-workspace.yaml` の `storeDir` | pnpm が読む | pnpm が読む | pnpm が読む |
| smoke テストのブラウザ | `web/pnpm-lock.yaml` の `@playwright/test` の版 | `scripts/setup.sh` | `scripts/cloud-snapshot.sh`（§4） | `check.yml` |

`core.hooksPath` を絶対パスにすると、worktree の `.githooks` を直しても本体の版が走る。
worktree ごとの設定（`extensions.worktreeConfig`）に残った値は共有の設定より優先されるので、`scripts/setup.sh` は先にそれを消す。

pnpm の既定の store は OS と版で変わるので、本体と worktree が違う store から依存を張ると、`pnpm install` と `pnpm exec` の前の依存の検査が `ERR_PNPM_UNEXPECTED_STORE` で止まる。
`.npmrc` の `store-dir` は pnpm 11 では効かず、`web/pnpm-workspace.yaml` の `storeDir` が効く。

## 4. コンテナの外向き通信

リモートのコンテナは外向き通信が許可制で、許可するドメインはクラウド環境のネットワーク設定が持つ。
設定は「カスタム」で既定のリストを含め、下の表の「足す」の行を加える。

| 先 | 許可 | 使う場面 |
|---|---|---|
| `registry.npmjs.org` | 既定のリストにある | mise 本体と依存の取得 |
| `cdn.playwright.dev` | 足す | smoke テストのブラウザの取得 |
| `anchor.fm` | 足す | `pnpm sync` が RSS を取得する（`web/scripts/sync-feed.ts`） |
| `tiles.openfreemap.org` | 足す | ベースマップのスタイルとタイル（`web/src/lib/map/config.ts`）。ブラウザで地図を開くときに取得する |
| `open.spotify.com`・`coten.co.jp` | 足す | 画面のリンク先。コンテナのブラウザでリンクを押し、遷移先が開くかを確かめるときに取得する |
| `mise.run` | 足さない | mise は npm から入れるので要らない |
| `mise-versions.jdx.dev` | 足さない | 届かなくても `mise install` は別の経路で版の一覧を取得する |

## 5. 設定の置き場

| 置き場 | 持つもの |
|---|---|
| `.claude/settings.json` | 権限（`permissions`。各規則の理由は下の「権限の規則」）・PreToolUse と `SessionStart` の配線 |
| `.claude/hooks/session-start.sh` | 実行環境を見分けて準備のスクリプトを呼ぶ順 |
| `scripts/cloud-session.sh` | リモートのセッションごとの準備のうちクラウドでだけ要る分（名義と mise の検査・shims の PATH の受け渡し） |
| `scripts/cloud-snapshot.sh` | リモートのスナップショットに残す準備（mise の版・ランタイム・依存・smoke テストのブラウザ） |
| `scripts/setup.sh` | どの実行環境でも要る環境準備（§3「揃えるもの」） |
| `web/pnpm-workspace.yaml` | pnpm の store の置き場（`storeDir`） |
| `.claude/hooks/guard-force-push.sh` | force push 系を ask へ回す PreToolUse フック |
| `.claude/hooks/guard-gh-api.sh` | `gh api` の戻せない書き込みを ask へ回す PreToolUse フック |
| `.githooks/commit-msg` | コミット本文の禁止語を commit の前で止める git フック |
| `.githooks/pre-commit` | ステージした追加行の禁止語を、コミットを止めずに報告する git フック |
| `scripts/lint-vocabulary.sh` | 禁止語の検査器。git の追加行・コミット本文・PR 本文を見る |
| `.github/workflows/lint-pr-body.yml` | PR 本文の禁止語を CI で報告する |
| `scripts/diff-coding-standards.sh` | 規約の写しと共有の雛形の差を、手で走らせて報告する |
| `.vocabulary/banned.tsv` | 禁止語の検査が読む、`.claude/rules/writing.md` の表の写し |
| `.vocabulary/allow` | このリポジトリが定義して使う名前で、禁止語の検査から外すもの（1 行 1 語） |
| クラウド環境の環境変数欄 | `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL`（リポジトリに置けない名義） |
| クラウド環境のセットアップスクリプト欄 | `bash /home/user/coten-atlas/scripts/cloud-snapshot.sh` の一行 |
| クラウド環境のネットワーク設定 | 許可ドメイン（§4） |
| `.claude/skills/` | 同梱の規約 skill。プラグインを入れていないので本体を置いてある。`karpathy-guidelines` は外部由来（出所 https://github.com/multica-ai/andrej-karpathy-skills の `skills/karpathy-guidelines/SKILL.md`、固定 2c60614、MIT。上流の更新は手で取り込む） |
| `mise.toml`（ルート） | `[tools]` のみ。ランタイム版の固定。`mise-action` もルートで読む |
| `web/package.json` | `pnpm check` を含む scripts |

リモートで効かせたい設定はリポジトリに置く。
クラウド環境の設定画面には、名義のようにリポジトリへ置けないものと、リポジトリのスクリプトを呼ぶ一行と許可ドメインだけを置く。
セットアップスクリプト欄の結果は、欄を設定した後に立てたセッションのスナップショットから残る。

`.githooks/` のフックは git の既定の `.git/hooks/` に無いので、クローンごとに `git config core.hooksPath .githooks` で有効にする。
どの実行環境でも `scripts/setup.sh` がこの設定を入れる。

### 権限の規則

`.claude/settings.json` の `permissions` と PreToolUse フックのうち、設定の値だけでは理由が読めないものを並べる。
どの操作を人間に訊くかの方針は `CLAUDE.md`「git」節が持つ。

- **ask の `git push --force` 系・`--delete`・`--mirror` と、`gh api` の DELETE の2パターン**
  権限のパターンは前方一致で、`git push origin --force` のようにフラグが後ろに来る語順を拾えない
  語順に依存しない判定はフックが持ち、ask の列挙はフックを外したときの下限として残す
- **フックの `if` を `Bash(git:*)`・`Bash(gh:*)` のコマンド名で絞る**
  コマンド名より細かいパターンは、`$( )` を含むコマンドでフックを起動させずに通す
- **`gh api` を allow に置き、判定を `guard-gh-api.sh` に任せる**
  `gh api` はコマンド名が一つで、前方一致では読み取りと書き込みを分けられない
  全部を ask にすると、`gh issue comment` と同じく戻せるレビューの読み取りや返信まで毎回訊かれる
  フックが訊かずに通すのは、読み取り・コメント投稿・レビュースレッドの resolve だけである
- **`pnpm check` を構成する個別のスクリプトを allow に置く**
  失敗の切り分けで単体で打つ
- **deny の `.env*` を Read と Edit で別に書く**
  読みは秘密を持つ名前だけを塞いで `.env.example` を読める側に置き、書きは `.env*` を一律に塞ぐ
  評価は deny・ask・allow の順で、狭い allow は deny を覆さないので、例外は名前の書き方で表す
  `Write(パス)` の規則は受理されるが参照されないので、書きは `Edit` で書く
- **MCP の GitHub ツールをツール名で ask と deny に置く**
  `gh` を通らないので、`gh` に設定した規則もフックも効かない
  PR と issue の本文やコメントの編集は GitHub の編集履歴から戻せるので、何も置かない

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
  起動の絞りは job 側の `if:` の一本で、`on:` を絞らない理由は [ADR-20260825-gh-review-trigger-narrowing（gh-review の起動の絞り方）](adr/20260825-gh-review-trigger-narrowing.md) が持つ
  run 一覧に `skipped` が並ぶのは正常なので、異常と読んで調べ直さない
