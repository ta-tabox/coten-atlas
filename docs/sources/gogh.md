# ゴッホ（`gogh`・season 53）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `gogh` |
| `series.json` の `season` | 53 |
| `series.json` の `timeRange` | 1853..1890 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `arles` |
| `loci.geojson` の座標 | `[4.628, 43.677]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1853 | ゴッホの生年（3 月 30 日） | [Britannica: Vincent van Gogh](https://www.britannica.com/biography/Vincent-van-Gogh)（三次） | 無し |
| `end` | 1890 | ゴッホの没年（7 月 29 日） | 同上 | 無し |

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 4.628611, 43.676944 |
| 典拠 | [Wikidata Q48292](https://www.wikidata.org/wiki/Q48292)（座標の出典はフランスの répertoire géographique des communes） |
| 典拠の格 | 三次 |

配信フィードの各回の説明によれば、第 1 回が生涯の全体、第 2 回がパリでの浮世絵と印象派との出会い、第 3 回がアルルの黄色い家での共同生活の破綻、第 4 回が療養所での日々を扱う。

拠点が複数あるときは、番組が扱う主な事績が起きた地を中心の場所とする（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。
パリ・アルル・サン＝レミは、第 2〜4 回で 1 回ずつ扱われる。
代表点をアルルに置いたのは、第 3 回が扱う黄色い家での共同生活と破綻がこのシリーズの山場の事績で、黄色い家が本人の構えた制作の拠点だったためである。
1 回目の裏どりで、`@historian` は、ヴァン・ゴッホ美術館の公式の記述で黄色い家が「南仏のアトリエ」として本人が構えた制作の拠点だったことを確認した。

3 回目の裏どりが返した、滞在地ごとの事実は次のとおりである。

| 滞在地 | 期間 | 作品の数の目安 | 代表作 | 典拠 | 典拠の格 |
|---|---|---|---|---|---|
| パリ | 1886 年 3 月〜1888 年 2 月 | 油彩が約 226 点 | 《タンギー爺さん》 | [The Met: Vincent van Gogh (1853–1890)](https://www.metmuseum.org/essays/vincent-van-gogh-1853-1890)、[Wikipedia: Vincent van Gogh](https://en.wikipedia.org/wiki/Vincent_van_Gogh) | 三次 |
| アルル | 1888 年 2 月〜1889 年 5 月（15 か月） | 素描を含めて 140 点を超える | 《黄色い家》《ひまわり》《夜のカフェテラス》《ローヌ川の星月夜》 | 同上 | 三次 |
| サン＝レミ | 1889 年 5 月〜1890 年 5 月 | 約 143 点 | 《星月夜》《アイリス》 | [Vincent van Gogh Gallery: Saint-Rémy](https://vggallery.com/painting/by_period/st_remy.htm) | 参考程度（個人運営のカタログ） |

| 候補 | 置くと何が起きるか |
|---|---|
| アルル（現在値） | 第 3 回の黄色い家の事績と、本人が構えた制作の拠点に点が立つ |
| パリ（第 2 回の浮世絵と印象派との出会い） | 画風が変わり、油彩を最も多く描いた地に点が立つ |
| サン＝レミ（第 4 回の療養所） | 《星月夜》を描いた療養の地に点が立つ |

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理がオランダとフランスで一区画に収まるので、[ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 1 行目で決めた。
`@historian` は、活動の範囲が `ヨーロッパ` に収まることを確認した。
`title: ゴッホ` は、シリーズ名の「ショート ゴッホ」からコーナー名を除いたものである。
`kind: place` と `title` に指摘は出なかった。

`id` の `gogh` は、`id` の表の「カタカナの外来固有名」の行で、カタカナの語形 `ゴッホ` に合う綴りにした。
`van-gogh` はヴァン・ゴッホの語形になる。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #171 の決定（ADR-0041）で代表点の理由を事績の中心として当て直した。
値は変わらなかった。
事績の中心をどこに置くかの人間の判定は [#165](https://github.com/ta-tabox/coten-atlas/pull/165) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | アルル（事績の中心） | 描いた油彩の数で数えればパリが最も多い。浮世絵と印象派との出会いを主な事績と見ればパリ、《星月夜》を代表作と見ればサン＝レミになる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628088075) | `timeRange`・代表点・`region` の裏どり |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628210063) | 1 回目で URL が返らなかった `timeRange` と座標の典拠 |
| [`@historian` 3 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5633765389) | パリ・アルル・サン＝レミの滞在期間と作品の数の目安の裏どり |
| [#165 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/165) | 代表点を選んだ判断と候補 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

1 回目は典拠を事典の名と Wikidata の番号だけで返したので、2 回目が URL と値を返した。
**`timeRange` と座標の典拠の URL は 2 回目、滞在地ごとの事実の典拠は 3 回目が正である。**
