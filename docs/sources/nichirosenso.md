# 日露戦争（`nichirosenso`・season 32）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `nichirosenso` |
| `series.json` の `season` | 32 |
| `series.json` の `timeRange` | 1904..1905 |
| `series.json` の `region` | `中国` |
| `loci.geojson` の `anchor` | `port-arthur` |
| `loci.geojson` の座標 | `[121.261, 38.812]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1904 | 開戦（2 月 8 日。旅順港への奇襲） | [コトバンク: 日露戦争（日本大百科全書）](https://kotobank.jp/word/%E6%97%A5%E9%9C%B2%E6%88%A6%E4%BA%89-109776)（三次） | 無し |
| `end` | 1905 | ポーツマス条約（9 月 5 日） | [Britannica: Treaty of Portsmouth](https://www.britannica.com/event/Treaty-of-Portsmouth)（三次） | 無し |

配信フィードの各回の説明によれば、第 2〜8 回がアヘン戦争・日本の近代国家化・朝鮮の派閥の対立・日清戦争・ロシア帝国と明治政府・義和団事件、第 9〜15 回が開戦の備え・旅順・資金の調達・旅順の総攻撃・二〇三高地・奉天の決戦・日本海海戦、第 16 回が戦争の残したものを扱う。
`title` の中心になる語が戦争そのものを指すので、前史は `timeRange` に含めなかった。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 121.26667, 38.8（Lüshunkou） |
| 典拠 | [GeoNames 1801722](https://www.geonames.org/1801722) |
| 典拠の格 | 三次 |

`@historian` は格を参考程度と報告したが、[典拠の格の定義](README.md)で地名辞典の値を持つデータベースは三次に当たるので、三次にした。
現在の値は典拠の値から約 1.5km 以内に在る。

出来事の舞台が一つの区画の中で複数あるときは、番組が扱う主な事の運びが起きた舞台を中心の場所とする（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。
戦争そのものを扱う第 9〜15 回の舞台は、旅順（第 10・12・13 回）・奉天（第 14 回）・日本海（第 15 回）である。
代表点を旅順に置いたのは、主な事の運びのうち最も多くの回が割かれた旅順の攻防の舞台だからである。
`@historian` は、規模で見れば奉天会戦（1905 年 2〜3 月。日本側 25 万・ロシア側 32 万、死傷者は合わせて 10 万を超える）が日露戦争で最大の陸戦で、旅順の攻囲戦を上回ると報告した（[コトバンク: 奉天会戦](https://kotobank.jp/word/%E5%A5%89%E5%A4%A9%E4%BC%9A%E6%88%A6-132341)、[JACAR](https://www.jacar.go.jp/nichiro2/sensoushi/rikujou09_detail.html)、どちらも三次）。
回の数と戦いの規模は別の基準なので、`@historian` はこれを矛盾でなく判断の材料として報告した。

| 候補 | 置くと何が起きるか |
|---|---|
| 旅順（現在値） | 各回が最も多く扱った攻防の地に点が立つ |
| 奉天（第 14 回の決戦） | 最大の陸戦の地に点が立つ。区画は `中国` のまま |
| 対馬沖（第 15 回の日本海海戦） | 海の上に点が立ち、陸の主な舞台から離れる |

事物の `id` は `port-arthur` である。
最初の版は、[ADR-0034](../adr/0034-series-vocabulary.md) の事物の `id` の表の「中国の地名は声調記号を付けないピンインで書く」を当てて `lushun` にしていた。
`@historian` は、日露戦争を扱う英語の文献が当時も現在も一貫して Port Arthur と書くと報告した。
Rotem Kowner の *Historical Dictionary of the Russo-Japanese War*（2006）は見出し語を Port Arthur とし、Lüshun を括弧内の転写形として併記するだけで、Britannica の項目名も [Battle of Port Arthur](https://www.britannica.com/event/Battle-of-Port-Arthur) である。
代表点に選んだ時代の地点が複数の名を持つときは、現在の英語の文献がその時代のその地点を指すときに通用する名を使い、中国の地名にもこの慣用を先に当てると、#170 で決まった（ADR-0041）。
それに従い、コミット fbc7fed で `lushun` を `port-arthur` へ直した。

## `region`・`title`

`region: 中国` は、各回が朝鮮半島と日本も扱って区画が跨るので ADR-0034 の `region` の選び方の表の 2 行目に当て、出来事の本拠の主な舞台（満洲）で決めた。
継ぎ目の表は、満洲を `中国` に入れる。
`@historian` は、陸戦（遼陽・沙河・奉天・旅順）がすべて南満洲に集中し、朝鮮半島は開戦の発端ではあるが陸戦の主な舞台でないことを Britannica で確認した。

`id` の `nichirosenso` は、デジタル大辞泉と精選版日本国語大辞典に一語の見出し（にちろ‐せんそう）があるので割らなかった。
二つの辞書のどちらかに一語の見出しがあれば割らないと #172 で決まり（ADR-0041）、値は変わらない。
`title: 日露戦争` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #170・#171・#172 の決定（ADR-0041）で事物の `id` を `port-arthur` へ直し、代表点と `id` の区切りを当て直した。
2026-09-11 に人間が仮決定を採用して決着させた。
2026-09-12 に人間が、規則と各回の配分で決まった値に残る別の候補も優先度を下げて見直すと決め、見直しを [#205](https://github.com/ta-tabox/coten-atlas/issues/205)（日露戦争（nichirosenso）の代表点を旅順と奉天のどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | 旅順（主な事の運びの舞台） | 戦いの規模で数えれば、最大の陸戦の奉天になる。見直しは #205 で行う |
| `region` | `中国` | 日本の国家の歩みとして読む読み手には `日本` が自然だが、出来事の本拠（主な舞台）の基準を変えない限り値は変わらない |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・代表点・事物の `id` の裏どりと、Port Arthur の慣用の指摘 |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| [#170 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/170#issuecomment-5629510408) | 地点が複数の名を持つときに、現在の英語の文献の慣用で事物の `id` を決め、中国の地名にも先に当てる判断 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 出来事の舞台が複数あるときに、主な事の運びが起きた舞台を代表点にする判断 |
| [#172 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/172#issuecomment-5629510570) | 二つの辞書のどちらかに一語の見出しがあれば割らない判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |
| [#205（見直し）](https://github.com/ta-tabox/coten-atlas/issues/205) | 採用した仮決定を人間が見直す論点と案 |
