# 人類のコミュニケーション史（`jinrui-no-komyunikeshonshi`・season 3）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `jinrui-no-komyunikeshonshi` |
| `series.json` の `season` | 3 |
| `series.json` の `timeRange` | `"untimed"` |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `地域なし` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

`"untimed"`（時期なし）である。
主題のコミュニケーションは現在まで続いていて終わりを史実の年で言えないので、skill `series-vocabulary` の手順 7（[ADR-0039](../adr/0039-untimed-concept-series.md)）の表の 3 行目に当たる。

配信フィードの各回の説明によれば、第 1 回がインターネット、第 2 回が文字の成立、第 3 回が活版印刷、第 4 回が電気通信を扱う。

裏どりで確かめた年は、`catalog/` の値には使わず、年代の見せ方を決めるときの材料として次の表に残す。

| 端 | 年 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| 始まり | -3200 | ウルクで楔形文字が発達した時期（第 2 回が扱う文字の成立） | [World History Encyclopedia: Cuneiform](https://www.worldhistory.org/cuneiform/)（三次） | 同じ典拠が、シュメール人による文字の発明そのものを前3600〜前3500年頃に置く |

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`title`

`region: 地域なし` は、ADR-0034 の `region` の選び方の表の 3 行目で決めた。
第 2 回の文字と第 3 回の活版印刷は、複数の区画（メソポタミアと中国、中国とドイツ）で別々に生まれたものとして扱われているためである。
`@historian` は `anchor` が無いことを理由に `region` を座標と突き合わせておらず、`region` の選択への指摘も出なかった。
`title: 人類のコミュニケーション史` に指摘は出なかった。

`id` の `komyunikeshon` は、ADR-0034 の `id` の表の「漢字とかな」の行（ヘボン式）を当てた。
「コミュニケーション」はカタカナだが固有名でないので、ラテン文字の綴りを使う「カタカナの外来固有名」の行に当たらない。
「コミュニケーション史」は接尾辞の付いた語なので割らず、`komyunikeshonshi` とした（現物の `america-kaitakushi` と同じ扱い）。
自動レビューは、この表記が ADR-0034 の細則どおりだと確認した。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て仮決定し、2026-09-11 に ADR-0039 に従って `timeRange` を `"untimed"` にした。
2026-09-12 に人間が仮決定を採用して決着させた。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 時期を持つか | `"untimed"` | 時期なしのシリーズの見せ方を決めて始まりの年が要るなら、ウルクでの楔形文字の発達（前3200年頃）か、文字の発明（前3600〜前3500年頃）を使える |
| `id` の表記 | `komyunikeshonshi` | カタカナの普通名詞にもラテン文字の綴りを使うなら `communication` を含む形になる。ADR-0034 はカタカナの普通名詞を名指ししていない |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | 始まりの年・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各回の内容から決めた年と、`region` と `id` の判断 |
| [#160（ADR-0039）](https://github.com/ta-tabox/coten-atlas/pull/160) | `timeRange` を `"untimed"` にした線 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
