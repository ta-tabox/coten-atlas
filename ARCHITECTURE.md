# ARCHITECTURE — coten-atlas の現況

このプロジェクトが**いまどうなっているか**を書く。

- **なぜ**は `VISION.md`（未作成。#41 が起こす）
- **なぜそう決めたか**は `docs/adr/`
- **順序**は `ROADMAP.md`
- **検証**は `HARNESS.md`

この文書は理由を持たない。検査は「**過去形の文が無いか**」——過去形が出たら、
それは `docs/adr/` へ置くべき経緯が混ざり込んでいる。

## 1. 技術スタック（確定事項）

結論だけを置く。理由は ADR を開く。

| 項目 | 確定 | 根拠 |
|---|---|---|
| スタック | Next.js (App Router) + TypeScript、static export（`output: 'export'`） | [ADR-0001](docs/adr/0001-nextjs-static-export.md) |
| スタイル | Tailwind v4（`globals.css` が `@import "tailwindcss"` と `@theme` のトークンを持つ）。`*.module.css` は持たない | [ADR-0021](docs/adr/0021-tailwind-v4.md) |
| 地図 | MapLibre GL JS（+ react-map-gl の maplibre エントリ） | [ADR-0003](docs/adr/0003-maplibre.md) |
| ベースマップ | OpenFreeMap positron（代替は Carto Positron） | [ADR-0004](docs/adr/0004-openfreemap-positron.md) |
| データ | エピソード = RSS 自動 / シリーズ = 人間キュレーション の二層 | [ADR-0005](docs/adr/0005-two-layer-data.md) |
| 配信リンク | RSS の `<link>`（Spotify のエピソードページ） | [ADR-0006](docs/adr/0006-rss-link-as-episode-url.md) |
| デプロイ | GitHub Pages（`https://ta-tabox.github.io/coten-atlas/`、`basePath` = `/coten-atlas`） | [ADR-0007](docs/adr/0007-github-pages.md) |
| 引用の範囲 | シリーズ名とエピソードタイトルのみ | [ADR-0008](docs/adr/0008-quote-titles-only.md) |
| 判定の口 | `pnpm check` の一本 | [ADR-0009](docs/adr/0009-pnpm-check.md) |
| ツールチェーン | mise + pnpm + Biome | ADR を持たない。このリポジトリの外で決めた既定をそのまま踏襲する。`mise.toml` は `[tools]` のみでランタイム版管理に徹する |
| テスト | Vitest（+ React Testing Library）／ ブラウザを立てる層は Playwright | 単体側は ADR を持たない。踏襲元の既定が JS のテストランナーを固定していない。Vite 系の事実上の既定で Biome と衝突せず、静的サイトに追加ランタイムを持ち込まない。ブラウザ側を分ける理由は [ADR-0016](docs/adr/0016-playwright-runner.md) |
| エピソード取得 | RSS を正とする自動同期（ビルド前スクリプト） | ADR を持たない。手順は §5 が持つ。今後の追加に耐えるため |

## 2. システム全体像

```
公式 RSS ──(pnpm sync: ビルド前)──> data/episodes.json ─┐
                                    └─> data/inbox/     │  未割当スタブ = 人間の入口
                                                        │
data/series.geojson （人間キュレーション）──────────────┤
data/eras.json      （時代区分）────────────────────────┤
                                                        v
                                          Next.js static export (next build)
                                                        │
                                                        v
                              GitHub Pages の静的ファイル一式
                                                        │
                                                        v
                          ブラウザ: MapLibre がシリーズを描き、era スライダーが opacity を動かす
```

実行時 fetch を持たない。RSS の取得は常にビルド前のデータ更新として走る。

## 3. データモデル

### 二層構造

```
data/
├── episodes.json        # 自動層。RSS から同期。手で編集しない
├── series.geojson       # 手動層。シリーズ=キュレーション対象の正
├── eras.json            # 時代区分（下記「時系列（era）モデル」）
└── inbox/               # RSS 同期が排出する「未割当シリーズのスタブ」置き場
```

**episodes.json**（RSS 由来、guid キー）:

