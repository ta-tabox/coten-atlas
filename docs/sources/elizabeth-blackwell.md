# エリザベス・ブラックウェル（`elizabeth-blackwell`・season 65）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `elizabeth-blackwell` |
| `series.json` の `season` | 65 |
| `series.json` の `timeRange` | 1821..1910 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `geneva` |
| `loci.geojson` の座標 | `[-76.993, 42.879]` |

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
| 典拠が示す値 | -76.993056, 42.878889（ニューヨーク州ジュネーブ市） |
| 典拠 | [Wikidata Q1378284](https://www.wikidata.org/wiki/Q1378284)（GeoNames 5118398 を出典に持つ） |
| 典拠の格 | 三次 |

代表点は二度動いた。

| 版 | 代表点 | 座標 | 動かした理由 |
|---|---|---|---|
| 最初の値 | ニューヨーク市（`new-york`） | `[-74.006, 40.713]` | 1853 年に診療所を開き、1857 年にニューヨーク貧困女性子供施療院（New York Infirmary for Indigent Women and Children）を設立した地として置いた。座標は [Wikidata Q60](https://www.wikidata.org/wiki/Q60) の値 |
| 2 番目の値（コミット ee643fd ） | ジュネーブ（`geneva`） | `[-76.977, 42.869]` | 拠点が複数あるときは番組が扱う主な事績が起きた地を中心の場所とすると決まった（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。下の理由で、医学の学位を得た医学校の地へ移した |
| 現在の値（コミット 9e56daf ） | ジュネーブ（`geneva`） | `[-76.993, 42.879]` | 3 回目の裏どりが、2 番目の値は Wikidata Q1378284 の値から南東へ約 1.7km ずれていると報告したので、典拠の値へ寄せた |

配信フィードの各回の説明によれば、第 2・3 回が近代医学の成立と女性が医者になれなかった理由、第 4〜6 回が医者を志すまで、第 7・8 回が医学校への入学と学生としての日々、第 9 回が医者としての修業、第 10 回が女性のための病院の設立、第 11 回が海を越えて続く女性医師の系譜を扱う。
全 11 回のうち第 2〜8 回が、女性が医者になれなかった理由から医学校で学ぶまでを追い、その到達点が医学の学位である。
代表点をジュネーブに置いたのは、この主な事績の到達点の、女性として初めて医学の学位を得たジュネーブ医学校（Geneva Medical College）の地だからである。
ニューヨーク市での病院の設立は、第 10 回の 1 回で扱われる。

3 回目の裏どりが返した事実は次のとおりである。

| 事実 | 典拠 | 典拠の格 |
|---|---|---|
| 1847 年 10 月下旬に合格の通知を受け、同年 11 月 6 日にジュネーブに着いた | [Hobart and William Smith Colleges: Elizabeth Blackwell](https://www.hws.edu/about/history/elizabeth-blackwell/woman-attends-medical-school.aspx) | 三次（医学校の後継校の公式の沿革） |
| 1849 年 1 月に首席で卒業して医学の学位を得た。米国で女性が医学の学位を得た最初の例である | 同上、[HISTORY: Elizabeth Blackwell becomes first woman to receive medical degree](https://www.history.com/this-day-in-history/january-23/elizabeth-blackwell-becomes-first-woman-to-receive-medical-degree) | 三次・参考程度 |

学位を得た日は、後継校の沿革が 1849 年 1 月 29 日、HISTORY が同年 1 月 23 日と書き、割れている。
年はどちらも 1849 年なので、`catalog/` の値には影響しない。
ジュネーブ医学校の所在地そのものの座標は、3 回目の裏どりで確かめていない。

| 候補 | 置くと何が起きるか |
|---|---|
| ジュネーブ（現在値） | 医学の学位を得た医学校の地に点が立つ |
| ニューヨーク市（第 10 回の病院の設立の地） | 続けて医療を行った拠点に点が立つ。事物の `id` の `new-york` を #168 の `nikola-tesla` が使うので、同じ地名の決め方（#166）の順 2 か順 3 で、どちらが具体的な地点名へ移るかを決め直すことになる |
| ロンドン（英国へ戻った後の活動。第 11 回） | 晩年の活動の地に点が立つ。`london` を `marx-engels` が使う |

事物の `id` の `geneva` は、3 回目の裏どりで、1847〜1849 年から現在まで英語の文献が Geneva, New York と書くと確かめた。

## `region`・`title`

`region: ヨーロッパ` は、扱う地理が米国と英国に跨るので [ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 2 行目に当て、人物の本拠の生地（英国のブリストル）で決めた。
`@historian` は、生地がブリストルであることを Britannica と Wikidata で確認し、代表点の区画（`北アメリカ`）と `region` が食い違うことは、`region` を `anchor` と独立に決める規則と矛盾しないと判断した。

`title: エリザベス・ブラックウェル` は、シリーズ名の「ショート エリザベス・ブラックウェル」からコーナー名を除いたものである。
`title` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #171 の決定（ADR-0041）で代表点をジュネーブへ移した。
2026-09-11 に人間が仮決定を採用して決着させ、見直しを [#191](https://github.com/ta-tabox/coten-atlas/issues/191)（エリザベス・ブラックウェル（elizabeth-blackwell）の代表点をジュネーブとニューヨーク市のどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 代表点 | ジュネーブ（事績の中心） | 続けて医療を行った拠点を重く見れば、病院を設立したニューヨーク市になる。`@historian` は 1 回目で、続けて医療を行った拠点としてはニューヨーク市が最も合うと判断していた。見直しは #191 で行う |
| `region` | `ヨーロッパ`（生地） | 活動の大半が米国なので、代表点と同じ `北アメリカ` を望む読み手がいる。人物の本拠の基準を変えない限り値は変わらない |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628088075) | `timeRange`・代表点・`region` の裏どり |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628210063) | 1 回目で URL が返らなかった `timeRange` とニューヨーク市の座標の典拠 |
| [`@historian` 3 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5633765389) | ジュネーブ医学校への入学と学位・ジュネーブの座標と地名の裏どり |
| [#165 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/165) | 代表点を選んだ判断と候補 |
| [#166 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/166#issuecomment-5629548286) | 同じ地名を二つのシリーズが要求したときに、どちらが移るかを決めた判断 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| [#191（見直し）](https://github.com/ta-tabox/coten-atlas/issues/191) | 採用した仮決定を人間が見直す論点と案 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |

**ジュネーブの座標と学位の事実の典拠は 3 回目が正である。**
