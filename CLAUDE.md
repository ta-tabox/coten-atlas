# coten-atlas

目的: コテンラジオの各シリーズを世界地図×時系列にマッピングし、
どの場所・どの時代の話か、どのシリーズと近接するかを一望できる Web アプリを作る。
転職ポートフォリオ（coten-career と接続）として公開する。
完了条件の閾値は `ROADMAP.md` が持つ。
このプロジェクトは**終わる**——恒久運用を前提にした造りにしない。

## git
このリポジトリは**ソフトウェアとして公開する**。
- **author は人間名義**。Claude も `-c` を付けず素の `git commit` を使う
  （手元は local config に焼いてある。リモートはクラウド環境の `GIT_AUTHOR_*` が渡し、無ければセッション起動フックが止まる。置き場は `HARNESS.md`「設定の置き場」）。
  責任を負うのは、そのコミットを公開すると決めた人間の側。
  **リモートの `git config user.name` は Claude 名義のまま**で、これは直さない。
  コンテナが署名を強制し、その鍵が `noreply@anthropic.com` に紐づいているので、committer を人間名義にすると GitHub が Unverified を出す。
  author（責任を誰が担ったか）と committer（実際にコミットを作った者）は別の欄なので、片方を実態へ合わせても他方は動かない。
- **`Co-authored-by: Claude <noreply@anthropic.com>` を付ける**。ソフトウェアの
  利用者に対しては、AI 支援の事実を履歴に明示する。
- **メッセージ prefix は変更の型**——`feat:` `fix:` `docs:` `refactor:` `chore:`
  `test:`、部位を添えるなら `feat(web):`。**プロジェクト名は名乗らない**
  （このリポジトリが既に答えている）。
- **push は Claude が叩いてよい**（手元でもリモートでも）。
  判定は `.claude/settings.json` の `permissions` が持ち、素の `git push` は allow。
  **戻せない操作——force push・履歴の書き換え・ブランチやタグの削除——は、
  その都度人間に諾否を訊く**。
  権限パターンは前方一致で `git push origin --force` のような語順を拾えないので、
  コマンド全文を見る `.claude/hooks/guard-force-push.sh` が ask へ回す。
  PR の作成とマージは、人間がそう指示したときだけ。
- **`gh` の実行権は「戻せるか」で三層に切る**。
  読み取り・起票・コメント・close までが allow——どれも reopen や編集で戻る。
  `gh pr merge`・`gh release` は ask。
  merge を分けたのは、main への push が本番デプロイや migration を起こしうるので、戻る操作の側に入らないため。
  `gh repo delete`・`gh repo edit`・`gh secret`・`gh auth` は deny。
  承認を挟めば通る類ではなくエージェントの仕事でもないので、プロンプトごと落としてある。
  ただし deny が効くのはそのコマンド文字列にだけで、`gh api -X PATCH repos/…` は `gh repo edit` を経由せず同じ操作へ届く。
  そこを受け止めるのが `.claude/hooks/guard-gh-api.sh` である。
  `gh api` はコマンド文字列が一通りしか無く、前方一致では読み取りと書き込みを分けられないので、コマンド全文を見て戻せない書き込みだけを ask へ回す。
  素通しするのは読み取り・コメント投稿・レビュースレッドの resolve の三つで、どれも `gh issue comment` が allow なのと同じ「戻せる」層に当たる。
  雛形は `gh api` を丸ごと ask にしており、その形だとレビューの往復で読み取りまで毎回訊かれるので、**ここは全器共通の雛形から逸脱している**。
  層の基準は操作が戻せるかどうかなので、パターンの都合で層をまたいでいた分を切り直した。

## 開発ハーネス（本文は `HARNESS.md`）

作業の区切りごとに `web/` で `pnpm check` を回し、**緑ならコミット**する。判定の口はこの一本だけ。
**赤のままコミットしない**。

## 文書の層（矛盾したら上位が勝つ）

`VISION.md`（なぜ。**未作成**、#41 が起こす）> `ARCHITECTURE.md`（現況。理由を持たない）
> `HARNESS.md`（検証・実行環境）> `ROADMAP.md`（順序・完了条件の閾値）。
決定と経緯は `docs/adr/`——1決定1レコード・**追記のみ**・覆すときは supersede
（規約は同 `README.md`）。状態と作業単位は GitHub Issues。

**コードを書く前に** @CODING.md と skill `coding-standards` / `karpathy-guidelines` を開く
（レビューやリファクタに限らない。言語固有の作法は skill の `languages/` のみ）。

**申し送りの層は持たない**（[ADR-0025](docs/adr/0025-retire-next-md.md)）。
続きは開いている issue の一覧から拾い、構造に関わる未決は `ARCHITECTURE.md` §8 が引き取る。

## 配布物の追随

`.claude/` と `.github/workflows/` の一部、`web/scripts/lint-comments.ts` と `web/tests/`、`CODING.md` は共有の雛形からの写しである。

- **追随は、この器の開発を再開するときにまとめてやる**。
  都度の追随は打ち切ってあるので、放っておけば雛形との差は開き続ける。
  実装へ触れる最初のセッションが配布手順を通し直す
- **検査器は雛形のコピーでバイト一致を保つ**。
  直すときは雛形の側を先に直して配り直す。
  器の側で直すと、次の追随で黙って踏み潰される
