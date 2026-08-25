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

このセッションが `CLAUDE_CODE_REMOTE=true` なら、fermentary はマウントされていない。
**その不在は異常ではなく既定**なので、これを理由に作業を止めない。

- できる: この器の中の実装・文書。
- できない: fermentary への書き込み全般（`ATLAS.md`・`inbox`・`questions`・
  `NEXT.md` の搬送メモ）。書き込む先が無いので、やったと報告すれば嘘になる。
- 膜行きの素材が出たら、この器の `NEXT.md` へ**未搬送**として書き置く。
  次の手元セッションが膜を通して搬入する。
- commit の committer はコンテナの名義のまま置く（署名が強制されるため）。
  author は人間名義へ焼く。

環境の準備は `.claude/hooks/session-start.sh` が持つ（`CLAUDE_CODE_REMOTE` で囲ってあるので手元では即 exit する）。
名義の `GIT_AUTHOR_NAME` / `GIT_AUTHOR_EMAIL` だけはクラウド環境の環境変数欄が持ち、
未設定ならフックがセッションを立てずに止める。
振り分けの正典は `~/vivarium/fermentary/playbooks/remote-settings-placement.md`。

コンテナの外向き通信は許可制で、環境側から塞ぐ手段が無い（`fermentary/kb/claude-code-web.md`）。
この器が引き受けている非対称は次のとおりで、いずれも**リモートでは未検証**:

- `mise.run` へは出られないので、フックは mise を npm から入れる。mise が要るのは
  **ランタイム版管理のため**——`mise.toml` が固定した node と pnpm を立てないと、
  コンテナ同梱の版で `pnpm check` が走ってしまい、手元と CI と意味が揃わない
- ベースマップのタイル `https://tiles.openfreemap.org` はブラウザプレビューから引く先。
  出られなければ地図の見た目はリモートで確認できない
- RSS の `https://anchor.fm/...`（S6 の同期）も同じ。出られなければ同期スクリプトはリモートで動かない

## ツールチェーンと規約
toolchain 正典: `~/vivarium/fermentary/playbooks/toolchain.md`
（init・依存追加・環境構築の前に読む）

判定の口は **`pnpm check` の一本**（正典どおり。2026-08-26 の改定で
「タスクランナー = 器のマニフェスト」が正典になったので、これは逸脱ではない。
`package.json` は `web/` にあるので、打つ場所も `web/` の中）。

コーディング規約: @CODING.md。
**コードを書く前に**、次の二つを開く（レビューやリファクタに限らない。実装・テスト追加・
バグ修正でも同じ）。

- skill `coding-standards` — 言語固有の作法（JSDoc・import・空行）はそこの
  `languages/` にしかなく、CODING.md には載っていない
- skill `karpathy-guidelines` — 過剰実装と巻き込み変更を防ぐ振る舞いの規律。
  「変更した各行が依頼に辿れるか」で手を止める。
  この器では**プラグインを導入していない**ので、本体を `.claude/skills/` へ同梱してある。
  外部由来で、出所は https://github.com/multica-ai/andrej-karpathy-skills の
  `skills/karpathy-guidelines/SKILL.md`、固定は 2c60614（MIT）。
  上流の更新は手で取り込む

経緯（なぜそう決めたか・採らなかった案・トレードオフ）の受け皿は
`docs/plan.md` §1 決定事項。ADR は置かない——決定の数が表に収まる規模で、
別立てにすると地図と決定の二重管理になる。

GitHub 上の Claude レビュー体制: `~/vivarium/fermentary/playbooks/gh-review.md`
（ワークフローを触る前・public 化の前に読む）

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
> **封緘搬送**。手順は正典の搬送節）、どれでもなければ流す。

セッション開始時に fermentary/NEXT.md の自分宛（`[→このプロジェクト]`）搬送メモを
確認し、あれば拾って消す。宛先が自分でないメモは実行も削除も編集もしない。

**膜を触る前に正典を読む**（不変条件も追記の書式も、正典と各キュー先頭のコメントが
自己記述している）。
