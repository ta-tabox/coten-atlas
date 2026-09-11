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
| スタック | Next.js (App Router) + TypeScript、static export（`output: 'export'`） | [ADR-0001](adr/0001-nextjs-static-export.md) |
| スタイル | Tailwind v4（`globals.css` が `@import "tailwindcss"` と `@theme` のトークンを持つ）。`*.module.css` は持たない | [ADR-0021](adr/0021-tailwind-v4.md) |
| 地図の DOM 境界 | overlay は React + Tailwind。MapLibre 由来の DOM は canvas コンテナと attribution だけ | [ADR-0022](adr/0022-map-dom-boundary.md) |
| 地図 | MapLibre GL JS（+ react-map-gl の maplibre エントリ） | [ADR-0003](adr/0003-maplibre.md) |
| ベースマップ | OpenFreeMap positron（代替は Carto Positron） | [ADR-0004](adr/0004-openfreemap-positron.md) |
| データ | エピソード = RSS 自動 / シリーズ = 人間キュレーション の二層 | [ADR-0029](adr/0029-two-layer-data-without-inbox.md) |
| 位置情報 | 二段階。第一段階は代表点 1 つか位置なしで、Point 以外の図形を持たない。第二段階（S9）で精緻な図形を足す。代表点は第二段階でも独立に持ち、どちらを描くかは利用者が切り替える | [ADR-0026](adr/0026-two-phase-location.md) |
| シリーズと事物 | 1 対多。`series.json`（属性）と `loci.geojson`（事物）に分け、シリーズは代表点の参照か位置なしの印を持つ | [ADR-0027](adr/0027-series-and-loci.md) |
| 管理画面 | 手元でだけ動き、`catalog/` のファイルへ書く。公開サイトの成果物に含まれない | [ADR-0028](adr/0028-local-only-admin.md) |
| 配信リンク | RSS の `<link>`（Spotify のエピソードページ） | [ADR-0006](adr/0006-rss-link-as-episode-url.md) |
| デプロイ | GitHub Pages（`https://ta-tabox.github.io/coten-atlas/`、`basePath` = `/coten-atlas`） | [ADR-0007](adr/0007-github-pages.md) |
| 引用の範囲 | シリーズ名とエピソードタイトルのみ | [ADR-0008](adr/0008-quote-titles-only.md) |
| 判定の口 | `pnpm check` の一本 | [ADR-0009](adr/0009-pnpm-check.md) |
| ツールチェーン | mise + pnpm + Biome | ADR を持たない。このリポジトリの外で決めた既定をそのまま踏襲する。`mise.toml` は `[tools]` のみでランタイム版管理に徹する |
| テスト | Vitest（+ React Testing Library）／ ブラウザを立てる層は Playwright | 単体側は ADR を持たない。踏襲元の既定が JS のテストランナーを固定していない。Vite 系の事実上の既定で Biome と衝突せず、静的サイトに追加ランタイムを持ち込まない。ブラウザ側を分ける理由は [ADR-0016](adr/0016-playwright-runner.md) |
| エピソード取得 | RSS を正とする自動同期（ビルド前スクリプト） | ADR を持たない。手順は §5 が持つ。今後の追加に耐えるため |

## 2. システム全体像

