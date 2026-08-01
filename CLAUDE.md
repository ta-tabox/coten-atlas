# coten-atlas — 有期プロジェクト（terrarium）

目的: コテンラジオの各シリーズ（テーマ）を世界地図×時系列にマッピングし、
どの場所・どの時代の話か、どのテーマと近接するかを一望できる Web アプリを作る。
転職ポートフォリオ（coten-career と接続）として公開する。
完了条件: 全シリーズをマッピングした地図アプリが公開 URL で動作し、
RSS 由来の新エピソード追加パイプラインが回り、README がポートフォリオとして
提示可能な状態になっている。
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
署名は fermentary/RULES.md #5 に従う。この器は**公開する**前提。
- **author は人間名義**。Claude も `-c` を付けず素の `git commit` を使う
  （名義は local config に焼いてある）。機械の痕跡は残さない——AI 支援は自明で、
  log に残すべきは責任を誰が担ったかの一点。Co-authored-by も付けない。
- **メッセージ prefix は変更の型**——`feat:` `fix:` `docs:` `refactor:` `chore:`
  `test:`、部位を添えるなら `feat(web):`。**プロジェクト名は名乗らない**
  （このリポジトリが既に答えている。外の器から書き込むときも同じ型を使う）。
- push・リモート操作は人間のみ。

## ツールチェーンと規約
toolchain 正典: `~/vivarium/fermentary/playbooks/toolchain.md`
（init・依存追加・環境構築の前に読む）

コーディング規約: @CODING.md（詳細判断は skill `coding-standards`）

## プランの正典化
1セッションに収まらない実装・構築に着手する前に
`~/vivarium/fermentary/playbooks/planning.md` を読む
（プランは `docs/plan.md` に正典化し、NEXT.md はポインタに徹する）。
本プロジェクトのプランは立ち上げ時に `docs/plan.md` へ正典化済み。

## 知識区分の膜（正典: ~/vivarium/fermentary/playbooks/membrane.md）

このプロジェクトも vivarium 共通の膜に従う。一行判定:

> 事実の参照ならこのプロジェクトの kb/stock、言い切れる抽象なら
> fermentary/memory/inbox.md、開いた問いなら fermentary/memory/questions.md、
> 別領域行きなら fermentary/NEXT.md に搬送メモ（本文が数行に収まらないなら
> **封緘搬送**——一行要約からの再生成は内容を変質させる。手順は正典の搬送節）、
> どれでもなければ流す。

セッション開始時に fermentary/NEXT.md の自分宛（`[→このプロジェクト]`）搬送メモを
確認し、あれば拾って消す。宛先が自分でないメモは実行も削除も編集もしない。

膜を触る前に正典を読む（不変条件: 本文複製禁止／昇格は人間／捕捉で git を
触らない、他）。追記の書式は各キュー先頭のコメントが自己記述している。
