# NEXT — coten-atlas

申し送り専用。**作業単位と状態は GitHub Issues**、順序と規約は `docs/plan.md`（地図）。
ここに内容を複製しない（複製した瞬間から腐る）。

## 人間へ渡すもの

**#8**（リポジトリ設定と GitHub App の導入）。前提が無く、**今すぐ着手できる宿題**。
これが済むまで、配布済みの `claude-code-review.yml` は起動しても認証で落ちる。

**`issues/` の草稿7本の登録**。2026-08-23 の洗い出しで出た未 issue 化分。
登録したら草稿は撤去する（2026-08-02 と同じ手順）。
このうち5本は前提が無く、#1 を待たずに着手できる。

## 開いている issue

- 実装: #1〜#6（S1〜S3）。**#1 が他の全ての前提**
- gh-review: #8（人間・通電）→ #9（Claude・`check.yml` と `claude.yml`。#1 にも依存）→
  #10（人間・public 化と実地検証）

## 配布物の未達分（#1 で実行環境が立ってから配る）

- **coding-standards の機械層**は `issues/coding-standards-machine-layer.md` へ降ろした
- gh-review のワークフロー二本は #9 へ降ろした

## issue にしなかった覚え書き（該当 issue に着手するとき拾う）

- `data/eras.json` 末尾の `end: 2030` は現在より先。スライダー右端が未来を指してよいかは #3 で決める
- 一つのエピソードが複数シリーズに跨る回（対談・番外編）と、`match` 正規表現の衝突時の優先順位。
  #3 が `themeId` を単数 nullable で固定するので、S6 の精緻化のときに突き合わせる
- モバイルでの振る舞い（全画面マップ + 下部スライダー + 左パネル）の範囲は S8 の精緻化で決める

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
  機械層と workflows は前提未達で見送り
- 2026-08-23 GH 基盤のうち実行環境に依存しない層を配置。PR テンプレ、`claude-code-review.yml`、
  issue テンプレの `name` を3文字以上へ修正（`作業` は2文字でテンプレート選択画面に出ていなかった）。
  残りは #8〜#10 へ降ろした
- 2026-08-23 未 issue 化分を洗い出し、草稿7本を `issues/` へ起草。
  内訳は配布の未達分1・実地検証2・未決定の決定4。S4 以降は精緻化の規律どおり降ろしていない
