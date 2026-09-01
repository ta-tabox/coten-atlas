# HARNESS — 検証と実行環境

何をもって「動いた」と言えるか、どこで動かすか。
**なぜ**は `VISION.md`（未作成。#41）、**どう**は `ARCHITECTURE.md`、
**順序**は `ROADMAP.md`、**決定**は `docs/adr/`。

## 1. 検証の層構造

| 層 | 何を見るか | 実体 |
|---|---|---|
| **L0 型** | 型が通るか | `tsc --noEmit` |
| **L1 静的** | 規約・書式・明らかな誤り | `biome ci .` |
| **L2 ユニット** | 関数とコンポーネントの振る舞いと、`data/` の現物がスキーマに合うか | `vitest run`（+ React Testing Library、jsdom） |
| **L3 ビルド** | static export が実際に吐けるか | `next build` |
| **L4 スモーク** | 静的成果物が自足しているか（4xx・実行時エラー・canvas の寸法） | ヘッドレスの Chromium で `out/` を開く（`playwright test`） |
| **人間の目視** | 地図の見た目・スライダーの手触り・実機 | 人間が `pnpm dev` で開く |

L0〜L4 は `pnpm check` の一本にまとまっている（下記）。
番号が指すのはこの連鎖の中の位置で、安い順に並んでいる。

**人間の目視は番号を持たない。** 連鎖に居らず、close も妨げないので、番号を与えると連鎖の続きに見える。
機械層が増えるたびに末尾がずれて、他の文書からの参照も一緒に腐る。
issue の完了条件は機械判定（`pnpm check`）と人間の判定に分かれており、後者が待ち行列になると前者まで止まる（`ROADMAP.md`「完了条件は二本に分ける」）。

[ADR-0014](docs/adr/0014-e2e-offline-smoke.md) は人間の目視を L5 と呼んでいる。
ADR は追記のみで本文を書き換えないので、決定した時点の呼び名がそのまま残る（`docs/adr/README.md` の規約 4）。

`data/` の検査が L2 に居るのは、検査器が `web/src/lib/schema/` の zod スキーマそのもので、それを保証するのが同じ層の反例テストだから。
層を分けると、赤が出たときに「データが壊れている」のか「スキーマが壊れている」のかを人間が切り分けることになる。
型検査は `data/` を見ない（`tsconfig.json` の `include` が `web/` 配下しか見ない）ので、ここで拾わないとどの層にも掛からない。
`data/` の検査は `web/tests/data.test.ts` で、ファイル名が `*.test.ts` なので `pnpm test` が拾う。
足すと同じ検査が二度走るので、連鎖へ別の段としては足さない。
`pnpm validate:data` はその 1 本だけを名指す切り分け用で、「これが緑なら閉じてよい」と言えるのは変わらず `pnpm check` だけである。

L3 を層に持つのは static export の性質による。ビルド時にしか壊れない失敗があり、
L0〜L2 だけでは PR が緑のまま公開が落ちる。

L4 を層に持つのは、L3 までがどれも「配信物へ実際に到達できるか」を見ないため。
ビルドが通っても worker やアセットが 404 になり、地図だけが描画されない形が実際に起きた
（PR #60。決定は [ADR-0014](docs/adr/0014-e2e-offline-smoke.md)）。
守らせるのは自足の一点で、外部への通信は遮断する。

## 2. 判定の口

**`pnpm check` の一本**。中身は L0 → L1 → L2 → L3 → L4 の順で、安いものから落とす。
アプリは `web/` 配下なので（#39）、**打つ場所も `web/` の中**。

```
cd web && pnpm check   # tsc --noEmit → biome ci . → vitest run → next build → smoke
```

L4 のスモークが連鎖の末尾に居るのは、判定の対象が `next build` の出力だから。
その前には置けない。
ブラウザを立てるのは L4 だけで、回すのは Playwright である（[ADR-0016](docs/adr/0016-playwright-runner.md)）。
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
- 決定と理由は [ADR-0009](docs/adr/0009-pnpm-check.md)（[ADR-0002](docs/adr/0002-mise-run-check.md) を supersede）
- CI も同じ一本を回す（`.github/workflows/check.yml`）

ランタイムの版は `mise.toml` の `[tools]` が固定する（node / pnpm）。
固定を立てずに走らせると、手元と CI と意味が揃わない。

タスクは `package.json` の scripts が持つ（その `package.json` は `web/` にあるので、
打つ場所も `web/` の中）。`mise.toml` はルートに残って `[tools]` だけを持ち、
`run = "pnpm check"` の薄いラッパは置かない——口が一本に見えて二本ある状態が、
そもそも避けようとしたもの。理由と範囲は ADR-0009。

**これは踏襲元の既定からの逸脱ではない。** 決定した 2026-08-25 の時点では既定が
「タスクランナー = mise tasks」だったので逸脱として記録していたが、2026-08-26 の
改定で「タスクランナー = その言語のマニフェスト」へ変わり、逸脱の状態は解消した。