```
公式 RSS ──(pnpm sync: ビルド前)──> catalog/episodes.json ─┐
                                                           │
手元の管理画面 ──(保存 = ファイル書き込み)──┐               │
                                            v               │
catalog/series.json  （シリーズの属性。人間キュレーション）─┤
catalog/loci.geojson （事物 = 代表点。同上）────────────────┤
catalog/eras.json    （時代区分）───────────────────────────┤
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
管理画面は手元でだけ立ち、公開サイトの成果物には含まれない（[ADR-0028](adr/0028-local-only-admin.md)）。

## 3. データモデル

### 二層構造

```
catalog/
├── episodes.json        # 自動層。RSS から同期。手で編集しない
├── series.json          # 手動層。シリーズ=キュレーション対象の正。geometry を持たない
├── loci.geojson         # 手動層。事物（シリーズが地図の上に持つもの）。地図の source の元
└── eras.json            # 時代区分（下記「時系列（era）モデル」）
```

シリーズと事物は 1 対多で、多の側（事物）が `seriesId` で一の側を指す（[ADR-0027](adr/0027-series-and-loci.md)）。
位置情報は二段階で持つ（[ADR-0026](adr/0026-two-phase-location.md)）。
第一段階では、シリーズが代表点 1 つか位置なしのどちらかを持ち、事物の geometry は Point だけである。
第二段階（S9、完了条件の外）で事物に年範囲と精緻な図形を足す。

**episodes.json**（RSS 由来、guid キー）:

```jsonc
{
  "syncedAt": "2026-08-23T00:00:00Z",
  "episodes": [
    {
      // RSS の guid。差分同期のキー。747 件は UUID だが 5 件は先頭に空白の付いた URL なので trim して持つ
      "guid": "4d80b4a3-deee-41f3-8045-d06ade19132f",
      // フィードの文字列をそのまま持つ。シリーズ名をここから抽出しない（表記が揺れている。#13 の実測）
      "title": "【66-10】五賢帝時代はじまる！…【COTEN RADIO 帝政ローマ編10】",
      "pubDate": "2026-08-19T21:00:00Z",  // ISO 8601。RFC 822（フィードは全件 GMT）からの正規化は同期側
      "season": 66,              // itunes:season。持たない回（番外編・特別編・告知）は null
      "seriesId": "teisei-roma",  // season から割当。未割当なら null（ADR-0018）
      // RSS の <link>。エピソード単位の Spotify ページで、open.spotify.com/episode/… はフィードに無い
      "links": [{ "platform": "spotify", "url": "https://podcasters.spotify.com/pod/show/coten/episodes/66-10COTEN-RADIO-10-e3m0l9q" }]
    }
  ]
}
```

**series.json**（シリーズの属性。`eras.json` と同じ素の配列で、GeoJSON ではない）:

```jsonc
[
  {
    "id": "sparta",
    "title": "スパルタ",
    "kind": "place",                              // 描画の濃淡の分岐キー
    "anchor": "sparta-city",                      // 代表点の事物 id（loci.geojson の properties.id）
    "timeRange": { "start": -900, "end": -200 },  // 両端を含む閉区間。負値 = BC
    "summary": "",         // 自前の要約を入れる欄。番組の説明文は引かないので当面は空（ADR-0008）
    "region": "ヨーロッパ",
    "season": 2,           // 割当キー。itunes:season の値（ADR-0018）
    "links": [],           // シリーズ単位の配信ページは存在しないので、何を指すかは未決定
    "tags": ["集団", "戦争"]
  },
  {
    "id": "sekai-sandai-shukyo",
    "title": "世界三大宗教",
    "kind": "concept",
    "anchor": "unlocated",  // 位置なし。JSON に定数は無いので文字列をそのまま書き、コードは ANCHOR_UNLOCATED の名で読む。地図に出ず、一覧パネルの別区画に出る（§4）
    "timeRange": "untimed",  // 時期なし。コードは TIME_RANGE_UNTIMED の名で読む。置けるのは種別が概念史だけの位置なしのシリーズに限る（ADR-0039）
    "summary": "",
    "region": "地域なし",
    "season": 7,
    "links": [],
    "tags": ["宗教", "概念史"]
  }
  // 以下、1 シリーズ = 1 要素が並ぶ
]
```

**loci.geojson**（事物。GeoJSON FeatureCollection で、地図の source の元。渡す形はビルド時に `kind` と `timeRange` を properties へ写して組む）:

```jsonc
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [22.43, 37.07] },  // 第一段階は Point だけ
      "properties": {
        "id": "sparta-city",       // 鍵。属性は series.json から引く（ADR-0024）
        "seriesId": "sparta",      // シリーズへの参照。1 対多はこの欄が担う
        "timeRange": "series"      // 「シリーズの timeRange と同じ」の意（コードでは TIME_RANGE_OF_SERIES）。代表点は必ずこれで、第二段階の事物は年の閉区間を書く
      }
    }
    // 位置なしのシリーズはここに現れない
  ]
}
```

`season` と `title` の対応は**フィードが正**で、実測の一覧は #13 のコメントが持つ（2026-08-23 時点で 1〜66 が欠番なく並ぶ）。
上の `2` はスパルタ、`7` は世界三大宗教で、この一覧から引いた値である。

- **1 シリーズ = `itunes:season` の 1 値**。
  `ROADMAP.md` の完了判定がシリーズ数を数えるので、複数の season を 1 件へ束ねない
- エピソードとシリーズの割当キーは `itunes:season`（[ADR-0018](adr/0018-season-as-assignment-key.md)）。
  シリーズ側もエピソード側も `season` を持ち、シリーズ側は必須、エピソード側は持たない回があるので nullable
- `id` はシリーズ名のローマ字を kebab-case にした手書きの値で、フィードから機械で決まる値ではない。
  同じ値を二つのシリーズが要求したら、どちらかを変える。
  重複はスキーマが落とし、変えた後に残る古い参照（エピソードの `seriesId`・事物の `seriesId`）は `references.ts` が落とすので、黙って壊れることは無い
- シリーズと事物の紐づけは事物側の `seriesId` が担う（多の側が一の側を指す）。
  `anchor` は紐づけではなく、そのシリーズの事物のうちどれが代表点かを示す印である
- `anchor` は代表点の事物 id か、位置なしを表す `"unlocated"` のどちらかで、null を使わない。
  null は「まだ置いていない」と「置かないと決めた」を語らない（[ADR-0027](adr/0027-series-and-loci.md)）。
  `anchor` が指す事物は実在し、その `seriesId` がそのシリーズを指さなければならない。
  位置なしのシリーズは事物を 1 件も持たない。
  どちらも `references.ts` が見る。
  代表点の geometry が Point であることは、第一段階では `loci.geojson` のスキーマが Point しか通さないので `references.ts` の側では見ない。
  位置なしは段階を問わず代表点を持たない（[ADR-0026](adr/0026-two-phase-location.md)）
- 事物の `id` は事物間で一意。
  `"unlocated"` は位置なしの印に使うので、事物の `id` には使えない
- 事物の `timeRange` は年の閉区間か、シリーズの `timeRange` と同じことを表す `"series"` のどちらか。
  代表点の `timeRange` は `"series"` でなければならない。
  代表点はシリーズ全体を代表するので、年を写して二重に持たない。
  年を書いた事物はそのシリーズの `timeRange` に収まっていなければならない（`references.ts`）。
  era スライダーが読むのは事物の `timeRange` で、`"series"` は地図へ渡す形を組むときにシリーズの値へ置き換える
- シリーズの `timeRange` は年の閉区間か、時期を持たないことを表す `"untimed"` のどちらか（[ADR-0039](adr/0039-untimed-concept-series.md)）。
  `"untimed"` を置けるのは、種別が `概念史` だけで位置なしのシリーズに限る。
  そのうち主題が終わっていて両端を史実の年で言えるシリーズ（ショート 切腹など）は、`"untimed"` でなく年を書く。
  位置なしのシリーズは事物を持たないので、事物の `"series"` が `"untimed"` へ解決されることは無い
- 代表点に正確さを求めない。
  活動の中心地か舞台の代表地点を 1 点置く。
  代表点を 1 つ置くと嘘になるシリーズ（お金の歴史のように、同じ仕組みが各地で独立に立ち上がるもの）は位置なしにする（[ADR-0026](adr/0026-two-phase-location.md)）
- `links` は `{ platform, url }` の配列で、シリーズもエピソードも同じ形。
  `platform` を enum にしてあるので、配信基盤が増えたときに壊れる場所が一箇所で済む。
  エピソード側は RSS の `<link>` を入れる（[ADR-0006](adr/0006-rss-link-as-episode-url.md)）。
  配信側にシリーズ単位のページが無いので、**シリーズ側が何を指すかは未決定**である（#13 の実測）
- `kind` は `place`（場所が一意に決まる）と `concept`（決まらない）の 2 値（[ADR-0023](adr/0023-kind-place-or-concept.md)）。
  `anchor` とは別の欄で、`concept` でも代表点を置いてよい。
  シリーズの属性なので事物には持たせず、地図の濃淡に要る分は地図へ渡す形を組むときに `seriesId` で引いて写す（[ADR-0024](adr/0024-map-feature-carries-key-only.md)）
- `region` と `tags` の消費者は §4「シリーズの近接」（関連シリーズ行と tag 絞り込み）である。
  近接のためにスキーマを増やさないので、この二つが判定の材料になる
- `region` は陸地を重ならないように割った 12 区画と `地域なし` の 13 値で、区画を一つ選ぶと嘘になるシリーズが `地域なし` を書く（[ADR-0034](adr/0034-series-vocabulary.md)）。
  区画の境目の決め方と、値を足すときの手順も同じレコードが持つ。
  `tags` は種別（`人物` / `集団` / `出来事` / `概念史` の閉じた集合から最低 1 つ）と主題を合わせて 4 個以内で、`eras.json` の区分と同じ粒度の時代名と地域名を入れない。
  `幕末` や `三国志` のように era より細かい時代の名は主題として入れてよい
- `region` の 13 値・種別が最低 1 つ在ること・`tags` の上限・era 級の時代名の禁止・`title` が `ショート` と `ジンブンガク` で始まらないこと・`kind: place` と `ANCHOR_UNLOCATED` を組まないこと・`"untimed"` を置いたシリーズの種別が `概念史` だけで位置なしであることは、`web/src/lib/schema/series.ts` が検査する。
  外の知識が要る判定（区画を一つ選ぶと嘘になるか、`id` の表記が読みどおりか）は検査に入らない
- スキーマの現物は `web/src/lib/schema/` の zod が持つ。
  この節と食い違ったらスキーマが正で、`pnpm test`（`web/tests/catalog.test.ts`）が `catalog/` 全体をそれに掛ける。
  ファイル単体の検査に加えて、ファイルをまたぐ整合——`episodes.json` の `seriesId` が実在する id と season を指すか、`series.json` の `anchor` が実在する事物を指すか、事物の `seriesId` が実在するシリーズを指すか、`timeRange` が `eras.json` の era 空間と重なるか（`"untimed"` のシリーズを除く）——も同じテストが見る（`web/src/lib/schema/references.ts`）
- 人物伝（吉田松陰など）は活動の中心地を代表点、生涯年代を `timeRange` とする

### 時系列（era）モデル

スライダーは年を等間隔に刻まない。
`eras.json` が持つ時代区分を**一区間ずつ等幅**に並べた一次元の空間（以下 era 空間）の上を動く。

```jsonc
// catalog/eras.json — この 7 区間が era 空間を 7 等分する
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

