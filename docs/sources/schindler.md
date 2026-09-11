# シンドラー（`schindler`・season 44）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `schindler` |
| `series.json` の `season` | 44 |
| `series.json` の `timeRange` | 1908..1974 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `krakow` |
| `loci.geojson` の座標 | `[19.937, 50.061]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1908 | オスカー・シンドラーの生年（4 月 28 日。ツヴィッタウ） | [USHMM Holocaust Encyclopedia: Oskar Schindler](https://encyclopedia.ushmm.org/content/en/article/oskar-schindler)（三次） | 無し |
| `end` | 1974 | オスカー・シンドラーの没年（10 月 9 日） | 同上 | 無し |

配信フィードの各回の説明によれば、第 1 回がシンドラーの生涯の全体、第 2・3 回が水晶の夜とポーランドでの迫害、第 4〜7 回がシンドラーの生い立ち・事業・アーモン・ゲートとの関わり・晩年、第 8・9 回がアイヒマンとミルグラムの実験、第 10・11 回が杉原千畝、第 12 回が善性の発動の条件を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 19.93722, 50.06139（旧市街の中心） |
| 典拠 | [Wikipedia: Kraków](https://en.wikipedia.org/wiki/Krak%C3%B3w)（Infobox） |
| 典拠の格 | 参考程度 |

`catalog/loci.geojson` の最初の値 `[19.945, 50.065]` は、クラクフ中央駅の付近に在り、旧市街の中心から北へ約 700m、工場跡から約 2.4km 離れていた。
`@historian` は、都市の一般の点として置くか、選んだ理由の工場跡へ寄せるかを規則が明言していないと報告した。
事物の `id` が市の名 `krakow` なので、典拠の旧市街の中心の値を小数 3 桁に丸めた現在の値へ直した。
`@historian` は GeoNames に到達できず Wikipedia の Infobox の値で代えたので、格を参考程度にとどめた。

拠点が複数あるときは、番組が扱う主な事績が起きた地を中心の場所とする（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。
代表点をクラクフに置いたのは、第 5・6 回が扱う主な事績のホーロー工場の経営とユダヤ人の労働者の雇用が、クラクフで起きたためである。
工場跡（ul. Lipowa 4、現在のシンドラーの工場博物館）は 19.9616, 50.0474 に在る（[Museum of Krakow: Oskar Schindler's Enamel Factory](https://muzeumkrakowa.pl/en/branches/oskar-schindlers-enamel-factory)、三次）。
クラクフを要求するシリーズはほかに無いので、同じ地名の決め方（#166）は当たらない。

| 候補 | 置くと何が起きるか |
|---|---|
| クラクフの旧市街の中心（現在値） | 工場を経営した都市に点が立つ |
| クラクフの工場跡 | 選んだ理由の地点そのものに点が立つ。事物の `id` を市の名のままにすると、`id` の粒度と座標の粒度が食い違う |
| ブリュンリッツ（1944 年に工場を移した地） | 戦争の最後の年の地に点が立つ |
| ツヴィッタウ（生地） | 活動の拠点でない点が立つ |

事物の `id` の `krakow` は、事物の `id` の表の発音区別符号の行で Kraków の `ó` を `o` にした。
`@historian` は、英語の文献がドイツの占領下（1939〜1945 年）についても Kraków か Krakow と書き、Krakau は占領したドイツの当局の名だと報告した（[USHMM Holocaust Encyclopedia: The Krakow (Cracow) Ghetto](https://encyclopedia.ushmm.org/content/en/article/krakow-cracow)、三次）。
代表点に選んだ時代の地点が複数の名を持つときは、現在の英語の文献がその時代のその地点を指すときに通用する名を使うと #170 で決まった（ADR-0041）ので、`krakow` のまま決着した。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、第 9 回が米国でのミルグラムの実験を扱って区画が跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（ツヴィッタウ。当時のオーストリア＝ハンガリー、現在のチェコ）で決めた。
#168 の PR 本文の最初の版は 1 行目（一区画に収まる）と書いていたが、第 9 回の舞台を数えれば 2 行目に当たる。
どちらの行でも値は `ヨーロッパ` である。
`@historian` は、生地がツヴィッタウであることを確認した。

`title: シンドラー` と `kind: place` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #170 と #171 の決定（ADR-0041）で事物の `id` と代表点の理由を当て直した。
値は変わらなかった。
2026-09-11 に人間が仮決定を採用して決着させた。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 座標 | クラクフの旧市街の中心 | 事績の地の工場跡へ寄せる案もある。そのときは事物の `id` を工場跡の地名にするかも決める |
| 座標の典拠 | Wikipedia の Infobox（参考程度） | GeoNames か Wikidata で取り直せば格が上がる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 3 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628417235) | 後半 6 件の `timeRange`・`region`・代表点・事物の `id` の裏どりと、座標のずれの指摘 |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| [#170 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/170#issuecomment-5629510408) | 地点が複数の名を持つときに、現在の英語の文献の慣用で事物の `id` を決めた判断 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

2 回目・4 回目・5 回目はこのシリーズを対象にしていない。
