# ハンニバル（`hannibal`・season 42）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `hannibal` |
| `series.json` の `season` | 42 |
| `series.json` の `timeRange` | -247..-183 |
| `loci.geojson` の `anchor` | `carthage` |
| `loci.geojson` の座標 | `[10.323, 36.853]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -247 | ハンニバルの生年 | [Britannica](https://www.britannica.com/biography/Hannibal-Carthaginian-general-247-183-BCE) | 無し |
| `end` | -183 | ハンニバルの没年 | 同上 | 前181年 |

没年は前183年とする典拠が主流だが、前181年とする文献もある。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 10.323056, 36.853056 |
| 典拠 | [Pleiades 314921](https://pleiades.stoa.org/places/314921) |
| 典拠の格 | 二次 |

カルタゴがハンニバルの本拠地であり出身地でもあるので、代表点に置いた。
第二次ポエニ戦争の主戦場はイタリア半島なので、カンナエに置く案も立つ。

| 候補 | 置くと `region` がどうなるか |
|---|---|
| カルタゴ（現在値） | `アフリカ`。主戦場のイタリアとは `region` が一致せず、近接は `戦争` の tag が拾う |
| カンナエ | `ヨーロッパ`。本拠地と出身地が地図に出なくなる |

## `region`・`title`

`region: アフリカ` はカルタゴ（チュニジア）が [ADR-0034](../adr/0034-series-vocabulary.md) の継ぎ目表「北アフリカ（エジプトを含む）→ アフリカ」に明記された区画そのものに当たる。
`title: ハンニバル` に指摘は出なかった。

## 仮決定と論点

2026-09-10 に人間が現在の値で決着させた。
2026-09-12 に人間が、決着させた値に残る論点を見直すと決め、見直しを [#217](https://github.com/ta-tabox/coten-atlas/issues/217)（ハンニバル（hannibal）の代表点をカルタゴとカンナエのどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 没年 | -183 | 前181年とする文献がある |
| 代表点 | `carthage`（カルタゴ） | カンナエに置けば `region` が `ヨーロッパ` になり、第二次ポエニ戦争の主戦場と揃う。見直しは #217 で行う |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902) | `timeRange`・座標・`region`・`kind`・`title` の裏どり |
| [`@historian` 2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216) | 座標の典拠の取り直し |
| [#143 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/143) | 代表点を選んだ判断と候補 |
| [#154 のレビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/154) | 仮決定 |
| [#217（見直し）](https://github.com/ta-tabox/coten-atlas/issues/217) | 人間が決着させた値を見直す論点と案 |

1 回目は座標の典拠に `geodatos.net` と Wikipedia の Archaeological site of Carthage の記事を使っていたので、2 回目が Pleiades 314921 へ差し替えた。
**座標の典拠は 2 回目が正である。**
