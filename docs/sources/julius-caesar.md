# ユリウス・カエサル（`julius-caesar`・season 20）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `julius-caesar` |
| `series.json` の `season` | 20 |
| `series.json` の `timeRange` | -100..-44 |
| `loci.geojson` の `anchor` | `forum-romanum` |
| `loci.geojson` の座標 | `[12.485, 41.893]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -100 | カエサルの生年（伝統説） | [World History Encyclopedia](https://www.worldhistory.org/Julius_Caesar/) | 前102年説 |
| `end` | -44 | カエサルの暗殺（前44年3月15日） | [Wikipedia: Julius Caesar](https://en.wikipedia.org/wiki/Julius_Caesar) | 無し |

前102年説は、執政官などの就任年齢が規定より若すぎることを理由に採る研究者がいる。
どちらが正しいかは確定していない。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | OSM 境界ポリゴン（経度 12.4833〜12.4909、緯度 41.8902〜41.8932）。現在値はその内側の北端付近 |
| 典拠 | [Pleiades 502866838](https://pleiades.stoa.org/places/502866838) |
| 典拠の格 | 二次 |

フォルム・ロマヌムがカエサル期ローマの政治的中心なので、代表点に選んだ。
`rome` は `teisei-roma`（帝政ローマ）が既に名乗っているので、より具体的な地点名を使った（[ADR-0034](../adr/0034-series-vocabulary.md)「`id` の表記」）。

## `region`・`kind`・`title`

`region: ヨーロッパ` はローマの位置と合う。
`kind: place` と `title: ユリウス・カエサル` に指摘は出なかった。

## 仮決定と論点

2026-09-10 に人間が現在の値で決着させた。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 生年 | -100（伝統説） | 執政官などの就任年齢が規定より若すぎることを理由に、前102年説を採る研究者がいる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902) | `timeRange`・座標・`region`・`kind`・`title` の裏どり |
| [`@historian` 2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216) | 座標の典拠の取り直し |
| [#143 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/143) | 代表点を選んだ判断と候補 |
| [#154 のレビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/154) | 仮決定 |

1 回目は座標の典拠に `latitude.to` を使っていたので、2 回目が Pleiades 502866838 へ差し替えた。
**座標の典拠は 2 回目が正である。**
