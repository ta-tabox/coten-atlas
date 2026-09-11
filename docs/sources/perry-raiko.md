# ペリー来航（`perry-raiko`・season 59）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `perry-raiko` |
| `series.json` の `season` | 59 |
| `series.json` の `timeRange` | 1853..1854 |
| `series.json` の `region` | `日本` |
| `loci.geojson` の `anchor` | `uraga` |
| `loci.geojson` の座標 | `[139.714, 35.248]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1853 | ペリーの艦隊が浦賀へ入港した年（7 月 8 日） | [Britannica: United States expedition to Japan](https://www.britannica.com/topic/United-States-expedition-to-Japan)（三次） | 無し |
| `end` | 1854 | 日米和親条約（神奈川条約）を結んだ年（3 月 31 日） | [Britannica: Treaty of Kanagawa](https://www.britannica.com/event/Treaty-of-Kanagawa)（三次） | 無し |

`title` の中心になる語が `来航` で、種別の中心が `出来事` なので、ペリーの生涯（1794..1858）でなく、来航から条約までにした。
配信フィードの各回の説明によれば、第 1 回がペリーの生涯、第 2 回が米国が日本に目を付けた理由、第 3〜8 回が幕府の対応・琉球への寄港・条約の交渉・艦隊の帰還を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 139.71397, 35.2475 |
| 典拠 | [Wikidata Q2735604](https://www.wikidata.org/wiki/Q2735604) |
| 典拠の格 | 三次 |

1 回目の裏どりで、`catalog/loci.geojson` の最初の値 `[139.717, 35.238]` が典拠から南へ約 1km ずれていると分かり、典拠の値を小数 3 桁に丸めた現在の値へ直した。
2 回目の裏どりで、直した値が丸めの誤差の範囲で典拠と一致すると確認した。

代表点を浦賀に置いたのは、艦隊が停泊したのが浦賀沖で、[ADR-0034](../adr/0034-series-vocabulary.md) の `region` の本拠の表も「ペリー来航（浦賀）」を例に持つためである。
`@historian` は、浦賀が `title` の中心になる語 `来航` に最も直接に対応すると判断した。

| 候補 | 置くと何が起きるか |
|---|---|
| 浦賀（現在値） | 艦隊が停泊した地に点が立つ |
| 久里浜（国書を受け渡した上陸地） | 1853 年の来航のうち、国書を受け渡した一場面に絞った点になる |
| 横浜（日米和親条約の締結地） | 1854 年の条約の地に点が立つ |

## `region`・`kind`・`title`

`region: 日本` は、第 2 回が米国の事情を扱って区画が跨るので ADR-0034 の `region` の選び方の表の 2 行目に当て、出来事の主な舞台の浦賀で決めた。
`@historian` は、ADR-0034 の例が 1 行目（一区画に収まる）を示すと読んで、2 行目を当てた理由づけとの食い違いを挙げたが、値は変わらないとした。
ADR-0034 の「ペリー来航（浦賀）→ `日本`」の例は、2 行目で使う本拠の表に在るので、2 行目を当てた理由づけと食い違わない。
`@historian` は第 2 回の内容を配信フィードまで追わなかったので、第 2 回が米国の事情を扱うことは、この PR の側が配信フィードの各回の説明で確かめた。

`title: ペリー来航` は、シリーズ名の「ショート ペリー来航」からコーナー名を除いたものである。
`kind: place` と `title` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#165](https://github.com/ta-tabox/coten-atlas/pull/165) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `timeRange` | 1853..1854（来航から条約まで） | 第 1 回が扱うペリーの生涯（1794..1858）を採れば、`start` が近世の era に入る |
| 種別 | `出来事` と `人物` | 第 1 回だけがペリーの生涯を扱うので、`出来事` だけにする案もある。代表点と `region` はどちらでも変わらない |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628088075) | `timeRange`・代表点・`region` の裏どりと、座標のずれの指摘 |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628210063) | `timeRange` の典拠の URL と、直した座標の再確認 |
| [#165 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/165) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

1 回目は `timeRange` の典拠を URL 無しで返したので、2 回目が URL を返した。
**典拠の URL は 2 回目が正である。**
