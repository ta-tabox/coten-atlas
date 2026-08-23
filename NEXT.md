# NEXT — coten-atlas

申し送り専用。**作業単位と状態は GitHub Issues**、順序と規約は `docs/plan.md`（地図）。
ここに内容を複製しない（複製した瞬間から腐る）。

## 人間へ渡すもの（gh-review の人間担当分）

正典は `~/vivarium/fermentary/playbooks/gh-review.md`「人間の担当分」。配線だけ済んで
**動かない状態**を「入った」と読まないために並べる。

- **Settings → General → Automatically delete head branches を有効化する**。現在 false。
  1 issue = 1 ブランチ = 1 PR で回す器なので、切らないとマージ済みブランチが溜まる
  （既定は無効で、有効化は遡及しない）
- **GitHub App のインストールと `CLAUDE_CODE_OAUTH_TOKEN` の secrets 登録**。現在 secrets は
  ゼロ件で、これが欠けている限りワークフローは起動しても認証で落ちる。陽性テストも走らせられない
- **ブランチ保護（ruleset）**。private × Free plan では REST が 403 を返すので、public 化か
  Pro への移行が先に要る
- **public 化そのもの**と、**陰性テスト用の第三者アカウント**の手当て（private のうちは
  陰性を作れないので、実地検証は public 化の後）

## 開いている issue

#1〜#6 が全て OPEN（`gh issue list`）。**#1 が他の全ての前提**——`mise run check` が実在する
までは CI も `claude.yml` の実行環境ブロックも書けない。

## 配布物の未達分（#1 で実行環境が立ってから配る）

- **coding-standards の機械層**（`biome.json`・`scripts/lint-comments.ts`・
  `tests/lint-comments.test.ts`）。前提の四つ（`.ts` を直に食える Node・`typescript` の
  devDependency・`git`・vitest）が package.json ごと未成立。正典は
  `fermentary/playbooks/coding-standards.md` 配布手順3、配線は
  `fermentary/tools/coding-standards/README.md`。**検査器とテストは対で配る**。
  配ったら一度全量を走らせ、**件数と内訳を報告してから別コミットで掃除**する
- **`claude.yml` と `check.yml`**。正典が「`claude.yml` の実行環境ブロックは `check.yml` の
  複製にする」と縛っているので、`mise.toml` と lockfile が実在してから二本まとめて書く。
  `claude-code-review.yml` は実行環境に依存しないので配布済み

## 精緻化の状態

- issue へ降りている: **S1〜S3**（#1〜#6）
- 粗いまま: S4 以降。**#6 が閉じたら次の束（S4・S5・S6）を割る**
  （正典: `fermentary/playbooks/planning.md`「精緻化はいつやるか」）

## 済んだもの

- 2026-07-14 立ち上げ。プランを `docs/plan.md` に正典化（Next.js static export + MapLibre）
- 2026-07-14 S0 完了。移設・git init・初回コミット・Cowork 化・fermentary 並置
- 2026-08-02 台帳を **issue 台帳版へ移行**。`docs/plan.md` を状態を持たない地図へ改訂し、
  S1〜S3 を issue 草稿へ精緻化。テスト = Vitest、判定の口 = `mise run check` を決定
- 2026-08-02 ラベル19枚と issue #1〜#6 を登録し、草稿を撤去
- 2026-08-22 bootstrap 配布物を正典へ追随（`chore/sync-bootstrap`）。規約の核と skill を
  現行版へ、CLAUDE.md に規約・gh-review・経緯の受け皿の入口、`.claude/settings.json` を配置。
  機械層と workflows は前提未達で見送り（上節）
- 2026-08-23 GH 基盤のうち実行環境に依存しない層を配置。PR テンプレ、`claude-code-review.yml`、
  issue テンプレの `name` を3文字以上へ修正（`作業` は2文字でテンプレート選択画面に出ていなかった）
