# 0027. シリーズと事物を分け、シリーズは代表点の参照か位置なしの印を持つ

- **状態**: 採用
- **決定日**: 2026-09-02（#108）
- **関係する ADR**: 0005（データの二層分離）、0018（割当キーは `itunes:season`）、0019（終わっていない era の印）、0024（地図から返る feature は鍵の運搬に限る）、0026（位置情報の段階分け）

## 文脈

0026 は第二段階に「1 シリーズが年範囲の違う複数の事物を持つ」を置いた。
`series.geojson` は 1 Feature = 1 geometry で、シリーズと図形が 1 対 1 に縛られており、これを表せない。

0024 は地図から返る feature を鍵の運搬に限り、属性は `data/` を読んだ値から引くと決めている。
地図へ渡すファイルと属性を持つファイルが同じである必要は、既に無い。

#96 は、実物の輪郭（数百〜数千点）を `series.geojson` へ直に持つと手動層が人間の読める場所でなくなる、と指摘している。
#95 は位置なしを `geometry: null` で表す案を出していた。
0019 は「終わっていない era」を null でなく `"present"` の印で表し、null は無い理由を語らないと書いている。

## 決定

1. **`data/series.json` がシリーズの属性を持つ。**
   geometry を持たず、GeoJSON でもない。
   列は `eras.json` と同じ素の配列
2. **`data/loci.geojson` が事物（`locus`、複数形 `loci`）を持つ。**
   GeoJSON FeatureCollection で、地図の source の元になる。
   source へ渡す形はビルド時に組み、properties へ `kind` と解決した `timeRange` を写す。
   geometry は触らない。
   Feature の `properties` は `id`・`seriesId`・`timeRange` の 3 欄。
   第一段階の geometry は Point だけ
3. **シリーズは `anchor` を持ち、値は代表点の事物 id か、位置なしを表す値 `"unlocated"`（コードでは `ANCHOR_UNLOCATED`）のどちらか。**
   null を使わない。
   事物の id に `"unlocated"` は使えない
4. **ファイルをまたぐ整合を `references.ts` が見る。**
   `anchor` が指す事物が実在し、その `seriesId` がそのシリーズを指し、geometry が Point であること。
   位置なしのシリーズが事物を 1 件も持たないこと。
   全事物の `seriesId` が実在するシリーズを指すこと
5. **事物は第一段階から `timeRange` を持つ。**
   値は年の閉区間（`series.timeRange` と同じ形）か、シリーズの `timeRange` と同じことを表す値 `"series"`（コードでは `TIME_RANGE_OF_SERIES`）のどちらか。
   代表点の `timeRange` は `"series"` でなければならない。
   代表点はシリーズ全体を代表するので、年を写して二重に持たない。
   年を書いた事物の `timeRange` は、そのシリーズの `timeRange` に収まっていなければならない（`references.ts`）
6. 役割の欄は持たない。
   代表点は `series.anchor` の参照で見分ける

## 理由

シリーズと図形の多重度を 1 対多にするには、図形を別のファイルへ出すしかない。
属性を持つファイルが geometry を持たなければ、第二段階で重い輪郭がどこに置かれても、人間が読む属性の diff は汚れない。
`loci.geojson` が GeoJSON なので、地図へ渡す形は properties へ鍵から引いた値を写すだけで組める。
geometry を組み直す合成は要らない。

位置なしを印にするのは、「まだ置いていない」と「置かないと決めた」を分けるためである。
欄の欠落や null はどちらとも読める。
0019 と同じ理由で、読んだ人が意味を推測せずに済む語を置く。

事物に `timeRange` を第一段階から持たせるのは、描画の濃淡が読む欄を段階で変えないためである。
第二段階で欄が増えると、地図へ渡す形も era スライダーの入力も組み直すことになる。
代表点は常にシリーズ全体を代表するので、年を写すと同じ値を二箇所に持つ。
一致を定数で表せば、シリーズの `timeRange` を直したときに代表点が追随し忘れることが無い。

採らなかった案:

- **代表点の座標を `series.json` へ直に持ち、`loci.geojson` は第二段階で足す** — 第一段階は 1 ファイルで済む。
  ただし第二段階で geometry の置き場が 2 つになり、地図の source も 2 本になる。
  代表点も事物の一つだと最初から置くほうが、形が段階で変わらない
- **`geometry: null`（#95）** — GeoJSON の仕様は許す。
  ただし 1 Feature = 1 geometry のまま 1 対多にできず、null が「未決」か「位置なし」かを語らない
- **事物に `role: "anchor"` の欄を持たせる** — シリーズ側の参照と二重になり、片方だけ書き換えたデータが作れる
- **シリーズ側に事物 id の配列を持たせる** — 事物が増えると `series.json` が再び重くなる。
  参照は多の側から一の側へ向ける
- **代表点に年を写す** — 欄が一つの形で済む。
  ただしシリーズと同じ値を二箇所に持ち、片方だけ直したデータが作れる
- **`timeRange` を第二段階で足す** — 第一段階のスキーマが小さい。
  ただし欄が増えた時点で描画の入力が変わり、第一段階の表示を書き直すことになる
- **DB へ移す** — 0028

## 帰結

- 0024 の「読んでよいのは `properties.id` だけ」は、事物の `id` と `seriesId` の二つの鍵になる。
  どちらも string で、鍵の運搬に限る意図は変わらないので supersede しない
- 描画の濃淡に要る `kind` は事物の properties に無い。
  地図へ渡す形をビルド時に組むときに `seriesId` から引いて写す。
  `timeRange` の `"series"` も同じ場所でシリーズの値へ置き換える。
  era スライダー（S4）が読むのは事物の `timeRange` で、段階で変わらない。
  `data/` の形は動かさない（0024 の「地図へ渡す形だけを平らにする」と同じ扱い）
- `web/scripts/sync-feed.ts` の `readSeries` と `web/src/lib/feed/assign.ts` は `series.json` を読む。
  season → seriesId の索引の組み方は変わらない
- `web/src/lib/schema/data-files.ts` の対応表は 4 ファイルになる
- `series.geojson` は消え、`data/LICENSE` と `README.md` のファイル名が変わる
- 移行は #109。
  `ANCHOR_UNLOCATED`・`TIME_RANGE_OF_SERIES` の名と `references.ts` の検査もここで入る。
  第二段階の図形と、位置なしのシリーズに事物を持たせるかは #111 が決める
- `ROADMAP.md` の閾値 1 は `series.json` の件数を数える

## 覆る条件

第二段階に着手して、代表点を事物でなくシリーズの属性として持つほうが扱いやすいと分かったとき。
1 シリーズの事物が多くなり、`loci.geojson` 1 枚で人間が読めなくなったとき（そのときは分割の形を決める）。