**era 空間の一点から西暦の年へ**——どの区間に居るかで era を選び、その中を `start` から `end` へ線形補間する。
区間の 4 割の位置が指す年は、19 世紀（1800〜1900）なら 1840 年、先史（-10000〜-800）なら -6320 年になる。

区間ごとに年の幅が違うまま等幅で並べるので、**スライダーを同じだけ動かしても進む年数が era ごとに変わる**。
先史は 9200 年幅、19 世紀は 100 年幅なので、この二つの間では 92 倍違う。
これが「イベントが密な近現代ほど細かく刻む」の中身で、年を等間隔に刻んだ場合との差でもある。

- 区間は `start` を含み `end` を含まない半開区間で、境目の年は後ろの era に属する（1450 年は「近世」であって「中世」ではない）
- 隣り合う区間は接していなければならない（前の `end` = 次の `start`）。
  隙間があるとそこを指した位置に対応する年が無く、重なりがあると同じ年が二箇所から指される。
  検査は `eraListSchema` が持つ
- **終わっていない era の `end` には年を書かず `"present"` を置く**（[ADR-0019](adr/0019-era-open-end.md)）。
  置けるのは末尾だけで、この区間を補間するときの右端はビルドした時点の年である（[ADR-0038](adr/0038-era-space-window.md)、[ADR-0040](adr/0040-era-fade-wiring.md)）
