# ジャンヌ・ダルク（`jeanne-darc`・season 50）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `jeanne-darc` |
| `series.json` の `season` | 50 |
| `series.json` の `timeRange` | 1412..1431 |
| `series.json` の `anchor` | `orleans` |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の座標 | `[1.904, 47.902]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1412 | ジャンヌ・ダルクの生年（頃） | [Britannica: Saint Joan of Arc](https://www.britannica.com/biography/Saint-Joan-of-Arc)・[World History Encyclopedia: Joan of Arc](https://www.worldhistory.org/Joan_of_Arc/)（三次） | 無し（推定値） |
| `end` | 1431 | ルーアンでの処刑（5 月 30 日） | [Britannica: Saint Joan of Arc](https://www.britannica.com/biography/Saint-Joan-of-Arc)（三次） | 無し |

1412 年は正確な日付の記録が無い推定値で、年の値そのものに異説は見つかっていない。

配信フィードの各回の説明によれば、第 1〜4 回がジャンヌ像の形成・フランスの成り立ちと騎士・百年戦争の経緯、第 5〜6 回が生い立ちと王太子への謁見、第 7〜10 回がオルレアンの解放からランスでの戴冠とコンピエーニュでの捕縛まで、第 11〜12 回が異端審問と処刑、百年戦争の終わりと復権裁判を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 1.904167, 47.902222 |
| 典拠 | [Wikidata Q6548](https://www.wikidata.org/wiki/Q6548)（フランスの統計機関 INSEE を出典とする） |
| 典拠の格 | 三次 |

最初に書いた座標は `[1.909, 47.903]` で、`@historian` が典拠の値から経度で約 360m、緯度で約 100m 離れていると返したので、典拠の値へ直した。
GeoNames では確かめられていない。

種別は `人物` だけなので、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md) の「代表点と `kind` の選び方」の表の 3 行目で、活動の拠点に代表点を置いた。
活動の地が複数あるので、ADR-0041 の決定（#171）により、番組が扱う主な事績が起きた地を中心の場所とした。
各回の第 7〜8 回が、百年戦争の転換点になったオルレアンの解放（1429）を扱うので、オルレアンにした。
`@historian` は、オルレアン包囲戦の解囲が百年戦争の転換点であったことを確かめ、この選び方を妥当と返した。
「オルレアンの乙女」は後世の呼び名で、本人が生前に好んだ呼び名は「乙女ジャンヌ」だったとも付記した（[jeanne-darc.info: FAQ](https://www.jeanne-darc.info/joan-of-arc/frequently-asked-questions/)、参考程度）。

| 候補 | 置くと何が起きるか |
|---|---|
| オルレアン（現在値） | 百年戦争の転換点になった解囲に寄る |
| ランス | シャルル 7 世の戴冠式に寄る |
| ドンレミ | 生地に寄る |
| ルーアン | 異端審問と処刑の地に寄る |

## `region`・`kind`・`title`

`region: ヨーロッパ` は、舞台のフランスとイングランドがヨーロッパに収まるので、ADR-0041 の `region` の選び方の表の 1 行目で決めた。
`@historian` は妥当だと確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: ジャンヌ・ダルク` はシリーズ名のままで、指摘は出なかった。
`id` の `jeanne-darc` は、ADR-0041 の `id` の表が `'` を除く例に挙げている値である。
事物の `id` の `orleans` は、Orléans の発音区別符号を除いて書いた。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て、座標を典拠の値へ直したうえで仮決定した。
同じ日に人間が #171 で拠点や舞台が複数あるときの選び方を決め、Claude がその規則で代表点を当て直した。
値は変わらない。
人間の判定は [#167](https://github.com/ta-tabox/coten-atlas/pull/167) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `start` | 1412 | 正確な日付の記録が無い推定値である |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628151771) | `timeRange`・`region`・代表点の選び方の裏どり、座標の典拠 |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628144799) | `id`・事物の `id`・`region`・`tags`・`timeRange` と ADR-0034 の規則の突き合わせ |
| [#167 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/167) | 代表点を選んだ判断と候補 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171) | 拠点や舞台が複数あるときに、番組が扱う主な事績が起きた地を中心の場所とする規則 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