### PR に付く run

`Check` と自動レビューは起動条件が違うので、push の後に待つものを取り違えない。

- **`Check`（`check.yml`）は PR への push ごとに走る**。`pull_request` にフィルタを置いていないので、md 一枚の変更でも回る
- **自動レビュー（`claude-code-review.yml`）は `opened` / `ready_for_review` / `reopened` でだけ走る**。
  push は `synchronize` なので拾わず、レビュー指摘へ対応して push しても再レビューは来ない
- **再レビューが要るなら PR コメントで `@claude` を名指しする**（起動するのは `claude.yml` の側）。
  人間が `ready_for_review` か再オープンで掛け直す手もあるが、そちらは人間の操作である

### レビューを掛け直す

自動レビューが走るのは PR を開いた回だけなので、指摘へ対応した後の再レビューは自分で起こす。

1. 指摘を読み、同意できるものを直す。
   指摘は決定ではないので、同意できないものは直さず根拠を添えて返信する
2. 指摘ごとに関心が違えばコミットを分けて push し、各インラインコメントへ返信する（返信は push の後）
3. `gh pr comment <PR番号> --body "@claude ..."` で掛け直す。
   何を直したかと、どこを見てほしいかを書く
4. 完了は `gh run watch <run-id>` を**バックグラウンドで**待つ。
   終了時に呼び戻されるので、状態を繰り返し叩くループを書かない
5. 新しい指摘があれば 1 へ戻る。
   上限は2周で、3周目に入るなら収束していないことを人間へ報告して判断を仰ぐ

`claude.yml` の `permissions` は `contents: read` である。
Actions 経由の Claude はコメントしか残せないので、レビューへ「直しておいて」と投げても直らない。
修正を書くのは常にセッションの側になる。

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
このリポジトリが引き受けている手元との差は次の4件で、
いずれも**リモートでは未検証**（egress の実測は人間が環境を立ててから）。

- **`mise.run`** — 出られないので、フックは mise を npm から入れる。
  mise が要るのは**ランタイム版管理のため**——`mise.toml` が固定した node と pnpm を
  立てないと、コンテナ同梱の版で `pnpm check` が走ってしまい、手元と CI と意味が揃わない
- **`https://tiles.openfreemap.org`** — ベースマップのタイル。ブラウザプレビューから引く先。
  出られなければ地図の見た目はリモートで確認できない
- **`https://anchor.fm/...`** — RSS（S6 の同期）。出られなければ同期スクリプトはリモートで動かない
- **Playwright の配信元** — L4 のスモークが立てる Chromium のバイナリ。
  出られなければブラウザを入れられず、リモートでは `pnpm check` がスモークで落ちる

## 5. 設定の置き場

| 置き場 | 持つもの |
|---|---|
| `.claude/settings.json` | 権限（`permissions`）・`SessionStart` の配線 |
| `.claude/hooks/session-start.sh` | リモートの環境準備（mise の導入・ランタイム・依存・shims の PATH の受け渡し） |
| `.claude/hooks/guard-force-push.sh` | force push 系を ask へ回す PreToolUse フック |
| クラウド環境の環境変数欄 | `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL`（リポジトリに置けない名義） |
| `.claude/skills/` | 同梱の規約 skill。プラグインを入れていないので本体を置いてある。`karpathy-guidelines` は外部由来（出所 https://github.com/multica-ai/andrej-karpathy-skills の `skills/karpathy-guidelines/SKILL.md`、固定 2c60614、MIT。上流の更新は手で取り込む） |
| `mise.toml`（ルート） | `[tools]` のみ。ランタイム版の固定。`mise-action` もルートで読む |
| `web/package.json` | `pnpm check` を含む scripts |

リモートで効かせたい設定はリポジトリに置く。
名義のようにリポジトリへ置けないものだけがクラウド環境の環境変数欄へ行く。

## 6. 意図的にやらないこと

- **E2E で地図の絵を検証しない**。ヘッドレスでも描画そのものは出るが、絵を判定するには
  実タイルかそのフィクスチャが要る。L4 が守るのは配信物が自足していることまでで、
  見た目は人間の目視に残す（[ADR-0014](docs/adr/0014-e2e-offline-smoke.md)）
- **実 API を自動テストで叩かない**。RSS もタイルサーバも外部の可用性に依存するので、
  テストが外部の都合で赤くなる。取得層はフィクスチャで検証する。
  L4 のスモークも同じで、タイルサーバへの通信は遮断してスタイルだけを合成のもので返す
- **`claude.yml` の `on:` を絞らない**。起動の絞りは job 側の `if:` の一本
  （[ADR-0010](docs/adr/0010-gh-review-trigger-narrowing.md)）。run 一覧に `skipped` が
  並ぶのは正常なので、異常と読んで調べ直さない
