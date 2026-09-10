# ハンニバル（`hannibal`・season 42）

`catalog/series.json` の `hannibal` と `catalog/loci.geojson` の `carthage` が持つ値の典拠を残す。
値の正は `catalog/` の側にあり、このファイルは根拠だけを持つ。
ファイルの書式と「典拠」の語の範囲は [README.md](README.md) が持つ。

`@historian`（[ADR-0035](../adr/0035-history-review-lane.md)）の裏どりが 2 回走った。
[1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902)が全欄を見て、[2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216)が座標の典拠を取り直した。
**座標の典拠は 2 回目が正である。**

## `timeRange`（-247..-183）

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -247 | ハンニバルの生年 | [Britannica](https://www.britannica.com/biography/Hannibal-Carthaginian-general-247-183-BCE) | 無し |
| `end` | -183 | ハンニバルの没年 | 同上 | 前181年 |

没年は前183年とする典拠が主流だが、前181年とする文献もある。

## 代表点（`carthage`）

| 欄 | 値 |
|---|---|
| 座標 | `[10.323, 36.853]` |
| 典拠が示す値 | 10.323056, 36.853056 |
| 典拠 | [Pleiades 314921](https://pleiades.stoa.org/places/314921) |
| 典拠の格 | 二次 |

カルタゴがハンニバルの本拠地であり出身地でもあるので、代表点に置いた。
第二次ポエニ戦争の主戦場はイタリア半島なので、カンナエに置く案も立つ。

| 候補 | 置くと `region` がどうなるか |
|---|---|
| カルタゴ（現在値） | `アフリカ`。主戦場のイタリアとは `region` が一致せず、近接は `戦争` の tag が拾う |
| カンナエ | `ヨーロッパ`。本拠地と出身地が地図に出なくなる |

## `region`・`kind`・`title`

`region: アフリカ` はカルタゴ（チュニジア）が [ADR-0034](../adr/0034-series-vocabulary.md) の継ぎ目表「北アフリカ（エジプトを含む）→ アフリカ」に明記された区画そのものに当たる。
`kind: place` と `title: ハンニバル` に指摘は出なかった。

## 未決

代表点をカルタゴとカンナエのどちらに置くかは人間が決める。
没年をどちらの説で書くかも人間が決める。
値はカルタゴと前183年のままである。
