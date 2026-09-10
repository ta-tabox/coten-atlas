# 老いと死の歴史（`oi-to-shi-no-rekishi`・season 36）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `oi-to-shi-no-rekishi` |
| `series.json` の `season` | 36 |
| `series.json` の `timeRange` | -10000..2022 |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `地域なし` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -10000 | era 空間の始端 | `catalog/eras.json` の `prehistory` の `start` | 無し |
| `end` | 2022 | 最終回（36-8）の配信年 | `catalog/episodes.json` の `pubDate`（2022-12-21） | 無し |

配信フィードの各回の説明によれば、第 1〜2 回が文化と社会による老いの捉え方、第 3〜4 回が生物学から見た死と古代の埋葬、第 5〜7 回が神話と宗教（一神教・インド・中国・日本）の死生観、第 8 回が葬送の文化と現代を扱う。
第 4 回が扱う古代の埋葬は -10000 より古い時代を含むが、#106（S7: 通史・概念史のシリーズを series.json へ載せる）が `timeRange` を era 空間に収まる範囲で引くと決めているので、`start` を era 空間の始端に置いた。
第 8 回が現代を扱うので、`end` は最終回の配信年にした。
現代まで扱うシリーズの `end` を最終回の配信年にする揃え方は、`okane-no-rekishi` の `end` 2020 が最終回の配信日（2020-01-12）の年と一致することに合わせている。

`start` は外部の史実でなく era 空間の始端という取り決めなので、`@historian` は外部典拠の対象外とし、`catalog/eras.json` の値との一致だけを確認した。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`kind`・`title`

`region: 地域なし` は、ADR-0034 の `region` の選び方の表の 3 行目で決めた。
各回が一神教・インド・中国・日本の死生観を、それぞれの地で生まれたものとして並べて扱うためである。
`@historian` は `anchor` が無いことを理由に `region` を座標と突き合わせておらず、`region` の選択への指摘も出なかった。
`kind: concept` は `tags` の種別が `概念史` だけであることと矛盾しないと `@historian` が確認した。
`title: 老いと死の歴史` に指摘は出なかった。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#157](https://github.com/ta-tabox/coten-atlas/pull/157) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `start` | -10000（era 空間の始端） | 番組が扱う古代の埋葬はさらに古い。era 空間が先へ伸びれば `start` も動かすことになる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | `end` と配信日の突き合わせ・`start` と `eras.json` の突き合わせ・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各端を決めた回と、`region` の判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
