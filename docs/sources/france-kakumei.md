# フランス革命（`france-kakumei`・season 9）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `france-kakumei` |
| `series.json` の `season` | 9 |
| `series.json` の `timeRange` | 1789..1799 |
| `series.json` の `anchor` | `paris` |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の座標 | `[2.349, 48.853]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1789 | バスティーユ牢獄の襲撃 | [Britannica: French Revolution（Summary）](https://www.britannica.com/summary/French-Revolution)（三次） | 1787（名士会の招集） |
| `end` | 1799 | ブリュメール 18 日のクーデタ | 同上 | 無し |

Britannica の概説は、フランス革命を 1787 年から 1799 年までの運動とする。
`@historian` は、1789 年を始まりとする区切りが最も広く使われていて誤りではないと返した。

配信フィードの各回の説明によれば、第 1〜3 回が革命の背景とルソーの思想、第 4〜8 回が三部会からロベスピエールの失脚まで、第 9 回がナポレオンの登場を扱う。
各回が革命の勃発として扱うバスティーユ牢獄の襲撃の年を `start` にし、第 9 回が扱うナポレオンの権力の掌握の年を `end` にした。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 2.3522, 48.8567（現在値との差は約 500m） |
| 典拠 | [Wikidata Q90](https://www.wikidata.org/wiki/Q90) |
| 典拠の格 | 三次 |

種別は `出来事` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 3 行目で、主な舞台に代表点を置いた。
バスティーユ牢獄の襲撃・国王の処刑・恐怖政治がパリで起きたので、パリを主な舞台とした。

| 候補 | 置くと何が起きるか |
|---|---|
| パリ（現在値） | 革命の主な事件が起きた都市に寄る |
| ヴェルサイユ | 三部会と球戯場の誓いの地に寄る。国王の処刑と恐怖政治の舞台は地図に出ない |

## `region`・`kind`・`title`

`region: ヨーロッパ` は、舞台のフランスと戦った相手の国々がヨーロッパに収まるので、ADR-0034 の `region` の選び方の表の 1 行目で決めた。
`@historian` は、舞台がパリに集中しており区画も代表点も妥当だと確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: フランス革命` はシリーズ名のままで、指摘は出なかった。
`id` の `france-kakumei` は、カタカナの外来固有名を France、漢字を読みにして、部分ごとに規則を当てた（現物の `america-kaitakushi`・`teisei-roma`）。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#169](https://github.com/ta-tabox/coten-atlas/pull/169) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `start` | 1789（バスティーユ牢獄の襲撃） | 名士会の招集（1787）から数える区切りを Britannica の概説が示す |
| 代表点 | `paris` | 三部会と球戯場の誓いを重く見ればヴェルサイユになる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628206488) | `timeRange` の始まりの区切り・座標・`region` の裏どり |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628201381) | `region` の値・`anchor` と事物の対応・`tags` の規則の突き合わせ |
| [#169 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/169) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
