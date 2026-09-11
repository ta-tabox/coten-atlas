# オスマン帝国（`osman-teikoku`・season 18）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `osman-teikoku` |
| `series.json` の `season` | 18 |
| `series.json` の `timeRange` | 1299..1922 |
| `series.json` の `anchor` | `constantinople` |
| `series.json` の `region` | `西アジア` |
| `loci.geojson` の座標 | `[28.976, 41.008]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1299 | 建国の伝承年 | Cemal Kafadar, *Between Two Worlds*（1995。二次。`@historian` の報告による）・[Wikipedia: History of the Ottoman Empire](https://en.wikipedia.org/wiki/History_of_the_Ottoman_Empire)（参考程度） | 無し（伝承上の起点） |
| `end` | 1922 | スルタン制の廃止（11 月 1 日） | [Wikipedia: Abolition of the Ottoman sultanate](https://en.wikipedia.org/wiki/Abolition_of_the_Ottoman_sultanate)（参考程度） | 無し |

1299 年は学術的に確定した建国年でなく、15 世紀に成立したオスマン家の年代記が伝える伝承上の起点である。
`@historian` は、PR 本文が「建国の伝承年」と書いているので、この扱いに問題は無いと返した。

種別は `集団` なので、現物の `sparta`・`teisei-roma` と同じく、集団が存続した期間で引いた。
配信フィードの各回の説明によれば、第 1〜3 回がイスラーム世界の群雄割拠とオスマン家の台頭、第 4〜5 回が国家の仕組みとティムールとの戦い、第 6〜8 回がメフメト 2 世によるコンスタンティノープルの攻略、第 9 回が攻略後の都市の再建を扱う。
各回は 15 世紀までを扱うが、`timeRange` は集団の存続期間に揃えた。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 28.9654, 41.0072（Pleiades の代表点。Wikidata Q16869 の 28.976018, 41.012240 とも数百 m 以内） |
| 典拠 | [Pleiades 520998](https://pleiades.stoa.org/places/520998) |
| 典拠の格 | 三次 |

種別は `集団` だけなので、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md) の「代表点と `kind` の選び方」の表の 3 行目で、本拠の都市に代表点を置いた。
帝国の都は時期によって移ったので、ADR-0041 の決定（#171）により、番組が扱う主な事績が起きた地を本拠の都市とした。
各回の第 6〜9 回がコンスタンティノープルの攻略と攻略後の都市の再建を扱い、1453 年から帝国の終わりまでの都でもあるので、ここにした。
`@historian` は、この選び方を妥当と返した。

| 候補 | 置くと何が起きるか |
|---|---|
| コンスタンティノープル（現在値） | 1453 年以降の都と、各回の山場に寄る |
| ブルサ・エディルネ | 1453 年より前の都に寄る |
| ソユト | 発祥の地に寄る |

## `region`・`kind`・`title`

`region: 西アジア` は、版図がバルカンと北アフリカに跨るので、ADR-0041 の `region` の選び方の表の 2 行目で本拠の区画にした。
種別 `集団` の本拠は発祥の地で、発祥の地のソユトはアナトリアに在り、ADR-0041 の継ぎ目の表でアナトリアは `西アジア` である。
`@historian` は、アナトリアを西アジアに分類しイスタンブールの欧州側も含めてトルコを割らない規則を前提にすれば妥当だと確認した。
`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: オスマン帝国` はシリーズ名のままで、指摘は出なかった。
`id` の `osman-teikoku` は、カタカナの外来固有名を Osman、漢字を読みにして、部分ごとに規則を当てた（現物の `teisei-roma`）。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て現在の値で仮決定した。
同じ日に人間が #171 で拠点や舞台が複数あるときの選び方を決め、Claude がその規則で代表点を当て直した。
値は変わらない。
人間の判定は [#167](https://github.com/ta-tabox/coten-atlas/pull/167) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `start` | 1299（建国の伝承年） | 伝承上の起点で、学術的に確定した年ではない |
| 代表点 | `constantinople` | 事績の中心を建国と拡大の時期（第 1〜5 回）に置けば、ブルサかエディルネになる。事績の中心をどこに置くかは人間の判定を待つ |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628151771) | `timeRange`・座標・`region` の裏どり |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/167#issuecomment-5628144799) | `id`・事物の `id`・`region`・`tags`・`timeRange` と ADR-0034 の規則の突き合わせ |
| [#167 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/167) | 代表点を選んだ判断と候補 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171) | 拠点や舞台が複数あるときに、番組が扱う主な事績が起きた地を中心の場所とする規則 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
