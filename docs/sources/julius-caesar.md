# ユリウス・カエサル（`julius-caesar`・season 20）

`catalog/series.json` の `julius-caesar` と `catalog/loci.geojson` の `forum-romanum` が持つ値の典拠を残す。
値の正は `catalog/` の側にあり、このファイルは根拠だけを持つ。
ファイルの書式と「典拠」の語の範囲は [README.md](README.md) が持つ。

`@historian`（[ADR-0035](../adr/0035-history-review-lane.md)）の裏どりが 2 回走った。
[1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902)が全欄を見て、[2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216)が座標の典拠を取り直した。
**座標の典拠は 2 回目が正である。**

## `timeRange`（-100..-44）

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -100 | カエサルの生年（伝統説） | [World History Encyclopedia](https://www.worldhistory.org/Julius_Caesar/) | 前102年説 |
| `end` | -44 | カエサルの暗殺（前44年3月15日） | [Wikipedia: Julius Caesar](https://en.wikipedia.org/wiki/Julius_Caesar) | 無し |

前102年説は、執政官などの就任年齢が規定より若すぎることを理由に採る研究者がいる。
どちらが正しいかは確定していない。

## 代表点（`forum-romanum`）

| 欄 | 値 |
|---|---|
| 座標 | `[12.485, 41.893]` |
| 典拠が示す値 | OSM 境界ポリゴン（経度 12.4833〜12.4909、緯度 41.8902〜41.8932）。現在値はその内側の北端付近 |
| 典拠 | [Pleiades 502866838](https://pleiades.stoa.org/places/502866838) |
| 典拠の格 | 二次 |

フォルム・ロマヌムがカエサル期ローマの政治的中心なので、代表点に選んだ。
`rome` は `teisei-roma`（帝政ローマ）が既に名乗っているので、より具体的な地点名を使った（[ADR-0034](../adr/0034-series-vocabulary.md)「`id` の表記」）。

## `region`・`kind`・`title`

`region: ヨーロッパ` はローマの位置と合う。
`kind: place` と `title: ユリウス・カエサル` に指摘は出なかった。

## 未決

生年をどちらの説で書くかは人間が決める。
値は前100年説のままである。
