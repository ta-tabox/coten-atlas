# coten-atlas 実装プラン（正典）

正典化の型: `fermentary/playbooks/planning.md`（1ステップ=1セッション、
各ステップ自己記述、NEXT.md はポインタ）。
完了したらステップ末尾に完了印と発見事項を追記する。プランと実態が乖離したら
先にここを改訂してから進む。

## 0. 決定事項（2026-07-14 立ち上げ時）

| 項目 | 決定 | 理由 |
|---|---|---|
| スタック | Next.js (App Router) + TypeScript、**static export**（`output: 'export'`） | 転職ポートフォリオとして Next.js 習熟を示す（coten-career と接続）。サーバ処理は不要なので実質静的サイト |
| ツールチェーン | mise + pnpm + Biome | toolchain 正典に従う（`fermentary/playbooks/toolchain.md`） |
| 地図 | MapLibre GL JS（+ react-map-gl の maplibre エントリ） | 無料・ベクタタイル・opacity 遷移やスタイル制御の自由度が高い |
| ベースマップ | OpenFreeMap（キー不要・無料）の淡色スタイル。不足なら Carto 系無料スタイル | POI 不要・地域名程度で足りる要件に合致。淡色はテーマオブジェクトを主役にできる |
| 歴史地図 | 現代地図で開始。OpenHistoricalMap 連動は S9（後回し） | 古代の網羅性が不完全でリスクが読めないため、MVP と分離 |
| エピソード取得 | RSS を正とする自動同期（ビルド時スクリプト） | 今後の追加に耐える。詳細は §3 |
| データ管理 | エピソード=RSS 自動 / テーマ=人間キュレーション の二層分離 | 座標・年代・ジオメトリは自動化できない。自動層と手動層を混ぜると更新のたびに壊れる |
| 配信リンク | Spotify（エピソード URL または番組 URL + 検索導線） | 基盤未定のため一旦 Spotify。データ側は `links` を配列にして基盤追加に開いておく |
| デプロイ | Vercel 想定（GitHub Pages でも可） | static export なのでどちらでも。ポートフォリオ導線として公開 URL 必須 |

## 1. データモデル

### 二層構造

```
data/
├── episodes.json        # 自動層。RSS から同期。手で編集しない
├── themes.geojson       # 手動層。テーマ=キュレーション対象の正典
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

## 2. UI 構成

- 全画面マップ + 下部に era スライダー（ラベルは era 名、位置は補間年を薄く表示）
- 左に開閉パネル: 現在窓に表示中のテーマ一覧。クリックで該当オブジェクトを
  選択（flyTo + ハイライト）。地図側の選択もパネルに同期（単一の selection state）
- オブジェクトクリック → 詳細カード（summary・年代・エピソード一覧・Spotify リンク）
- 状態管理は React の範囲で足りる想定（selection / era window / panel 開閉のみ）。
  外部ライブラリを足す前に本当に要るか問う

## 3. RSS 同期パイプライン（今後の追加に耐える仕組み）

- feedUrl の取得: Apple Podcasts lookup API
  `https://itunes.apple.com/lookup?id=1450522865` の `feedUrl` を確認して固定する
  （S6 冒頭で実施。RSS が Spotify エピソード URL を含まない場合の対応もここで判断——
  最悪、番組 URL + エピソードタイトル検索への導線で妥協する）
- `scripts/sync-feed.ts`（mise task `sync` として登録）:
  1. RSS を取得し、guid で episodes.json と差分
  2. 新規エピソードを themes.geojson の各 `match` 正規表現に通して themeId 割当
  3. どのテーマにも合わないものは `data/inbox/YYYY-MM-DD.json` にスタブ排出
     （タイトル・guid・推定シリーズ名。座標と年代は空欄=人間+Claude の補正対象）
  4. 結果サマリ（新規 n 件 / 割当 m 件 / 要レビュー k 件）を stdout へ
- 運用: 当面は手動で `mise run sync` → inbox を見てキュレーション → コミット。
  軌道に乗ったら GitHub Actions の cron で sync + PR 自動作成に昇格（S8 以降の任意課題）
- 静的サイトなので実行時 fetch はしない。同期は常にビルド前のデータ更新として行う

## 4. ステップ分割（1ステップ = 1セッション）

### S0: 移設・git 化・プロジェクト化【人間】
- 入口: bootstrap 一式が `fermentary/_bootstrap/coten-atlas/` にある（済）
- 作業: terrarium.md 手順 2〜4（mv → git init + 初回コミット → Cowork
  プロジェクト作成 + fermentary 並置）
- 完了条件: coten-atlas セッションから fermentary/RULES.md が読める

