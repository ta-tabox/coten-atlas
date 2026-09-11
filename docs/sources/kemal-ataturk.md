# ケマル・アタテュルク（`kemal-ataturk`・season 47）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `kemal-ataturk` |
| `series.json` の `season` | 47 |
| `series.json` の `timeRange` | 1881..1938 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `ankara` |
| `loci.geojson` の座標 | `[32.854, 39.925]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1881 | ケマル・アタテュルクの生年（サロニカ） | [Britannica: Kemal Ataturk](https://www.britannica.com/biography/Kemal-Ataturk)（三次） | 無し |
| `end` | 1938 | ケマル・アタテュルクの没年（11 月 10 日。イスタンブール） | 同上 | 無し |

配信フィードの各回の説明によれば、第 2〜5 回がオスマン帝国の衰退とマフムト 2 世・アブデュルハミト 2 世の改革、第 6・7 回がケマルの生い立ちと青年トルコ人革命、第 8・9 回が第一次世界大戦、第 10・11 回が交渉と対ギリシア戦争、第 12・13 回がトルコ共和国の設立と世俗国家への転換、第 14 回が最期を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 32.85472, 39.92889 |
| 典拠 | [Wikipedia: Ankara](https://en.wikipedia.org/wiki/Ankara)（Infobox） |
| 典拠の格 | 参考程度 |

`@historian` は GeoNames に到達できず Wikipedia の Infobox の値で代えたので、格を参考程度にとどめた。
現在の値は典拠の値とほぼ一致する。

拠点が複数あるときは、番組が扱う主な事績が起きた地を中心の場所とし、人物の治めた国の都と本人が暮らして執務した地が別の都市なら、暮らして執務した地を先に見る（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。
ケマルが治めたトルコ共和国の都と、暮らして執務した地はどちらもアンカラなので、後者の読みは当たらない。
代表点をアンカラに置いたのは、ケマルが 1920 年に国民運動の本拠を置き、第 12・13 回が扱う共和国の設立と世俗国家への転換を、1923 年に首都にしたアンカラで進めたためである。
`@historian` は、代表点の選び方に指摘を出さなかった。

| 候補 | 置くと何が起きるか |
|---|---|
| アンカラ（現在値） | 治めた国の都で、国民運動と共和国の事績の地に点が立つ |
| テッサロニキ（生地。第 6・7 回） | 活動の拠点でない点が立ち、区画が `ヨーロッパ` になって `region` と揃う |
| イスタンブール（オスマン帝国の都で、没地） | 仕えた帝国の都に点が立つ |

事物の `id` は `ankara` である。
3 回目の裏どりは、Britannica が 1930 年まで Angora と呼ばれたと書くことを返した（[Britannica: Ankara summary](https://www.britannica.com/summary/Ankara)、三次）。
代表点に選んだ時代の地点が複数の名を持つときは、当時の英語の文献での呼び名や改称の時期でなく、現在の英語の文献がその時代のその地点を指すときに通用する名を使うと、#170 で決まった（ADR-0041）。
5 回目の裏どりは、現在の英語の文献が 1920〜1938 年の出来事にも Ankara を主な表記として使い、Angora は当時の呼び名として括弧書きで触れるだけだと返した。

| 事実 | 典拠 | 典拠の格 |
|---|---|---|
| 大国民議会の開設（1920 年 4 月 23 日）を、現在の英語の文献は Ankara の出来事として書く | [Britannica: Grand National Assembly](https://www.britannica.com/topic/Grand-National-Assembly-Turkish-history)、[Britannica: Kemal Atatürk – The nationalist movement and the war for independence](https://www.britannica.com/biography/Kemal-Ataturk/The-nationalist-movement-and-the-war-for-independence) | 三次 |
| 1921 年の条約の項目名は Treaty of Ankara で、本文は「Ankara (also known as Angora)」と書く | [Wikipedia: Treaty of Ankara (1921)](https://en.wikipedia.org/wiki/Treaty_of_Ankara_(1921)) | 三次 |

これにより、`ankara` のまま決着した。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理がテッサロニキ・リビア・アナトリア・シリアに跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（サロニカ。現在のギリシアのテッサロニキ）で決めた。
継ぎ目の表の「トルコを割らない」はトルコの中の地点に当たり、テッサロニキはトルコの外にある。
`@historian` は、生地がサロニカであることを確認し、代表点の区画（`西アジア`）と `region` が一致しない理由とも整合するとした。

`id` の `kemal-ataturk` は、Atatürk の `ü` を `u` にし、`・` を `-` にした。
`kind: place` と `title: ケマル・アタテュルク` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #170 と #171 の決定（ADR-0041）で事物の `id` と代表点の理由を当て直した。
値は変わらなかった。
2026-09-11 に人間が仮決定を採用して決着させた。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `region` | `ヨーロッパ`（生地） | 活動の拠点のアンカラと同じ `西アジア` を望む読み手がいる。人物の本拠の基準を変えない限り値は変わらない |
| 座標の典拠 | Wikipedia の Infobox（参考程度） | GeoNames か Wikidata で取り直せば格が上がる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 3 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628417235) | 後半 6 件の `timeRange`・`region`・代表点・事物の `id` の裏どりと、Angora の典拠 |
| [`@historian` 5 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5633756847) | 現在の英語の文献が 1920〜1938 年のアンカラを何と書くかの裏どり |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| [#170 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/170#issuecomment-5629510408) | 地点が複数の名を持つときに、現在の英語の文献の慣用で事物の `id` を決めた判断 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

2 回目と 4 回目はこのシリーズを対象にしていない。
**事物の `id` の典拠は 5 回目が正である。**