- era の刻みはデータが揃ってから密度に合わせて調整する（S7 の後に見直し）

**年からシリーズの opacity へ**——スライダーが指すのは 1 点だが、シリーズは `timeRange` という幅を持つので、点と幅は直接比べられない。
そこで点の周りに幅を持つ**現在窓**（年範囲）を取り、`timeRange` との重なり率（0..1）をイージングに通した値を opacity にする。
窓の端で滑らかにフェードイン / アウトする。

- 現在窓の幅は era 空間の 1 区間の半分（`WINDOW_WIDTH_IN_ERAS`）で、窓の両端を年へ変換してから `timeRange` と比べる。
  重なり率は重なる年数を窓と `timeRange` のうち短い方の年数で割り、smoothstep に通して濃さにする（[ADR-0038](adr/0038-era-space-window.md)）
- 地図の円の不透明度は `kind` の濃さと窓の濃さの積で、窓と重ならない事物は地図から除く。
  地図を開いたときのスライダーは古代の区間の中央を指す（[ADR-0040](adr/0040-era-fade-wiring.md)）

### 配り方

シリーズと事物はビルド時に取り込み、エピソードは `public/` へ複製して実行時に取ってくる。
初期表示に要るのは地図へ置く点とシリーズの属性だけで、エピソード一覧は詳細カードを開くまで要らないので、初期ロードへ載せる範囲をその二つに限る。

