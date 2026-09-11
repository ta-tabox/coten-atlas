# 織田信長（`oda-nobunaga`・season 24）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `oda-nobunaga` |
| `series.json` の `season` | 24 |
| `series.json` の `timeRange` | 1534..1582 |
| `series.json` の `anchor` | `azuchi` |
| `series.json` の `region` | `日本` |
| `loci.geojson` の座標 | `[136.14, 35.156]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1534 | 織田信長の生年 | [Britannica: Oda Nobunaga](https://www.britannica.com/biography/Oda-Nobunaga)（三次） | 無し |
| `end` | 1582 | 織田信長の没年（本能寺の変） | 同上 | 無し |

配信フィードの各回の説明によれば、第 1〜5 回が武士の起こりから鎌倉幕府と室町幕府の混乱まで、第 6〜11 回が信長の出自から天下人としての政治まで、第 12 回が本能寺の変を扱う。
第 1〜5 回は信長の生年より前を扱うが、種別が `人物` のシリーズは生没年で引く現物（`hannibal` など）に揃えた。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 136.1394, 35.1560（安土城跡） |
| 典拠 | `@historian` が Wikidata と Wikipedia の座標で照合した（照合した項目の URL は報告に無い） |
| 典拠の格 | 三次 |

種別は `人物` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 3 行目で、活動の拠点に代表点を置いた。
信長が天下人として安土城を築き、没するまで本拠にした地なので、安土にした。

`@historian` によれば、信長は 1567 年に稲葉山城を落として岐阜と改め、1576 年に安土城の普請を始めて本拠を移し、1582 年に京都の本能寺で死ぬまで安土を本拠にした。
ADR-0034 は複数の拠点からどれを選ぶかの基準を持たないので、岐阜（9 年）と安土（6 年）はどちらも活動の拠点として選べる。
この選択は [#171](https://github.com/ta-tabox/coten-atlas/issues/171)（人物や集団の拠点が時期によって複数あるとき、どれを代表点にするかを決める） で決める。

| 候補 | 置くと何が起きるか |
|---|---|
| 安土（現在値） | 最後の拠点に寄る |
| 岐阜 | 拠点にした期間が長い地に寄る |
| 京都（本能寺） | 没地に寄る。活動の拠点ではない |

## `region`・`kind`・`title`

`region: 日本` は、扱う地理が日本に収まるので、ADR-0034 の `region` の選び方の表の 1 行目で決めた。
`@historian` は、生没年が一致することを確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: 織田信長` はシリーズ名のままで、指摘は出なかった。
`id` の `oda-nobunaga` は、姓と名の間で割った（現物の `yoshida-shoin`）。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#169](https://github.com/ta-tabox/coten-atlas/pull/169) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | `azuchi`（安土） | 拠点にした期間の長さで選べば岐阜になる（#171） |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628206488) | `timeRange`・座標の裏どり、岐阜と安土の拠点の期間 |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628201381) | `region` の値・`anchor` と事物の対応・`tags` の規則の突き合わせ |
| [#169 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/169) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
