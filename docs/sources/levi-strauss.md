# レヴィ＝ストロース（`levi-strauss`・season 35）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `levi-strauss` |
| `series.json` の `season` | 35 |
| `series.json` の `timeRange` | 1908..2009 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `college-de-france` |
| `loci.geojson` の座標 | `[2.346, 48.849]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1908 | レヴィ＝ストロースの生年（11 月 28 日。ブリュッセル） | [British Academy: Memoir of Claude Lévi-Strauss](https://www.thebritishacademy.ac.uk/documents/920/Memoirs_18-14-Levi-Strauss.pdf)（二次） | 無し |
| `end` | 2009 | レヴィ＝ストロースの没年（10 月 30 日。公表は 11 月 3 日） | 同上 | 無し |

配信フィードの各回の説明によれば、第 1 回が文化人類学者としての生涯、第 2〜4 回が言語の本質・インセスト・タブー・構造主義を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 2.345556, 48.849167 |
| 典拠 | [Wikidata Q202660](https://www.wikidata.org/wiki/Q202660) |
| 典拠の格 | 三次 |

`@historian` は格を二次と報告したが、[典拠の格の定義](README.md)で Wikidata の座標は三次に当たるので、三次にした。

代表点は一度動いた。

| 版 | 代表点 | 座標 | 動かした理由 |
|---|---|---|---|
| 最初の値 | パリ（`paris`） | `[2.352, 48.857]` | コレージュ・ド・フランスで教え、没地でもある都市として置いた。座標は [Wikidata Q90](https://www.wikidata.org/wiki/Q90) の値 |
| 現在の値（コミット 836510b ） | コレージュ・ド・フランス（`college-de-france`） | `[2.346, 48.849]` | #169 の `france-kakumei`（フランス革命。種別は `出来事`）も `paris` を要求した。同じ地名を二つのシリーズが要求したときは、`集団`・`出来事` のシリーズが地名を使い、`人物` のシリーズがより具体的な地点名へ移ると決まった（#166 の順 1、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)） |

移る先は、パリの中で事績の中心の候補を比べて選んだ（#171、ADR-0041）。
第 2〜4 回が扱う主な事績は、言語の本質・インセスト・タブー・構造主義の仕事である。
5 回目の裏どりが返した、職と著作の時期は次のとおりである。

| 事実 | 典拠 | 典拠の格 |
|---|---|---|
| コレージュ・ド・フランスで社会人類学の講座を持った（1959〜1982 年） | [LAS (EHESS): Claude Lévi-Strauss](https://las.ehess.fr/membres/claude-levi-strauss)、[Collège de France: Claude Lévi-Strauss](https://www.college-de-france.fr/en/chair/claude-levi-strauss-social-anthropology-statutory-chair) | 二次 |
| 人類博物館の副館長を務めた（1949〜1950 年） | 同上の LAS、[EPHE prosopographical dictionary](https://prosopo.ephe.psl.eu/claude-l%C3%A9vi-strauss) | 二次 |
| 高等研究実習院（EPHE）で教えた（1947 年から非常勤講師、1951〜1974 年に第 5 部門の研究指導主任） | 同上の EPHE | 二次 |
| 『親族の基本構造』は、主に亡命先のニューヨーク（1941〜1944 年ごろ）で書き、1949 年に刊行した | [Wikipédia: Les Structures élémentaires de la parenté](https://fr.wikipedia.org/wiki/Les_Structures_%C3%A9l%C3%A9mentaires_de_la_parent%C3%A9) | 三次 |
| 『悲しき熱帯』（1955）と『構造人類学』（1958）は EPHE の在任中に、『野生の思考』（1962）はコレージュ・ド・フランスの在任中に刊行した | [Wikipedia: Tristes Tropiques](https://en.wikipedia.org/wiki/Tristes_Tropiques)、[Derrida's Margins: Anthropologie structurale](https://derridas-margins.princeton.edu/library/levi-strauss-anthropologie-structurale-1958/)、[Wikipedia: The Savage Mind](https://en.wikipedia.org/wiki/The_Savage_Mind) | 三次 |

代表点をコレージュ・ド・フランスに置いたのは、パリの中で最も長く職を持った機関で、社会人類学の講座と本人が創った研究室を持ったためである。
『野生の思考』がコレージュ・ド・フランスでの講義に基づくという記述は、5 回目の裏どりで独立に確かめられなかった。

| 候補 | 置くと何が起きるか |
|---|---|
| コレージュ・ド・フランス（現在値） | 最も長く講座を持った機関に点が立つ |
| 高等研究実習院（EPHE） | 『悲しき熱帯』と『構造人類学』を刊行した時期の職の地に点が立つ |
| 人類博物館 | 1949〜1950 年の副館長の職の地に点が立つ |
| ニューヨーク（亡命中の滞在） | 『親族の基本構造』を書いた地に点が立つ。事物の `id` の `new-york` は #168 の `nikola-tesla` が使う |
| ブリュッセル（生地） | 活動の拠点でない点が立つ |
| サンパウロ（ブラジルでの調査） | 調査の地に点が立つ |

事物の `id` の `college-de-france` は、Collège de France の発音区別符号を除き、空白を `-` にした。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理がブラジルと米国に跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（ブリュッセル）で決めた。
`@historian` は、ブリュッセルの生まれであることと、パリの生まれとする説が誤りとして扱われていることを [Wikidata Q128126](https://www.wikidata.org/wiki/Q128126) で確認したが、一次と二次の文献には直接当たれなかった。

`title: レヴィ＝ストロース` は、シリーズ名の「ジンブンガク レヴィ＝ストロース」からコーナー名を除いたものである。
`id` の `levi-strauss` は、ADR-0034 の `id` の表の発音区別符号と `＝` の行の例と同じである。
`kind: place` と `title` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #166 と #171 の決定（ADR-0041）で代表点をコレージュ・ド・フランスへ移した。
2026-09-11 に人間が仮決定を採用して決着させ、見直しを [#184](https://github.com/ta-tabox/coten-atlas/issues/184)（レヴィ＝ストロース（levi-strauss）の代表点をコレージュ・ド・フランスとニューヨークのどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | コレージュ・ド・フランス（事績の中心） | 構造主義の代表的な著作を刊行した時期の職を重く見れば高等研究実習院、インセスト・タブーを論じた『親族の基本構造』を書いた地を重く見ればニューヨークになる。見直しは #184 で行う |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・パリの座標・事物の `id` の裏どり |
| [`@historian` 5 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5633756847) | パリの中の候補の職と期間・著作の時期・コレージュ・ド・フランスの座標の裏どり |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| [#166 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/166#issuecomment-5629548286) | 同じ地名を二つのシリーズが要求したときに、どちらが移るかを決めた判断 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| [#184（見直し）](https://github.com/ta-tabox/coten-atlas/issues/184) | 採用した仮決定を人間が見直す論点と案 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

**コレージュ・ド・フランスの座標と職の事実の典拠は 5 回目が正である。**
