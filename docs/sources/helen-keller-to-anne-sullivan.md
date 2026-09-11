# ヘレン・ケラーとアン・サリヴァン（`helen-keller-to-anne-sullivan`・season 16）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `helen-keller-to-anne-sullivan` |
| `series.json` の `season` | 16 |
| `series.json` の `timeRange` | 1866..1968 |
| `series.json` の `region` | `北アメリカ` |
| `loci.geojson` の `anchor` | `forest-hills` |
| `loci.geojson` の座標 | `[-73.85, 40.716]` |

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
| 典拠が示す値 | -73.85, 40.716111 |
| 典拠 | [Wikidata Q1202211](https://www.wikidata.org/wiki/Q1202211)（GeoNames 6332488 と対応） |
| 典拠の格 | 三次 |

`@historian` は格を二次と報告したが、[ADR-0037](../adr/0037-sources-layer.md) の定義で Wikidata の座標は三次に当たるので、三次にした。
[Wikipedia: Forest Hills, Queens](https://en.wikipedia.org/wiki/Forest_Hills,_Queens)（三次）の Infobox は -73.845, 40.715 を示す。

代表点は二度動いた。

| 版 | 代表点 | 座標 | 動かした理由 |
|---|---|---|---|
| 最初の値 | タスカンビア（`tuscumbia`） | `[-87.702, 34.731]` | ヘレン・ケラーの生地で、アン・サリヴァンの教育が始まった地として置いた |
| 2 番目の値（コミット 50ee742） | フォレストヒルズ（`forest-hills`） | `[-73.845, 40.72]` | 2 回目の裏どりが、タスカンビアは生地で、[ADR-0034](../adr/0034-series-vocabulary.md) の代表点の選び方の表の 4 行目（中心の場所が伝わらないときの生地）の選び方になっていると指摘した。二人の活動の拠点は伝わっているので、3 行目を当ててフォレストヒルズへ移した |
| 現在の値 | フォレストヒルズ（`forest-hills`） | `[-73.85, 40.716]` | 4 回目の裏どりが、2 番目の値は Wikidata の値から約 600m ずれていると報告したので、典拠の値を小数 3 桁に丸めた値へ直した |

タスカンビアの座標は、2 回目の裏どりで Wikidata Q79606 の値（-87.7028, 34.7308）と一致すると確認していた。

代表点をフォレストヒルズに置いたのは、二人が 1917 年から暮らし、ヘレン・ケラーがアメリカ盲人援護協会のための活動の拠点にし、アン・サリヴァンが没した地だからである。
4 回目の裏どりが返した典拠は次のとおりである。

| 事実 | 典拠 | 典拠の格 |
|---|---|---|
| 1917 年にクイーンズのフォレストヒルズへ移った | [QNS: Anne Sullivan's journey ended in Forest Hills](https://qns.com/2017/04/anne-sullivans-journey-ended-in-forest-hills/) | 参考程度（地域紙） |
| アン・サリヴァンが 1936 年 10 月 20 日にフォレストヒルズの自宅で没した | [Encyclopedia.com: Macy, Anne Sullivan (1866–1936)](https://www.encyclopedia.com/women/dictionaries-thesauruses-pictures-and-press-releases/macy-anne-sullivan-1866-1936) | 三次 |
| ヘレン・ケラーがフォレストヒルズの家をアメリカ盲人援護協会のための活動の拠点にした | [Wikipedia: Helen Keller](https://en.wikipedia.org/wiki/Helen_Keller) | 三次 |

アメリカ盲人援護協会の事務所そのものはマンハッタンに在った（[AFB: Our History](https://afb.org/afb100/our-history)、三次）。
フォレストヒルズの家は協会の本部でなく、ヘレン・ケラーが講演の旅・執筆・募金を組み立てた個人の拠点である。

| 候補 | 置くと何が起きるか |
|---|---|
| フォレストヒルズ（現在値） | 二人が 1917〜1936 年の 19 年間暮らし、協会のための活動をした地に点が立つ |
| レンサム（マサチューセッツ州。1904〜1917 年の 13 年間の住まい） | 二人の住まいに点が立つが、期間はフォレストヒルズより短い（[AFB: The House in Wrentham](https://afb.org/about-afb/history/online-museums/anne-sullivan-miracle-worker/wrentham-massachusetts)、三次） |
| イーストン（コネチカット州。アン・サリヴァンの没後のヘレン・ケラーの住まい） | ヘレン・ケラーが一人で移った地で、二人を扱うシリーズの中心の場所としては弱い |
| タスカンビア（ヘレン・ケラーの生地。第 3〜5 回の教育の始まり） | 活動の拠点が伝わっているのに生地に点を置くことになる |
| ボストンの近郊（パーキンス盲学校・ラドクリフ・カレッジ） | 教育を受けた時期の地に点が立つ |

事物の `id` の `forest-hills` は、地区の名を空白で区切った英語の綴りを `-` でつないだ。
`@historian` は、地区の名が 1906 年に付けられ、1917 年の転居の時点で既に Forest Hills と呼ばれ、綴りが現在まで変わっていないと確認した。
フォレストヒルズはニューヨーク市の中の地区なので、`elizabeth-blackwell` の `new-york` と地名は重ならない。

## `region`・`kind`・`title`

`region: 北アメリカ` は、扱う地理が米国で一区画に収まるので ADR-0034 の `region` の選び方の表の 1 行目で決めた。
`@historian` は、生地・教育の地・活動の拠点・没地がすべて米国に在ることを確認した。

`id` の `helen-keller-to-anne-sullivan` は、助詞の `と` を語として残した。
現物の規則の例 `saicho-to-kukai` と同じ形である。
`kind: place` と `title: ヘレン・ケラーとアン・サリヴァン` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#168](https://github.com/ta-tabox/coten-atlas/pull/168) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | フォレストヒルズ | 第 3〜5 回の教育を主題の中心と見ればタスカンビアかボストンの近郊、協会の組織を中心と見ればマンハッタンになる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・タスカンビアの座標の裏どりと、代表点の選び方の指摘 |
| [`@historian` 4 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628471492) | フォレストヒルズに暮らした期間・活動の拠点・座標・事物の `id` の裏どり |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

3 回目（後半 6 件）はこのシリーズを対象にしていない。
**代表点と座標の典拠は 4 回目が正である。**