エピソードの件数はシリーズの十倍を超え、増え続ける。
シリーズと事物は初期ロードへ載せても軽く、エピソードは載せると地図が出るまでの待ちがそのぶん伸びる。

- **シリーズと事物は Server Component が `node:fs` で読む**。
  `catalog/` はルート側にあって `web/tsconfig.json` の `include` の外で、`resolveJsonModule` が効くのは `.json` だけなので、`.geojson` を素の `import` では読めない。
  `fs` なら解決の設定が要らず、`web/tests/catalog.test.ts` と同じ読み口になる。
  static export では `next build` の中でしか走らないので、公開後にファイルを触る口は残らない
- **エピソードは `public/catalog/episodes.json` を fetch する**。
  `catalog/` は `web/` の外にあって `public/` へ入らないので、ビルドの前に複製する手順が要る。
  worker の複製（`web/package.json` の `sync-map-worker`）と同じ形で `predev` / `prebuild` へ繋ぐ
- **fetch の URL には `BASE_PATH` を付ける**。
  GitHub Pages はリポジトリ名を挟んだ場所へ配信するので、`/catalog/episodes.json` は公開後に 404 になる
- **どちらの読み込み口も `parseSeries` / `parseLoci` / `parseEpisodes` を通す**。
  `fs` で読んだ値も fetch した値も型を持たないので、検査を外すと `as` で型を名乗ることになる。
  ビルド時の検査（`web/tests/catalog.test.ts`）が見るのは `catalog/` の現物だけなので、複製し損ねた・404 の HTML を掴んだ、は実行時にしか映らない
- `vitest.config.ts` に手当ては要らない。
  どちらの口も `fs` と `fetch` で読み、`.geojson` を import しない
- §7 の「実行時 fetch を持たない」が指すのは RSS の取得で、自分で配った静的 JSON を引くことではない（#92 が文言を絞る）

## 4. UI 構成

- 全画面マップ + 下部に era スライダー（era 名を等幅のセルに並べ、下に区間の境目の年を置く。現在窓の年の範囲を、文字とセルの上の帯で示す）
- 左に開閉パネル: 現在窓に表示中のシリーズ一覧。クリックで該当オブジェクトを
  選択（flyTo + ハイライト）。地図側の選択もパネルに同期（単一の selection state）
- 位置なしのシリーズ（`anchor` が `ANCHOR_UNLOCATED`）は地図に出ない。
  同じパネルの別区画に、地図と区別して並べる（[ADR-0026](adr/0026-two-phase-location.md)）。
  現在窓で絞るかどうかは S5 で決める（§8）
- 第二段階のデータが入った後は、代表点と精緻な事物のどちらを描くかを利用者が画面で切り替える（[ADR-0026](adr/0026-two-phase-location.md)）。
  切り替えを出すかどうかは環境変数が決め、精緻な事物を持たないシリーズは代表点へフォールバックする。
  代表点は `series.anchor` の参照で見分けるので、二つの集合は同じ `loci.geojson` から割れる。
  実装は #111
- オブジェクトクリック → 詳細カード（summary・年代・エピソード一覧・Spotify リンク）
- 状態管理は React の範囲で足りる想定（selection / era window / panel 開閉のみ）。
  外部ライブラリを足す前に本当に要るか問う
- 地図の上に載る overlay は React + Tailwind で書く。MapLibre 由来の DOM は canvas コンテナと attribution だけで、Popup も built-in control も使わない（[ADR-0022](adr/0022-map-dom-boundary.md)）

