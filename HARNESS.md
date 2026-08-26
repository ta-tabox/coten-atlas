# HARNESS — 検証と実行環境

何をもって「動いた」と言えるか、どこで動かすか。
**なぜ**は `VISION.md`（未作成。#41）、**どう**は `ARCHITECTURE.md`、
**順序**は `ROADMAP.md`、**決定**は `docs/adr/`。

## 1. 検証の層構造

| 層 | 何を見るか | 実体 |
|---|---|---|
| **L0 型** | 型が通るか | `tsc --noEmit` |
| **L1 静的** | 規約・書式・明らかな誤り | `biome ci .` |
| **L2 ユニット** | 関数とコンポーネントの振る舞い | `vitest run`（+ React Testing Library、jsdom） |
| **L3 ビルド** | static export が実際に吐けるか | `next build` |
| **L4 人間の目視** | 地図の見た目・スライダーの手触り・実機 | 人間が `pnpm dev` で開く |

L0〜L3 は `pnpm check` の一本にまとまっている（下記）。
**L4 は close を妨げない**——issue の完了条件は機械判定（L0〜L3）と人間の判定（L4）に
分かれており、後者が待ち行列になると前者まで止まる（`ROADMAP.md`「完了条件は二本に分ける」）。

L3 を層に持つのは static export の性質による。ビルド時にしか壊れない失敗があり、
L0〜L2 だけでは PR が緑のまま公開が落ちる。

## 2. 判定の口

**`pnpm check` の一本**。中身は L0 → L1 → L2 → L3 の順で、安いものから落とす。
アプリは `web/` 配下なので（#39）、**打つ場所も `web/` の中**。

```
cd web && pnpm check   # tsc --noEmit → biome ci . → vitest run → next build
```

- **赤のままコミットしない。** 心拍は「`pnpm check` → 緑ならコミット」
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

**これは toolchain 正典からの逸脱ではない。** 決定した 2026-08-25 の時点では正典が
「タスクランナー = mise tasks」と定めていたので逸脱として記録していたが、2026-08-26 の
改定で「タスクランナー = 器のマニフェスト」が正典になり、逸脱の状態は解消した。

### PR に付く run

`Check` と自動レビューは起動条件が違うので、push の後に待つものを取り違えない。

- **`Check`（`check.yml`）は PR への push ごとに走る**。`pull_request` にフィルタを置いていないので、md 一枚の変更でも回る
- **自動レビュー（`claude-code-review.yml`）は `opened` / `ready_for_review` / `reopened` でだけ走る**。
  push は `synchronize` なので拾わず、レビュー指摘へ対応して push しても再レビューは来ない
- **再レビューが要るなら PR コメントで `@claude` を名指しする**（起動するのは `claude.yml` の側）。
  人間が `ready_for_review` か再オープンで掛け直す手もあるが、そちらは人間の操作である

## 3. 実行環境

手元（native fs）とリモート（Claude Code on the web）の二つで走る。差は次のとおり。

| | 手元 | リモート |
|---|---|---|
| fermentary（第二マウント） | 並置されている | **マウントされていない**（`CLAUDE_CODE_REMOTE=true`） |
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

リモートのコンテナは外向き通信が許可制で、**環境側から塞ぐ手段が無い**
（`fermentary/kb/claude-code-web.md`）。この器が引き受けている非対称は次の3件で、
いずれも**リモートでは未検証**（egress の実測は人間が環境を立ててから）。

- **`mise.run`** — 出られないので、フックは mise を npm から入れる。
  mise が要るのは**ランタイム版管理のため**——`mise.toml` が固定した node と pnpm を
  立てないと、コンテナ同梱の版で `pnpm check` が走ってしまい、手元と CI と意味が揃わない
- **`https://tiles.openfreemap.org`** — ベースマップのタイル。ブラウザプレビューから引く先。
  出られなければ地図の見た目はリモートで確認できない
- **`https://anchor.fm/...`** — RSS（S6 の同期）。出られなければ同期スクリプトはリモートで動かない

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

振り分けの正典は `~/vivarium/fermentary/playbooks/remote-settings-placement.md`。

fermentary の playbook のうち、**init・依存追加・環境構築の前**に `toolchain.md` を、
**ワークフローを触る前と public 化の前**に `gh-review.md` を開く。

## 6. 意図的にやらないこと

- **E2E（Playwright）を MVP に入れない**。L3 のビルドと L4 の目視で足りる範囲に留め、
  ブラウザを立てる層は要件が出てから足す
- **実 API を自動テストで叩かない**。RSS もタイルサーバも外部の可用性に依存するので、
  テストが外部の都合で赤くなる。取得層はフィクスチャで検証する
- **`claude.yml` の `on:` を絞らない**。起動の絞りは job 側の `if:` の一本
  （[ADR-0010](docs/adr/0010-gh-review-trigger-narrowing.md)）。run 一覧に `skipped` が
  並ぶのは正常なので、異常と読んで調べ直さない
