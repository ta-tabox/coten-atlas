# coten-atlas 実装プラン（地図）

台帳の型: **issue 台帳版**（正典: `fermentary/playbooks/planning.md`）。
**順序・横断規約・完了条件の閾値はこの文書。作業単位と状態は GitHub Issues。**

この地図は**状態を持たない**——ステップに ✅ を書かない。完了は issue の close で
確定する。この文書を改訂するのは、順序か規約が変わったときだけ。

**Cowork の制約**: サンドボックスから GitHub へは到達できない。issue の登録・状態
更新は人間の手元（native fs 側）で回す。Cowork セッションが担うのは草稿の起草と
地図の改訂まで。

## 0. 完了条件の閾値（この器が「終わった」と言える基準）

terrarium は終わる器。次の3点が揃った時点で閉じる:

1. **公開 URL で地図アプリが動作し、公式一覧の全シリーズが地図に載る**

   「公式一覧」の定義（#13 で実地確認）:

   - 出典は公式 RSS `https://anchor.fm/s/8c2088c/podcast/rss` の `itunes:season`。
     番組サイト cotenradio.fm はドメインが失効して第三者の広告サイトに変わっており、
     coten.co.jp の COTEN RADIO ページも配信基盤へのリンクだけでシリーズを列挙していないので、
     一覧の正はフィードしか残っていない
   - 1 シリーズ = `itunes:season` の 1 値と数える
   - `itunes:season` を持たない回（番外編・特別編・告知）は数えない
   - `itunes:season` に番外編の通し番号が入った 3 件（115・116・117）も数えない。
     タイトルが `【番外編＃` で始まることで判別できる
   - 「COTEN RADIOショート」も独立した season 番号を持つので 1 シリーズとして数える
   - 2026-08-23 に取得したフィード（`lastBuildDate` は 2026-08-19）では
     season 1〜66 が欠番なく並び、対象エピソードは 573 件。
     シリーズは今後も増えるので、閾値を判定する時点のフィードを正とする（66 はその日のスナップショット）

   判定は「シリーズ数」——上の定義で数えた全シリーズが `themes.geojson` に存在し
   バリデーションを通ること。
   座標・年代の精度は叩き台品質で可
2. **`pnpm sync` による RSS 由来の新エピソード追加パイプラインが回る**
   （新規取得 → match 割当 → 未割当の inbox 排出まで）
3. **README がポートフォリオとして提示可能**（設計判断・スクショ・技術スタック）

## 1. 決定事項

