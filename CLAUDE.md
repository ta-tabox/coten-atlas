# coten-atlas — 有期プロジェクト（terrarium）

目的: コテンラジオの各シリーズ（テーマ）を世界地図×時系列にマッピングし、
どの場所・どの時代の話か、どのテーマと近接するかを一望できる Web アプリを作る。
転職ポートフォリオ（coten-career と接続）として公開する。
完了条件の閾値は `ROADMAP.md` が持つ。
このプロジェクトは**終わる**。手仕舞いの正典は
`~/vivarium/fermentary/playbooks/terrarium.md`（収穫掃引 → _closed）。
人間が「クローズして」と言ったら、正典の手仕舞い手順を読み、Claude 側の担当分
（収穫掃引・最終コミット・ATLAS の行を closed に更新）を実行し、
人間側の残り（Cowork プロジェクトを閉じる・`_closed/` への mv）を明示して引き渡す。

## セッション開始時にやること
0. fermentary（第二マウント）が見えることを確認する（`fermentary/RULES.md` が
   読めるか）。**見えなければ作業を始めず**、人間に「fermentary が並置されていない」
   と指摘して連携を求める——並置なしのセッションは膜からも台帳からも切断されており、
   そのまま初期化すると孤児プロジェクトが生まれる
1. `NEXT.md` を見て続きを拾う
2. fermentary（第二マウント）の `NEXT.md` に自分宛の搬送メモがあれば拾う
3. fermentary の `ATLAS.md`（terrarium 節）の自行を一瞥し、status が実態と
   乖離していたら直す（初回セッション実施・MVP 到達・方針転換などの節目を反映。
   台帳はこのプロジェクトの状態を fermentary へ伝える唯一の口）

## git
署名は fermentary/RULES.md #5 に従う。この器は**ソフトウェアとして公開する**器。
- **author は人間名義**。Claude も `-c` を付けず素の `git commit` を使う
  （名義は local config に焼いてある）。責任を負うのは、そのコミットを公開すると
  決めた人間の側。
- **`Co-authored-by: Claude <noreply@anthropic.com>` を付ける**。ソフトウェアの
  利用者に対しては、AI 支援の事実を履歴に明示する。
- **メッセージ prefix は変更の型**——`feat:` `fix:` `docs:` `refactor:` `chore:`
  `test:`、部位を添えるなら `feat(web):`。**プロジェクト名は名乗らない**
  （このリポジトリが既に答えている。外の器から書き込むときも同じ型を使う）。
- **push は Claude が叩いてよい**（手元でもリモートでも）。
  判定は `.claude/settings.json` の `permissions` が持ち、素の `git push` は allow。
  **戻せない操作——force push・履歴の書き換え・ブランチやタグの削除——は、
  その都度人間に諾否を訊く**（fermentary `RULES.md` #5）。
  権限パターンは前方一致で `git push origin --force` のような語順を拾えないので、
  コマンド全文を見る `.claude/hooks/guard-force-push.sh` が ask へ回す。
  PR の作成とマージは、人間がそう指示したときだけ。

## リモートの縮退モード（Claude Code on the web）

`CLAUDE_CODE_REMOTE=true` なら fermentary はマウントされていない。
**その不在は異常ではなく既定**なので、これを理由に作業を止めない。

- できる: この器の中の実装・文書。
- できない: fermentary への書き込み全般。書き込む先が無いので、
  やったと報告すれば嘘になる。
- 膜行きの素材が出たら、**この器のファイルへは書かない**。
  次の手元セッションへそのまま渡せるプロンプトとして会話へ出し、人間がコピペで運ぶ。
  他所への依頼を器の中へ書き置くと、運び終えた後も本文が残って器が汚れる。

環境の事実は `HARNESS.md`。

## 開発ハーネス（正典: `HARNESS.md`）

心拍は `web/` で `pnpm check` を回して**緑ならコミット**。判定の口はこの一本だけ。
**赤のままコミットしない**。

## 文書の層（矛盾したら上位が勝つ）

`VISION.md`（なぜ。**未作成**、#41 が起こす）> `ARCHITECTURE.md`（現況。理由を持たない）
> `HARNESS.md`（検証・実行環境）> `ROADMAP.md`（順序・完了条件の閾値）。
決定と経緯は `docs/adr/`——1決定1レコード・**追記のみ**・覆すときは supersede
（規約は同 `README.md`）。`NEXT.md` は引き継ぎだけ。状態と作業単位は GitHub Issues。

**コードを書く前に** @CODING.md と skill `coding-standards` / `karpathy-guidelines` を開く
（レビューやリファクタに限らない。言語固有の作法は skill の `languages/` のみ）。

fermentary の playbook をいつ開くか（`toolchain.md` / `planning.md` / `gh-review.md`）は
`HARNESS.md`「設定の置き場」と `ROADMAP.md`「進め方の横断規約」が持つ。

## 知識区分の膜（正典: ~/vivarium/fermentary/playbooks/membrane.md）

このプロジェクトも vivarium 共通の膜に従う。一行判定:

> 事実の参照ならこのプロジェクトの kb/stock、言い切れる抽象なら
> fermentary/memory/inbox.md、開いた問いなら fermentary/memory/questions.md、
> 別領域行きなら fermentary/NEXT.md に搬送メモ（本文が数行に収まらないなら
> **封緘搬送**。手順は正典の搬送節）、どれでもなければ流す。

セッション開始時に fermentary/NEXT.md の自分宛（`[→このプロジェクト]`）搬送メモを
確認し、あれば拾って消す。宛先が自分でないメモは実行も削除も編集もしない。

**膜を触る前に正典を読む**（不変条件も追記の書式も、正典と各キュー先頭のコメントが
自己記述している）。
