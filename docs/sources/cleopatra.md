# クレオパトラ（`cleopatra`・season 33）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `cleopatra` |
| `series.json` の `season` | 33 |
| `series.json` の `timeRange` | -69..-30 |
| `loci.geojson` の `anchor` | `alexandria` |
| `loci.geojson` の座標 | `[29.92, 31.2]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -69 | クレオパトラ 7 世の生年 | [コトバンク: クレオパトラ](https://kotobank.jp/word/クレオパトラ)（三次） | 前 70 年末（[Wikipedia: Cleopatra](https://en.wikipedia.org/wiki/Cleopatra) は前 69 年初めか前 70 年末と併記する。参考程度） |
| `end` | -30 | クレオパトラの自害 | 同上 | 無し |

コトバンクが収める 6 つの事典が、すべて前 69〜前 30 年とする。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 29.909773, 31.201435（現在値との差は約 1 km） |
| 典拠 | [Pleiades 727070](https://pleiades.stoa.org/places/727070) |
| 典拠の格 | 二次 |

クレオパトラが女王として治めたプトレマイオス朝の都なので、代表点に置いた。

## `region`・`title`

`region: アフリカ` は、アレクサンドリアが継ぎ目の表の「北アフリカ（エジプトを含む）」に当たることと合う。
種別が `人物` なので本拠は生地だが、生地がアレクサンドリアであることは確かめられなかった。
活動の中心で決めても同じアレクサンドリアなので、`region` の値は変わらない。
`title: クレオパトラ` に指摘は出なかった。

## 仮決定と論点

人間の採用はまだである。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 生年 | -69 | 前 70 年末とする記述がある |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian`（2026-10-09）](https://github.com/ta-tabox/coten-atlas/issues/252#issuecomment-6075143238) | `timeRange`・座標・`region`・`title` の裏どり |
| [#293 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/293) | 代表点を選んだ判断 |

生地をアレクサンドリアとする典拠は、脚注の無い Wikipedia の記述しか取れなかった。