| 項目 | 決定 | 理由 |
|---|---|---|
| スタック | Next.js (App Router) + TypeScript、**static export**（`output: 'export'`） | 転職ポートフォリオとして Next.js 習熟を示す（coten-career と接続）。サーバ処理は不要なので実質静的サイト |
| ツールチェーン | mise + pnpm + Biome | toolchain 正典に従う（`fermentary/playbooks/toolchain.md`） |
| テスト | **Vitest**（+ React Testing Library） | toolchain 正典は JS のテストランナーを固定していない。Vite 系の事実上の既定で Biome と衝突せず、静的サイトに追加ランタイムを持ち込まない（決定日 2026-08-02） |
| 機械判定の口 | **`pnpm check`** = `tsc --noEmit` → `biome ci .` → `vitest run` → `next build`。並びは安いものから落とす（L0 型 → L1 静的 → L2 ユニット → L3 ビルド） | issue の完了条件を一つのコマンドへ集約する。判定の口が複数あると、どれが緑なら閉じてよいかが毎回議論になる（決定日 2026-08-02）。**口を mise tasks から package.json の scripts へ移した（決定日 2026-08-25）**——toolchain 正典が JS/TS 系の設定の置き場を `package.json` と定めており、タスクだけ別ファイルへ出すと置き場が二つに割れる。`mise.toml` は `[tools]` のみを持ちランタイム版管理に徹し、`run = "pnpm check"` の薄いラッパも置かない（口が一本に見えて二本ある状態が、そもそも避けようとしたもの）。逸脱の記録は `CLAUDE.md`。**`next build` を含める**のは、static export がビルド時にしか壊れない失敗を持つため——判定の口が拾えないと PR は緑のまま公開が落ちる |
| 地図 | MapLibre GL JS（+ react-map-gl の maplibre エントリ） | 無料・ベクタタイル・opacity 遷移やスタイル制御の自由度が高い |
| ベースマップ | OpenFreeMap の positron `https://tiles.openfreemap.org/styles/positron`（API キー不要・リクエスト数無制限・商用可、MIT）。要求 attribution は `OpenFreeMap © OpenMapTiles Data from OpenStreetMap` で、スタイルが参照する TileJSON が持つので MapLibre の `AttributionControl` が既定で表示する（`attributionControl: false` を渡さないことが条件）。代替は Carto Positron `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`（attribution は `© CARTO, © OpenStreetMap contributors`、API キー必須・フェアユース 5M タイルリクエスト/月） | POI 不要・地域名程度で足りる要件に合致。淡色はテーマオブジェクトを主役にできる。キー不要と無制限を手放す理由が他に無いので、Carto へ倒すのは OpenFreeMap の可用性が実際に問題になったときだけ（確認日 2026-08-23） |
| 歴史地図 | 現代地図で開始。OpenHistoricalMap 連動は S9（後回し） | 古代の網羅性が不完全でリスクが読めないため、MVP と分離 |
| エピソード取得 | RSS を正とする自動同期（ビルド時スクリプト） | 今後の追加に耐える。詳細は §4 |
| データ管理 | エピソード=RSS 自動 / テーマ=人間キュレーション の二層分離 | 座標・年代・ジオメトリは自動化できない。自動層と手動層を混ぜると更新のたびに壊れる |
| 配信リンク | RSS の `<link>`（Spotify のエピソードページ）をそのまま使う。取れない回だけ番組 URL `https://open.spotify.com/show/3qiAapMhh8UgWVfDWTSq2f` + タイトル検索へ落とす | 全 752 件が `podcasters.spotify.com/pod/show/coten/episodes/…`（`creators.spotify.com` へリダイレクト）を持っており、エピソード単位のリンクは RSS だけで賄えるので検索導線は例外扱いでよい。`open.spotify.com/episode/…` はフィードに無く Spotify Web API 無しでは引けないため採らない。データ側は `links` を配列にして基盤追加に開いておく（決定日 2026-08-23、#13） |
| デプロイ | **GitHub Pages**（`https://ta-tabox.github.io/coten-atlas/`）。`next.config.ts` に `basePath` と `assetPrefix` = `/coten-atlas` を置く。独自ドメインは当てない | 公開物とコードの管理主体をリポジトリ一つに閉じられ、GitHub App の面と揃う。Vercel は追記ゼロで済む代わりに管理主体が増える（決定日 2026-08-23、#15）。将来ドメインを当てるなら `basePath` を外す改修が要る |
| 引用と出典 | シリーズ名とエピソードタイトルのみ載せ、番組の説明文は引かない（`summary` は残すが当面は空）。番組名はテキストとしてのみ使い、ロゴ・カバーアート・出演者画像は使わない。非公式である旨・権利の帰属・地図上の整理は独自である旨・公式への導線の4点を、フッタ（短文）と README と `/about` に置く。番組公式 `https://coten.co.jp/services/cotenradio/` への導線は配信リンクとは別にフッタへ常時置く。文言の実装は S8（決定日 2026-08-23、#17） | 番組公式に第三者向けの利用規約が無く（公開ページを全列挙して確認。`crew-terms-of-service` は有料会員向けの契約で非会員には及ばない）、許諾も禁止も明示されていないので、線は原則から引くしかない。著作物性が争いになりにくい題号だけを載せ、説明文と画像には触れない。ロゴは出所表示なので公式・提携との誤認を招く。番組サイト `cotenradio.fm` はドメインが失効して第三者の広告サイトに変わっており、公式への導線に使うと誤誘導になるので、宛先は運営元 COTEN の COTEN RADIO ページにする（#13 で確認、差し替え日 2026-08-25） |

