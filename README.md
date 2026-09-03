# coten-atlas

コテンラジオ（COTEN RADIO）の各シリーズが「いつ・どこの話か」を、世界地図と時系列の上へ置いて一望する Web アプリ。

## 現況

開発中。
手元で `pnpm dev` すると全画面のベースマップが出るところまで。
公開 URL はまだ無い。

どの順で何を作るかは [ROADMAP.md](ROADMAP.md)、いま何に着手しているかは GitHub Issues にある。

## 技術スタック

Next.js (App Router) + TypeScript を static export する。
地図は MapLibre GL JS、ベースマップは OpenFreeMap positron。
データはエピソード（RSS から自動同期）とシリーズ（人間のキュレーション）の二層に分かれる。
ツールチェーンは mise + pnpm + Biome、テストは Vitest。

確定事項の一覧とそれぞれの根拠は [ARCHITECTURE.md](ARCHITECTURE.md) の「技術スタック（確定事項）」にある。

## 文書

ルートの `ls` が目次として働くので、README は索引に徹して中身を複製しない。

- [ARCHITECTURE.md](ARCHITECTURE.md) — いまどうなっているか。技術スタック・データモデル・ディレクトリ構造
- [ROADMAP.md](ROADMAP.md) — 作る順序と、その理由と、完了条件の閾値
- [HARNESS.md](HARNESS.md) — 何をもって「動いた」と言うか。開発の入口（`pnpm check` の打ち方）もここ
- [docs/adr/](docs/adr/) — なぜそう決めたか。1決定1レコードで追記のみ

## 出典と引用の範囲

番組公式とは関係の無い、非公式のファンサイトである。
番組そのものの権利は制作元の COTEN に帰属する。
地図と時代区分の上への整理はこのプロジェクトが独自に行ったものであって、番組の見解ではない。

載せるのはシリーズ名とエピソードタイトルだけで、番組の説明文・ロゴ・カバーアート・出演者画像は使わない（[ADR-0008](docs/adr/0008-quote-titles-only.md)）。

番組公式: <https://coten.co.jp/services/cotenradio/>

## ライセンス

コードは MIT（[LICENSE](LICENSE)）。

`data/` のキュレーション層（`series.json`・`loci.geojson`・`eras.json`）は CC BY 4.0 で、再利用には帰属表示が要る。
同じ `data/` でも `episodes.json` は番組の RSS 由来なので、このリポジトリのライセンスは及ばない。

シリーズ名・エピソードタイトル・配信リンクも同じく範囲外で、権利は上の「出典と引用の範囲」のとおり制作元に帰属する。

決定と理由は [ADR-0011](docs/adr/0011-license.md)。
