# NEXT — coten-atlas

申し送り専用。**作業単位と状態は GitHub Issues**、順序と規約は `docs/plan.md`（地図）。
ここに内容を複製しない（複製した瞬間から腐る）。

## 人間へ渡すもの

**#41（VISION）は冷えたセッションへ渡さない**。
あれは人間との対話が本体で、Claude が一人で埋めると要件定義の言い換えが出てくるだけになる。
対話できる場で開く。

決めたこと（本文は #39〜#42 が持つ。ここは索引）:

- 文書を**五層**へ割る。`VISION.md`（なぜ）> `ARCHITECTURE.md`（どう）> `HARNESS.md`（検証）> `ROADMAP.md`（順序）、経緯と決定は `docs/adr/`
- `docs/plan.md` は**撤去**する。地図はルートの `ROADMAP.md` へ（公開する器ではルートの `ls` が目次として働く）
- **ADR を導入する**（#40）。`CLAUDE.md` の「ADR は置かない」は逆へ書き直す。
  1決定1レコード・追記のみ・覆すときは書き換えず supersede
- アプリ本体を **`web/` サブディレクトリ**へ移す（#39。ルートは器の文書と運用設定に空ける）
- `CODING.md` は toiito 版が4点先行しているが、**雛形の更新を待ってから**追随する（#42。器の側だけ直すと雛形が三世代目の遅れになる）

文書の割り方について: 最初は文書1枚 = issue 1枚で7件に割ったが、完了条件が
「ファイルが存在し N 節を持つ」しか出せず、**判定で割れなかった分を成果物の境界で代用していた**ので #40 の1枚へ畳んだ。
issue 台帳の三つの理由（並行マシンからの状態更新・機械的な完了確定・公開時の開発ログ）のうち、
散文の移設に効くのは三つ目だけで、それは本文の厚い issue 1枚でも果たせる。
#39 と #41 を畳まなかったのは、前者が**ビルドを壊しうる**（CI 赤が散文の編集を人質に取る）、
後者が**人間待ちで閉じられない単位**になるから。

**fermentary へ搬送済み**（`fermentary/NEXT.md` の4行。宛先は fermentary なのでこちらから実行しない）:
配布型の規約に逆流の経路を作る ／ ADR の playbook と雛形を新設する ／ terrarium の器の骨格を雛形化する ／
gh-review.md に run の不在を先に疑う一行を足すか諮る。
概念側は `fermentary/memory/inbox.md` 2026-08-25「コピー配布された規約は、逆流の経路を持たない限り…」。

**#14 は実体が済んでいるのに open のまま**。
ベースマップの決定は PR #20 で `docs/plan.md` §1 に入っている。
閉じ忘れかどうかを見て閉じる。

**#16**（テーマの近接を UI 要件として決める）は PR #22 がレビュー待ち。

**#10**（public 化と実地検証）は #9 の後。gh-review 二系統（PR 自動レビュー・`@claude` 対話）とも
陽性テスト済みなので、着手できる状態にある。

## 開いている issue

- 実装: #2〜#6（S1〜S3）。**#1 が閉じたので #2 から着手できる**
- 実装（先に降りた束）: #27（S6・RSS 同期）／ #26（S8・GitHub Pages 配信）
- **器の構成（2026-08-25 登録）**: #39（web/ 移設）／ #40（文書を五層へ・中は4コミット）／
  #41（VISION・人間との対話が本体）／ #42（CODING.md 追随・fermentary 待ちで blocked）。
  **#39 と #40 は並行可**——触るファイルが交差しない（前者はビルド設定と `src/`、後者は散文）。
  ただし #40 のコミット2「ディレクトリ構造」節は #39 の結果を書くので、**先にマージされた側に後がついていく**
- gh-review: #10（人間・public 化と実地検証）
- 検証と決定: #14・#16（人間）。#19（Claude・#3 依存）／ #25（Claude・引用と出典の反映）
- 配布の未達分: #18（Claude・#1 の前提は解けた）

## 配布物の未達分（#1 が閉じて前提は解けた）

- **coding-standards の機械層**は #18 へ降ろした

## issue にしなかった覚え書き（該当 issue に着手するとき拾う）

