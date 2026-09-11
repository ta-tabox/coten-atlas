# 鑑真（`ganjin`・season 56）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `ganjin` |
| `series.json` の `season` | 56 |
| `series.json` の `timeRange` | 688..763 |
| `series.json` の `anchor` | `yangzhou` |
| `series.json` の `region` | `中国` |
| `loci.geojson` の座標 | `[119.42, 32.39]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 688 | 鑑真の生年 | [日本語版 Wikipedia: 鑑真](https://ja.wikipedia.org/wiki/%E9%91%91%E7%9C%9F)（参考程度） | 無し |
| `end` | 763 | 鑑真の没年 | 同上 | 無し |

`@historian` は、生年と没年が複数の独立した典拠（日本語版 Wikipedia・prabook）で一致すると返した。
コトバンクの記述を機械的に抽出したときに 687 年と 769 年という値が一度現れたが、`@historian` は原文を確認できておらず、抽出時の誤読の可能性が高いとしつつ、確定した反証として扱っていない。

配信フィードの各回の説明によれば、第 1 回が鑑真の生い立ちと日本僧との出会い、第 2〜4 回が仏教の戒律、第 5〜6 回が渡日の動機と十二年にわたる渡航の失敗、第 7〜8 回が来日後の授戒と鑑真が遺したものを扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 119.4128, 32.3944（現在値との差は 1km 未満） |
| 典拠 | [Wikipedia: Yangzhou](https://en.wikipedia.org/wiki/Yangzhou)（GeoNames 由来とみられる値。GeoNames 本体では確かめられていない） |
| 典拠の格 | 参考程度 |

種別は `人物` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 3 行目で、活動の拠点に代表点を置いた。
生地で、渡日まで授戒の大師として活動した拠点なので、揚州にした。
`@historian` は、713 年の帰郷から渡日を試みる 743 年頃までの約 30 年間、揚州（大雲寺・大明寺）が一貫した拠点だったことを確かめ、この選び方を妥当と返した。
揚州と、来日後の 10 年の拠点の奈良のどちらを選ぶかの基準は ADR-0034 に無く、[#171](https://github.com/ta-tabox/coten-atlas/issues/171)（人物や集団の拠点が時期によって複数あるとき、どれを代表点にするかを決める）で決める。

| 候補 | 置くと何が起きるか |
|---|---|
| 揚州（現在値） | 生地と、渡日まで約 30 年の拠点に寄る |
| 奈良 | 来日後の 10 年の拠点（東大寺・唐招提寺）に寄る。日本で戒律を伝えた事績に寄る |

## `region`・`kind`・`title`

`region: 中国` は、渡日して日本に跨るので、ADR-0034 の `region` の選び方の表の 2 行目で本拠の区画にした。
種別 `人物` の本拠は生地で、生地の揚州は中国に在る。
`@historian` は妥当だと確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: 鑑真` はシリーズ名「ショート 鑑真」からコーナー名を除いた値で、指摘は出なかった。
`id` の `ganjin` は、「鑑真」の読みをヘボン式で書いた。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#167](https://github.com/ta-tabox/coten-atlas/pull/167) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | `yangzhou`（揚州） | 来日後の事績を重く見れば奈良になる（#171） |
| `timeRange` | 688..763 | コトバンクの抽出に一度現れた 687 年・769 年の真偽が未解決である |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628151771) | `timeRange`・座標・`region`・代表点の選び方の裏どり |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628144799) | `id`・事物の `id`・`region`・`tags`・`timeRange` と ADR-0034 の規則の突き合わせ |
| [#167 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/167) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
