# ギルガメシュ（`gilgamesh`・season 63）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `gilgamesh` |
| `series.json` の `season` | 63 |
| `series.json` の `timeRange` | -2800..-2500 |
| `loci.geojson` の `anchor` | `uruk` |
| `loci.geojson` の座標 | `[45.637, 31.324]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -2800 | 治世の始期 | [World History Encyclopedia](https://www.worldhistory.org/gilgamesh/) | 無し（典拠間でおおむね一致する） |
| `end` | -2500 | 治世の終期 | 同上 | 前2600年とする見積もりもある |

学説は治世を「前2800〜前2500年頃」という幅で語ることが多い。
始期の前2800年はおおむね一致するのに対し、終期の見積もりは前2600年から前2500年まで割れている。
シュメール王朝表はギルガメシュの治世を 126 年と記すが、現代の歴史学はこの在位年数を文字どおりには採らない。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 45.6394, 31.3234（現在値との差は経度約230m・緯度約67m。OSM/CIGS の実測地物からの重心） |
| 典拠 | [Pleiades 912986](https://pleiades.stoa.org/places/912986) |
| 典拠の格 | 二次 |

ウルクが伝承と考古学の双方でギルガメシュと結びつく都市なので、代表点に選んだ。
他の地点は候補に挙がっていない。

## `region`・`kind`・`title`

`region: 西アジア` はウルクがイラクにある事実と合い、[ADR-0034](../adr/0034-series-vocabulary.md) の継ぎ目表のどの行にも当たらない。
`kind: place` と `title: ギルガメシュ` に指摘は出なかった。

## 仮決定と論点

2026-09-10 に人間が終期を前2500年で決着させ、`catalog/series.json` の `end` を -2600 から -2500 へ動かした。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 治世の終期 | -2500 | 学説は前2600年から前2500年まで割れており、前2600年を採る典拠もある |

`timeRange` が `catalog/eras.json` の 先史（-10000..-800）へ全部収まるので、このシリーズは古代のスライダー位置には現れない。

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902) | `timeRange`・座標・`region`・`kind`・`title` の裏どり |
| [`@historian` 2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216) | 座標の典拠の取り直し |
| [#143 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/143) | 代表点を選んだ判断と候補 |
| [#154 のレビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/154) | 終期を前2500年へ動かす仮決定 |

1 回目は座標の典拠に `latitude.to` を使っていたので、2 回目が Pleiades 912986 へ差し替えた。
**座標の典拠は 2 回目が正である。**
