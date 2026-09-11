# マルクス・エンゲルス（`marx-engels`・season 29）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `marx-engels` |
| `series.json` の `season` | 29 |
| `series.json` の `timeRange` | 1818..1895 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `london` |
| `loci.geojson` の座標 | `[-0.128, 51.507]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1818 | マルクスの生年（5 月 5 日） | [Britannica: Karl Marx](https://www.britannica.com/biography/Karl-Marx)（三次） | 無し |
| `end` | 1895 | エンゲルスの没年（8 月 5 日） | [Britannica: Friedrich Engels](https://www.britannica.com/biography/Friedrich-Engels)（三次） | 無し |

二人を扱うシリーズなので、現物の `kou-to-ryuho`（項羽と劉邦）に揃えて、早い方の生年から遅い方の没年までにした。
配信フィードの各回の説明によれば、第 12 回がマルクスの没後（1883 年より後）のエンゲルスを扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | -0.1275, 51.507222 |
| 典拠 | [Wikidata Q84](https://www.wikidata.org/wiki/Q84) |
| 典拠の格 | 三次 |

配信フィードの各回の説明によれば、第 2〜5 回がウィーン会議後のプロイセンと二人の生い立ち、第 6〜8 回が二人の出会い・『共産党宣言』・亡命、第 9〜11 回が『資本論』と第一インターナショナル、第 12 回がエンゲルスの晩年を扱う。
代表点をロンドンに置いたのは、マルクスが 1849 年から没年まで住み、『資本論』の執筆と第一インターナショナルの設立を行った地だからである。
`@historian` は、English Heritage と German History in Documents and Images でこの事実を確認し、トリーアは出生地だけ、マンチェスターはエンゲルスの勤め先で二人に共通する拠点ではないとして、ロンドンが妥当と判断した。

| 候補 | 置くと何が起きるか |
|---|---|
| ロンドン（現在値） | 二人がともに活動し、『資本論』を書いた地に点が立つ |
| トリーア（マルクスの生地） | 活動の拠点でない点が立つ |
| マンチェスター（エンゲルスの勤め先） | エンゲルスだけの拠点に点が立つ |

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理がドイツ・フランス・ベルギー・英国で一区画に収まるので、[ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 1 行目で決めた。
`@historian` は、活動の範囲が `ヨーロッパ` に収まることを確認した。
`kind: place` と `title: マルクス・エンゲルス` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#165](https://github.com/ta-tabox/coten-atlas/pull/165) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `end` | 1895（エンゲルスの没年） | 主題の中心の語をマルクスと見て、マルクスの没年（1883）で閉じる案もある |
| 代表点 | ロンドン | エンゲルスの拠点を重く見ればマンチェスターになる |

ロンドンは、#169（S7: 近世の 8 シリーズを series.json へ載せる）の `elizabeth-1`（エリザベス1世）も要求している。
#169 は `whitehall` を使い、事物の `id` は重ならない。

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628088075) | `timeRange`・代表点・`region` の裏どり |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628210063) | 1 回目で URL が返らなかった `timeRange` と座標の典拠 |
| [#165 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/165) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

1 回目は典拠を事典の名と Wikidata の番号だけで返したので、2 回目が URL と値を返した。
**典拠の URL は 2 回目が正である。**
