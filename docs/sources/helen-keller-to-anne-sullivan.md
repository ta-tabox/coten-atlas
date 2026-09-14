# ヘレン・ケラーとアン・サリヴァン（`helen-keller-to-anne-sullivan`・season 16）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `helen-keller-to-anne-sullivan` |
| `series.json` の `season` | 16 |
| `series.json` の `timeRange` | 1866..1968 |
| `series.json` の `region` | `北アメリカ` |
| `loci.geojson` の `anchor` | `tuscumbia` |
| `loci.geojson` の座標 | `[-87.703, 34.731]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1866 | アン・サリヴァンの生年（4 月 14 日） | [Wikipedia: Anne Sullivan](https://en.wikipedia.org/wiki/Anne_Sullivan)（三次） | 無し |
| `end` | 1968 | ヘレン・ケラーの没年（6 月 1 日） | [AFB: Helen Keller Biography](https://afb.org/about-afb/history/helen-keller/biography-and-chronology/biography)（三次） | 無し |

二人を扱うシリーズなので、現物の `kou-to-ryuho`（項羽と劉邦）に揃えて、早い方の生年から遅い方の没年までにした。

配信フィードの各回の説明によれば、第 1 回が二人の物語の全体、第 2 回が見えず聞こえず話せない少女ヘレンの苦悩、第 3〜5 回がアン・サリヴァンの家庭教師としての教育とヘレンの成長、第 6 回がヘレンの社会福祉の活動、第 7 回が劇場での興行、第 8 回がヘレンの残した言葉を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | -87.7028, 34.7308 |
| 典拠 | [Wikidata Q79606](https://www.wikidata.org/wiki/Q79606)（GeoNames 4094484 と対応） |
| 典拠の格 | 三次 |

`@historian` は格を二次と報告したが、[典拠の格の定義](README.md)で Wikidata の座標は三次に当たるので、三次にした。

代表点は三度動いた。

| 版 | 代表点 | 座標 | 動かした理由 |
|---|---|---|---|
| 最初の値 | タスカンビア（`tuscumbia`） | `[-87.702, 34.731]` | ヘレン・ケラーの生地で、アン・サリヴァンの教育が始まった地として置いた |
| 2 番目の値（コミット 50ee742 ） | フォレストヒルズ（`forest-hills`） | `[-73.845, 40.72]` | 2 回目の裏どりが、タスカンビアは生地で、[ADR-0034](../adr/0034-series-vocabulary.md) の代表点の選び方の表の 4 行目（中心の場所が伝わらないときの生地）の選び方になっていると指摘した。二人の活動の拠点は伝わっているので、3 行目を当てて、二人が 1917 年から暮らした地へ移した |
| 3 番目の値（コミット 9db7f3c ） | フォレストヒルズ（`forest-hills`） | `[-73.85, 40.716]` | 4 回目の裏どりが、2 番目の値は Wikidata Q1202211 の値から約 600m ずれていると報告したので、典拠の値へ寄せた |
| 現在の値（コミット d5c1b0b ） | タスカンビア（`tuscumbia`） | `[-87.703, 34.731]` | 拠点が複数あるときは番組が扱う主な事績が起きた地を中心の場所とすると決まった（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。二人の主な事績の教育が起きた地へ戻した |

現在の値は、最初の値と同じ地点を、生地としてでなく事績の地として表の 3 行目で置いている。

番組は、第 3〜5 回の 3 回をアン・サリヴァンによる教育に割き、フォレストヒルズを拠点にした社会福祉の活動は第 6 回の 1 回だけである。
代表点をタスカンビアに置いたのは、二人の主な事績の教育と、その象徴の井戸のポンプの出来事が、タスカンビアのケラー家（アイヴィー・グリーン）で起きたためである。
5 回目の裏どりが返した事実は次のとおりである。

| 事実 | 典拠 | 典拠の格 |
|---|---|---|
| アン・サリヴァンが 1887 年 3 月 3 日にタスカンビアのケラー家（アイヴィー・グリーン）に着き、教育を始めた | [HISTORY: Helen Keller meets her miracle worker](https://www.history.com/this-day-in-history/march-3/helen-keller-meets-her-miracle-worker)、[AFB: Teaching Helen](https://afb.org/about-afb/history/online-museums/anne-sullivan-miracle-worker/anne-teacher/teaching-helen) | 三次 |
| 井戸のポンプの出来事は 1887 年 4 月 5 日に、ケラー家の敷地の井戸で起きた | 同上の HISTORY、[Encyclopedia of Alabama: Helen Keller Water Pump](https://encyclopediaofalabama.org/media/water-pump/) | 三次 |
| 1888 年 5 月にアン・サリヴァンがヘレン・ケラーをボストンのパーキンス盲学校へ連れて行き、1888〜1890 年の冬をパーキンスで過ごした | [Perkins School for the Blind: Helen Keller](https://www.perkins.org/helen-keller/) | 三次 |

タスカンビアでの教育の期間は、1887 年 3 月から 1888 年 5 月までの約 14 か月である。

4 回目の裏どりが返したフォレストヒルズの事実は次のとおりである。

| 事実 | 典拠 | 典拠の格 |
|---|---|---|
| 二人が 1917 年にクイーンズのフォレストヒルズへ移り、1936 年まで暮らした | [QNS: Anne Sullivan's journey ended in Forest Hills](https://qns.com/2017/04/anne-sullivans-journey-ended-in-forest-hills/) | 参考程度（地域紙） |
| アン・サリヴァンが 1936 年 10 月 20 日にフォレストヒルズの自宅で没した | [Encyclopedia.com: Macy, Anne Sullivan (1866–1936)](https://www.encyclopedia.com/women/dictionaries-thesauruses-pictures-and-press-releases/macy-anne-sullivan-1866-1936) | 三次 |
| ヘレン・ケラーがフォレストヒルズの家をアメリカ盲人援護協会のための活動の拠点にした。協会の事務所そのものはマンハッタンに在った | [Wikipedia: Helen Keller](https://en.wikipedia.org/wiki/Helen_Keller)、[AFB: Our History](https://afb.org/afb100/our-history) | 三次 |

| 候補 | 置くと何が起きるか |
|---|---|
| タスカンビア（現在値） | 教育が始まり、井戸のポンプの出来事が起きた地に点が立つ |
| ボストン（パーキンス盲学校。1888 年 5 月から） | 教育の続きの地に点が立つ |
| レンサム（マサチューセッツ州。1904〜1917 年の住まい） | 二人の住まいに点が立つ（[AFB: The House in Wrentham](https://afb.org/about-afb/history/online-museums/anne-sullivan-miracle-worker/wrentham-massachusetts)、三次） |
| フォレストヒルズ（1917〜1936 年の住まい。第 6 回の社会福祉の活動の拠点） | 最も長く二人が暮らした地に点が立つ |
| イーストン（コネチカット州。アン・サリヴァンの没後のヘレン・ケラーの住まい） | ヘレン・ケラーが一人で移った地で、二人を扱うシリーズの中心の場所としては弱い |

事物の `id` の `tuscumbia` は、2 回目の裏どりで標準の英語の綴りと一致すると確認した。

## `region`・`title`

`region: 北アメリカ` は、扱う地理が米国で一区画に収まるので ADR-0034 の `region` の選び方の表の 1 行目で決めた。
`@historian` は、生地・教育の地・活動の拠点・没地がすべて米国に在ることを確認した。

`id` の `helen-keller-to-anne-sullivan` は、助詞の `と` を語として残した。
現物の規則の例 `saicho-to-kukai` と同じ形である。
`title: ヘレン・ケラーとアン・サリヴァン` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #171 の決定（ADR-0041）で代表点をタスカンビアへ当て直した。
2026-09-11 に人間が仮決定を採用して決着させ、見直しを [#182](https://github.com/ta-tabox/coten-atlas/issues/182)（ヘレン・ケラーとアン・サリヴァン（helen-keller-to-anne-sullivan）の代表点をタスカンビアとフォレストヒルズのどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | タスカンビア（事績の中心） | 期間で数えれば、タスカンビアでの教育（約 14 か月）はフォレストヒルズ（19 年）やレンサム（13 年）より短い。第 6 回の社会福祉の活動を主な事績と見ればフォレストヒルズになる。見直しは #182 で行う |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・タスカンビアの座標の裏どりと、代表点の選び方の指摘 |
| [`@historian` 4 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628471492) | フォレストヒルズに暮らした期間・活動の拠点・座標の裏どり |
| [`@historian` 5 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5633756847) | タスカンビアでの教育の始まり・井戸のポンプの出来事・パーキンス盲学校への移動の裏どり |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| [#182（見直し）](https://github.com/ta-tabox/coten-atlas/issues/182) | 採用した仮決定を人間が見直す論点と案 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

3 回目（後半 6 件）はこのシリーズを対象にしていない。
**タスカンビアの座標の典拠は 2 回目、教育の事実の典拠は 5 回目が正である。**