```jsonc
{
  "syncedAt": "2026-07-14T00:00:00Z",
  "episodes": [
    {
      "guid": "...",            // RSS の guid。差分同期のキー。trim 済み
      "title": "三国志 徹底解説 #1 ...",
      "pubDate": "2026-08-19T21:00:00Z",  // ISO 8601。RFC 822 からの正規化は同期側
      "audioUrl": "...",
      "season": 22,             // itunes:season。持たない回（番外編・特別編・告知）は null
      "seriesId": "sangokushi",  // season から割当。未割当なら null（ADR-0018）
      "links": [{ "platform": "spotify", "url": "https://open.spotify.com/episode/..." }]
    }
  ]
}
```

**series.geojson**（GeoJSON FeatureCollection。MapLibre へ直接渡す）:

```jsonc
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [112.5, 34.6] },
  // Point / Polygon / LineString をシリーズの性質で使い分ける
  // 例: 都市国家=Point、帝国や文明圏=Polygon、遠征や航海=LineString
  "properties": {
    "id": "sangokushi",
    "title": "三国志",
    "kind": "polygon",              // 描画スタイルの分岐キー
    "timeRange": { "start": 180, "end": 280 },  // 負値 = BC
    "summary": "",                  // 自前の要約を入れる欄。番組の説明文は引かないので当面は空（ADR-0008）
    "region": "中国",
    "season": 22,                   // 割当キー。itunes:season の値（ADR-0018）
    "links": [{ "platform": "spotify", "url": "https://open.spotify.com/..." }],
    "tags": ["戦乱", "中国"]
  }
}
```

- **1 シリーズ = `itunes:season` の 1 値**。
  `ROADMAP.md` の完了判定がシリーズ数を数えるので、複数の season を 1 件へ束ねない
- エピソードとシリーズの割当キーは `itunes:season`（[ADR-0018](docs/adr/0018-season-as-assignment-key.md)）。
  シリーズ側もエピソード側も `season` を持ち、シリーズ側は必須、エピソード側は持たない回があるので nullable
- `links` は `{ platform, url }` の配列で、シリーズもエピソードも同じ形。
  `platform` を enum にしてあるので、配信基盤が増えたときに壊れる場所が一箇所で済む
- スキーマの現物は `web/src/lib/schema/` の zod が持つ。
  この節と食い違ったらスキーマが正で、`pnpm test`（`web/tests/data.test.ts`）が `data/` 全体をそれに掛ける
- 人物伝（吉田松陰など）は活動の中心地を Point、生涯年代を timeRange とする
- 概念史（お金の歴史・資本主義など）は「場所が一意でない」——主要な舞台を
  MultiPoint か代表 Polygon で置き、`kind: "concept"` で控えめなスタイルにする。
  S2 でシードを作りながら規約を確定し、この節に追記する

### 時系列（era）モデル

年の線形スライダーにしない。密度の違う「ざっくり時代区分」を一次元に並べ、
スライダーは era 空間を動く（イベントが密な近現代ほど細かく刻む）:

```jsonc
// data/eras.json
[
  { "id": "prehistory", "label": "先史",   "start": -10000, "end": -800 },
  { "id": "ancient",    "label": "古代",   "start": -800,   "end": 550 },
  { "id": "medieval",   "label": "中世",   "start": 550,    "end": 1450 },
  { "id": "earlymodern","label": "近世",   "start": 1450,   "end": 1800 },
  { "id": "modern19",   "label": "19世紀", "start": 1800,   "end": 1900 },
  { "id": "modern20a",  "label": "〜WWII", "start": 1900,   "end": 1945 },
  { "id": "modern20b",  "label": "戦後",   "start": 1945,   "end": "present" }
]
```

- スライダー位置 → era 内を線形補間して「現在窓（年範囲）」を得る
- シリーズの表示 opacity = timeRange と現在窓の重なり率（0..1）を
  イージングに通した値。窓の端で滑らかにフェードイン/アウトする
- era の刻みはデータが揃ってから密度に合わせて調整する（S7 の後に見直し）
- 区間は `start` を含み `end` を含まない半開区間で、境目の年は後ろの era に属する
- **終わっていない era の `end` には年を書かず `"present"` を置く**（[ADR-0019](docs/adr/0019-era-open-end.md)）。
  置けるのは末尾だけで、スライダーの右端に当たる年は描画のときに決まる（決め方は S4）

## 4. UI 構成

- 全画面マップ + 下部に era スライダー（ラベルは era 名、位置は補間年を薄く表示）
- 左に開閉パネル: 現在窓に表示中のシリーズ一覧。クリックで該当オブジェクトを
  選択（flyTo + ハイライト）。地図側の選択もパネルに同期（単一の selection state）
