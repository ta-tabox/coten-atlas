# デプロイ先を確定する

**前提**: なし ／ **担当**: 人間 ／ **参照**: `docs/plan.md` §1「デプロイ」、#1、S8

## 目的
§1 はデプロイを「Vercel 想定（GitHub Pages でも可）」で止めている。
GitHub Pages はリポジトリ名がパスに入るので `next.config.ts` に `basePath` と `assetPrefix` が要り、Vercel なら要らない。
その `next.config.ts` を作るのは #1 なので、後から決めると #1 の成果物を触り直すことになる。

## 作るもの（決定と文書の改訂）
- **Vercel か GitHub Pages か**の決定。独自ドメインを当てるかどうかも合わせて
- **`basePath` の要否** — GitHub Pages を選ぶなら値まで決める
- **公開 URL の出し先** — README とポートフォリオ導線（coten-career）のどこに置くか
- `docs/plan.md` §1「デプロイ」の行を「想定」から決定へ書き換える
- 必要なら #1 の `next.config.ts` の記述へ `basePath` を追記する

## 触らないもの
実装。
実際のデプロイ作業は S8。

## 完了条件（機械判定）
機械判定は無い（決定と文書の改訂なので、この issue は例外）。

- `docs/plan.md` §1 が「想定」でなく決定を持っている
- `basePath` の要否が #1 に反映されている

## 人間の判定（別トラック）
なし。

## 登録時のラベル（提案）
`human` / `small`