地図の画面のほかに、出典表記の置き場を二つ持つ。
何を載せるかは ADR-0008 が持つ。

公開サイトの外に、手元でだけ立つ管理画面を持つ（[ADR-0028](adr/0028-local-only-admin.md)）。
シリーズを選んで地図をクリックすると代表点が置かれ、`series.json` と `loci.geojson` へ書かれる。
書く前にスキーマと参照の検査を通し、通らない値は書かない。
実装の形と入口は #110 が決める。

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
  S4 の opacity 制御の上に載る差分で、選択が無いときは何も起きない。
  `timeRange` が `"untimed"` のシリーズを選んだときも、重なりを求める年が無いので何も起きない
- **tag 絞り込み**: パネルに現在窓の tags を並べ、選んだタグを持つシリーズだけを地図とパネルに残す。
  selection とは別に filter state が一つ増える

近接のためにスキーマは増やさない。
判定は既存の properties（`tags` / `region` / `timeRange`）だけで行う。
シリーズ間の明示的な関連リンク（`related` のような属性）は、全シリーズ（2026-08-23 時点で 66 件）へ人手で張る費用が S7 に乗るので採らない。
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
  - `<link>` は Spotify のエピソードページで、これが配信リンクになる（[ADR-0006](adr/0006-rss-link-as-episode-url.md)）
  - `enclosure` は `anchor.fm` の再生 URL（cloudfront の mp3 を包む）。
    音声を再生する画面が無いので episodes.json へは保存しない
  - シリーズ番号は `itunes:season`。1〜66 が欠番なく並ぶが、752 件中 176 件（番外編・特別編・告知）はこれを持たない
  - シリーズ内の回は `itunes:episode`。消費する画面が無いので episodes.json へは保存しない（ADR-0018）
- `web/scripts/sync-feed.ts`（`web/package.json` の scripts に `sync` として登録）:
  1. RSS を取得し、guid で episodes.json と差分
  2. series.json 全件の `season` から season → seriesId の索引を組み、フィード全件の `itunes:season` で引いて seriesId 割当（ADR-0018）
  3. 結果サマリを stdout へ。
     未割当は「規則で確定」（`itunes:season` を持たない回・番外編）と「シリーズ未作成」に割って数える（[ADR-0029](adr/0029-two-layer-data-without-inbox.md)）
- 運用: 当面は手動で `pnpm sync` → サマリの「シリーズ未作成」を見て `series.json` へシリーズを足し、管理画面で代表点を置くか位置なしにする → コミット。
  手を入れる先は手動層の `series.json` と `loci.geojson` だけで、`episodes.json` は毎回フィードから組み直すので編集しない。
  未割当を溜める置き場も持たず、いま何が未割当かは `episodes.json` の `seriesId` が持つ（[ADR-0029](adr/0029-two-layer-data-without-inbox.md)）。
  軌道に乗ったら GitHub Actions の cron で sync + PR 自動作成に昇格（S8 以降の任意課題）
- 静的サイトなので実行時 fetch はしない。同期は常にビルド前のデータ更新として行う

## 6. ディレクトリ構造

ルートは**プロジェクトの文書と運用設定**だけを持ち、Next.js アプリは `web/` 配下に隔離する。
このリポジトリは今後 `catalog/`（人間キュレーション層）と RSS 同期スクリプトを持つので、
`src/` の隣に `catalog/` が並ぶと「これは Next.js が読むのか、ビルド前に走る何かなのか」が
構造から読めなくなる。境界をディレクトリで引けば、その問いが起きる場所そのものが無くなる。

