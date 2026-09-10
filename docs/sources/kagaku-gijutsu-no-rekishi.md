# 科学技術の歴史（`kagaku-gijutsu-no-rekishi`・season 58）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `kagaku-gijutsu-no-rekishi` |
| `series.json` の `season` | 58 |
| `series.json` の `timeRange` | -10000..2025 |
| `series.json` の `anchor` | `"unlocated"` |
| `series.json` の `region` | `地域なし` |
| `loci.geojson` の事物 | 無し |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -10000 | era 空間の始端 | `catalog/eras.json` の `prehistory` の `start` | 無し |
| `end` | 2025 | 最終回（58-12）の配信年 | `catalog/episodes.json` の `pubDate`（2025-05-14） | 無し |

配信フィードの各回の説明によれば、第 1 回が科学と技術の区別、第 2 回が古代ギリシアの自然哲学、第 3 回が科学革命、第 4 回が量子力学、第 5 回が金属、第 6 回が蒸気機関と内燃機関、第 7 回が産業革命、第 8 回が火薬、第 9 回が 1 万年以上に及ぶ農業と肥料、第 10 回が原子力、第 11 回がコンピュータ、第 12 回が半導体と AI を扱う。
第 9 回が扱う農業の始まりは era 空間の始端とほぼ重なり、#106（S7: 通史・概念史のシリーズを series.json へ載せる）が `timeRange` を era 空間に収まる範囲で引くと決めているので、`start` を era 空間の始端に置いた。
第 12 回が現代の AI を扱うので、`end` は最終回の配信年にした。
現代まで扱うシリーズの `end` を最終回の配信年にする揃え方は、`okane-no-rekishi` の `end` 2020 が最終回の配信日（2020-01-12）の年と一致することに合わせている。

`start` は外部の史実でなく era 空間の始端という取り決めなので、`@historian` は外部典拠の対象外とし、`catalog/eras.json` の値との一致だけを確認した。

## 代表点

位置なしである。
`tags` の種別が `概念史` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 1 行目に当たる。
他の候補は挙がっていない。

## `region`・`kind`・`title`

`region: 地域なし` は、ADR-0034 の `region` の選び方の表の 3 行目で決めた。
各回が鉄をアナトリア、火薬を中国、科学革命と産業革命をヨーロッパで生まれたものとして扱い、主題が複数の区画で別々に生まれているためである。
`@historian` は `anchor` が無いことを理由に `region` を座標と突き合わせておらず、`region` の選択への指摘も出なかった。
`kind: concept` は `tags` の種別が `概念史` だけであることと矛盾しないと `@historian` が確認した。
`title: 科学技術の歴史` に指摘は出なかった。

`id` の `kagaku-gijutsu` は「科学技術」を「科学」と「技術」の境目で割った。
[コトバンク](https://kotobank.jp/word/科学技術)で引ける辞書は日本大百科全書と改訂新版世界大百科事典だけで、デジタル大辞泉と精選版日本国語大辞典に一語の見出しが無かったためである。

## 仮決定と論点

2026-09-10 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#157](https://github.com/ta-tabox/coten-atlas/pull/157) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `id` の区切り | `kagaku-gijutsu` | 百科事典には「科学技術」の見出しがある。辞書の見出しの有無でなく一語として通用するかで判定すれば、`kagakugijutsu` になる |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724847) | `end` と配信日の突き合わせ・`start` と `eras.json` の突き合わせ・`kind` の裏どり |
| [自動レビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/157#issuecomment-5618724200) | `id` の表記と ADR-0034 の規則の突き合わせ |
| [#157 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/157) | 各端を決めた回と、`region` と `id` の判断 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-10 取得）の各回の説明 | 各回が扱う主題 |
