# 老子・荘子（`roshi-soshi`・season 55）

| `catalog/` の鍵 | 値 |
|---|---|
| `series.json` の `id` | `roshi-soshi` |
| `series.json` の `season` | 55 |
| `series.json` の `timeRange` | -571..-286 |
| `loci.geojson` の `anchor` | `luyi` |
| `loci.geojson` の座標 | `[115.486, 33.861]` |

## `timeRange`

| 欄 | 値 | 何の年か | 典拠 | 並立する説 |
|---|---|---|---|---|
| `start` | -571 | 老子の生年 | [Wikipedia: Laozi](https://en.wikipedia.org/wiki/Laozi) | 前604年説・前581年説 |
| `end` | -286 | 荘子の没年 | [Berkshire Publishing](https://www.berkshirepublishing.com/ecph-china/2018/01/16/zhuangzi-c-369-286-bce/) | 無し |

老子は実在そのものが定説でないので、前571年は数ある伝承上の年代の一つに過ぎない。
前604年説を挙げる文献があり、前571年説の内部でも前581年説を併記するものがある（[Baidu Baike 英語版](https://baike.baidu.com/en/item/Laozi/985692)、[GlobalSecurity.org](https://www.globalsecurity.org/military/world/china/lao-tzu.htm)）。
GlobalSecurity.org は一次資料でないので、参考程度の情報源として扱う。

荘子の没年は前286年で、前369年生とあわせて複数の典拠が一致する。

## 代表点

| 欄 | 値 |
|---|---|
| 典拠が示す値 | 115.48092, 33.86042（現在値との差は経度約470m・緯度約65m） |
| 典拠 | [Wikidata Q1198911](https://www.wikidata.org/wiki/Q1198911) |
| 典拠の格 | 三次 |

老子の伝承上の生地である苦県が現在の鹿邑県に当たるので、代表点を鹿邑に置いた。
点が指すのは伝承の指す一帯であって、老子と荘子が活動した場所ではない。
荘子の伝承上の生地である蒙（現・商丘市）と鹿邑は直線距離で 60〜70km 離れており、同一地点ではない。
「同じ河南省東部」という括りでは合うが、「同じ一帯」と言えるかは見る粒度によって変わる。

| 候補 | 置くと何が起きるか |
|---|---|
| 鹿邑（現在値） | 老子の伝承地に寄る。荘子の伝承地は 60〜70km 離れたまま地図に出ない |
| 位置なし | 実在が定説でない人物に点を置かずに済む。地図から消える |

## `region`・`kind`・`title`

`region: 中国` に指摘は出なかった。
`kind: concept` は、老子の実在が定説でないことと符合する。
[ADR-0034](../adr/0034-series-vocabulary.md) は `concept` と代表点の組を許しているので、代表点を持ったままでよい。
`title: 老子・荘子` に指摘は出なかった。

## 仮決定と論点

2026-09-10 に人間が現在の値で決着させた。

| 論点 | 仮決定 | 覆りうる根拠 |
|---|---|---|
| 老子の生年 | -571 | 前604年説と前581年説が並立し、実在そのものが定説でない |
| 代表点 | `luyi`（鹿邑） | 位置なしにすれば、実在が定説でない人物に点を置かずに済む |

## 裏どりの出所

| 出所 | 何を持つか |
|---|---|
| [`@historian` 1 回目（2026-09-09）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610048902) | `timeRange`・座標・`region`・`kind`・`title` の裏どり |
| [`@historian` 2 回目（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/143#issuecomment-5610686216) | 座標の典拠の取り直し |
| [#143 の PR 本文](https://github.com/ta-tabox/coten-atlas/pull/143) | 代表点を選んだ判断と候補 |
| [#154 のレビュー（2026-09-10）](https://github.com/ta-tabox/coten-atlas/pull/154) | 仮決定 |

1 回目は座標の典拠に Wikipedia の Laozi の記事を使っていたので、2 回目が Wikidata Q1198911 へ差し替えた。
**座標の典拠は 2 回目が正である。**
