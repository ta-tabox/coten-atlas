# 0007. GitHub Pages で配信し、独自ドメインは当てない

- **状態**: 採用
- **決定日**: 2026-08-23（#15）
- **関係する ADR**: 0001（static export）

## 文脈

static export の成果物をどこから配信するか。
このリポジトリは GitHub App による Claude レビュー体制を既に持っている。

## 決定

**GitHub Pages**（`https://ta-tabox.github.io/coten-atlas/`）。`next.config.ts` に `basePath` と `assetPrefix` = `/coten-atlas` を置く。独自ドメインは当てない。

## 理由

公開物とコードの管理主体をリポジトリ一つに閉じられ、GitHub App の面と揃う。Vercel は追記ゼロで済む代わりに管理主体が増える（決定日 2026-08-23、#15）。将来ドメインを当てるなら `basePath` を外す改修が要る。

## 帰結

- `basePath` が dev にも効くので、開発サーバで開くのは `/coten-atlas`（`/` は 404）
- 独自ドメインを当てるなら `basePath` を外す改修が要る
- 配信は S8。実装は #26

## 覆る条件

独自ドメインを当てると決めたとき、または GitHub Pages では満たせない配信要件
（リダイレクト・ヘッダ制御など）が出たとき。
