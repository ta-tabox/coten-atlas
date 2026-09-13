# 障害の歴史（`shogai-no-rekishi`・season 37）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `shogai-no-rekishi` |
| `series.json` の `season` | 37 |
| `series.json` の `timeRange` | `"untimed"` |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `地域なし` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

`"untimed"`（時期なし）である。
主題の障害の捉え方は現在まで続いていて終わりを史実の年で言えないので、skill `series-vocabulary` の手順 7（[ADR-0039](../adr/0039-untimed-concept-series.md)）の表の 3 行目に当たる。
番組は era 空間の始端（-10000）より古い太古の考古学的な証拠も扱うので、始まりも取り決めの値でしか書けない。

配信フィードの各回の説明によれば、第 1 回が太古の考古学的な証拠と古代の日本・ギリシア・中国・メソポタミア・ローマ、第 2 回が宗教、第 3 回が中世から啓蒙主義の時代、第 4〜6 回が進化論と優生学、第 7〜8 回がノーマライゼーションと自立生活運動から現在までを扱う。

裏どりで史実の年として確かめた年は無い。
#157 の最初の版は `start` に era 空間の始端 -10000 を書いており、`@historian` はその値を外部典拠の対象外として `catalog/eras.json` との一致だけを確認した。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`title`

`region: 地域なし` は、ADR-0034 の `region` の選び方の表の 3 行目で決めた。
第 1 回が古代の日本・ギリシア・中国・メソポタミアでの障害の扱いを、それぞれの地のものとして並べて扱うためである。
`@historian` は `anchor` が無いことを理由に `region` を座標と突き合わせておらず、`region` の選択が割れうることは事実の裏どりでは決められないと報告した。
`title: 障害の歴史` に指摘は出なかった。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て仮決定し、2026-09-11 に ADR-0039 に従って `timeRange` を `"untimed"` にした。
2026-09-12 に人間が仮決定を採用して決着させ、見直しを [#213](https://github.com/ta-tabox/coten-atlas/issues/213)（障害の歴史（shogai-no-rekishi）の region を地域なしとヨーロッパのどちらにするか）へ切り出した。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `region` | `地域なし` | 第 3 回以降は啓蒙主義・優生学・ノーマライゼーションと、ヨーロッパで生まれて広がった考えを追う。後半を主題と見れば、表の 2 行目で `ヨーロッパ` になる。見直しは #213 で行う |
| 時期を持つか | `"untimed"` | 無し。始まりが era 空間の始端より古く、終わりも無いので、年で書く値が無い |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | 最初の版の `start` と `eras.json` の突き合わせ・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各回の内容と、`region` の判断 |
| [#160（ADR-0039）](https://github.com/ta-tabox/coten-atlas/pull/160) | `timeRange` を `"untimed"` にした線 |
| [#213（見直し）](https://github.com/ta-tabox/coten-atlas/issues/213) | 採用した仮決定を人間が見直す論点と案 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
