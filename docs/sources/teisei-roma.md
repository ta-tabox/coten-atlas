# 帝政ローマ（`teisei-roma`・season 66）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `teisei-roma` |
| `series.json` の `season` | 66 |
| `series.json` の `timeRange` | -27..476 |
| `loci.geojson` の `anchor` | `rome` |
| `loci.geojson` の座標 | `[12.496, 41.903]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -27 | オクタウィアヌスへのアウグストゥスの称号の授与（帝政の開始） | [コトバンク: ローマ帝国](https://kotobank.jp/word/ローマ帝国)（三次） | 無し |
| `end` | 476 | オドアケルによる西ローマ皇帝の廃位 | [コトバンク: 西ローマ帝国](https://kotobank.jp/word/西ローマ帝国)（三次） | 395 年（東西の分割）・480 年（ネポスの死）・1453 年（東ローマ帝国の滅亡） |

デジタル大辞泉は、帝政の開始（前 27 年）から西ローマ帝国の滅亡（476 年）までを古代ローマ帝国と呼ぶと補説しており、-27 と 476 の組はその区切りと一致する。
英語圏では 476 年は Gibbon 以来の便宜上の区切りで、480 年を採る説も併存する（[Wikipedia: Fall of the Western Roman Empire](https://en.wikipedia.org/wiki/Fall_of_the_Western_Roman_Empire)。参考程度）。

種別は `集団` なので、`osman-teikoku`・`mughal-teikoku` と同じく、集団が存続した期間で引いた。
配信フィードの各回の説明によれば、第 1〜5 回がカエサルの暗殺からアウグストゥスの統治、第 6〜8 回がユリウス＝クラウディウス朝とウェスパシアヌス、第 9 回がローマ人の暮らし、第 10〜14 回が五賢帝からセウェルス朝と軍人皇帝時代を扱う。
各回は 3 世紀までを扱うが、`timeRange` は集団の存続期間に揃えた。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 12.4913, 41.8900（現在値との差は約 1.4 km） |
| 典拠 | [Pleiades 423025](https://pleiades.stoa.org/places/423025) |
| 典拠の格 | 二次 |

種別が `集団` なので、本拠の都市ローマに置いた。

## `region`・`title`

`region: ヨーロッパ` は、発祥の地ローマの区画と合う。
`title: 帝政ローマ` に指摘は出なかった。

## 仮決定と論点

人間の採用はまだである。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `end` | 476（西ローマ皇帝の廃位） | 東西の分割（395 年）、ネポスの死（480 年）、東ローマ帝国の滅亡（1453 年）を終わりとする数え方がある |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian`（2026-10-09）](https://github.com/ta-tabox/coten-atlas/issues/252#issuecomment-6075143238) | `timeRange`・座標・`region`・`title` の裏どり |
| [#293 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/293) | `timeRange` を存続期間で引いた判断 |

Pleiades の位置の精度は確かめられなかった。
