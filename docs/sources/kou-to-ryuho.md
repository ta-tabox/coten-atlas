# 項羽と劉邦（`kou-to-ryuho`・season 60）

`catalog/series.json` の `kou-to-ryuho` と `catalog/loci.geojson` の `pengcheng` が持つ値の典拠を残す。
値の正は `catalog/` の側にあり、このファイルは根拠だけを持つ。
ファイルの書式と「典拠」の語の範囲は [README.md](README.md) が持つ。

`@historian`（[ADR-0035](../adr/0035-history-review-lane.md)）の裏どりが 2 回走った。
[1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902)が全欄を見て、[2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216)が座標の典拠を取り直した。
**座標の典拠は 2 回目が正である。**

## `timeRange`（-256..-195）

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -256 | 劉邦の生年 | [China Highlights](https://www.chinahighlights.com/travelguide/china-history/liu-bang.htm)、[Wikipedia: Emperor Gaozu of Han](https://en.wikipedia.org/wiki/Emperor_Gaozu_of_Han) | 前247年説 |
| `end` | -195 | 劉邦の没年 | [Wikipedia: Emperor Gaozu of Han](https://en.wikipedia.org/wiki/Emperor_Gaozu_of_Han) | 無し |

劉邦の生年は前256年説と前247年説が並立し、どちらが正しいとは確定していない。
項羽の生没年（前232年生・前202年没。[Wikipedia: Xiang Yu](https://en.wikipedia.org/wiki/Xiang_Yu)）は、どちらの説を採っても現在の `timeRange` に収まる。

## 代表点（`pengcheng`）

| 欄 | 値 |
|---|---|
| 座標 | `[117.185, 34.262]` |
| 典拠が示す値 | 117.18587, 34.26104（現在値との差は経度約80m・緯度約107m） |
| 典拠 | [Wikidata Q57719](https://www.wikidata.org/wiki/Q57719)（徐州。古名が彭城であることも同項目内で確認した） |
| 典拠の格 | 三次 |

彭城は項羽が西楚の覇王として都とした都市であり、劉邦の本拠ではない。
劉邦の出身は同じ徐州管轄域内の沛県で、彭城とは別の地点である。
彭城が劉邦の大敗した彭城の戦い（前205年。[Wikipedia: Battle of Pengcheng](https://en.wikipedia.org/wiki/Battle_of_Pengcheng)、[徐州博物館](https://www.xzmuseum.com/ezl_detail.aspx?id=2219)）の舞台でもあるので、両者に関わる地点として選ぶ根拠は立つ。

| 候補 | 誰の側に寄るか |
|---|---|
| 彭城（現在値） | 項羽の都。劉邦の側は彭城の戦いで関わる |
| 沛県 | 劉邦の出身地。徐州管轄域内なので彭城と近い |
| 咸陽 | 秦の首都。`shin-no-shikotei` の代表点と同じ地点になる |
| 長安 | 劉邦が漢の都に定めた地 |

## `region`・`kind`・`title`

`region: 中国` に指摘は出なかった。
`kind: place` と `title: 項羽と劉邦` にも指摘は出なかった。

## 未決

代表点を彭城・沛県・咸陽・長安のどこに置くかは人間が決める。
劉邦の生年をどちらの説で書くかも人間が決める。
値は彭城と前256年のままである。
