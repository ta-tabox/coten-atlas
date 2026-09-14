# 教育の歴史（`kyoiku-no-rekishi`・season 25）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `kyoiku-no-rekishi` |
| `series.json` の `season` | 25 |
| `series.json` の `timeRange` | `"untimed"` |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `地域なし` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

`"untimed"`（時期なし）である。
主題の教育は現在まで続いていて終わりを史実の年で言えないので、skill `series-vocabulary` の手順 7（[ADR-0039](../adr/0039-untimed-concept-series.md)）の表の 3 行目に当たる。
最終回が語る最も遅い制度の年（1852）は、番組の範囲の終わりであって、主題の終わりではない。

配信フィードの各回の説明によれば、第 1 回が古代文明の学校、第 2 回がギリシアとローマ、第 3〜5 回が中世ヨーロッパと大学の誕生、第 6〜7 回が中国、第 8 回が日本、第 9 回がイスラーム世界、第 10〜12 回が人文主義からペスタロッチまで、第 13 回が近代の公教育を扱う。

裏どりで確かめた年は、`catalog/` の値には使わず、年代の見せ方を決めるときの材料として次の表に残す。

| 端 | 年 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| 始まり | -2500 | メソポタミアで学校の考古学的な痕跡が確認できる年代（第 1 回が扱う古代文明の学校） | [World History Encyclopedia: Mesopotamian Education](https://www.worldhistory.org/article/2203/mesopotamian-education/)（三次） | 無し |
| 番組の範囲の終わり | 1852 | マサチューセッツ州の義務教育法の制定（第 13 回が扱う制度のうち最も遅い） | [Encyclopedia.com: Act Concerning the Attendance of Children at School](https://www.encyclopedia.com/social-sciences/applied-and-social-sciences-magazines/act-concerning-attendance-children-school)（三次） | 無し |

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`title`

`region: 地域なし` は、ADR-0034 の `region` の選び方の表の 3 行目で決めた。
各回がギリシア・中国・日本・イスラーム世界の教育を、それぞれの地で生まれたものとして並べて扱うためである。
`@historian` は `anchor` が無いことを理由に `region` を座標と突き合わせておらず、`region` の選択への指摘も出なかった。
`title: 教育の歴史` に指摘は出なかった。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て仮決定し、2026-09-11 に ADR-0039 に従って `timeRange` を `"untimed"` にした。
2026-09-12 に人間が仮決定を採用して決着させた。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 時期を持つか | `"untimed"` | 時期なしのシリーズの見せ方を決めて番組が語る範囲を年で出すなら、-2500..1852 を使える |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | 始まりと番組の範囲の終わりの年・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各回の内容から決めた年と、`region` の判断 |
| [#160（ADR-0039）](https://github.com/ta-tabox/coten-atlas/pull/160) | `timeRange` を `"untimed"` にした線 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
