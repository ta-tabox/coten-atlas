# 人類のコミュニケーション史（`jinrui-no-komyunikeshonshi`・season 3）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `jinrui-no-komyunikeshonshi` |
| `series.json` の `season` | 3 |
| `series.json` の `timeRange` | -3200..2019 |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `地域なし` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -3200 | ウルクで楔形文字が発達した時期 | [World History Encyclopedia: Cuneiform](https://www.worldhistory.org/cuneiform/)（三次） | 同じ典拠が、シュメール人による文字の発明そのものを前3600〜前3500年頃に置く |
| `end` | 2019 | 最終回（3-4）の配信年 | `catalog/episodes.json` の `pubDate`（2019-03-01） | 無し |

配信フィードの各回の説明によれば、第 1 回がインターネット、第 2 回が文字の成立、第 3 回が活版印刷、第 4 回が電気通信を扱う。
最も古い主題は第 2 回の文字の成立なので、`start` を楔形文字の年代に置いた。
第 1 回が現代のインターネットを扱うので、`end` は最終回の配信年にした。
現代まで扱うシリーズの `end` を最終回の配信年にする揃え方は、`okane-no-rekishi` の `end` 2020 が最終回の配信日（2020-01-12）の年と一致することに合わせている。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`kind`・`title`

`region: 地域なし` は、ADR-0034 の `region` の選び方の表の 3 行目で決めた。
第 2 回の文字と第 3 回の活版印刷は、複数の区画（メソポタミアと中国、中国とドイツ）で別々に生まれたものとして扱われているためである。
`@historian` は `anchor` が無いことを理由に `region` を座標と突き合わせておらず、`region` の選択への指摘も出なかった。
`kind: concept` は `tags` の種別が `概念史` だけであることと矛盾しないと `@historian` が確認した。
`title: 人類のコミュニケーション史` に指摘は出なかった。

`id` の `komyunikeshon` は、ADR-0034 の `id` の表の「漢字とかな」の行（ヘボン式）を当てた。
「コミュニケーション」はカタカナだが固有名でないので、ラテン文字の綴りを使う「カタカナの外来固有名」の行に当たらない。
「コミュニケーション史」は接尾辞の付いた語なので割らず、`komyunikeshonshi` とした（現物の `america-kaitakushi` と同じ扱い）。
自動レビューは、この表記が ADR-0034 の細則どおりだと確認した。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#157](https://github.com/ta-tabox/coten-atlas/pull/157) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `start` | -3200（ウルクでの楔形文字の発達） | 文字の発明そのものを起点にすれば前3600〜前3500年頃になる |
| `id` の表記 | `komyunikeshonshi` | カタカナの普通名詞にもラテン文字の綴りを使うなら `communication` を含む形になる。ADR-0034 はカタカナの普通名詞を名指ししていない |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | `timeRange` の両端・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各端を決めた回と、`region` と `id` の判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