- オブジェクトクリック → 詳細カード（summary・年代・エピソード一覧・Spotify リンク）
- 状態管理は React の範囲で足りる想定（selection / era window / panel 開閉のみ）。
  外部ライブラリを足す前に本当に要るか問う

地図の画面のほかに、出典表記の置き場を二つ持つ。
何を載せるかは ADR-0008 が持つ。

- **`/about`（このサイトについて）**: static export のページを1枚増やす。出典表記の全文はここに置く
- **フッタ**: 番組公式への導線と出典表記へ常時到達できること。
  物理的な置き場所（画面下端の常設か、スライダー脇の小さな帰属＋リンクか）は
  全画面マップの制約次第なので S8 で決める

### シリーズの近接

`CLAUDE.md` の目的にある「どのシリーズと近接するか」は、時代・地理・主題という別々の三つの軸を指す。
軸ごとに扱いを変える。

- **地理の近さは暗黙に満たす**。
  地図上の位置がそのまま距離を表すので、専用の UI は同じことを二度言うだけになる
- **時代の近さは era スライダーで暗黙に満たし、選択中のシリーズとの重なりだけを明示する**。
  現在窓に浮かんでいるシリーズは同時代だが、窓の端に薄く残っているだけのものと区別が付かない
- **主題の近さには明示的な UI を置く**。
  主題は地図にも era スライダーにも現れないので、置かなければ目的の三つ目が満たされない

明示的に足すのは次の三つで、置き場所は S5（`ROADMAP.md`）。
三つとも選択中のシリーズを起点にするので、selection の消費者が揃うステップに同居させる。

- **関連シリーズ行**: 詳細カードの末尾に、`tags` を共有するか `region` が同じシリーズを数件並べる。
  クリックで選択がそのシリーズへ移る
- **同時代ハイライト**: 選択中のシリーズと `timeRange` が重なるシリーズを地図上で強調する。
  S4 の opacity 制御の上に載る差分で、選択が無いときは何も起きない
- **tag 絞り込み**: パネルに現在窓の tags を並べ、選んだタグを持つシリーズだけを地図とパネルに残す。
  selection とは別に filter state が一つ増える

近接のためにスキーマは増やさない。
判定は既存の properties（`tags` / `region` / `timeRange`）だけで行う。
シリーズ間の明示的な関連リンク（`related` のような属性）は、90 前後の全シリーズへ人手で張る費用が S7 に乗るので採らない。
シードが10件前後の間は関連シリーズが 0 件になりうるので、0 件なら行ごと出さない。

## 5. RSS 同期パイプライン

- feedUrl: `https://anchor.fm/s/8c2088c/podcast/rss`。
  Apple Podcasts lookup API `https://itunes.apple.com/lookup?id=1450522865` の `feedUrl` を
  2026-08-23 に実取得した値で、以後はこれを直接叩く
- フィードの形（#13 で実地確認。パーサはこれを前提にしてよい）:
  - `guid` は `isPermaLink="false"` の UUID。
    ただし初期の 5 件だけ `anchor.fm` のエピソード URL が入っており、先頭に空白が付く。
    突き合わせのキーにする前に trim する
  - `pubDate` は RFC 822（`Wed, 19 Aug 2026 21:00:00 GMT`）で、全件 GMT 表記
  - `<link>` は Spotify のエピソードページ、`enclosure` は `anchor.fm` の再生 URL（cloudfront の mp3 を包む）
  - シリーズ番号は `itunes:season`。1〜66 が欠番なく並ぶが、752 件中 176 件（番外編・特別編・告知）はこれを持たない
  - シリーズ内の回は `itunes:episode`。消費する画面が無いので episodes.json へは保存しない（ADR-0018）
- `web/scripts/sync-feed.ts`（`web/package.json` の scripts に `sync` として登録）:
  1. RSS を取得し、guid で episodes.json と差分
  2. series.geojson 全件の `season` から season → seriesId の索引を組み、新規エピソードの `itunes:season` で引いて seriesId 割当（ADR-0018）
  3. どのシリーズにも当たらないものは `data/inbox/YYYY-MM-DD.json` にスタブ排出
     （タイトル・guid・推定シリーズ名。座標と年代は空欄=人間+Claude の補正対象）
  4. 結果サマリ（新規 n 件 / 割当 m 件 / 要レビュー k 件）を stdout へ
