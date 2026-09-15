# coten-atlas

コテンラジオ（COTEN RADIO）の各シリーズが「いつ・どこの話か」を、世界地図と時系列の上へ置いて一望する Web アプリ。

<https://ta-tabox.github.io/coten-atlas/> で公開している。

<!-- スクリーンショットと操作の動画の置き場 -->

開発中で、どの順で何を作るかは [ROADMAP.md](docs/ROADMAP.md)、いま何に着手しているかは GitHub Issues にある。

## できること

- **地図**: 各シリーズの舞台を代表する地点（代表点）を、世界地図の上に円で描く
  円を押すと、そのシリーズを選択して詳細カードを開く
- **era スライダー**: 画面の下で、時代区分を等幅に並べたスライダーを動かして時代を選ぶ
  選んだ位置の前後の年の範囲（現在窓）を、文字とスライダーの上の帯で示す
  地図に描くのは現在窓と重なるシリーズだけで、重なりが大きいほど円を濃くする
- **一覧パネル**: 地図に出ているシリーズと、位置なしのシリーズを別々の区画に並べる
  位置なしのシリーズは、お金の歴史のように舞台を 1 点に置くと誤りになるシリーズで、地図には描かない
  パネルで選ぶと地図が代表点へ移動し、地図で選ぶとパネルの行が選択中の表示に変わる
- **詳細カード**: 選択中のシリーズの名前・年代・エピソード一覧を表示する
  各エピソードから Spotify の配信ページへ移動できる
- **このサイトについて（`/about`）**: 出典表記とライセンスの全文を載せる

## 設計判断

各項は、いまの形と、理由を持つ ADR へのリンクを並べる。
リンク先の ADR では、採らなかった案と、決定が覆る条件も読める。

### サーバと DB を持たずに配信する

Next.js を static export し、GitHub Pages から静的ファイルだけを配信する。
シリーズと地図の点はビルド時に `catalog/` から読み、エピソード一覧だけをブラウザが同じサイトの JSON から取得する。

理由は [ADR-0001（static export）](docs/adr/0001-nextjs-static-export.md) と [ADR-0007（GitHub Pages での配信）](docs/adr/0007-github-pages.md) が持つ。

### RSS から同期する層と、人間がキュレーションする層を分ける

エピソード（`catalog/episodes.json`）は `pnpm sync` が公式 RSS から毎回組み直し、手で編集しない。
シリーズの属性と地図の点（`catalog/series.json`・`catalog/loci.geojson`）は人間が書き、エピソードとは `seriesId` で結ぶ。

理由は [ADR-0029（データの二層分離）](docs/adr/0029-two-layer-data-without-inbox.md) が持つ。

### データの編集を公開サイトに載せない

`catalog/` の手動層はリポジトリのファイルで、変更はコミットで確定し、PR の diff で読む。
公開サイトは編集の手段・認証・DB を持たない。

理由は [ADR-0028（手元でだけ動く管理画面）](docs/adr/0028-local-only-admin.md) が持つ。

### シリーズと地図の点を分け、位置を段階に分けて持つ

`series.json` は geometry を持たず、地図の点は `loci.geojson` が持ち、点の側が `seriesId` でシリーズを指す。
いまの段階では、各シリーズが代表点を 1 つ持つか `anchor` に `"unlocated"` を置いて位置なしを宣言し、版図や経路の図形は持たない。

理由は [ADR-0026（位置情報の二段階）](docs/adr/0026-two-phase-location.md) と [ADR-0027（シリーズと事物の分離）](docs/adr/0027-series-and-loci.md) が持つ。

### 時代の近さを、地図の点の濃さで見せる

era スライダーは年でなく時代区分を等幅に並べた数直線の上を動き、選んだ位置の前後に時代区分の半分の幅の現在窓を取る。
各点は現在窓との重なりが大きいほど濃く描き、濃さの計算は MapLibre の式でなく TypeScript の側が持ち、現在窓と重ならない点は地図に描かない。

理由は [ADR-0038（現在窓の幅と右端の年）](docs/adr/0038-era-space-window.md) と [ADR-0043（点の濃さの渡し方）](docs/adr/0043-era-fade-window-only.md) が持つ。

### 地図の上の UI を React で書く

一覧パネル・詳細カード・era スライダーは React と Tailwind で書き、地図の上に重ねる。
MapLibre が出す DOM は canvas と attribution だけで、Popup と built-in control を使わない。

理由は [ADR-0022（地図の DOM の境界）](docs/adr/0022-map-dom-boundary.md) が持つ。

### 歴史の裏どりをコードのレビューと分け、典拠をファイルに残す

