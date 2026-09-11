# 資本主義（`shihonshugi`・season 28）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `shihonshugi` |
| `series.json` の `season` | 28 |
| `series.json` の `timeRange` | `"untimed"` |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

`"untimed"`（時期なし）である。
主題の資本主義は現在まで続いていて終わりを史実の年で言えないので、skill `series-vocabulary` の手順 7（[ADR-0039](../adr/0039-untimed-concept-series.md)）の表の 3 行目に当たる。

配信フィードの各回の説明によれば、第 1 回が資本主義の特徴と起源（封建制のヨーロッパとの対比、ヴィクトリア朝）、第 2 回がアダム・スミスから始まる経済学史、第 3 回がポスト資本主義の諸論、第 4 回が現代の企業での実践を扱う。

裏どりで確かめた年は、`catalog/` の値には使わず、年代の見せ方を決めるときの材料として次の表に残す。

| 端 | 年 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| 始まり | 1776 | アダム・スミス『国富論』の刊行（第 2 回の経済学史の起点） | [Wikipedia: The Wealth of Nations](https://en.wikipedia.org/wiki/The_Wealth_of_Nations)（参考程度） | 無し |

始まりの典拠は英語版 Wikipedia 止まりで、`@historian` は脚注の先の文献までは辿れなかった。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、ADR-0034 の `region` の選び方の表の 2 行目で決めた。
第 1 回が資本主義を封建制のヨーロッパから生まれ、西洋の価値観として世界へ広がったものとして扱うので、`概念史` の本拠（一つの区画で生まれて他へ広がったなら、生まれた区画）がヨーロッパに決まる。
`@historian` は、『国富論』の著者アダム・スミスがスコットランドのグラスゴー大学の経済学者であることを [University of Glasgow: Adam Smith 300](https://www.gla.ac.uk/explore/adamsmith300/lifeworkandlegacy/keyworks/wealthofnations/)（三次）で確認し、現在の選択と矛盾しないと報告した。
`kind: concept` は `tags` の種別が `概念史` だけであることと矛盾しないと `@historian` が確認した。
`title: 資本主義` に指摘は出なかった。

`id` の `shihonshugi` は「資本主義」を割らずに書いた。
[コトバンク](https://kotobank.jp/word/資本主義)でデジタル大辞泉と精選版日本国語大辞典の両方に一語の見出し（しほん‐しゅぎ）があり、ADR-0034 の `id` の表が辞書に一語で載る語を割らないと決めているためである。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て仮決定し、2026-09-11 に ADR-0039 に従って `timeRange` を `"untimed"` にした。
人間の判定は [#157](https://github.com/ta-tabox/coten-atlas/pull/157) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 時期を持つか | `"untimed"` | 時期なしのシリーズの見せ方を決めて始まりの年が要るなら、『国富論』の刊行（1776）を使える。資本主義の成立を経済学の起点でなく経済の仕組みの変化で数えれば、始まりの年が動く（典拠は取っていない） |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | 始まりの年・`region` を支える事実・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各回の内容から決めた年と、`region` と `id` の判断 |
| [#160（ADR-0039）](https://github.com/ta-tabox/coten-atlas/pull/160) | `timeRange` を `"untimed"` にした線 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
