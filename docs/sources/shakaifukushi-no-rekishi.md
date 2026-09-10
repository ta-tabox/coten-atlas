# 社会福祉の歴史（`shakaifukushi-no-rekishi`・season 38）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `shakaifukushi-no-rekishi` |
| `series.json` の `season` | 38 |
| `series.json` の `timeRange` | 1349..2023 |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1349 | イングランド王エドワード 3 世の労働者勅令の発布（1349 年 6 月 18 日） | [Wikipedia: Ordinance of Labourers 1349](https://en.wikipedia.org/wiki/Ordinance_of_Labourers_1349)（参考程度） | 無し |
| `end` | 2023 | 最終回（38-6）の配信年 | `catalog/episodes.json` の `pubDate`（2023-03-01） | 無し |

配信フィードの各回の説明によれば、第 1 回が古代の国々にも触れたうえでイングランドのエドワード 3 世の勅令からエリザベス 1 世の救貧法・産業革命・新救貧法まで、第 2 回が福祉国家の成立とアメリカのニューディール、第 3 回が 1970 年代以降の新自由主義、第 4 回が北欧、第 5 回が日本、第 6 回が各国の現状を扱う。
第 1 回が扱う施策のうち最も早いエドワード 3 世の勅令の年を `start` にした。
第 6 回が現状を扱うので、`end` は最終回の配信年にした。
現代まで扱うシリーズの `end` を最終回の配信年にする揃え方は、`okane-no-rekishi` の `end` 2020 が最終回の配信日（2020-01-12）の年と一致することに合わせている。

`start` の典拠は英語版 Wikipedia 止まりで、`@historian` は脚注の先の文献までは辿れなかった。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、ADR-0034 の `region` の選び方の表の 2 行目で決めた。
各回が社会福祉をイギリスで生まれてアメリカ・北欧・日本へ広がったものとして扱うので、`概念史` の本拠（一つの区画で生まれて他へ広がったなら、生まれた区画）がヨーロッパに決まる。
`@historian` は、労働者勅令の発布地がイングランドであることを確認し、現在の選択と矛盾しないと報告した。
本拠をどの範囲で見るかの編集判断は、事実の裏どりでは決められないとも報告した。
`kind: concept` は `tags` の種別が `概念史` だけであることと矛盾しないと `@historian` が確認した。
`title: 社会福祉の歴史` に指摘は出なかった。

`id` の `shakaifukushi` は「社会福祉」を割らずに書いた。
[コトバンク](https://kotobank.jp/word/社会福祉)でデジタル大辞泉と精選版日本国語大辞典の両方に一語の見出し（しゃかい‐ふくし）があり、ADR-0034 の `id` の表が辞書に一語で載る語を割らないと決めているためである。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#157](https://github.com/ta-tabox/coten-atlas/pull/157) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `region` | `ヨーロッパ` | 第 2 回が扱うアメリカのニューディールを別の起源と見れば、表の 3 行目で `地域なし` になる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | `timeRange` の両端・`region` を支える事実・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各端を決めた回と、`region` と `id` の判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
