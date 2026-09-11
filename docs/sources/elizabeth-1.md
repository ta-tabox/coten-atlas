# エリザベス1世（`elizabeth-1`・season 23）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `elizabeth-1` |
| `series.json` の `season` | 23 |
| `series.json` の `timeRange` | 1533..1603 |
| `series.json` の `anchor` | `whitehall` |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の座標 | `[-0.126, 51.504]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1533 | エリザベス1世の生年 | [Britannica: Elizabeth I](https://www.britannica.com/biography/Elizabeth-I)（三次） | 無し |
| `end` | 1603 | エリザベス1世の没年 | 同上 | 無し |

配信フィードの各回の説明によれば、第 1〜3 回がテューダー朝とヘンリー 8 世の結婚、第 4〜6 回が即位までの王位継承の争い、第 7〜11 回が治世・スペインとの戦い・晩年を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | -0.1256, 51.5045（ホワイトホール宮殿跡） |
| 典拠 | `@historian` が Wikidata と Wikipedia の座標で照合した（照合した項目の URL は報告に無い） |
| 典拠の格 | 三次 |

種別は `人物` だけなので、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md) の「代表点と `kind` の選び方」の表の 3 行目で、活動の拠点に代表点を置いた。
エリザベス1世の活動の拠点はロンドンで、宮廷はテューダー朝の主な王宮のホワイトホール宮殿に置かれた。

並行して進んでいる #104（19 世紀）の PR #165 が、`marx-engels`（マルクス・エンゲルス）の代表点に事物の `id` `london` を使っている。
ADR-0041 の決定（#166）の同じ地名の表では、二件とも種別が `人物` なので順 1 に当たらず、事績の中心を都市の中の一か所に絞れるかで決める順 2 に当たる。
エリザベス1世の事績の中心は宮廷を置いたホワイトホール宮殿に絞れる。
マルクスのロンドンの住まいは 1850 年から没年までに 3 か所以上移り、一か所に絞れない（PR #173 の `@historian` による。[English Heritage: Karl Marx](https://www.english-heritage.org.uk/visit/inspire-me/blog/blog-posts/karl-marx-london-connections/)、三次）。
そのため、このシリーズが具体的な地点名のホワイトホール宮殿へ移り、`marx-engels` が `london` を使う。
PR の最初の版は、PR #165 が先に `london` を使っていたことを理由に書いていたが、#166 の決定で順 2 の理由へ書き直した。

| 候補 | 置くと何が起きるか |
|---|---|
| ホワイトホール宮殿（現在値） | 宮廷の置かれた王宮に寄る |
| ロンドン | 活動の拠点の都市そのものになる。#166 の順 2 では `marx-engels` が `london` を使うので、このシリーズは使えない |
| グリニッジ | 生地の宮殿に寄る |

## `region`・`kind`・`title`

`region: ヨーロッパ` は、イングランドが戦ったスペインと、関わったネーデルラント・スコットランドがヨーロッパに収まるので、ADR-0041 の `region` の選び方の表の 1 行目で決めた。
`@historian` は、生没年が一致し、ホワイトホール宮殿がテューダー朝の主な王宮であることを確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: エリザベス1世` はシリーズ名のままで、指摘は出なかった。
`id` の `elizabeth-1` は、ADR-0041 の `id` の表が序数の例に挙げている値である。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て現在の値で仮決定した。
同じ日に人間が #166 で同じ地名を二つのシリーズが要求したときの規則を決め、Claude がその規則で当て直した。
値は変わらない。
人間の判定は [#169](https://github.com/ta-tabox/coten-atlas/pull/169) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | `whitehall`（ホワイトホール宮殿） | エリザベス1世の事績の中心がグリニッジやリッチモンドなどの王宮に分かれると見れば、順 2 で一か所に絞れず、順 3 で season の小さいエリザベス1世（23）が `london` を使い、`marx-engels`（29）が移る |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628206488) | `timeRange`・座標・`region` の裏どり |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628201381) | `region` の値・`anchor` と事物の対応・`tags` の規則の突き合わせ |
| [#169 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/169) | 代表点を選んだ判断と候補 |
| [#166 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/166) | 同じ地名を二つのシリーズが要求したときに、どちらが具体的な地点名へ移るかの規則 |
| [PR #173 の `@historian`（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/173#issuecomment-5630160476) | マルクスのロンドンの住まいが移ったこと |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
