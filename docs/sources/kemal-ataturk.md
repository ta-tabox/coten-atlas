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

代表点をアンカラに置いたのは、ケマルが 1920 年から国民運動の本拠を置き、第 12 回が扱うトルコ共和国の首都に 1923 年に定めた地だからである。
`@historian` は、代表点の選び方に指摘を出さなかった。

| 候補 | 置くと何が起きるか |
|---|---|
| アンカラ（現在値） | 治めた国の都に点が立つ |
| テッサロニキ（生地。第 6・7 回） | 活動の拠点でない点が立ち、区画が `ヨーロッパ` になって `region` と揃う |
| イスタンブール（オスマン帝国の都で、没地） | 仕えた帝国の都に点が立つ |

事物の `id` の `ankara` は、典拠が割れている。
Britannica は、1930 年まで Angora と呼ばれたと書く（[Britannica: Ankara summary](https://www.britannica.com/summary/Ankara)、三次）。
国民運動の本拠を置いた 1920 年と首都にした 1923 年はどちらも改称の前なので、その時代の英語の文献は Angora と書いていたと `@historian` は見た。
トルコ語の名は当時から Ankara である。
[ADR-0034](../adr/0034-series-vocabulary.md) の事物の `id` の表は「英語の文献で通用する表記」を綴りの基準にしていて、トルコ語の名とは別の軸なので、`@historian` はどちらにするかは典拠だけでは決まらないとした。
その時代に複数の名を持つ地点の `id` の決め方は、#170（代表点に選んだ時代の地点が複数の名を持つとき、事物の `id` にどの名を使うかを決める）が扱う。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理がテッサロニキ・リビア・アナトリア・シリアに跨るので ADR-0034 の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（サロニカ。現在のギリシアのテッサロニキ）で決めた。
ADR-0034 の継ぎ目の表の「トルコを割らない」はトルコの中の地点に当たり、テッサロニキはトルコの外にある。
`@historian` は、生地がサロニカであることを確認し、代表点の区画（`西アジア`）と `region` が一致しない理由とも整合するとした。

`id` の `kemal-ataturk` は、Atatürk の `ü` を `u` にし、`・` を `-` にした。
`kind: place` と `title: ケマル・アタテュルク` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#168](https://github.com/ta-tabox/coten-atlas/pull/168) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `region` | `ヨーロッパ`（生地） | 活動の拠点のアンカラと同じ `西アジア` を望む読み手がいる。ADR-0034 の人物の本拠の基準を変えない限り値は変わらない |
| 事物の `id` | `ankara` | #170 で英語の文献の慣用を使うと決まれば `angora` になる |
| 座標の典拠 | Wikipedia の Infobox（参考程度） | GeoNames か Wikidata で取り直せば格が上がる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 3 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628417235) | 後半 6 件の `timeRange`・`region`・代表点・事物の `id` の裏どりと、Angora の典拠 |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

2 回目（前半 6 件）はこのシリーズを対象にしていない。
