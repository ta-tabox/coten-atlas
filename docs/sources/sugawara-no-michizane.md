# 菅原道真（`sugawara-no-michizane`・season 45）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `sugawara-no-michizane` |
| `series.json` の `season` | 45 |
| `series.json` の `timeRange` | 845..903 |
| `series.json` の `anchor` | `heian-kyo` |
| `series.json` の `region` | `日本` |
| `loci.geojson` の座標 | `[135.742, 35.014]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 845 | 菅原道真の生年 | [コトバンク: 菅原道真](https://kotobank.jp/word/%E8%8F%85%E5%8E%9F%E9%81%93%E7%9C%9F-77365)（三次） | 無し |
| `end` | 903 | 菅原道真の没年 | 同上 | 無し |

デジタル大辞泉・日本大百科全書・精選版日本国語大辞典のいずれも 845〜903 で一致する。

配信フィードの各回の説明によれば、第 1 回が道真の人物像と律令の官僚、第 2 回が菅原氏の教育と若手官僚の時代、第 3 回が出世と遣唐使の停止、第 4 回が右大臣への昇進と大宰府への左遷を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 135.74222, 35.01361（大内裏。平安宮） |
| 典拠 | [Wikidata Q304501](https://www.wikidata.org/wiki/Q304501) |
| 典拠の格 | 参考程度 |

最初に書いた座標は `[135.75, 35.01]` で、`@historian` が道真の仕えた朝廷そのものの大内裏の座標から約 800m 離れていると指摘したので、大内裏の座標へ直した。

種別は `人物` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 3 行目で、活動の拠点に代表点を置いた。
官僚として仕えた朝廷の都の平安京にした。
`@historian` によれば、道真は 845 年の生年から 901 年の左遷まで約 56 年間を都で過ごし、大宰府での期間は約 2 年にとどまる（[太宰府市: 文化財](https://www.city.dazaifu.lg.jp/site/bunkazai/34082.html)、参考程度）。

紫式部（`murasaki-shikibu`）の活動の拠点も平安京である。
ADR-0034 の事物の `id` の表は、同じ地名を二つのシリーズが要求したら「より具体的な地点名を使う」と決めているが、どちらが移るかを決めていない。
#167 の PR は、道真の拠点が朝廷の官職で一つの邸宅に絞れないので道真に `heian-kyo` を残し、紫式部を土御門殿へ移した。
どちらが移るかは [#166](https://github.com/ta-tabox/coten-atlas/issues/166)（同じ地名を二つの人物のシリーズが要求したとき、どちらが具体的な地点名へ移るかを決める）で決める。

| 候補 | 置くと何が起きるか |
|---|---|
| 平安京（現在値。座標は大内裏） | 仕えた朝廷の都に寄る |
| 大宰府 | 左遷されて没した地に寄る。約 2 年しか過ごしていない |

## `region`・`kind`・`title`

`region: 日本` は、扱う地理が日本に収まるので、ADR-0034 の `region` の選び方の表の 1 行目で決めた。
`@historian` は妥当だと確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: 菅原道真` はシリーズ名「ショート 菅原道真」からコーナー名を除いた値で、指摘は出なかった。
`id` の `sugawara-no-michizane` は、ADR-0034 の `id` の表が読みに在る助詞の例に挙げている値である。
事物の `id` の `heian-kyo` は、Heian-kyō の長音を表さずに書いた。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て、座標を典拠の値へ直したうえで仮決定した。
人間の判定は [#167](https://github.com/ta-tabox/coten-atlas/pull/167) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | `heian-kyo`（平安京） | 紫式部の側でなく道真の側を具体的な地点へ移すと決まれば、平安宮などの地点名になる（#166） |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628151771) | `timeRange`・`region`・代表点の選び方の裏どり、座標のずれの指摘と典拠 |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628144799) | `id`・事物の `id`・`region`・`tags`・`timeRange` と ADR-0034 の規則の突き合わせ |
| [#167 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/167) | 代表点を選んだ判断と候補、平安京を紫式部と取り合った判断 |
| [#166](https://github.com/ta-tabox/coten-atlas/issues/166) | 同じ地名を二つのシリーズが要求したときの論点 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