## 2. データモデル

### 二層構造

```
data/
├── episodes.json        # 自動層。RSS から同期。手で編集しない
├── themes.geojson       # 手動層。テーマ=キュレーション対象の正典
├── eras.json            # 時代区分（§2 時系列モデル）
└── inbox/               # RSS 同期が排出する「未割当テーマのスタブ」置き場
```

**episodes.json**（RSS 由来、guid キー）:

```jsonc
{
  "syncedAt": "2026-07-14T00:00:00Z",
  "episodes": [
    {
      "guid": "...",            // RSS の guid。差分同期のキー
      "title": "三国志 徹底解説 #1 ...",
      "pubDate": "...",
      "audioUrl": "...",
      "themeId": "sangokushi",  // マッチャが割当。未割当なら null
      "links": { "spotify": "https://open.spotify.com/episode/..." }
    }
  ]
}
```

**themes.geojson**（GeoJSON FeatureCollection。MapLibre に直接食わせる）:

```jsonc
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [112.5, 34.6] },
  // Point / Polygon / LineString をテーマの性質で使い分ける
  // 例: 都市国家=Point、帝国や文明圏=Polygon、遠征や航海=LineString
  "properties": {
    "id": "sangokushi",
    "title": "三国志",
    "kind": "polygon",              // 描画スタイルの分岐キー
    "timeRange": { "start": 180, "end": 280 },  // 負値 = BC
    "summary": "後漢末期から晋の統一まで…",
    "region": "中国",
    "match": "^三国志",             // エピソードタイトル割当用の正規表現
    "links": { "spotify": "https://open.spotify.com/..." },
    "tags": ["戦乱", "中国"]
  }
}
```

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
  { "id": "modern20b",  "label": "戦後",   "start": 1945,   "end": 2030 }
]
```

- スライダー位置 → era 内を線形補間して「現在窓（年範囲）」を得る
- テーマの表示 opacity = timeRange と現在窓の重なり率（0..1）を
  イージングに通した値。窓の端で滑らかにフェードイン/アウトする
- era の刻みはデータが揃ってから密度に合わせて調整する（S7 の後に見直し）

## 3. UI 構成

- 全画面マップ + 下部に era スライダー（ラベルは era 名、位置は補間年を薄く表示）
- 左に開閉パネル: 現在窓に表示中のテーマ一覧。クリックで該当オブジェクトを
  選択（flyTo + ハイライト）。地図側の選択もパネルに同期（単一の selection state）
- オブジェクトクリック → 詳細カード（summary・年代・エピソード一覧・Spotify リンク）
- 状態管理は React の範囲で足りる想定（selection / era window / panel 開閉のみ）。
  外部ライブラリを足す前に本当に要るか問う

## 4. RSS 同期パイプライン

- feedUrl: `https://anchor.fm/s/8c2088c/podcast/rss`。
  Apple Podcasts lookup API `https://itunes.apple.com/lookup?id=1450522865` の `feedUrl` を
  2026-08-23 に実取得した値で、以後はこれを直接叩く
- フィードの形（#13 で実地確認。パーサはこれを前提にしてよい）:
  - `guid` は `isPermaLink="false"` の UUID。
    ただし初期の 5 件だけ `anchor.fm` のエピソード URL が入っており、先頭に空白が付く。
    突き合わせのキーにする前に trim する
  - `pubDate` は RFC 822（`Wed, 19 Aug 2026 21:00:00 GMT`）で、全件 GMT 表記
  - `<link>` は Spotify のエピソードページ、`enclosure` は `anchor.fm` の再生 URL（cloudfront の mp3 を包む）
  - シリーズ番号は `itunes:season`、シリーズ内の回は `itunes:episode`
- `scripts/sync-feed.ts`（package.json の scripts に `sync` として登録）:
  1. RSS を取得し、guid で episodes.json と差分
  2. 新規エピソードを themes.geojson の各 `match` 正規表現に通して themeId 割当
  3. どのテーマにも合わないものは `data/inbox/YYYY-MM-DD.json` にスタブ排出
     （タイトル・guid・推定シリーズ名。座標と年代は空欄=人間+Claude の補正対象）
  4. 結果サマリ（新規 n 件 / 割当 m 件 / 要レビュー k 件）を stdout へ
