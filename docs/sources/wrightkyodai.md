# ライト兄弟（`wrightkyodai`・season 41）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `wrightkyodai` |
| `series.json` の `season` | 41 |
| `series.json` の `timeRange` | 1867..1948 |
| `series.json` の `region` | `北アメリカ` |
| `loci.geojson` の `anchor` | `dayton` |
| `loci.geojson` の座標 | `[-84.192, 39.759]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1867 | ウィルバー・ライトの生年（4 月 16 日） | [Britannica: Wright brothers](https://www.britannica.com/biography/Wright-brothers)（三次） | 無し |
| `end` | 1948 | オーヴィル・ライトの没年（1 月 30 日） | 同上 | 無し |

二人を扱うシリーズなので、現物の `kou-to-ryuho`（項羽と劉邦）に揃えて、早い方の生年から遅い方の没年までにした。
ウィルバーは 1912 年 5 月 30 日に没し、オーヴィルは 1871 年 8 月 19 日に生まれた。

配信フィードの各回の説明によれば、第 1 回が二人の生涯の全体、第 2 回が自転車の商売と翼をねじる工夫、第 3 回が世界に知られた公開飛行、第 4 回が特許の争いを扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | -84.19167, 39.75944 |
| 典拠 | [Wikipedia: Dayton, Ohio](https://en.wikipedia.org/wiki/Dayton,_Ohio)（Infobox） |
| 典拠の格 | 参考程度 |

`@historian` は GeoNames に到達できず、Wikipedia の Infobox の値で代えたので、格を参考程度にとどめた。
現在の値は典拠の値とほぼ一致する。

拠点が複数あるときは、番組が扱う主な事績が起きた地を中心の場所とする（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。
代表点をデイトンに置いたのは、第 2 回が扱う翼をねじる工夫と飛行機の開発を、二人が自転車店と工房を構えたデイトンで進め、デイトンがオーヴィルの生地と没地でもあるためである。
`@historian` は、Britannica もオーヴィルの生地と没地をデイトンとしており、選んだ理由と矛盾しないと確認した。

| 候補 | 置くと何が起きるか |
|---|---|
| デイトン（現在値） | 工房を構えた地に点が立つ |
| キティホーク（1903 年の初飛行の地の近く） | 初飛行という一度の出来事の地に点が立つ |
| ル・マン（1908 年のフランスでの公開飛行） | 区画が `ヨーロッパ` になる |

## `region`・`kind`・`title`

`region: 北アメリカ` は、フランスでの公開飛行を含めて区画が跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、`title` の中心になる語 `兄弟` が当たる `人物` の本拠の生地で決めた。
`@historian` は、ウィルバーの生地（インディアナ州ミルヴィルの近く）とオーヴィルの生地（オハイオ州デイトン）がどちらも `北アメリカ` に在ることを確認した。

`id` の `wrightkyodai` は、デジタル大辞泉と精選版日本国語大辞典に一語の見出し（ライト‐きょうだい）があるので割らなかった。
二つの辞書のどちらかに一語の見出しがあれば割らないと #172 で決まり（ADR-0041）、値は変わらない。
カタカナの部分だけ、`id` の表の「カタカナの外来固有名」の行で `wright` にした。
事物の `id` の `dayton` は、当時から現在まで英語の文献で一貫して Dayton と書かれている。
`kind: place` と `title` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #171 と #172 の決定（ADR-0041）で代表点と `id` の区切りを当て直した。
値は変わらなかった。
2026-09-11 に人間が仮決定を採用して決着させ、見直しを [#185](https://github.com/ta-tabox/coten-atlas/issues/185)（ライト兄弟（wrightkyodai）の代表点をデイトンとキティホークのどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | デイトン（事績の中心） | 1903 年の初飛行を主な事績と見ればキティホークになる。見直しは #185 で行う |
| 座標の典拠 | Wikipedia の Infobox（参考程度） | GeoNames か Wikidata で取り直せば格が上がる。見直しは #185 で行う |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 3 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628417235) | 後半 6 件の `timeRange`・`region`・代表点・事物の `id` の裏どり |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| [#172 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/172#issuecomment-5629510570) | 二つの辞書のどちらかに一語の見出しがあれば割らない判断 |
| [#185（見直し）](https://github.com/ta-tabox/coten-atlas/issues/185) | 採用した仮決定を人間が見直す論点と案 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

2 回目・4 回目・5 回目はこのシリーズを対象にしていない。
