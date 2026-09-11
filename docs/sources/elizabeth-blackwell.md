# エリザベス・ブラックウェル（`elizabeth-blackwell`・season 65）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `elizabeth-blackwell` |
| `series.json` の `season` | 65 |
| `series.json` の `timeRange` | 1821..1910 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `new-york` |
| `loci.geojson` の座標 | `[-74.006, 40.713]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1821 | ブラックウェルの生年（2 月 3 日） | [Britannica: Elizabeth Blackwell](https://www.britannica.com/biography/Elizabeth-Blackwell)（三次） | 無し |
| `end` | 1910 | ブラックウェルの没年（5 月 31 日） | 同上 | 無し |

`end` の 1910 は、#104（S7: 19 世紀のシリーズを series.json へ載せる）の era（1800〜1900）の外に出る。
`@historian` は、これを史実の誤りでなく era の区分とのずれと判断した。
生涯の 90 年のうち 89 年が 19 世紀に入り、各回が扱う医学校への入学と病院の設立も 19 世紀のことなので、#104 に残した。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | -74.006111, 40.712778 |
| 典拠 | [Wikidata Q60](https://www.wikidata.org/wiki/Q60) |
| 典拠の格 | 三次 |

配信フィードの各回の説明によれば、第 2・3 回が近代医学の成立と女性が医者になれなかった理由、第 4〜6 回が医者を志すまで、第 7〜9 回が医学校での修業、第 10 回が女性のための病院の設立、第 11 回が海を越えて続く女性医師の系譜を扱う。
代表点をニューヨークに置いたのは、1853 年に診療所を開き、1857 年にニューヨーク貧困女性子供施療院（New York Infirmary for Indigent Women and Children）を設立した地だからである。
`@historian` は、二つの設立がどちらもニューヨーク市内で行われたことを確認し、ジュネーブは入学という一度の出来事の地、ロンドンは晩年の活動の地で、続けて医療を行った拠点としてはニューヨークが最も合うと判断した。

| 候補 | 置くと何が起きるか |
|---|---|
| ニューヨーク（現在値） | 開業と病院の設立の地に点が立つ |
| ジュネーブ（ニューヨーク州。入学した医学校。第 7〜9 回） | 修業の地に点が立つ |
| ロンドン（英国へ戻った後の活動） | 晩年の活動の地に点が立つ。`london` を `marx-engels` が使うので、事物の `id` はより具体的な地点名になる |

ニューヨークは、#168（S7: 20 世紀のシリーズを series.json へ載せる）の `nikola-tesla`（ニコラ・テスラ）も要求している。
#168 は、ブラックウェルの活動期（1851〜1869 年）のニューヨーク市がマンハッタンだけだったことから、`nikola-tesla` の側をより具体的な地点名 `manhattan` にした。
どちらの人物のシリーズが具体的な地点名へ移るかは、#166（同じ地名を二つの人物のシリーズが要求したとき、どちらが具体的な地点名へ移るかを決める）が決める。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理が米国と英国に跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（英国のブリストル）で決めた。
`@historian` は、生地がブリストルであることを Britannica と Wikidata で確認し、代表点の区画（`北アメリカ`）と `region` が食い違うことは、`region` を `anchor` と独立に決める ADR-0034 と矛盾しないと判断した。

`title: エリザベス・ブラックウェル` は、シリーズ名の「ショート エリザベス・ブラックウェル」からコーナー名を除いたものである。
`kind: place` と `title` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定した。
人間の判定は [#165](https://github.com/ta-tabox/coten-atlas/pull/165) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `region` | `ヨーロッパ`（生地） | 扱う地理のうち活動の大半が米国なので、代表点と同じ `北アメリカ` を望む読み手がいる。ADR-0034 の人物の本拠の基準を変えない限り値は変わらない |
| 事物の `id` | `new-york` | #166 の決定で、`nikola-tesla` と入れ替えるか両方を具体的な地点名にすることになれば変わる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628088075) | `timeRange`・代表点・`region` の裏どり |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628210063) | 1 回目で URL が返らなかった `timeRange` と座標の典拠 |
| [#165 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/165) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

1 回目は典拠を事典の名と Wikidata の番号だけで返したので、2 回目が URL と値を返した。
**典拠の URL は 2 回目が正である。**
