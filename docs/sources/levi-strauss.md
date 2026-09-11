# レヴィ＝ストロース（`levi-strauss`・season 35）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `levi-strauss` |
| `series.json` の `season` | 35 |
| `series.json` の `timeRange` | 1908..2009 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `paris` |
| `loci.geojson` の座標 | `[2.352, 48.857]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1908 | レヴィ＝ストロースの生年（11 月 28 日。ブリュッセル） | [British Academy: Memoir of Claude Lévi-Strauss](https://www.thebritishacademy.ac.uk/documents/920/Memoirs_18-14-Levi-Strauss.pdf)（二次） | 無し |
| `end` | 2009 | レヴィ＝ストロースの没年（10 月 30 日。公表は 11 月 3 日） | 同上 | 無し |

配信フィードの各回の説明によれば、第 1 回が文化人類学者としての生涯、第 2〜4 回が言語の本質・インセスト・タブー・構造主義を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 2.352222, 48.856666 |
| 典拠 | [Wikidata Q90](https://www.wikidata.org/wiki/Q90) |
| 典拠の格 | 三次 |

[GeoNames 2988507](https://sws.geonames.org/2988507/about.rdf)（三次）は 2.3488, 48.85341 を示し、Wikidata の値と約 463m 離れる。
`@historian` は、パリのように広い都市の代表点としてはこの差は小さいと判断した。
コレージュ・ド・フランスの地点（2.3455, 48.8489）からは約 1.0km 離れ、事物の `id` が施設の名でなく都市の名であることと合う。

代表点をパリに置いたのは、コレージュ・ド・フランスで教え（1959〜1982 年）、没地でもあるためである。
`@historian` は、教授の在任期間が他の候補の滞在より長く、パリが活動の拠点として妥当と判断した。

| 候補 | 置くと何が起きるか |
|---|---|
| パリ（現在値） | 教えた地で没地に点が立つ |
| ブリュッセル（生地） | 活動の拠点でない点が立つ |
| サンパウロ（ブラジルでの調査） | 調査の地に点が立ち、区画が `南アメリカ` になる |
| ニューヨーク（亡命中の滞在） | 亡命の地に点が立つ |

パリは、#169（S7: 近世の 8 シリーズを series.json へ載せる）の `france-kakumei`（フランス革命）も要求していて、事物の `id` の `paris` が衝突している。
事物の `id` は一意なので、どちらかを直さずに両方を main へ入れると、後から入る側の `pnpm check` が赤になる。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理がブラジルと米国に跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（ブリュッセル）で決めた。
`@historian` は、ブリュッセルの生まれであることと、パリの生まれとする説が誤りとして扱われていることを [Wikidata Q128126](https://www.wikidata.org/wiki/Q128126) で確認したが、一次と二次の文献には直接当たれなかった。

`title: レヴィ＝ストロース` は、シリーズ名の「ジンブンガク レヴィ＝ストロース」からコーナー名を除いたものである。
`id` の `levi-strauss` は、ADR-0034 の `id` の表の発音区別符号と `＝` の行の例と同じである。
`kind: place` と `title` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#168](https://github.com/ta-tabox/coten-atlas/pull/168) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 事物の `id` | `paris` | #169 の `france-kakumei` も `paris` を持つ。出来事の主な舞台が都市そのもののフランス革命が都市の名を残すなら、`levi-strauss` はより具体的な地点名（`college-de-france` など）へ移る |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・代表点・事物の `id` の裏どり |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |
