# ガンディー（`gandhi`・season 10）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `gandhi` |
| `series.json` の `season` | 10 |
| `series.json` の `timeRange` | 1869..1948 |
| `series.json` の `region` | `南アジア` |
| `loci.geojson` の `anchor` | `ahmedabad` |
| `loci.geojson` の座標 | `[72.581, 23.061]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1869 | ガンディーの生年（10 月 2 日） | [Britannica: Mahatma Gandhi](https://www.britannica.com/biography/Mahatma-Gandhi)（三次） | 無し |
| `end` | 1948 | ガンディーの没年（1 月 30 日。暗殺） | 同上 | 無し |

配信フィードの各回の説明によれば、第 1 回が生涯の全体、第 2 回が弁護士の時代、第 3・4 回が南アフリカでの人種差別とサティヤーグラハ、第 5 回が塩の行進、第 6 回がヒンドゥーとイスラームの対立と暗殺を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 72.5808, 23.0599（サーバルマティー・アーシュラムの地点） |
| 典拠 | [Wikidata Q1410702](https://www.wikidata.org/wiki/Q1410702)（値は GeoNames から取り込まれている） |
| 典拠の格 | 三次 |

`@historian` は格を参考程度と報告したが、値は地名辞典の GeoNames から取り込まれているので、[ADR-0037](../adr/0037-sources-layer.md) の定義で三次に当てた。
現在の値はアーシュラムの地点から約 120m 以内に在り、アフマダーバード市の中心（[Wikidata Q18145](https://www.wikidata.org/wiki/Q18145)）からは約 4.3km 離れる。
事物の `id` は市の名で、座標は市の中のアーシュラムの地点を指す。

代表点をアフマダーバードに置いたのは、ガンディーが 1917 年から 1930 年までサーバルマティー・アーシュラムに住み、第 5 回が扱う塩の行進もそこから出発したためである。
`@historian` は、南アフリカのダーバンでの活動（1893〜1914 年の約 21 年）の方が、アフマダーバード（約 13 年）より期間が長いと報告した（[South African History Online](https://sahistory.org.za/people/mohandas-karamchand-gandhi)、三次）。
アフマダーバードに移ってからがインド独立運動の指導者としての実践の時期に当たることは Britannica の記述から読めるが、史実の裏どりだけでは活動の拠点をどちらと見るかが一つに定まらないとした。

| 候補 | 置くと何が起きるか |
|---|---|
| アフマダーバード（現在値） | 独立運動の指導者としての拠点に点が立つ |
| ダーバン（南アフリカでの活動。第 3・4 回） | 期間の最も長い拠点に点が立つ。代表点の区画が `アフリカ` になり、`region` の `南アジア` と一致しなくなる |
| ポールバンダル（生地） | 活動の拠点でない点が立つ |

## `region`・`kind`・`title`

`region: 南アジア` は、扱う地理が南アフリカと英国に跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（ポールバンダル）で決めた。
`@historian` は、生地がインドのポールバンダルであることを Britannica で確認した。
`@historian` は本拠の判断も割れうると書いたが、ADR-0034 は人物の本拠を生地とし、活動の中心を使うのは生地が伝わらないときだけなので、ダーバンとアフマダーバードの期間の比較は `region` を変えない。

`id` の `gandhi` は、ADR-0034 の `id` の表の「カタカナの外来固有名」の行で、カタカナの語形 `ガンディー` に合う綴りにした。
`kind: place` と `title: ガンディー` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#168](https://github.com/ta-tabox/coten-atlas/pull/168) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | アフマダーバード | 期間で数えれば、南アフリカのダーバン（約 21 年）がアフマダーバード（約 13 年）より長い |
| 事物の `id` と座標の粒度 | 市の名 `ahmedabad` と、アーシュラムの地点の座標 | 事物の `id` を施設の名にするか、座標を市の中心へ寄せれば、粒度が揃う |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・代表点・事物の `id` の裏どり |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |
