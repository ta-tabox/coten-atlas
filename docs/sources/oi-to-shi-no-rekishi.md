# 老いと死の歴史（`oi-to-shi-no-rekishi`・season 36）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `oi-to-shi-no-rekishi` |
| `series.json` の `season` | 36 |
| `series.json` の `timeRange` | `"untimed"` |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `地域なし` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

`"untimed"`（時期なし）である。
主題の老いと死の捉え方は現在まで続いていて終わりを史実の年で言えないので、skill `series-vocabulary` の手順 7（[ADR-0039](../adr/0039-untimed-concept-series.md)）の表の 3 行目に当たる。
番組は era 空間の始端（-10000）より古い古代の埋葬も扱うので、始まりも取り決めの値でしか書けない。

配信フィードの各回の説明によれば、第 1〜2 回が文化と社会による老いの捉え方、第 3〜4 回が生物学から見た死と古代の埋葬、第 5〜7 回が神話と宗教（一神教・インド・中国・日本）の死生観、第 8 回が葬送の文化と現代を扱う。

裏どりで史実の年として確かめた年は無い。
#157 の最初の版は `start` に era 空間の始端 -10000 を書いており、`@historian` はその値を外部典拠の対象外として `catalog/eras.json` との一致だけを確認した。

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

2026-09-10 に Claude が `@historian` の結果を見て仮決定し、2026-09-11 に ADR-0039 に従って `timeRange` を `"untimed"` にした。
2026-09-12 に人間が仮決定を採用して決着させた。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 時期を持つか | `"untimed"` | 無し。始まりが era 空間の始端より古く、終わりも無いので、年で書く値が無い |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | 最初の版の `start` と `eras.json` の突き合わせ・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各回の内容と、`region` の判断 |
| [#160（ADR-0039）](https://github.com/ta-tabox/coten-atlas/pull/160) | `timeRange` を `"untimed"` にした線 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
