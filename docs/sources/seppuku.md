# 切腹（`seppuku`・season 31）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `seppuku` |
| `series.json` の `season` | 31 |
| `series.json` の `timeRange` | 988..1868 |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `日本` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 988 | 藤原保輔の自害（永延 2 年 6 月 17 日に獄中で死去） | [コトバンク: 藤原保輔（デジタル版日本人名大辞典+Plus）](https://kotobank.jp/word/藤原保輔-1106544)（三次） | 無し |
| `end` | 1868 | 堺事件で土佐藩士が切腹した年（慶応 4 年 2 月 23 日） | [堺市: 土佐十一烈士墓](https://www.city.sakai.lg.jp/kanko/rekishi/bunkazai/bunkazai/shokai/bunya/shiseki/tosaresshihaka.html)（三次） | 無し |

種別が `概念史` だけの位置なしのシリーズだが、年を書く。
主題の切腹の慣行は終わっていて、両端を史実の年で言えるので、skill `series-vocabulary` の手順 7（[ADR-0039](../adr/0039-untimed-concept-series.md)）の表の 2 行目に当たる。
skill の手順 7 の表は、2 行目の例に「ショート 切腹」を挙げている。

配信フィードの各回の説明によれば、第 1 回が日本最古の切腹とされる貴族の事例と時代による切腹の違い、第 2 回が作法と身体観、第 3 回が刑罰としての切腹と殉死、第 4 回が源義経の切腹からフランス人の前で行われた集団切腹までの事例を扱う。
第 1 回が日本最古の切腹として扱う藤原保輔の年を `start` にした。
第 4 回が扱う事例のうち最も遅いものが堺事件なので、その年を `end` にした。

`start` の典拠は三次の人名辞典止まりで、`@historian` は一次史料（『日本紀略』など）までは辿れなかった。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
ADR-0034 はこの表の 1 行目の例に「ショート 切腹」を挙げている。
他の候補は挙がっていない。

## `region`・`kind`・`title`

`region: 日本` は、扱う地理が日本に収まるので ADR-0034 の `region` の選び方の表の 1 行目で決めた。
ADR-0034 はこの表の 1 行目の例に「ショート 切腹（位置なし） → `日本`」を挙げている。
`@historian` は `anchor` が無いことを理由に `region` を座標と突き合わせておらず、`region` の選択への指摘も出なかった。
`kind: concept` は `tags` の種別が `概念史` だけであることと矛盾しないと `@historian` が確認した。
`title: 切腹` はシリーズ名「ショート 切腹」からコーナー名を除いた値で、指摘は出なかった。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て現在の値で仮決定した。
2026-09-11 に ADR-0039 の線を当て、年を持つ側に当たることを確かめた。
人間の判定は [#157](https://github.com/ta-tabox/coten-atlas/pull/157) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `end` | 1868（堺事件） | 番組が扱う事例でなく制度の終わりで数えるなら、刑罰としての切腹が廃された年が終端になる（典拠は取っていない） |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | `timeRange` の両端・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各端を決めた回 |
| [#160（ADR-0039）](https://github.com/ta-tabox/coten-atlas/pull/160) | 種別が `概念史` だけの位置なしのシリーズに年を残す線 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
