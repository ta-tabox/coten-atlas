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

配信フィードの各回の説明によれば、第 1 回がインド独立の父としての生涯の全体、第 2 回が弁護士の時代、第 3・4 回が南アフリカでの人種差別とサティヤーグラハ、第 5 回が塩の行進、第 6 回がヒンドゥーとイスラームの対立と暗殺を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 72.5808, 23.0599（サーバルマティー・アーシュラムの地点） |
| 典拠 | [Wikidata Q1410702](https://www.wikidata.org/wiki/Q1410702)（値は GeoNames から取り込まれている） |
| 典拠の格 | 三次 |

`@historian` は格を参考程度と報告したが、値は地名辞典の GeoNames から取り込まれているので、[典拠の格の定義](README.md)で三次に当てた。
現在の値はアーシュラムの地点から約 120m 以内に在り、アフマダーバード市の中心（[Wikidata Q18145](https://www.wikidata.org/wiki/Q18145)）からは約 4.3km 離れる。
事物の `id` は市の名で、座標は市の中のアーシュラムの地点を指す。

拠点が複数あるときは、番組が扱う主な事績が起きた地を中心の場所とする（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。
各回の配分は、南アフリカでのサティヤーグラハ（第 3・4 回）とインドでの独立運動（第 5・6 回）が 2 回ずつで、第 1 回はガンディーをインド独立の父として紹介する。
代表点をアフマダーバードに置いたのは、番組が主な事績として紹介するインド独立運動の拠点で、ガンディーが 1917 年から 1930 年までサーバルマティー・アーシュラムに住み、第 5 回が扱う塩の行進もそこから出発したためである。

南アフリカの候補の事実は、5 回目の裏どりが次のとおり返した。

| 事実 | 典拠 | 典拠の格 |
|---|---|---|
| 1893 年に弁護士としてダーバンへ移り住み、1894 年にナタール・インド人会議を組織した | [Drishti IAS: 130th Anniversary of Natal Indian Congress](https://www.drishtiias.com/daily-updates/daily-news-analysis/130th-anniversary-of-natal-indian-congress) | 参考程度 |
| 1904 年にダーバンの近郊にフェニックス農園を設け、1910 年まで主な住まいにした | [Britannica: Gandhi's Phoenix Settlement](https://www.britannica.com/topic/Gandhis-Phoenix-Settlement) | 三次 |
| 1903 年にヨハネスブルグに法律事務所を開き、1906 年 9 月 11 日にヨハネスブルグの帝国劇場の集会でサティヤーグラハを初めて掲げた | [Liz Atlan Lancaster: Gandhi, Johannesburg and the birth of Satyagraha](https://www.lizatlancaster.co.za/blog/gandhi-johannesburg-birth-satyagraha) | 参考程度 |
| 1910 年にヨハネスブルグの近郊にトルストイ農園を開き、1913 年までサティヤーグラハの運動の本部にした | [South African History Online: Tolstoy Farm](https://sahistory.org.za/place/tolstoy-farm-near-johannesburg) | 三次 |

南アフリカでは、住まい（ダーバンの近郊のフェニックス農園）と運動の拠点（ヨハネスブルグ）が別の都市に在ったと読める典拠がある。

| 候補 | 置くと何が起きるか |
|---|---|
| アフマダーバード（現在値） | インド独立運動の拠点に点が立つ |
| ヨハネスブルグ（1906 年にサティヤーグラハを始め、トルストイ農園を運営した地。第 3・4 回） | サティヤーグラハの始まりの地に点が立つ。代表点の区画が `アフリカ` になり、`region` の `南アジア` と一致しなくなる |
| ダーバン（1893 年から住み、近郊のフェニックス農園を 1910 年まで主な住まいにした地） | 南アフリカでの住まいに点が立つ。区画は同じく `アフリカ` になる |
| ポールバンダル（生地） | 活動の拠点でない点が立つ |

## `region`・`kind`・`title`

`region: 南アジア` は、扱う地理が南アフリカと英国に跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（ポールバンダル）で決めた。
`@historian` は、生地がインドのポールバンダルであることを Britannica で確認した。
`@historian` は本拠の判断も割れうると書いたが、ADR-0034 は人物の本拠を生地とし、活動の中心を使うのは生地が伝わらないときだけなので、南アフリカとアフマダーバードの比較は `region` を変えない。

`id` の `gandhi` は、ADR-0034 の `id` の表の「カタカナの外来固有名」の行で、カタカナの語形 `ガンディー` に合う綴りにした。
`kind: place` と `title: ガンディー` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #171 の決定（ADR-0041）で代表点の理由を事績の中心として当て直した。
値は変わらなかった。
事績の中心をどこに置くかの人間の判定は [#168](https://github.com/ta-tabox/coten-atlas/pull/168) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | アフマダーバード（事績の中心） | 第 3・4 回の南アフリカでのサティヤーグラハを主な事績と見れば、サティヤーグラハを始めたヨハネスブルグになる。期間で数えれば、南アフリカ（1893〜1914 年の約 21 年）がアフマダーバード（約 13 年）より長い |
| 事物の `id` と座標の粒度 | 市の名 `ahmedabad` と、アーシュラムの地点の座標 | 事物の `id` を施設の名にするか、座標を市の中心へ寄せれば、粒度が揃う |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・代表点・事物の `id` の裏どり |
| [`@historian` 5 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5633756847) | ダーバンとヨハネスブルグの拠点の期間と事績 |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

3 回目と 4 回目はこのシリーズを対象にしていない。
