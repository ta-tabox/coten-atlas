# 宗教改革（`shukyokaikaku`・season 21）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `shukyokaikaku` |
| `series.json` の `season` | 21 |
| `series.json` の `timeRange` | 1517..1648 |
| `series.json` の `anchor` | `wittenberg` |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の座標 | `[12.643, 51.866]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1517 | ルターの九十五か条の論題 | [Britannica: Ninety-five Theses](https://www.britannica.com/event/Ninety-five-Theses)（三次） | 無し |
| `end` | 1648 | ヴェストファーレン条約 | [World History Encyclopedia: Protestant Reformation](https://www.worldhistory.org/Protestant_Reformation/)（三次） | 1685 など |

World History Encyclopedia は 1517〜1648 を最も広く受け入れられている区切りとし、1400〜1750 年や 1517〜1685 年とする学説も併記する。

配信フィードの各回の説明によれば、第 1〜3 回が中世ヨーロッパの教会と世俗の権力、第 4〜6 回がルターの登場から三十年戦争まで、第 7 回がカルヴァン、第 8 回がイエズス会を扱う。
各回が改革の始まりとして扱う九十五か条の論題の年を `start` にし、第 6 回が扱う三十年戦争を終わらせた条約の年を `end` にした。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 12.6484, 51.8671（現在値との差は約 400m） |
| 典拠 | [Wikidata Q6837](https://www.wikidata.org/wiki/Q6837) |
| 典拠の格 | 三次 |

種別は `出来事` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 3 行目で、主な舞台に代表点を置いた。
ルターが贖宥状を批判して改革が始まった地なので、ヴィッテンベルクを主な舞台とした。

舞台はドイツ・スイス・フランス・イングランドと複数の国に跨るが、区画はどれも `ヨーロッパ` に収まる。
そのため、表の 2 行目（出来事の舞台が複数の区画に対等に跨る）には当たらない。

| 候補 | 置くと何が起きるか |
|---|---|
| ヴィッテンベルク（現在値） | ルターの改革の始まりに寄る |
| ジュネーヴ | カルヴァンの改革に寄る。ルターの活動が地図に出ない |
| ローマ | 改革を受けた側の教皇庁に寄る |
| 位置なし | 舞台が複数の国に跨ることを重く見る読み方。ADR-0034 の表の 2 行目は区画をまたぐかで判定するので、現行の規則では当たらない |

## `region`・`kind`・`title`

`region: ヨーロッパ` は、舞台の国々がヨーロッパに収まるので、ADR-0034 の `region` の選び方の表の 1 行目で決めた。
`@historian` は、ドイツ・スイス・フランス・イングランドのどれもヨーロッパに収まり、九十五か条の論題の地のヴィッテンベルクは代表点として妥当だと確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: 宗教改革` はシリーズ名のままで、指摘は出なかった。
`id` の `shukyokaikaku` は、デジタル大辞泉と精選版日本国語大辞典に「宗教改革」の一語の見出し（しゅうきょう‐かいかく）があるので割らなかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#169](https://github.com/ta-tabox/coten-atlas/pull/169) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `end` | 1648（ヴェストファーレン条約） | 1685 年や 1750 年を終わりとする学説がある |
| 代表点 | `wittenberg` | カルヴァンの改革を同じ重さで見ればジュネーヴも立つ。舞台が複数の国に跨ることを重く見れば位置なしも立つ |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628206488) | `timeRange` の終わりの区切り・座標・`region` の裏どり |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628201381) | `region` の値・`anchor` と事物の対応・`tags` の規則の突き合わせ |
| [#169 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/169) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