```
.
├── README.md              # リポジトリの玄関。GitHub がここを描く
├── LICENSE                # GitHub がライセンス欄に出す
├── CLAUDE.md              # セッションの入口（規約・git）
├── catalog/               # 人間キュレーション層と時代区分。アプリの外なのでルート側
├── docs/                  # リポジトリ自身の文書
│   ├── ARCHITECTURE.md    # この文書（現況）
│   ├── ROADMAP.md         # 作る順序
│   ├── HARNESS.md         # 検証と実行環境
│   ├── adr/               # 決定と経緯。1決定1レコード
│   └── sources/           # `catalog/` の値の典拠。1 シリーズ 1 ファイル
├── mise.toml              # [tools] のみ。ランタイム版管理
├── .github/               # workflows・issue / PR テンプレ
├── .claude/               # settings・hooks・同梱 skill・rules/（規範。共有の雛形からの写し）
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

ルートに残るのは、道具がその位置を要求するものだけである（[ADR-0032](adr/0032-docs-under-docs.md)）。

まだ存在しないもの: `docs/VISION.md`（#41）。
`docs/sources/` は 66 シリーズのうち 6 件しか持たない（[ADR-0037](adr/0037-sources-layer.md)）。
ファイルが在ることが裏どりの済んだ印なので、無い 60 件は未調査である。
`catalog/` はアプリの外なので**ルート側**に置く。

`web/scripts/` はこれと別枠になる。`tsconfig.json` の `paths` も vitest の alias も `web/` の中で
解決するので、`web/` の道具立てに依るスクリプトはルートへ出さず `web/scripts/` に置く。
RSS 同期（`sync-feed.ts`）は `web/src/` のスキーマとパーサを import し `pnpm` の scripts から走るので、
ビルド前処理もここに入る。
`catalog/` の検査はスクリプトを持たず、`web/tests/catalog.test.ts` が L2 で回す（`HARNESS.md`）。

## 7. 意図的にやらないこと

- **OpenHistoricalMap 連動を MVP に入れない**。S9 の任意課題として分離する（`ROADMAP.md`）
- **番組の説明文・ロゴ・カバーアートを使わない**（ADR-0008 の帰結）。
  載せるのはシリーズ名とエピソードタイトルだけ
- **公開サイトにユーザ登録・コメント等の動的機能を持たない**。static export の前提（ADR-0001）から外れる。
  データの編集は手元の管理画面が担い、公開サイトの成果物に含まれない（[ADR-0028](adr/0028-local-only-admin.md)）
- **第一段階で Point 以外の図形を持たない**。版図や経路の精緻な図形は第二段階（S9）で、完了条件の外（[ADR-0026](adr/0026-two-phase-location.md)）
- **シリーズ間の明示的な関連リンク（`related` のような属性）を持たない**（§4）
- **実行時 fetch を持たない**。同期は常にビルド前（§5）

## 8. 持ち越した開いた問い

構造に関わる未決で、該当 issue に着手するときに解く。

- 一つのエピソードが複数シリーズに跨る回（対談・番外編）の見せ方。
  `seriesId` は単数 nullable で、割当キーが season なので、season を持つ回は必ず一つのシリーズへ入る（ADR-0018）。
  跨る回をどちらのシリーズの下に見せるかは S6 の精緻化のときに突き合わせる
- モバイルでの振る舞い（全画面マップ + 下部スライダー + 左パネル）の範囲は S8 の精緻化で決める
- 位置なしのシリーズを一覧パネルの別区画に出すとき、現在窓で絞るか全件を常に出すか。
  絞れば地図と同じ時代の話だけが並び、絞らなければ地図に出ないものの一覧として安定する。
  `timeRange` が `"untimed"` のシリーズは年を持たないので現在窓と比べられず、絞る場合はそのシリーズをどう並べるかも決めることになる。
  S5 を割るときに決める
- 時期なしのシリーズと、年を持つ位置なしのシリーズ（ショート 切腹など）を、一覧パネルと詳細カードでどう見せるか。
  年代の欄に何を出すかは、S3 の詳細カード（#146）と S5 を割るときに決める
- 概念史以外で現在まで続く主題の `end` をどう書くか（[ADR-0019](adr/0019-era-open-end.md) の `"present"` をシリーズにも許すか）。
  2026-09-10 時点で当てはまるシリーズが無いので、現物が出たときに決める（[ADR-0039](adr/0039-untimed-concept-series.md)）
- 位置なしのシリーズに第二段階の事物を持たせるか。
  第一段階の規則は「事物を持たない」で、代表点を持たないことは段階を問わず決まっている。
  #111 に着手するときに決める
- `series.timeRange` が era 空間からはみ出しても、いまは赤くならない。
  検査は入っている（`web/src/lib/schema/references.ts` の `seriesOutsideEraSpace`）が、見るのは**重なるかどうかだけ**で、収まっているかは見ていない。
  era 空間の外へ伸びる `timeRange` を書けてしまうので、S4 を割るときに現在窓の幅と一緒に拾う