- 運用: 当面は手動で `pnpm sync` → inbox を見てキュレーション → コミット。
  軌道に乗ったら GitHub Actions の cron で sync + PR 自動作成に昇格（S8 以降の任意課題）
- 静的サイトなので実行時 fetch はしない。同期は常にビルド前のデータ更新として行う

## 6. ディレクトリ構造

ルートは**プロジェクトの文書と運用設定**だけを持ち、Next.js アプリは `web/` 配下に隔離する。
このリポジトリは今後 `data/`（人間キュレーション層）と RSS 同期スクリプトを持つので、
`src/` の隣に `data/` が並ぶと「これは Next.js が読むのか、ビルド前に走る何かなのか」が
構造から読めなくなる。境界をディレクトリで引けば、その問いが起きる場所そのものが無くなる。

```
.
├── CLAUDE.md              # セッションの入口（規約・git）
├── CODING.md              # コーディング規約
├── ARCHITECTURE.md        # この文書（現況）
├── ROADMAP.md             # 作る順序
├── HARNESS.md             # 検証と実行環境
├── data/                  # 人間キュレーション層と時代区分。アプリの外なのでルート側
├── docs/adr/              # 決定と経緯。1決定1レコード
├── mise.toml              # [tools] のみ。ランタイム版管理
├── .github/               # workflows・issue / PR テンプレ
├── .claude/               # settings・hooks・同梱 skill
└── web/                   # アプリ本体。判定の口 `pnpm check` はこの中で打つ
    ├── CLAUDE.md          # 空殻（本文はルート）
    ├── src/               # Next.js が束ねる範囲。`app/` の構造は App Router の規約
    ├── public/            # そのまま配信される静的ファイル。中身は生成物なので追跡しない
    ├── scripts/           # `web/` から走らせる補助スクリプト
    ├── tests/             # `src/` に併置しないテスト
    ├── package.json       # 依存とタスクの定義
    ├── next.config.ts     # ビルドと配信の設定（static export / GitHub Pages）
    └── tsconfig.json / biome.json / postcss.config.mjs / vitest.config.ts / vitest-setup.ts
```

`web/CLAUDE.md` は空殻——`create-next-app` の生成物やエージェントが `web/` 直下へ規約を
書き足すのを、先に場所を埋めて防ぐ。本文はルートの `CLAUDE.md` とこの文書。

まだ存在しないもの: `data/series.geojson`（#4）、`data/episodes.json` と `data/inbox/`（#27）、
`web/scripts/sync-feed.ts`（S6）、`VISION.md`（#41）。
`data/` はアプリの外なので**ルート側**に置く。

`web/scripts/` はこれと別枠になる。`tsconfig.json` の `paths` も vitest の alias も `web/` の中で
解決するので、`web/` の道具立てに依るスクリプトはルートへ出さず `web/scripts/` に置く。
RSS 同期（`sync-feed.ts`）は `web/src/` のスキーマとパーサを import し `pnpm` の scripts から走るので、
ビルド前処理もここに入る。
`data/` の検査はスクリプトを持たず、`web/tests/data.test.ts` が L2 で回す（`HARNESS.md`）。

## 7. 意図的にやらないこと

- **OpenHistoricalMap 連動を MVP に入れない**。S9 の任意課題として分離する（`ROADMAP.md`）
- **番組の説明文・ロゴ・カバーアートを使わない**（ADR-0008 の帰結）。
  載せるのはシリーズ名とエピソードタイトルだけ
- **ユーザ登録・コメント等の動的機能を持たない**。static export の前提（ADR-0001）から外れる
- **シリーズ間の明示的な関連リンク（`related` のような属性）を持たない**（§4）
- **実行時 fetch を持たない**。同期は常にビルド前（§5）

## 8. 持ち越した開いた問い

構造に関わる未決で、該当 issue に着手するときに解く。

- 一つのエピソードが複数シリーズに跨る回（対談・番外編）の見せ方。
  `seriesId` は単数 nullable で、割当キーが season なので、season を持つ回は必ず一つのシリーズへ入る（ADR-0018）。
  跨る回をどちらのシリーズの下に見せるかは S6 の精緻化のときに突き合わせる
- モバイルでの振る舞い（全画面マップ + 下部スライダー + 左パネル）の範囲は S8 の精緻化で決める
