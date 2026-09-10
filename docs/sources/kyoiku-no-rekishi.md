# 教育の歴史（`kyoiku-no-rekishi`・season 25）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `kyoiku-no-rekishi` |
| `series.json` の `season` | 25 |
| `series.json` の `timeRange` | -2500..1852 |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `地域なし` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -2500 | メソポタミアで学校の考古学的な痕跡が確認できる年代 | [World History Encyclopedia: Mesopotamian Education](https://www.worldhistory.org/article/2203/mesopotamian-education/)（三次） | 無し |
| `end` | 1852 | マサチューセッツ州の義務教育法の制定 | [Encyclopedia.com: Act Concerning the Attendance of Children at School](https://www.encyclopedia.com/social-sciences/applied-and-social-sciences-magazines/act-concerning-attendance-children-school)（三次） | 無し |

配信フィードの各回の説明によれば、第 1 回が古代文明の学校、第 2 回がギリシアとローマ、第 3〜5 回が中世ヨーロッパと大学の誕生、第 6〜7 回が中国、第 8 回が日本、第 9 回がイスラーム世界、第 10〜12 回が人文主義からペスタロッチまで、第 13 回が近代の公教育を扱う。
第 1 回の古代文明の学校を最も古い主題と見て、`start` をメソポタミアの学校の痕跡に置いた。
第 13 回はフランス革命後の公教育・イギリス・プロイセン・アメリカのコモンスクールを並べて扱うので、`end` をその中で最も遅い制度であるマサチューセッツ州の義務教育法に置いた。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`kind`・`title`

`region: 地域なし` は、ADR-0034 の `region` の選び方の表の 3 行目で決めた。
各回がギリシア・中国・日本・イスラーム世界の教育を、それぞれの地で生まれたものとして並べて扱うためである。
`@historian` は `anchor` が無いことを理由に `region` を座標と突き合わせておらず、`region` の選択への指摘も出なかった。
`kind: concept` は `tags` の種別が `概念史` だけであることと矛盾しないと `@historian` が確認した。
`title: 教育の歴史` に指摘は出なかった。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#157](https://github.com/ta-tabox/coten-atlas/pull/157) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `end` | 1852（最終回が語る最も遅い制度） | 最終回はこれからの教育にも触れる。現代まで扱う他のシリーズと同じく最終回の配信年（2021、`pubDate` は 2021-09-05）にする案もある |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | `timeRange` の両端・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各端を決めた回と、`region` の判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
