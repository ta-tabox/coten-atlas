# 第一次世界大戦（`daiichijisekaitaisen`・season 22）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `daiichijisekaitaisen` |
| `series.json` の `season` | 22 |
| `series.json` の `timeRange` | 1914..1918 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `verdun` |
| `loci.geojson` の座標 | `[5.383, 49.16]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1914 | 開戦（7 月 28 日。オーストリア＝ハンガリーのセルビアへの宣戦布告） | [Britannica: World War I](https://www.britannica.com/event/World-War-I)（三次） | 無し |
| `end` | 1918 | 休戦（11 月 11 日） | 同上 | 講和条約（1919 年のヴェルサイユ条約）で閉じる数え方がある |

`@historian` は、講和条約でなく休戦を終わりとする扱いが標準的だと報告した。

配信フィードの各回の説明によれば、第 2〜8 回が技術の進化・国民国家・ビスマルクの外交・三国同盟と三国協商・開戦までの危機、第 9〜12 回が塹壕戦・東部戦線・米国の参戦とロシア革命・ドイツ帝国の末路、第 13・14 回が各国の戦後の動乱を扱う。
`title` の中心になる語が戦争そのものを指すので、前史と戦後は `timeRange` に含めなかった。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 5.383154, 49.1592415 |
| 典拠 | [Pleiades 109435](https://pleiades.stoa.org/places/109435) |
| 典拠の格 | 二次 |

[GeoNames 2969958](https://www.geonames.org/2969958/verdun.html)（三次）も 5.3829, 49.15964 を示し、二つの典拠は独立に一致する。
`catalog/loci.geojson` の最初の値 `[5.388, 49.16]` は典拠から東へ約 370m ずれていたので、典拠の値を小数 3 桁に丸めた現在の値へ直した。
`@historian` は格を「一次相当」と報告したが、[ADR-0037](../adr/0037-sources-layer.md) の定義で一次は対象と同時代の史料を指すので、Pleiades を二次、GeoNames を三次に当てた。

代表点をヴェルダンに置いたのは、第 9 回が扱う塹壕戦の主な舞台が西部戦線で、その中で最も長く続いた戦闘の地だからである。
`@historian` は、西部戦線がこの戦争の決定的な戦場だったこと（[IWM: Western Front](https://www.iwm.org.uk/history/first-world-war/western-front)、三次）と、ヴェルダンの戦い（1916 年 2 月 21 日〜12 月 18 日の 302 日間）がソンムの戦い（約 140 日間）より長いこと（[World History Encyclopedia: Battle of Verdun](https://www.worldhistory.org/article/2878/battle-of-verdun/)、三次）を確認した。

| 候補 | 置くと何が起きるか |
|---|---|
| ヴェルダン（現在値） | 西部戦線で最も長く続いた戦闘の地に点が立つ |
| サライェヴォ（第 8 回の開戦のきっかけ） | 戦争が始まった地に点が立つが、戦闘の主な舞台から離れる |
| ソンム（西部戦線の別の戦闘の地） | 西部戦線に点が立つ。ヴェルダンより短い戦闘の地になる |
| ベルリン（第 10・12 回が扱うドイツ帝国の都） | `berlin` を `hitler` が使うので、事物の `id` はより具体的な地点名になる |

## `region`・`kind`・`title`

`region: ヨーロッパ` は、舞台がヨーロッパ・西アジア・アフリカ・東アジアに跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、出来事の本拠の主な舞台（西部戦線と東部戦線）で決めた。
`@historian` は、西部戦線と東部戦線の主な舞台がヨーロッパに在ることを確認したが、ほかの区画の戦線との規模の比較は三次以上の典拠で定量的に確かめられなかった。

`id` の `daiichijisekaitaisen` は、デジタル大辞泉と精選版日本国語大辞典に一語の見出し（だいいちじ‐せかいたいせん）があるので割らなかった。
見出しの `‐` で割らない形は、現物の `shakaifukushi`（しゃかい‐ふくし）に揃えた。
`kind: place` と `title: 第一次世界大戦` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#168](https://github.com/ta-tabox/coten-atlas/pull/168) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | ヴェルダン | 開戦のきっかけを主題の起点と見ればサライェヴォになる |
| 代表点を置くか | 置く（ADR-0034 の代表点の選び方の表の 3 行目） | 舞台が複数の区画に対等に跨ると見れば 2 行目に当たり、位置なしの `concept` になる |
| `id` の区切り | `daiichijisekaitaisen` | 辞書の見出しの `‐` の位置で割れば `daiichiji-sekaitaisen` になる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・代表点・事物の `id` の裏どりと、座標のずれの指摘 |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |
