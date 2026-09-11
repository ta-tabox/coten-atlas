# チンギス・カン（`chinggis-khan`・season 17）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `chinggis-khan` |
| `series.json` の `season` | 17 |
| `series.json` の `timeRange` | 1162..1227 |
| `series.json` の `anchor` | `avraga` |
| `series.json` の `region` | `中央ユーラシア` |
| `loci.geojson` の座標 | `[109.153, 47.094]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1162 | チンギス・カンの生年 | [Wikipedia: Genghis Khan](https://en.wikipedia.org/wiki/Genghis_Khan) の脚注が指す二次文献（二次） | 1155・1167 |
| `end` | 1227 | チンギス・カンの没年 | 同上 | 無し |

1162 年は、現代の歴史家の多数派（Man 2004・Biran 2012・Atwood 2004 など）が採る説である。
1155 年説は趙珙とラシード・アッディーンによるもので Ratchnevsky（1991）が扱い、1167 年説はポール・ペリオ（1959）が支持する。
`@historian` は一次文献（ラシード・アッディーンの原文・『元史』など）そのものには到達しておらず、二次文献の存在を確かめたところで止まっている。
没年の異説は見つからなかったが、`@historian` は深くは確かめていない。

配信フィードの各回の説明によれば、第 1〜2 回が遊牧民の世界、第 3〜4 回がテムジンの少年時代からモンゴル高原の統一まで、第 5〜7 回がモンゴル帝国の組織と軍と金への遠征、第 8 回が後世への影響を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 109.152778, 47.094444（現在値と一致） |
| 典拠 | [Wikidata Q4827751](https://www.wikidata.org/wiki/Q4827751)（GeoNames 2032786 の Avarga と一致） |
| 典拠の格 | 三次 |

種別は `人物` だけなので、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md) の「代表点と `kind` の選び方」の表の 3 行目で、活動の拠点に代表点を置いた。
1206 年の即位の後に大オルドを置いた地で、現在のアヴラガ遺跡に当たるので、ここにした。
`@historian` は、遺跡の占有期間の考古学的な年代測定と整合するので、この選び方は妥当だと返した。

| 候補 | 置くと何が起きるか |
|---|---|
| アヴラガ（現在値） | 即位後の大オルドの地に寄る |
| カラコルム | オゴデイが 1235 年に都を築いた地で、チンギス・カンの存命中の拠点ではない |
| オノン河畔 | 生地に寄る |

### 事物の `id` の名

最初の版は事物の `id` を `aurag` にしていた。
PR #167 の `@historian` は、`aurag` が当時の名であるかに問題がある可能性が高いと返した。

| 当時の名の候補 | 典拠が示すこと | 典拠 | 典拠の格 |
|---|---|---|---|
| コデエ・アラル（Köde'e Aral / Khödöö Aral） | 13 世紀の『元朝秘史』の跋文は、この一帯を「ケルレン川のコデエ・アラル」と呼ぶ | [UNESCO 世界遺産暫定リスト: Archaeological Site at Khuduu Aral and Surrounding Cultural Landscape](https://whc.unesco.org/en/tentativelists/5952/) | 参考程度 |
| アウラガ（アウラグ） | 白石典之らの発掘調査が遺跡に与えた名で、近くの地形に由来する | [Wikipedia: Avarga](https://en.wikipedia.org/wiki/Avarga)（John Man, *Genghis Khan*, 2010 を出典に引く） | 参考程度 |

その後、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md) の決定（#170）により、代表点に選んだ時代の地点が複数の名を持つときは、現在の英語の文献がその時代のその地点を指すときに通用する名を使うことになった。
PR #173 の `@historian` は、現在の英語の考古学の文献がこの遺跡をほぼ一貫して Avraga（または Avarga）と書き、Aurag の使用例は見つからなかったと返した。
発掘責任者の白石典之の英語の出版物の題も *Avraga 1: Occasional Paper on the Excavations of the Palace of Genghis Khan* である（[researchmap: Avraga 1](https://researchmap.jp/read0183816/books_etc/12656446?lang=en)、二次）。
そのため、事物の `id` を `aurag` から `avraga` へ直した。
Avraga と Avarga の二つの綴りのうち、発掘責任者の出版物の題が使う Avraga にした。

## `region`・`kind`・`title`

`region: 中央ユーラシア` は、遠征が中国と西アジアに跨るので、ADR-0041 の `region` の選び方の表の 2 行目で本拠の区画にした。
種別 `人物` の本拠は生地で、生地のオノン河畔はモンゴル高原に在り、ADR-0041 の継ぎ目の表でモンゴル高原は `中央ユーラシア` である。
`@historian` は、アヴラガ遺跡がモンゴル高原のケルレン川流域に在り、区画の表と矛盾しないと確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: チンギス・カン` はシリーズ名のままで、指摘は出なかった。
`id` の `chinggis-khan` は、ADR-0041 の `id` の表がカタカナの外来固有名の例に挙げている値である。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
同じ日に人間が #170 で地点が複数の名を持つときの規則を決め、Claude がその規則を当てて事物の `id` を `avraga` へ直した。
人間の判定は [#167](https://github.com/ta-tabox/coten-atlas/pull/167) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `start` | 1162 | 1155 年説と 1167 年説が並立している |
| 事物の `id` の綴り | `avraga` | 英語の文献は Avarga とも書く |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628151771) | `timeRange` の並立説・座標・`region` の裏どり、`aurag` が当時の名かの指摘 |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628144799) | `id`・事物の `id`・`region`・`tags`・`timeRange` と ADR-0034 の規則の突き合わせ |
| [#167 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/167) | 代表点を選んだ判断と候補 |
| [#170 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/170) | 地点が複数の名を持つときに、現在の英語の文献の名を使う規則 |
| [PR #173 の `@historian`（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/173#issuecomment-5630160476) | 現在の英語の文献が大オルドの遺跡を指す名 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
