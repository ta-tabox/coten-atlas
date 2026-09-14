# 民主主義の歴史（`minshushugi-no-rekishi`・season 46）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `minshushugi-no-rekishi` |
| `series.json` の `season` | 46 |
| `series.json` の `timeRange` | `"untimed"` |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

`"untimed"`（時期なし）である。
主題の民主主義は現在まで続いていて終わりを史実の年で言えないので、skill `series-vocabulary` の手順 7（[ADR-0039](../adr/0039-untimed-concept-series.md)）の表の 3 行目に当たる。

配信フィードの各回の説明によれば、第 1 回がギリシア以前の民主主義の起源とダレイオスの逸話、第 2 回がアテナイの民主制、第 3 回がローマとイタリアの共和制、第 4 回がイギリスの議会制、第 5〜7 回がホッブズ・ロック・ルソーの社会契約説、第 8 回が革命後のフランス、第 9 回がワイマール共和国、第 10 回がアメリカ、第 11 回がイギリスと日本、第 12 回が現代の課題を扱う。

裏どりで確かめた年は、`catalog/` の値には使わず、年代の見せ方を決めるときの材料として次の表に残す。

| 端 | 年 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| 始まり | -508 | アテナイでのクレイステネスの改革（第 2 回が扱うアテナイの民主制の成立） | [Wikipedia: Cleisthenes](https://en.wikipedia.org/wiki/Cleisthenes)（参考程度） | 無し |

始まりの典拠は英語版 Wikipedia 止まりで、`@historian` は脚注の先の文献までは辿れなかった。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`title`

`region: ヨーロッパ` は、ADR-0034 の `region` の選び方の表の 2 行目で決めた。
各回が民主主義をアテナイで生まれてヨーロッパ・アメリカ・日本へ広がったものとして扱うので、`概念史` の本拠（一つの区画で生まれて他へ広がったなら、生まれた区画）がヨーロッパに決まる。
`@historian` は、クレイステネスの改革の舞台がアテナイであることを確認し、現在の選択と矛盾しないと報告した。
本拠をどの範囲で見るかの編集判断は、事実の裏どりでは決められないとも報告した。
`title: 民主主義の歴史` に指摘は出なかった。

`id` の `minshushugi` は「民主主義」を割らずに書いた。
[コトバンク](https://kotobank.jp/word/民主主義)でデジタル大辞泉と精選版日本国語大辞典の両方に一語の見出し（みんしゅ‐しゅぎ）があり、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md) の `id` の表が、二つの辞書のどちらかに一語で載る語を割らないと決めているためである。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て仮決定し、2026-09-11 に ADR-0039 に従って `timeRange` を `"untimed"` にした。
2026-09-12 に人間が仮決定を採用して決着させ、見直しを [#210](https://github.com/ta-tabox/coten-atlas/issues/210)（民主主義の歴史（minshushugi-no-rekishi）の region をヨーロッパ・起源の区画・地域なしのどれにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `region` | `ヨーロッパ` | 第 1 回はギリシア以前の民主主義の起源に触れる。その起源がヨーロッパの外なら本拠が変わる（配信フィードの説明からは起源の場所が読み取れず、典拠は取っていない）。見直しは #210 で行う |
| 時期を持つか | `"untimed"` | 時期なしのシリーズの見せ方を決めて始まりの年が要るなら、クレイステネスの改革（-508）を使える。第 1 回が触れるギリシア以前の起源を起点に数えれば、始まりの年が早まる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | 始まりの年・`region` を支える事実・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各回の内容から決めた年と、`region` と `id` の判断 |
| [#160（ADR-0039）](https://github.com/ta-tabox/coten-atlas/pull/160) | `timeRange` を `"untimed"` にした線 |
| [#210（見直し）](https://github.com/ta-tabox/coten-atlas/issues/210) | 採用した仮決定を人間が見直す論点と案 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