### S1: 足場 + 地図 Hello World
- 入口: S0 完了
- 作業: toolchain 正典を読む → mise.toml（node 固定）→ `pnpm create next-app`
  （TS / App Router）→ `output: 'export'` 設定 → Biome 導入 → maplibre-gl +
  react-map-gl 導入 → OpenFreeMap スタイルで全画面地図を表示
- 完了条件: `pnpm build` が out/ を生成し、ローカルで地図が表示される
- 引き継ぎ: 採用したベースマップスタイル URL を本ファイル §0 に追記

### S2: データスキーマ確定 + シード
- 入口: S1 完了
- 作業: §1 のスキーマを TypeScript 型（zod 等でバリデーション）に落とす。
  地理的・時代的に分散した 10 シリーズ前後を選びシードを作る
  （例: 三国志 / スパルタ / 吉田松陰 / ペスト / アメリカ開拓史 / 世界三大宗教 /
  お金の歴史 / ヒトラー / 大航海時代系 / クレオパトラ——Point / Polygon /
  LineString / concept の各 kind を最低1つ含めること）
- 完了条件: themes.geojson（シード入り）がバリデーションを通る。
  concept 系の置き方の規約を §1 に追記済み
- 引き継ぎ: シードは叩き台。人間補正は S7 でまとめて

### S3: テーマ描画
- 入口: S2 完了
- 作業: themes.geojson をレイヤ描画。kind ごとのスタイル分岐
  （Point=circle+ラベル、Polygon=fill+outline、LineString=line、concept=淡色）。
  クリック → 詳細カード（summary・エピソード・Spotify リンク）
- 完了条件: シード全件が地図上で見え、クリックで詳細が開き Spotify へ遷移できる

### S4: 時系列フェード
- 入口: S3 完了
- 作業: eras.json とスライダー実装。現在窓の算出 → 重なり率 → opacity
  （feature-state or paint expression。遷移はイージングで滑らかに）
- 完了条件: スライダー操作で同じ場所のテーマが時代に応じて入れ替わる。
  フェードが視覚的に滑らか

### S5: 一覧パネル + 選択同期
- 入口: S4 完了
- 作業: 表示中テーマの開閉パネル。パネル⇄地図の双方向選択同期（flyTo含む）
- 完了条件: パネルから任意テーマを選択→地図が寄る、地図クリック→パネルが追従

### S6: RSS 同期パイプライン
- 入口: S2 完了（S3〜S5 と並行可）
- 作業: §3 の実装。feedUrl 確定 → sync スクリプト → mise task 登録 →
  実フィードで初回同期し episodes.json を生成
- 完了条件: `mise run sync` が動き、全エピソードが取得され、シード分が
  match で自動割当され、残りが inbox にスタブ排出される
- 引き継ぎ: RSS に Spotify リンクが含まれるかの調査結果を §3 に追記

### S7: 全シリーズデータ叩き台【Claude 叩き台 → 人間補正】
- 入口: S6 完了(inbox に未割当スタブが揃っている)
- 作業: inbox のスタブ全件（90 シリーズ前後）に座標・timeRange・kind・summary・
  match を付けて themes.geojson へ叩き台マージ。情報源: 公式サイト
  (cotenradio.fm)・ファンメイド配信一覧・各シリーズの内容知識
- 完了条件: 全シリーズが地図に載る（精度は叩き台品質で可）
- 引き継ぎ: 人間補正は別途流し込み（補正のたびの再ビルドで反映）。
  1セッションで終わらなければ era 順に分割してこの節を割る

### S8: 仕上げ + デプロイ + README
- 入口: S5・S7 完了
- 作業: スタイル調整・モバイル対応の最低限・Vercel デプロイ（アカウント連携は
  人間）・ポートフォリオ README（設計判断・スクショ・技術スタック）
- 完了条件: 公開 URL で全機能が動作。README がポートフォリオとして提示可能

### S9（任意・後回し）: OpenHistoricalMap 連動
- 入口: S8 完了後、意欲があれば
- 作業: OHM ベクタタイルを era 窓と連動させ、時代に応じて地域名・国境の
  表示が変わるか検証。品質が要件（地域名程度）を満たすか判断してから本実装
- 完了条件: 検証結果と採否をこの節に記録

## 5. 依存関係

```
S0 → S1 → S2 → S3 → S4 → S5 ─┐
            └→ S6 → S7 ───────┴→ S8 → S9(任意)
```

S6 は S3〜S5 と並行可。人間の作業（S0、S7 補正、S8 デプロイ連携）は
Claude の作業と非同期で進められる。
