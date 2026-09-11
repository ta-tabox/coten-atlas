# サラディンと十字軍（`saladin-to-jujigun`・season 40）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `saladin-to-jujigun` |
| `series.json` の `season` | 40 |
| `series.json` の `timeRange` | 1096..1291 |
| `series.json` の `anchor` | `damascus` |
| `series.json` の `region` | `西アジア` |
| `loci.geojson` の座標 | `[36.306, 33.511]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1096 | 第 1 回十字軍の出発 | [World History Encyclopedia: First Crusade](https://www.worldhistory.org/First_Crusade/)（三次） | 1095（クレルモン教会会議での提唱） |
| `end` | 1291 | アッコンの陥落による十字軍国家の終わり | [Medievalists.net: Crusader states fall 1291](https://www.medievalists.net/2022/09/crusader-states-fall-1291/)（参考程度） | 無し |

第 1 回十字軍の起点には、提唱（1095）・出発（1096）・エルサレムの陥落（1099）の候補がある。
`@historian` は、現在の値は実際に軍が動いた年を採っており、混同は無いと返した。
サラディンの生没年（1137 か 1138〜1193）はこの範囲に含まれる（[Britannica: Saladin](https://www.britannica.com/biography/Saladin)、三次）。

人物と出来事の両方を種別に持つシリーズで、各回がサラディンの生涯と十字軍の始まりから終わりまでの両方を扱うので、十字軍の期間で引いた。
配信フィードの各回の説明によれば、第 1〜2 回がローマ帝国のキリスト教化から叙任権闘争まで、第 3〜5 回が第 1 回・第 2 回十字軍とイスラーム諸国、第 6〜8 回がサラディンの生い立ちからエルサレムの奪還まで、第 9〜10 回が第 3 回十字軍、第 11〜12 回がサラディン没後の十字軍とその終わりを扱う。
配信フィードは 40-6 と 40-10 に `itunes:season` 37 を付けているが、この 2 回も含めて読んだ。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 36.309102, 33.511612（現在値との差は約 0.3km） |
| 典拠 | [Pleiades 678106](https://pleiades.stoa.org/places/678106) |
| 典拠の格 | 三次 |

[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 3 行目で決めた。
種別が `人物` と `出来事` の二つなので、`title` の中心になる語（`A と B` なら A）のサラディンが当たる `人物` に絞り、活動の拠点に代表点を置いた。
1174 年 5 月にヌールッディーンが没した後、サラディンはダマスクスへ進軍して以後の本拠にした（[Britannica: Saladin](https://www.britannica.com/biography/Saladin)、三次）。
`@historian` は、この選び方を妥当と返した。
エジプトの宰相として治めたカイロと、1174 年以降の本拠のダマスクスのどちらを選ぶかの基準は ADR-0034 に無く、[#171](https://github.com/ta-tabox/coten-atlas/issues/171)（人物や集団の拠点が時期によって複数あるとき、どれを代表点にするかを決める）で決める。

| 候補 | 置くと何が起きるか |
|---|---|
| ダマスクス（現在値） | 1174 年以降の本拠と没地に寄る |
| カイロ | 宰相として治めたエジプトの都に寄る。点が `アフリカ` に出て、`region` の `西アジア` と区画が食い違って見える |
| エルサレム | 奪還した聖地と十字軍の舞台に寄る |

## `region`・`kind`・`title`

`region: 西アジア` は、十字軍がヨーロッパとエジプトに跨るので、ADR-0034 の `region` の選び方の表の 2 行目で本拠の区画にした。
中心になる語はサラディンで、人物の本拠は生地のティクリートである。
`@historian` は、シリアが国連の地域区分（M49）で Western Asia に分類されるので妥当だと確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: サラディンと十字軍` はシリーズ名のままで、指摘は出なかった。
`id` の `saladin-to-jujigun` は、カタカナの外来固有名を英語の文献で通用する Saladin、助詞を `to`、「十字軍」を一語の読みにした。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#167](https://github.com/ta-tabox/coten-atlas/pull/167) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `start` | 1096（第 1 回十字軍の出発） | 提唱の 1095 年を起点にする数え方がある |
| 代表点 | `damascus` | 宰相の時代を重く見ればカイロになる（#171） |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628151771) | `timeRange`・座標・`region`・代表点の選び方の裏どり |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628144799) | `id`・事物の `id`・`region`・`tags`・`timeRange` と ADR-0034 の規則の突き合わせ |
| [#167 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/167) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