- `data/eras.json` 末尾の `end: 2030` は現在より先。スライダー右端が未来を指してよいかは #3 で決める
- 一つのエピソードが複数シリーズに跨る回（対談・番外編）と、`match` 正規表現の衝突時の優先順位。
  #3 が `themeId` を単数 nullable で固定するので、S6 の精緻化のときに突き合わせる
- モバイルでの振る舞い（全画面マップ + 下部スライダー + 左パネル）の範囲は S8 の精緻化で決める

## 精緻化の状態

- issue へ降りている: **S1〜S3**（#2〜#6）・**S6**（#27）・**S8**（#26）
- 粗いまま: **S4・S5・S7**、および任意課題の S9。
  **#6 が閉じたら次の束（S4・S5）を割る**（正典: `fermentary/playbooks/planning.md`「精緻化はいつやるか」）。
  S7 を割る単位は `docs/plan.md` §5 の分割規約が持つ

## 済んだもの

- 2026-07-14 立ち上げ。プランを `docs/plan.md` に正典化（Next.js static export + MapLibre）
- 2026-07-14 S0 完了。移設・git init・初回コミット・Cowork 化・fermentary 並置
- 2026-08-02 台帳を **issue 台帳版へ移行**。`docs/plan.md` を状態を持たない地図へ改訂し、
  S1〜S3 を issue 草稿へ精緻化。テスト = Vitest、判定の口 = `mise run check` を決定
- 2026-08-02 ラベル19枚と issue #1〜#6 を登録し、草稿を撤去
- 2026-08-22 bootstrap 配布物を正典へ追随（`chore/sync-bootstrap`）。規約の核と skill を
  現行版へ、CLAUDE.md に規約・gh-review・経緯の受け皿の入口、`.claude/settings.json` を配置。
  機械層と workflows は前提未達で見送り
- 2026-08-23 GH 基盤のうち実行環境に依存しない層を配置。PR テンプレ、`claude-code-review.yml`、
  issue テンプレの `name` を3文字以上へ修正（`作業` は2文字でテンプレート選択画面に出ていなかった）。
  残りは #8〜#10 へ降ろした
- 2026-08-23 未 issue 化分を洗い出し、#13〜#19 を登録して草稿を撤去。
  内訳は実地検証2・未決定の決定4・配布の未達分1。S4 以降は精緻化の規律どおり降ろしていない
- 2026-08-25 S1 の足場が立った（#1・PR #30）。
  Next.js 16 の static export、Biome、Vitest。
  判定の口は一本（当初 `mise run check`。2026-08-25 に `pnpm check` へ移した。下記）で、
  ランタイムは `mise.toml` が node 24 / pnpm 11.21.0 に固定する。
  `basePath` が dev にも効くので、開発サーバで開くのは `/coten-atlas`（`/` は 404）
- 2026-08-25 リモート実行（Claude Code on the web）の設定を配置。
  `.claude/hooks/session-start.sh`（`CLAUDE_CODE_REMOTE` の門 + `require_git_author` + mise の導入）と
  `settings.json` の `SessionStart` 配線、`CLAUDE.md` へ縮退モードのブロック。
  mise は `mise.run` へ出られないので npm から入れる（ランタイム版をリモートでも
  `mise.toml` の固定へ揃えるため。2026-08-25 に理由文を実態へ直した）。**リモートでは未検証**——egress の実測は人間が環境を立ててから
- 2026-08-25 #8 完了・クローズ。`/install-github-app` で GitHub App 導入と
  `CLAUDE_CODE_OAUTH_TOKEN` の secrets 登録が済んだ。`/install-github-app` は
  ワークフロー変更を PR #34 として main へ直接マージしており、副作用として `claude-code-review.yml` が
  GitHub 公式のデフォルト生成物へ上書きされ、`claude.yml`（`@claude` 対話用）が新規に届いた。
  この生成物は `gh-review.md` の契約から複数逸脱している——`issues` トリガを持つ、
  `author_association` の絞りが無い、`pull_request` 経路が fork を絞っていない、
  `timeout-minutes` と `concurrency: cancel-in-progress: false` が無い、
  `claude.yml` の `allowed-tools` が無指定。**#9 で埋める**
