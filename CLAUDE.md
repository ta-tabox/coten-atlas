# coten-atlas

目的: コテンラジオの各シリーズを世界地図×時系列にマッピングし、
どの場所・どの時代の話か、どのシリーズと近接するかを一望できる Web アプリを作る。
転職ポートフォリオ（coten-career と接続）として公開する。
ポートフォリオとして見せられる品質に届くまで作り、その基準（完了条件の閾値）は `docs/ROADMAP.md` が持つ。
恒久運用を前提にした造りにしない。

## git
このリポジトリは**ソフトウェアとして公開する**（粒度と文体の正は `.claude/rules/writing.md`）。
- **author は人間名義**
  Claude も `-c` を付けず素の `git commit` を使う
  リモートは committer だけ Claude 名義で、直さない（名義の置き場は `docs/HARNESS.md`「設定の置き場」）
- **`Co-authored-by: Claude <noreply@anthropic.com>` を付ける**（文言は `.claude/settings.json` の `attribution`）
- **prefix は変更の型**（`feat:` `fix:` `docs:` `refactor:` `chore:` `test:`、部位を添えるなら `feat(web):`）
  プロジェクト名は名乗らない
- **push・issue の起票・コメント・close は Claude が叩いてよい**（どれも追記か、reopen で戻る）
  PR の作成とマージは、人間がそう指示したときだけ
- **戻せない操作（force push・履歴の書き換え・ブランチやタグの削除）・`gh pr merge`・`gh release` は、その都度人間に諾否を訊く**
  マージは main への push が本番デプロイや migration を起こしうるので、戻る操作に入れない
- 機械の判定は `.claude/settings.json` の `permissions`（`gh repo delete`・`gh repo edit`・`gh secret`・`gh auth` は deny）と、コマンド全文を見る `.claude/hooks/guard-force-push.sh`・`guard-gh-api.sh` が持つ
  `gh api` の読み取り・コメント投稿・レビュースレッドの resolve だけを訊かずに通す形は雛形からの逸脱で、正はこの節

## 開発ハーネス（本文は `docs/HARNESS.md`）

作業の区切りごとに `web/` で `pnpm check` を回し、**緑ならコミット**する。判定の入口はこの一本だけ。
**赤のままコミットしない**。

## 文書の層（矛盾したら上位が勝つ）

`docs/VISION.md`（なぜ。**未作成**、#41 が起こす）> `docs/ARCHITECTURE.md`（現況。理由を持たない）
> `docs/HARNESS.md`（検証・実行環境）> `docs/ROADMAP.md`（順序・完了条件の閾値）。
決定と経緯は `docs/adr/`——1決定1レコード・**追記のみ**・覆すときは supersede
（規約は同 `README.md`）。状態と作業単位は GitHub Issues。

**申し送りの層は持たない**（理由は [ADR-0025](docs/adr/0025-retire-next-md.md)）。
続きは開いている issue の一覧から拾い、構造に関わる未決は `docs/ARCHITECTURE.md` §8 が引き取る。

## 規約の入口
- 規約は `.claude/rules/`
  `writing.md` は常時、残り（`coding.md`・`layers.md`・`design.md`・`languages/*.md`）は frontmatter の `paths` に当たるファイルを Read した時点で読み込まれる
- **コードを書く前に** skill `coding-standards`（判断の例）と `karpathy-guidelines`（過剰実装と巻き込み変更の抑制）を開く
  実装・テスト追加・バグ修正・レビュー・リファクタのすべてが対象
- 隣接ファイルを読まずに新規ファイルを書くときは、先に `.claude/rules/coding.md` と該当言語の `languages/<lang>.md`（画面へ触るなら `design.md` も）を Read する
- 書き終えたら、PR の前に skill `coding-standards`「レビューで繰り返し指摘される型」の表を、変更した各コメント・名前・ファイルへ当てる
- `karpathy-guidelines` は外部由来（https://github.com/multica-ai/andrej-karpathy-skills の 2c60614、MIT）で、リモートの空のコンテナでも初回から効くよう本体を `.claude/skills/` へ同梱してある
  上流の更新は手で取り込む

## 配布物の追随

`.claude/` と `.github/workflows/` の一部、`web/tests/guard-hooks.test.ts`、`web/scripts/lint-comments.ts` と `web/tests/lint-comments.test.ts`、`scripts/lint-vocabulary.sh` と `web/tests/lint-vocabulary.test.ts` と `.githooks/` のフック、`.claude/rules/` は共有の雛形からの写しである。

- **追随は、このリポジトリの開発を再開するときにまとめてやる**
  都度の追随は打ち切ってあるので、放っておけば雛形との差は開き続ける
  実装へ触れる最初のセッションが配布手順を通し直す
- **検査器は雛形のコピーでバイト一致を保つ**
  直すときは雛形の側を先に直して配り直す
  リポジトリの側で直すと、次の追随で黙って踏み潰される
