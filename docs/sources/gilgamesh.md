# ギルガメシュ（`gilgamesh`・season 63）

`catalog/series.json` の `gilgamesh` と `catalog/loci.geojson` の `uruk` が持つ値の典拠を残す。
値の正は `catalog/` の側にあり、このファイルは根拠だけを持つ。
ファイルの書式と「典拠」の語の範囲は [README.md](README.md) が持つ。

`@historian`（[ADR-0035](../adr/0035-history-review-lane.md)）の裏どりが 2 回走った。
[1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902)が全欄を見て、[2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216)が座標の典拠を取り直した。
**座標の典拠は 2 回目が正である。**

## `timeRange`（-2800..-2600）

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -2800 | 治世の始期 | [World History Encyclopedia](https://www.worldhistory.org/gilgamesh/) | 無し（典拠間でおおむね一致する） |
| `end` | -2600 | 治世の終期 | 同上 | 前2500年まで幅がある |

学説は治世を「前2800〜前2500年頃」という幅で語ることが多く、現在値の -2600 はその幅の早い側に寄っている。
シュメール王朝表はギルガメシュの治世を 126 年と記すが、現代の歴史学はこの在位年数を文字どおりには採らない。

## 代表点（`uruk`）

| 欄 | 値 |
|---|---|
| 座標 | `[45.637, 31.324]` |
| 典拠が示す値 | 45.6394, 31.3234（現在値との差は経度約230m・緯度約67m。OSM/CIGS の実測地物からの重心） |
| 典拠 | [Pleiades 912986](https://pleiades.stoa.org/places/912986) |
| 典拠の格 | 二次 |

ウルクが伝承と考古学の双方でギルガメシュと結びつく都市なので、代表点に選んだ。
他の地点は候補に挙がっていない。

## `region`・`kind`・`title`

`region: 西アジア` はウルクがイラクにある事実と合い、[ADR-0034](../adr/0034-series-vocabulary.md) の継ぎ目表のどの行にも当たらない。
`kind: place` と `title: ギルガメシュ` に指摘は出なかった。

## 未決

治世の終期をどの値で書くかは人間が決める。
値は前2600年のままである。

`timeRange` が `catalog/eras.json` の 先史（-10000..-800）へ全部収まるので、このシリーズは古代のスライダー位置には現れない。
