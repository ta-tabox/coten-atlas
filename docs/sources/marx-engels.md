# マルクス・エンゲルス（`marx-engels`・season 29）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `marx-engels` |
| `series.json` の `season` | 29 |
| `series.json` の `timeRange` | 1818..1895 |
| `series.json` の `region` | `ヨーロッパ` |
| `loci.geojson` の `anchor` | `london` |
| `loci.geojson` の座標 | `[-0.128, 51.507]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1818 | マルクスの生年（5 月 5 日） | [Britannica: Karl Marx](https://www.britannica.com/biography/Karl-Marx)（三次） | 無し |
| `end` | 1895 | エンゲルスの没年（8 月 5 日） | [Britannica: Friedrich Engels](https://www.britannica.com/biography/Friedrich-Engels)（三次） | 無し |

二人を扱うシリーズなので、現物の `kou-to-ryuho`（項羽と劉邦）に揃えて、早い方の生年から遅い方の没年までにした。
配信フィードの各回の説明によれば、第 12 回がマルクスの没後（1883 年より後）のエンゲルスを扱う。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | -0.1275, 51.507222 |
| 典拠 | [Wikidata Q84](https://www.wikidata.org/wiki/Q84) |
| 典拠の格 | 三次 |

配信フィードの各回の説明によれば、第 2〜5 回がウィーン会議後のプロイセンと二人の生い立ち、第 6〜8 回が二人の出会い・『共産党宣言』・亡命、第 9〜11 回が『資本論』と第一インターナショナル、第 12 回がエンゲルスの晩年を扱う。

拠点が複数あるときは、番組が扱う主な事績が起きた地を中心の場所とする（#171、[ADR-0041](../adr/0041-series-vocabulary-tiebreaks.md)）。
代表点をロンドンに置いたのは、第 9〜11 回が扱う主な事績の『資本論』の執筆と第一インターナショナルの設立が、マルクスが 1849 年から没年まで住んだロンドンで起きたためである。
1 回目の裏どりで、`@historian` は、English Heritage と German History in Documents and Images でこの事実を確認し、トリーアは出生地だけ、マンチェスターはエンゲルスの勤め先で二人に共通する拠点ではないとして、ロンドンが妥当と判断した。

| 候補 | 置くと何が起きるか |
|---|---|
| ロンドン（現在値） | 二人がともに活動し、『資本論』を書いた都市に点が立つ |
| 大英博物館の閲覧室（『資本論』の調査の場所） | 調査の場所に点が立つ。下の同じ地名の組の決め方が変わる |
| トリーア（マルクスの生地） | 活動の拠点でない点が立つ |
| マンチェスター（エンゲルスの勤め先） | エンゲルスだけの拠点に点が立つ |

ロンドンは、#169（S7: 近世の 8 シリーズを series.json へ載せる）の `elizabeth-1`（エリザベス1世）も要求している。
同じ地名を二つのシリーズが要求したときの決め方（#166、ADR-0041）で、二つとも種別が `人物` なので順 1 に当たらない。
順 2 は、一方だけが中心の場所を都市の中の一か所に絞れるときに、絞れる側が移る。
3 回目の裏どりが返したマルクスのロンドンでの住まいは次のとおりで、住まいは四度移り、ソーホーとケンティッシュ・タウンの二つの区に分かれる。

| 住まい | 期間 | 典拠 | 典拠の格 |
|---|---|---|---|
| ディーン・ストリート 64 番地と 28 番地（ソーホー） | 1850〜1856 年（64 番地は数か月） | [English Heritage: Karl Marx's London connections](https://www.english-heritage.org.uk/visit/inspire-me/blog/blog-posts/karl-marx-london-connections/) | 三次 |
| グラフトン・テラス 46 番地（ケンティッシュ・タウン） | 1856〜1864 年 | 同上 | 三次 |
| メイトランド・パーク・ロードの 2 軒（ケンティッシュ・タウン） | 1864 年ごろ〜1883 年 3 月 14 日（最後の 41 番地が没地） | 同上、[Britannica: How did Karl Marx die?](https://www.britannica.com/question/How-did-Karl-Marx-die) | 三次 |
| 大英博物館の閲覧室（ブルームズベリー）での調査 | 1850 年代から住まいの移転を通じて続いた | [Taylor & Francis Online](https://www.tandfonline.com/doi/abs/10.1080/17583489.2017.1298892)、[The View from Chelsea: Remembering the Round Reading Room](https://theviewfromchelsea.com/2018/03/11/remembering-the-round-reading-room-at-the-british-museum/) | 二次・参考程度 |

マルクスの住まいはロンドンの中の一か所に絞れず、`elizabeth-1` の中心の場所はホワイトホール宮殿に絞れるので、順 2 で `marx-engels` が `london` を使い、`elizabeth-1` が `whitehall` へ移る。

## `region`・`kind`・`title`

`region: ヨーロッパ` は、扱う地理がドイツ・フランス・ベルギー・英国で一区画に収まるので、[ADR-0034](../adr/0034-series-vocabulary.md) の `region` の選び方の表の 1 行目で決めた。
`@historian` は、活動の範囲が `ヨーロッパ` に収まることを確認した。
`kind: place` と `title: マルクス・エンゲルス` に指摘は出なかった。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て仮決定し、同日に #166 と #171 の決定（ADR-0041）で代表点と事物の `id` の理由を当て直した。
値は変わらなかった。
2026-09-11 に人間が仮決定を採用して決着させた。
2026-09-12 に人間が、規則と各回の配分で決まった値に残る別の候補も優先度を下げて見直すと決め、見直しを [#204](https://github.com/ta-tabox/coten-atlas/issues/204)（マルクス・エンゲルス（marx-engels）の timeRange の終わりを 1895 と 1883 のどちらにし、代表点をロンドンとマンチェスターのどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `end` | 1895（エンゲルスの没年） | 主題の中心の語をマルクスと見て、マルクスの没年（1883）で閉じる案もある。見直しは #204 で行う |
| 代表点 | ロンドン（事績の中心） | エンゲルスの拠点を重く見ればマンチェスターになる。見直しは #204 で行う |
| 事物の `id` | `london`（#166 の順 2） | マルクスの事績の中心を『資本論』の調査の場所と見れば、大英博物館の閲覧室が一か所に絞れる候補になる。その場合は両方とも絞れるので順 3 に当たり、`season` の小さい `elizabeth-1`（23）が `london` を使い、`marx-engels`（29）が移る |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628088075) | `timeRange`・代表点・`region` の裏どり |
| [`@historian` 2 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5628210063) | 1 回目で URL が返らなかった `timeRange` と座標の典拠 |
| [`@historian` 3 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/165#issuecomment-5633765389) | マルクスのロンドンでの住まいと大英博物館の閲覧室での調査の裏どり |
| [#165 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/165) | 代表点を選んだ判断と候補 |
| [#166 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/166#issuecomment-5629548286) | 同じ地名を二つのシリーズが要求したときに、どちらが移るかを決めた判断 |
| [#171 の決定（2026-09-11）](https://github.com/ta-tabox/coten-atlas/issues/171#issuecomment-5629453137) | 拠点が複数あるときに、事績の中心を代表点にする判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う主題 |
| [#204（見直し）](https://github.com/ta-tabox/coten-atlas/issues/204) | 採用した仮決定を人間が見直す論点と案 |

1 回目は典拠を事典の名と Wikidata の番号だけで返したので、2 回目が URL と値を返した。
**`timeRange` と座標の典拠の URL は 2 回目、住まいの事実の典拠は 3 回目が正である。**
