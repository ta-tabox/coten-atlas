# NEXT — coten-atlas

申し送り専用。**作業単位と状態は GitHub Issues**、順序と規約は `docs/plan.md`（地図）。
ここに内容を複製しない（複製した瞬間から腐る）。

## 人間へ渡すもの（Cowork からは GitHub に到達できない）

`issues/` に草稿6枚（#01〜#06 = plan S1〜S3）を置いた。手元のターミナルで:

```bash
cd ~/vivarium/terrarium/coten-atlas
APPLY=1 ~/vivarium/fermentary/tools/issue-ledger/labels.sh    # 先にラベル
APPLY=1 ~/vivarium/fermentary/tools/issue-ledger/register.sh  # 草稿を登録
# 草稿内の「前提: #N」を実 issue 番号へ読み替えて直す（register.sh が警告する）
git rm -r issues && git commit -m "chore: issue 草稿を撤去（台帳は GitHub へ移行）"
git push
```

未 push のコミットが手元に残っている場合がある（`git status` で確認）。

## 開いている issue

（登録後にここへ番号を書く。登録前は上の「人間へ渡すもの」が唯一の宿題）

## 配布物の未達分（S1 で実行環境が立ってから配る）

2026-08-22 の追随で、前提を満たさない二つを意図的に見送った。

- **coding-standards の機械層**（`biome.json`・`scripts/lint-comments.ts`・
  `tests/lint-comments.test.ts`）。前提の四つ（`.ts` を直に食える Node・`typescript` の
  devDependency・`git`・vitest）が package.json ごと未成立。正典は
  `fermentary/playbooks/coding-standards.md` 配布手順3、配線は
  `fermentary/tools/coding-standards/README.md`。**検査器とテストは対で配る**。
  配ったら一度全量を走らせ、**件数と内訳を報告してから別コミットで掃除**する
- **gh-review のワークフロー二本**（`claude.yml`・`claude-code-review.yml`）。
  `<!-- FILL -->` は実行環境ブロックと `allowed-tools` で、実在する `mise run check` を
  見ながらでないと埋められない。`.claude/settings.json` は配布済み。
  正典は `fermentary/playbooks/gh-review.md`——**人間の担当分**（GitHub App の導入・
  `CLAUDE_CODE_OAUTH_TOKEN`・ブランチ保護・public 化・陰性テスト用の第三者アカウント）が
  別節にあるので、着手時に必ず読んで引き渡す

## 精緻化の状態

- issue へ降りている: **S1〜S3**（草稿 #01〜#06）
- 粗いまま: S4 以降。**#06 が閉じたら次の束（S4・S5・S6）を割る**
  （正典: `fermentary/playbooks/planning.md`「精緻化はいつやるか」）

## 済んだもの

- 2026-07-14 立ち上げ。プランを `docs/plan.md` に正典化（Next.js static export + MapLibre）
- 2026-07-14 S0 完了。移設・git init・初回コミット・Cowork 化・fermentary 並置
- 2026-08-02 台帳を **issue 台帳版へ移行**。`docs/plan.md` を状態を持たない地図へ改訂し、
  S1〜S3 を issue 草稿へ精緻化。テスト = Vitest、判定の口 = `mise run check` を決定
- 2026-08-22 bootstrap 配布物を正典へ追随（`chore/sync-bootstrap`）。規約の核と skill を
  現行版へ、CLAUDE.md に規約・gh-review・経緯の受け皿の入口、`.claude/settings.json` を配置。
  機械層と workflows は前提未達で見送り（上節）
