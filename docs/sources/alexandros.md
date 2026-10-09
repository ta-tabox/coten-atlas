# アレクサンドロス（`alexandros`・season 11）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `alexandros` |
| `series.json` の `season` | 11 |
| `series.json` の `timeRange` | -356..-323 |
| `loci.geojson` の `anchor` | `pella` |
| `loci.geojson` の座標 | `[22.525, 40.76]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -356 | アレクサンドロスの生年 | [コトバンク: アレクサンドロス大王](https://kotobank.jp/word/アレクサンドロス大王)（三次） | 無し |
| `end` | -323 | バビロンでの病没 | 同上 | 無し |

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 22.5182, 40.7544（現在値との差は約 0.7 km） |
| 典拠 | [Pleiades 491687](https://pleiades.stoa.org/places/491687) |
| 典拠の格 | 二次 |

ペラは前 4 世紀から前 168 年までマケドニア王国の都で、アレクサンドロスの生地でもある（[Wikipedia: Pella](https://en.wikipedia.org/wiki/Pella)。参考程度）。
アレクサンドロスが王として治めた国の都なので、代表点に置いた。
番組の第 5〜9 回は東征とバビロンでの死を扱うので、バビロンに置く案も立つ。
バビロンの座標は [Pleiades 893951](https://pleiades.stoa.org/places/893951)（二次）の reprPoint で 44.42498, 32.53730 である。

| 候補 | 置くと何が起きるか |
|---|---|
| ペラ（現在値） | `region` の `ヨーロッパ`（生地で決まる）と代表点の区画が揃う。東征の舞台は地図に出ない |
| バビロン | 東征の後に本拠とし、没した地を指す。代表点が `西アジア` の区画に入り、`region` の `ヨーロッパ` と区画が分かれる |

## `region`・`title`

`region: ヨーロッパ` は、種別が `人物` なので生地ペラの区画で決まる。
`title: アレクサンドロス` に指摘は出なかった。

## 仮決定と論点

人間の採用はまだである。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | `pella`（ペラ） | 番組の主な事績は東征なので、バビロンに置けば事績の中心と合う |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian`（2026-10-09）](https://github.com/ta-tabox/coten-atlas/issues/252#issuecomment-6075143238) | `timeRange`・ペラとバビロンの座標・`region`・`title` の裏どり |
| [#293 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/293) | 代表点を選んだ判断と候補 |

日本語の事典ではペラが都であったことと生地であったことを確かめられず、Wikipedia の脚注の無い記述だけが典拠である。