- 運用: 当面は手動で `pnpm sync` → inbox を見てキュレーション → コミット。
  軌道に乗ったら GitHub Actions の cron で sync + PR 自動作成に昇格（S8 以降の任意課題）
- 静的サイトなので実行時 fetch はしない。同期は常にビルド前のデータ更新として行う

## 5. 順序の地図

ステップは issue の束の見出しであって、作業単位ではない（作業単位は issue）。
ここが持つのは**なぜこの順か**と**そのステップが閉じたと言える閾値**の二つだけ。

```
S1 → S2 → S3 → S4 → S5 ─┐
        └→ S6 → S7 ──────┴→ S8 → S9(任意)
```

S6 は S2 完了後、S3〜S5 と並行可。人間の作業（S7 のデータ補正、S8 のデプロイ連携）は
Claude の作業と非同期に進む。

| ステップ | 内容 | なぜこの順か | 閉じた判定 |
|---|---|---|---|
| **S1** | 足場 + ベースマップ表示 | 以降の全ステップが「ビルドが通る器」を前提にする | `pnpm check`（静的ビルドを含む）が緑で、全画面にベースマップが出る |
| **S2** | データスキーマ確定 + シード10前後 | 描画のスタイル分岐は `kind` に依存し、`kind` の集合はシードを一度作らないと確定しない。未確定の前提の上に描画を積まない | 4 種の `kind` を含むシードがバリデーションを通り、concept 系の置き方が §2 に追記済み |
| **S3** | テーマ描画 + 詳細カード | データの形が決まって初めてレイヤを書ける | シード全件が地図上に見え、クリックで詳細が開く |
| **S4** | 時系列フェード（era） | opacity 制御は描画レイヤの**上に載る差分**。レイヤが無いうちは書けない | スライダー操作で同じ場所のテーマが時代に応じて入れ替わる |
| **S5** | 一覧パネル + 選択同期 | selection の消費者が地図とパネルの二者になって初めて「同期」の設計が要る。単方向で足りるうちは S3 の詳細カードで済む | パネル⇄地図の双方向選択が一致する |
| **S6** | RSS 同期パイプライン | `match` は themes のプロパティ。スキーマ確定前には書けない（＝ S2 の後）。UI とは独立なので S3〜S5 と並行できる | `pnpm sync` が全エピソードを取得し、シード分を自動割当し、残りを inbox へ排出する |
| **S7** | 全シリーズデータ叩き台 | 入口は S6 が排出した inbox スタブ。手で列挙してから同期を書くと二度手間 | 公式一覧の全シリーズが `themes.geojson` に載りバリデーションを通る（§0 閾値1） |
| **S8** | 仕上げ + 出典表記 + デプロイ + README | 見せるものが揃ってからでないと README の設計判断が書けない。出典表記は公開と同時に要る——公開してから足すのでは、ポートフォリオとして見られている最中の修正になる | 公開 URL で全機能が動作し、§1「引用と出典」の決定どおりフッタ・README・`/about` が揃い、README が提示可能（§0 閾値3） |
| **S9** | （任意）OpenHistoricalMap 連動 | MVP のリスクから分離した後回し。着手は S8 の後、意欲があれば | 検証結果と採否をこの表に記録して終わり |

**S7 の分割規約**: 1セッションで終わらない（90前後）。era 順に issue を割る
（例: 古代 / 中世 / 近世 / 近現代）。割る単位は「一つの issue でバリデーションが
緑になる」——中途半端な feature を残してセッションを跨がない。

## 6. 精緻化の規律

全ステップを一度に issue へ降ろさない。直近 2〜3 ステップのみ関数シグネチャと
テストケースまで降ろし、遠いものは粗いまま置く。手前の issue が尽きたら次の束を割る
（理由は planning.md「精緻化はいつやるか」）。**どこまで降りているかは NEXT.md が持つ**
——この地図は状態を持たない。