- 2026-08-25 #9 完了・クローズ（PR #35, #36）。`claude.yml` / `claude-code-review.yml` を
  fermentary の雛形（`author_association` 絞り・fork 絞り・`timeout-minutes`・`concurrency`
  非対称・`allowed-tools` 名指しを含む契約準拠版）へ置き換え、`check.yml`（`mise run check`
  一本を CI の判定口にする）を新規追加した。
  陽性テストの過程で `claude-code-action` 側の既知のリグレッション（native installer が
  `~/.local/bin` 不在時に「missing or broken」と警告しつつ success を騙り、後続の SDK 実行が
  ENOENT で落ちる。upstream `anthropics/claude-code-action#1290` と同種、2026-05 にも一度発生し
  再発した）を実測（rerun でも再現し一過性ではないことを確認）。PR #36 で `mkdir -p ~/.local/bin`
  を対処として追加し、issue #9 のコメントで `@claude` を呼ぶ陽性テストが success で通ることを確認した。
  upstream は 2026-08-25 時点でまだ open のため、この対処は当面残す
  （upstream が直ってから外す作業は fermentary へ還すかは未定）
- 2026-08-25 **判定の口を mise tasks から pnpm scripts へ移した**。`pnpm check` の一本
  （`tsc --noEmit` → `biome ci .` → `vitest run` → `next build`。static export は
  ビルド時にしか壊れない失敗を持つので `next build` を口に含める）。`mise.toml` は
  `[tools]` だけを持つ。薄いラッパの mise task も置かない。
  波及先は package.json / mise.toml / CI 二本 / settings.json / session-start.sh /
  CLAUDE.md / docs/plan.md §1・§0・§4・§5 / PR・issue テンプレ / NEXT.md。
  toolchain 正典（タスクランナー = mise tasks）からの逸脱は CLAUDE.md に記録し、
  正典の改定は fermentary/NEXT.md へ諮ってある。
  **これ以前の記録に出てくる `mise run check` / `mise run sync` は読み替える**
  CI（PR #38）は最初 run が一つも作られなかった。
  原因は `check.yml` ではなく main との競合。
  枝分かれした後に PR #22 が `docs/plan.md` を触ったので PR が `dirty` になり、
  GitHub が `refs/pull/38/merge` を作れず `pull_request` トリガが起動しない。
  main を取り込み、S5（#22 の近接の三つ）と S6（`pnpm sync`）の双方を残す形で競合を解いた。
  `Check` run #7 が緑。
  node は `mise.toml` の固定どおり 24.19.0 で走り、`pnpm check` の四段が全て通った。
  PR 本文が「CI の緑をもって node 24 での確認とする」として保留していた分は、これで済んでいる。
  `claude-code-review.yml` は `types: [opened, ready_for_review, reopened]` なので、
  この PR では一度も起動していない（`opened` の時点で競合しており、その後の push は `synchronize`）。
  自動レビューを掛けるなら人間が `ready_for_review` か再オープンで叩く
- 2026-08-25 器の構成を toiito へ寄せる設計。文書を五層（`VISION` なぜ > `ARCHITECTURE` どう >
  `HARNESS` 検証 > `ROADMAP` 順序、決定と経緯は `docs/adr/`）へ割る・`docs/plan.md` は撤去して
  ルートの `ROADMAP.md` へ・**ADR を導入**・アプリ本体を `web/` 配下へ、を決定し #39〜#42 を登録して草稿を撤去。
  ADR を入れる直接の理由は現物にあった——`mise run check` → `pnpm check` の移設が決定表のセルを
  その場で書き換えており、旧決定の本文は git 履歴にしか残っていない（決定日は 2026-08-02 のまま中身だけ 08-25）。
  fermentary へは4件搬送（配布型の規約の逆流・ADR の playbook 新設・器の骨格の雛形化・gh-review への申し送り）
- 2026-08-25 リモートセッションの膜素材を搬入。競合した PR で run が生成されない件は
  `fermentary/kb/github-actions.md` へ事実として、契約に足すかは同 `NEXT.md` の搬送行で諮る
