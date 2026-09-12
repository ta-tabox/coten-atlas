# ヌルハチ（`nurhaci`・season 51）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `nurhaci` |
| `series.json` の `season` | 51 |
| `series.json` の `timeRange` | 1559..1626 |
| `series.json` の `anchor` | `hetu-ala` |
| `series.json` の `region` | `中国` |
| `loci.geojson` の座標 | `[124.858, 41.702]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1559 | ヌルハチの生年 | [Britannica: Nurhachi](https://www.britannica.com/biography/Nurhachi)（三次） | 無し |
| `end` | 1626 | ヌルハチの没年 | 同上 | 無し |

配信フィードの各回の説明によれば、第 1 回が女真族と満洲、第 2 回が女真族の統一、第 3 回が後金の建国と八旗、第 4 回がサルフの戦いを扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 124.858, 41.702（41°42′07″N 124°51′29″E） |
| 典拠 | [Wikipedia: Hetu Ala](https://en.wikipedia.org/wiki/Hetu_Ala)・[Wikidata Q842950](https://www.wikidata.org/wiki/Q842950) |
| 典拠の格 | 三次 |

最初に書いた座標は `[124.83, 41.66]` で、`@historian` が典拠の値から約 5km 南西へずれていると指摘したので、典拠の値へ直した。
GeoNames にはヘトゥアラの独立した収録が確認できず、Wikipedia と Wikidata の座標の一致を典拠にした。

種別は `人物` だけなので、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md) の「代表点と `kind` の選び方」の表の 3 行目で、活動の拠点に代表点を置いた。
都が時期によって移ったので、ADR-0041 の決定（#171）により、番組が扱う主な事績が起きた地を中心の場所とした。
各回の第 2〜3 回が扱う女真族の統一と後金の建国は、ヌルハチが 1603 年に城を築いて本拠を置き、1616 年に後金を建てたヘトゥアラで起きたので、ここにした。
`@historian` は、この選び方自体は妥当だと返した。

| 候補 | 置くと何が起きるか |
|---|---|
| ヘトゥアラ（現在値） | 後金を建てた地に寄る |
| 遼陽 | 1621 年からの都に寄る |
| 瀋陽 | 1625 年からの都で、没する前年に移った地に寄る |

## `region`・`title`

`region: 中国` は、扱う地理が満洲と明に収まり、ADR-0041 の継ぎ目の表で満洲は `中国` なので、`region` の選び方の表の 1 行目で決めた。
`@historian` は、生没年が一致し、区画が継ぎ目の表と合うことを確認した。
`title: ヌルハチ` はシリーズ名「ショート ヌルハチ」からコーナー名を除いた値で、指摘は出なかった。
`id` の `nurhaci` は、カタカナの語形に合う綴りの Nurhaci と Nurhachi のうち、英語版 Wikipedia の見出しの Nurhaci にした。
Britannica の見出しは Nurhachi である。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て、座標を典拠の値へ直したうえで仮決定した。
同じ日に人間が #171 で拠点や舞台が複数あるときの選び方を決め、Claude がその規則で代表点を当て直した。
値は変わらない。
2026-09-11 に人間が仮決定を採用して決着させた。
2026-09-12 に人間が、規則と各回の配分で決まった値に残る別の候補も優先度を下げて見直すと決め、見直しを [#200](https://github.com/ta-tabox/coten-atlas/issues/200)（ヌルハチ（nurhaci）の代表点をヘトゥアラとサルフのどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | `hetu-ala`（ヘトゥアラ） | 事績の中心をサルフの戦い（第 4 回）に置けば戦場のサルフになる。見直しは #200 で行う |
| `id` の綴り | `nurhaci` | Britannica の見出しの Nurhachi も、カタカナの語形に合う |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628206488) | `timeRange`・`region` の裏どり、座標のずれの指摘と典拠 |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628201381) | `region` の値・`anchor` と事物の対応・`tags` の規則の突き合わせ |
| [#169 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/169) | 代表点を選んだ判断と候補 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171) | 拠点や舞台が複数あるときに、番組が扱う主な事績が起きた地を中心の場所とする規則 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
| [#200（見直し）](https://github.com/ta-tabox/coten-atlas/issues/200) | 採用した仮決定を人間が見直す論点と案 |