`catalog/` の年代と座標は、PR か issue に `@historian` とコメントすると、Web 検索を許した GitHub Actions のワークフローが典拠の URL を添えて裏どりする。
採った値の典拠は、シリーズごとに `docs/sources/<シリーズ id>.md` へ置く。

理由は [ADR-0035（歴史の裏どりのワークフロー）](docs/adr/0035-history-review-lane.md) と [ADR-0037（典拠の置き場）](docs/adr/0037-sources-layer.md) が持つ。

## 検証と開発の進め方

判定は `web/` で打つ `pnpm check` の一本で、手元と CI（`.github/workflows/check.yml`）が同じものを回す。
`pnpm check` は `tsc`・Biome・Vitest・`next build`・Playwright のスモークを安い順に回し、スモークは外部への通信を遮断して配信物が自足しているかを見る。
Vitest は、`catalog/` の現物がスキーマとファイルをまたぐ参照の整合に合うかも検査する。
main への push で `.github/workflows/deploy.yml` が GitHub Pages へ配信し、配信の直後に公開ページの `src`・`href` へ到達できるかを確かめる。

各段が何を見るかと、打ち方は [HARNESS.md](docs/HARNESS.md) が持つ。

開発は Claude Code を使って進める。
作業単位は GitHub Issues、決定は `docs/adr/` が持つ。

| 置き場 | 持つもの |
|---|---|
| [CLAUDE.md](CLAUDE.md) | セッションの入口（git の運用・文書の層） |
| [.claude/rules/](.claude/rules/) | コード・文章・UI の規約 |
| [.claude/skills/](.claude/skills/) | 判断の例と、シリーズの値を決める手順 |
| [.claude/hooks/](.claude/hooks/) | force push と戻せない `gh api` の書き込みを人間の確認へ回すフック |
| `.github/workflows/claude-code-review.yml` | PR を開いたときの自動レビュー（正しさと規約の二観点） |
| `.github/workflows/claude.yml` | コメントで `@claude` と名指したときの再レビュー |
| `.github/workflows/claude-history-review.yml` | コメントで `@historian` と名指したときの歴史の裏どり |
| `scripts/lint-vocabulary.sh` | コミット本文と PR 本文の禁止語の報告 |

## 技術スタック

Next.js (App Router) + TypeScript を static export する。
地図は MapLibre GL JS、ベースマップは OpenFreeMap positron。
スタイルは Tailwind v4。
ツールチェーンは mise + pnpm + Biome、テストは Vitest と Playwright。

確定事項の一覧とそれぞれの根拠は [ARCHITECTURE.md](docs/ARCHITECTURE.md) の「技術スタック（確定事項）」にある。

## 文書

ルートの `ls` が見せるのは `docs/` までなので、README がその索引を兼ねる。
各文書の中身はここへ複製しない。

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — いまどうなっているか。技術スタック・データモデル・ディレクトリ構造
- [ROADMAP.md](docs/ROADMAP.md) — 作る順序と、その理由と、完了条件の閾値
- [HARNESS.md](docs/HARNESS.md) — 何をもって「動いた」と言うか。開発の入口（`pnpm check` の打ち方）もここ
- [.claude/rules/](.claude/rules/) — コードと文章と UI の書き方（Claude Code が読み込む規範）。判断に迷う具体例は skill `coding-standards` が持つ
- [docs/adr/](docs/adr/) — なぜそう決めたか。1決定1レコードで追記のみ

## 出典と引用の範囲

番組公式とは関係の無い、非公式のファンサイトである。
番組そのものの権利は制作元の COTEN に帰属する。
地図と時代区分の上への整理はこのプロジェクトが独自に行ったものであって、番組の見解ではない。

載せるのはシリーズ名とエピソードタイトルだけで、番組の説明文・ロゴ・カバーアート・出演者画像は使わない（理由は [ADR-0008](docs/adr/0008-quote-titles-only.md)）。

番組公式: <https://coten.co.jp/services/cotenradio/>

## ライセンス

コードは MIT（[LICENSE](LICENSE)）。

`catalog/` のキュレーション層（`series.json`・`loci.geojson`・`eras.json`）は CC BY 4.0 で、再利用には帰属表示が要る。
同じ `catalog/` でも `episodes.json` は番組の RSS 由来なので、このリポジトリのライセンスは及ばない。

シリーズ名・エピソードタイトル・配信リンクも同じく範囲外で、権利は上の「出典と引用の範囲」のとおり制作元に帰属する。

ライセンスをこの範囲に分ける理由は [ADR-0011](docs/adr/0011-license.md) が持つ。
