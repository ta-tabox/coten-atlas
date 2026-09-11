# ゲッベルス（`goebbels`・season 39）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `goebbels` |
| `series.json` の `season` | 39 |
| `series.json` の `timeRange` | 1897..1945 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `wilhelmplatz` |
| `loci.geojson` の座標 | `[13.383, 52.512]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1897 | ゲッベルスの生年（10 月 29 日。ライト） | [Deutsche Biographie](https://www.deutsche-biographie.de/gnd118540041.html)（三次） | 無し |
| `end` | 1945 | ゲッベルスの没年（5 月 1 日。ベルリン） | [USHMM Holocaust Encyclopedia: Joseph Goebbels](https://encyclopedia.ushmm.org/content/en/article/joseph-goebbels-1)（三次） | 無し |

配信フィードの各回の説明によれば、第 1 回が宣伝大臣としての生涯、第 2 回が権力によるメディアの利用とプロパガンダの歴史、第 3 回がナチスの勃興、第 4 回がナチスの破滅と最期を扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 13.384, 52.5117 |
| 典拠 | [Wikidata Q531583](https://www.wikidata.org/wiki/Q531583)（値はドイツ語版ウィキペディアから取り込まれている） |
| 典拠の格 | 参考程度 |

ヴィルヘルム広場は Pleiades と GeoNames のどちらにも項目が無く、地名辞典の値に当たれなかった。
現在の値は Wikidata の値とほぼ一致する。

代表点をヴィルヘルム広場に置いたのは、ゲッベルスが率いた国民啓蒙宣伝省が、1933 年からヴィルヘルム広場 8-9 番地のプリンツ・カール宮殿を使っていたためである（[ベルリン州文化財データベース](https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09080285)、二次）。
活動の拠点の都市はベルリンだが、`berlin` を `hitler` が使うので、[ADR-0034](../adr/0034-series-vocabulary.md) の事物の `id` の表の「同じ地名を二つのシリーズが要求する」行で、より具体的な地点名を使った。

| 候補 | 置くと何が起きるか |
|---|---|
| ヴィルヘルム広場（現在値） | 宣伝省が面していた地点に点が立つ |
| ベルリン | `hitler` の `berlin` と同じ地名になる。どちらの人物のシリーズが具体的な地点名へ移るかは #166 が決める |
| ライト（生地） | 活動の拠点でない点が立つ |

事物の `id` の `wilhelmplatz` は、宣伝省が面していた時代の広場の名である。
戦後の改称の年は典拠が割れている。
ドイツ語版ウィキペディア（Demps の文献を脚注に持つ）と Wikidata は、1949 年 8 月に東ベルリンの参事会が改称を決め、同年 11 月 30 日に Thälmannplatz への改称を宣言したとする。
英語版ウィキペディアと Deutsche Digitale Bibliothek は、1950 年 8 月 18 日に改称したとする。
`@historian` は、推測としながら、1950 年 8 月 18 日が同じ名の地下鉄駅が Thälmannplatz として再開業した日と一致するので、駅の改名と広場の改称が混同された可能性を挙げた。
どちらの年でも、宣伝省の時代の名が Wilhelmplatz であることは変わらない。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理がドイツに収まるので ADR-0034 の `region` の選び方の表の 1 行目で決めた。
`title: ゲッベルス` は、シリーズ名の「ショート ゲッベルス」からコーナー名を除いたものである。
`kind: place` と `title` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#168](https://github.com/ta-tabox/coten-atlas/pull/168) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 事物の `id` | `wilhelmplatz` | #166（同じ地名を二つの人物のシリーズが要求したとき、どちらが具体的な地点名へ移るかを決める）の決定で、`hitler` と入れ替えるか両方を具体的な地点名にすることになれば変わる |
| 座標の典拠 | Wikidata（参考程度） | 地名辞典に項目が無い。ベルリン州文化財データベースのプリンツ・カール宮殿の位置で取り直せば、格が上がる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628185774) | 差分を読む前にエラーで止まり、結果を返していない |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/168#issuecomment-5628319996) | `timeRange`・`region`・代表点・事物の `id` の裏どりと、改称の年の割れ |
| [#168 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/168) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |
