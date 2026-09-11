# ムガール帝国（`mughal-teikoku`・season 54）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `mughal-teikoku` |
| `series.json` の `season` | 54 |
| `series.json` の `timeRange` | 1526..1857 |
| `series.json` の `anchor` | `agra` |
| `series.json` の `region` | `南アジア` |
| `loci.geojson` の座標 | `[78.021, 27.18]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | 1526 | パーニーパットの戦い（バーブルによる帝国の建国） | [Britannica: Babur](https://www.britannica.com/biography/Babur)（三次） | 無し |
| `end` | 1857 | 最後の皇帝バハードゥル・シャー 2 世の廃位 | [Britannica: When did the Mughal Empire end?](https://www.britannica.com/question/When-did-the-Mughal-Empire-end)・[Britannica: Bahadur Shah II](https://www.britannica.com/biography/Bahadur-Shah-II)（三次） | 1858 |

Britannica は、1857 年の最後の皇帝の廃位を王朝の実質的な終わりとし、流刑（1858 年 10 月）を別の出来事として区別する。
1858 年を終わりとする数え方は、廃位でなく流刑の年を採る読み方である。

種別は `集団` なので、現物の `sparta`・`teisei-roma` と同じく、集団が存続した期間で引いた。
配信フィードの各回の説明によれば、第 1〜5 回がインドの地理・言語・インダス文明・インド哲学・カースト・古代の王朝、第 6 回がイスラーム勢力とティムールの侵攻、第 7〜9 回がバーブルからアウラングゼーブまでの皇帝、第 10〜12 回がヨーロッパ諸国の進出からインド大反乱までを扱う。
第 1〜6 回は帝国の建国より前を扱うが、`timeRange` は集団の存続期間に揃えた。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 78.0211, 27.1795（アグラ城塞） |
| 典拠 | `@historian` が Wikidata と Wikipedia の座標で照合した（照合した項目の URL は報告に無い） |
| 典拠の格 | 三次 |

種別は `集団` だけなので、[ADR-0034](../adr/0034-series-vocabulary.md) の「代表点と `kind` の選び方」の表の 3 行目で、本拠の都市に代表点を置いた。
帝国を建てたバーブルが都にし、アクバルの治世まで都だったので、アグラにした。
帝国の都は時期によって移っており、どの都を本拠の都市とするかの基準を ADR-0034 は持たないので、この選択は [#171](https://github.com/ta-tabox/coten-atlas/issues/171)（人物や集団の拠点が時期によって複数あるとき、どれを代表点にするかを決める） で決める。

| 候補 | 置くと何が起きるか |
|---|---|
| アグラ（現在値） | 建国者と最盛期のアクバルの都に寄る |
| デリー | 1648 年から帝国の終わりまでの都に寄る |
| ファテープル・シークリー | アクバルが一時置いた都に寄る |

## `region`・`kind`・`title`

`region: 南アジア` は、各回が建国者バーブルの中央アジアでの前半生にも触れて複数の区画に跨るので、ADR-0034 の `region` の選び方の表の 2 行目で本拠の区画にした。
種別 `集団` の本拠は発祥の地で、帝国はパーニーパットの戦いの後に北インドで建った。

`@historian` は、ADR-0034 が `集団` の本拠の例に帝政ローマ（建国者の生地でなく、建国された地のローマ）を挙げていることに照らし、集団の本拠は建国者個人の出自の地でなく集団自体が興った地で決まると返した。
そのうえで、ムガール帝国はバーブルの出自のフェルガナでなく北インドで興ったので、`region: 南アジア` は ADR-0034 の基準と矛盾しないと確認した。

`kind: place` は表の 3 行目に当たり、自動レビューは `place` と位置なしの組み合わせに当たらないことを確認した。
`title: ムガール帝国` はシリーズ名のままで、指摘は出なかった。
`id` の `mughal-teikoku` は、カタカナの外来固有名をカタカナの語形に合う綴りで英語の文献で通用する Mughal、漢字を読みにして、部分ごとに規則を当てた（現物の `teisei-roma`）。

## 仮決定と論点

2026-09-11 に Claude が `@historian` の結果を見て現在の値で仮決定した。
人間の判定は [#169](https://github.com/ta-tabox/coten-atlas/pull/169) で待っている。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| `end` | 1857（最後の皇帝の廃位） | 流刑の 1858 年を終わりとする数え方がある |
| `region` | `南アジア` | 王家の出自のフェルガナを発祥の地と見れば `中央ユーラシア` になる |
| 代表点 | `agra`（アグラ） | 最も長く都だったデリーを本拠の都市と見ればデリーになる（#171） |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628206488) | `timeRange` の両端の並立説・座標・`region` の本拠の読み方の裏どり |
| [自動レビュー（2026-09-11）](https://github.com/ta-tabox/coten-atlas/pull/169#issuecomment-5628201381) | `region` の値・`anchor` と事物の対応・`tags` の規則の突き合わせ |
| [#169 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/169) | 代表点を選んだ判断と候補 |
| 配信フィード（`https://anchor.fm/s/8c2088c/podcast/rss`、2026-09-11 取得）の各回の説明 | 各回が扱う年代と舞台 |
