# coding-standards の機械層を配る

**前提**: #1 ／ **担当**: Claude ／ **参照**: `NEXT.md`「配布物の未達分」、`fermentary/playbooks/coding-standards.md` 配布手順3、`fermentary/tools/coding-standards/README.md`

## 目的
機械判定層が無いままコードが増えると、後から一括で赤を浴びる。
配布の前提だった四つ（`.ts` を直に食える Node・`typescript` の devDependency・git・vitest）は #1 で揃うので、#1 が閉じた直後に配る。
現状この未達分は `NEXT.md` の申し送りにしか無く、#1 が閉じると宙に浮く。

## 作るもの
- `biome.json` — 正典配布版へ差し替える。
  #1 が置いた素の設定と食い違ったら正典側を正とし、差分の理由を PR 本文へ書く
- `scripts/lint-comments.ts` — 正典から配る。改変しない
- `tests/lint-comments.test.ts` — 検査器とテストは対で配る。片方だけの配布は禁
- mise task への配線 — `check` の連鎖へ組み込み、判定の口を `mise run check` 一本に保つ

## 触らないもの
`src/`、`data/`、`docs/plan.md`。
検査器が出した指摘の掃除もこの範囲に入れない（下記のとおり別コミット）。

## 完了条件（機械判定）
- `mise run check` に lint-comments が組み込まれ、`mise run check` が緑
- 配線した直後に一度全量を走らせ、**件数と内訳をこの issue へコメントしてから**掃除に入る。
  掃除は配布とは別コミットにする（配ったことと直したことは違う関心）

## 人間の判定（別トラック）
なし。

## 登録時のラベル（提案）
`tooling` / `claude`
