# 0024. 地図から返る feature は鍵の運搬に限り、シリーズの属性は `data/` を読んだ値から引く

- **状態**: 採用
- **決定日**: 2026-09-01
- **関係する ADR**: 0003（MapLibre）、0005（データの二層分離）、0022（地図の DOM 境界）

## 文脈

`data/series.geojson` は二つの経路で使われる。
MapLibre の `geojson` source へそのまま渡って描画とスタイル分岐の入力になり、同じ中身が `parseSeries` を通った値として React 側の手元にも残る。

S3 以降、地物のクリックとホバーから詳細カード・一覧パネル・関連シリーズ行が開く。
このとき、カードに出す `title` や `timeRange` をどこから読むかが決まっていない。
クリックのハンドラは MapLibre が組み立てた feature を引数で受け取るので、そこから読むのが最短に見える。

MapLibre はこの経路で属性をそのまま渡さない。
`queryRenderedFeatures` の仕様がこう書いている（maplibre-gl 6.6.0 の型定義で確認した）。

> For GeoJSON sources, only string and numeric property values are supported (i.e. `null`, `Array`, and `Object` values are not supported).

`seriesPropertiesSchema` の 9 欄のうち、`timeRange` はオブジェクト、`links` と `tags` は配列で、3 欄がこれに当たる。

さらに詳細カードが出すエピソード一覧は `series.geojson` に無い。
エピソードは `data/episodes.json` が持ち、`seriesId` で一対多に繋がる（0005）。
シリーズ側はエピソードの配列を持たないので、地物から読める範囲をどれだけ広げてもカード 1 枚は埋まらない。

## 決定

**地図から返る feature から読んでよいのは `properties.id` だけとする。**
シリーズの属性は、`parseSeries` を通して React 側が持つ `SeriesCollection` から `id` で引き直す。

1. クリック・ホバーのハンドラは feature から `properties.id` を取り、selection state へ入れる
2. 描画に要る属性は MapLibre のスタイル式が `['get', ...]` で読む。
   これは地図の中で閉じるので上の制限に当たらない
3. カード・一覧パネル・関連シリーズ行が読むのは、`data/` を読んで検査に通した値だけ
4. エピソード一覧は `episodes.json` を `seriesId` で引く

## 理由

制限に触れない経路が既にあるので、触れる経路を選ぶ理由が無い。
React 側は `series.geojson` を検査済みで持っており、`id` はシリーズ間で一意（`seriesCollectionSchema` が重複を落とす）なので、文字列 1 個あれば全属性へ戻れる。

採らなかった案:

- **feature の `properties` をそのまま読む** — 3 欄が仕様の外にある。
  何が返るかは版と source の実装に依存し、壊れ方は「年代の欄が空になる」「tags が 1 文字ずつ並ぶ」のように静かに出る。
  MapLibre が返すのは検査を通っていない値なので、`SeriesCollection` の型も効かない
- **`properties` を string と number だけの平らな形に潰す**（`timeRange` を `timeStart` / `timeEnd` へ、`tags` をカンマ区切りへ） — 制限には触れなくなる。
  ただし人間が手で書くファイルの形まで平らになり、`timeRange` の逆転検査や `links` の platform 重複検査といった、構造を持つからこそ書ける検査を失う。
  地図という一つの消費者の都合を、手動層のファイルの形へ持ち込むことになる
- **必要な値を詰めた JSON 文字列の欄を 1 つ足す** — string なので制限を通る。
  同じ情報の二つ目の写しが `data/` に生まれ、どちらが正かを決める規則が要る。
  規則を足すだけで、決めることは減らない

エピソードは初めからこの経路に乗らない。
乗せるにはシリーズ側にエピソードの配列を持たせることになり、RSS が正の自動層を人間が編集する手動層のファイルへ複製するので、0005 の二層分離が崩れる。

## 帰結

- selection state が運ぶのは `id` の文字列 1 個になる。
  0022 が決めた「地物のクリックから詳細カードまでの経路は React の state を通る」の、運ぶ中身がこれで決まる
- React 側は `series.geojson` を二つの顔で持つ。
  MapLibre の source へ渡す生の JSON と、`id` で引ける索引の両方が要る
- `properties` へオブジェクトや配列を足してよい。
  地図がそれを読まないので、MapLibre の制限がスキーマの形を縛らない
- 地図の外から開く選択（一覧パネル・関連シリーズ行）も同じ索引を読むので、地図経由かどうかで情報源が割れない
- ホバー強調を `feature-state` で書くなら Feature の最上位の `id` が要る。
  `seriesFeatureSchema` は strictObject でその欄を許さないので、source 側の `generateId` を使うか `properties.id` を見る `filter` で強調するかのどちらかになる（S3 の判断）

## 覆る条件

MapLibre が GeoJSON source の `properties` について、構造を持つ値をそのまま返すと仕様で保証したとき。
描画そのものに構造を持つ属性が要るようになったとき（そのときは地図へ渡す形だけを平らにし、`data/` の形は動かさない）。
