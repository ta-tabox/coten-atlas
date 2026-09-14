# 秦の始皇帝（`shin-no-shikotei`・season 5）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `shin-no-shikotei` |
| `series.json` の `season` | 5 |
| `series.json` の `timeRange` | -259..-210 |
| `loci.geojson` の `anchor` | `xianyang` |
| `loci.geojson` の座標 | `[108.709, 34.333]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -259 | 嬴政の生年 | [Wikipedia: Qin Shi Huang](https://en.wikipedia.org/wiki/Qin_Shi_Huang) | 無し |
| `end` | -210 | 嬴政の没年 | [World History Edu](https://worldhistoryedu.com/emperor-qin-shi-huang-the-first-emperor-of-a-unified-china/) | 無し |

生没年に学説の割れは見当たらなかった。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 108.70917, 34.32972 |
| 典拠 | [Wikidata Q497341](https://www.wikidata.org/wiki/Q497341) |
| 典拠の格 | 三次 |

咸陽が秦の首都なので、代表点に選んだ。
他の地点は候補に挙がっていない。

## `region`・`title`

`region: 中国` は咸陽が陝西省にある事実と合う。
`title: 秦の始皇帝` に指摘は出なかった。

## 仮決定と論点

論点は無い。
生没年に学説の割れが無く、代表点の候補も挙がっていない。

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902) | `timeRange`・座標・`region`・`kind`・`title` の裏どり |
| [`@historian` 2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216) | 座標の典拠の取り直し |
| [#143 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/143) | 代表点を選んだ判断と候補 |

1 回目は座標の典拠に Wikipedia の Xianyang の記事を使っていたので、2 回目が Wikidata Q497341 へ差し替えた。
**座標の典拠は 2 回目が正である。**
