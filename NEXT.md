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

## 精緻化の状態

- issue へ降りている: **S1〜S3**（草稿 #01〜#06）
- 粗いまま: S4 以降。**#06 が閉じたら次の束（S4・S5・S6）を割る**
  （正典: `fermentary/playbooks/planning.md`「精緻化はいつやるか」）

## 済んだもの

- 2026-07-14 立ち上げ。プランを `docs/plan.md` に正典化（Next.js static export + MapLibre）
- 2026-07-14 S0 完了。移設・git init・初回コミット・Cowork 化・fermentary 並置
- 2026-08-02 台帳を **issue 台帳版へ移行**。`docs/plan.md` を状態を持たない地図へ改訂し、
  S1〜S3 を issue 草稿へ精緻化。テスト = Vitest、判定の口 = `mise run check` を決定
