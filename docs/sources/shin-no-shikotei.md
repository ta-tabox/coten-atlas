# 秦の始皇帝（`shin-no-shikotei`・season 5）

`catalog/series.json` の `shin-no-shikotei` と `catalog/loci.geojson` の `xianyang` が持つ値の典拠を残す。
値の正は `catalog/` の側にあり、このファイルは根拠だけを持つ。
ファイルの書式と「典拠」の語の範囲は [README.md](README.md) が持つ。

`@historian`（[ADR-0035](../adr/0035-history-review-lane.md)）の裏どりが 2 回走った。
[1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902)が全欄を見て、[2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216)が座標の典拠を取り直した。
**座標の典拠は 2 回目が正である。**

## `timeRange`（-259..-210）

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -259 | 嬴政の生年 | [Wikipedia: Qin Shi Huang](https://en.wikipedia.org/wiki/Qin_Shi_Huang) | 無し |
| `end` | -210 | 嬴政の没年 | [World History Edu](https://worldhistoryedu.com/emperor-qin-shi-huang-the-first-emperor-of-a-unified-china/) | 無し |

生没年に学説の割れは見当たらなかった。

## 代表点（`xianyang`）

| 欄 | 値 |
|---|---|
| 座標 | `[108.709, 34.333]` |
| 典拠が示す値 | 108.70917, 34.32972 |
| 典拠 | [Wikidata Q497341](https://www.wikidata.org/wiki/Q497341) |
| 典拠の格 | 三次 |

咸陽が秦の首都なので、代表点に選んだ。
他の地点は候補に挙がっていない。

## `region`・`kind`・`title`

`region: 中国` は咸陽が陝西省にある事実と合う。
`kind: place` と `title: 秦の始皇帝` に指摘は出なかった。

## 未決

無し。
