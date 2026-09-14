# 0023. `kind` は geometry から導けない差だけを持つ

- **状態**: supersede 済み（→ 0042）
- **決定日**: 2026-08-31（#88）
- **関係する ADR**: 0042（この決定を supersede する）、0003（MapLibre）、0018（割当キーを `itunes:season` にする）

## 文脈

`seriesKindSchema` は `point` / `polygon` / `line` / `concept` の 4 値だった。
#5（S3・シリーズを地図に描く）はこの 4 値に対応するレイヤを 4 本定義し、`filter: ['==', ['get', 'kind'], …]` で振り分ける設計になっている。

しかし MapLibre のレイヤは種別ごとに描ける geometry が決まっている。
circle レイヤは Point と MultiPoint だけを、fill レイヤは Polygon だけを、line レイヤは LineString だけを描く。
`point` / `polygon` / `line` の 3 値は `geometry.type` の言い換えで、MapLibre 自身が `['geometry-type']` で同じ分岐を書ける。

さらに両者を独立に持つので、`kind: "polygon"` の feature に Point の geometry を与えられる。
検査は無く、`ARCHITECTURE.md` §3 の例が実際にその組み合わせで書かれていた（#88 で直した）。

`concept` だけは geometry から導けない。
概念史は MultiPoint か代表 Polygon で置くので、geometry の型は他のシリーズと同じまま、描画だけを控えめにする必要がある。

## 決定

**`kind` を `place` / `concept` の 2 値にする。**

1. `place` は場所が一意に決まるもの（都市国家・帝国・人物・遠征）
2. `concept` は場所が一意でないもの（お金の歴史・資本主義など）
3. 図形による分岐は `kind` で持たない。MapLibre の `['geometry-type']` が直接読む

## 理由

geometry から導ける情報を二重に持たない。
二つ持つと、片方だけを書き換えたデータが作れる。

採らなかった案:

- **4 値のまま #4 で決める** — 値域の重複は実データを見なくても構造から分かるので、待つ理由が無い。
  待つ間に、重複したままの形でシード 10 件が書かれる
- **`history` / `concept` / `other` の 3 値** — `other`（番外編）はシリーズ側に現れない。
  `itunes:season` を持たない回は inbox へ行き `series.geojson` には入らない（ADR-0018）ので、実例の無い値を先に置くことになる

## 帰結

- `ROADMAP.md` の S2 完了条件「4 種の `kind`」は「両方の `kind`」になる
- #4 のシードは 2 値の両方を含めばよい。`kind` の集合を実データで確定する作業は消える
- #5 のレイヤ定義は `kind` で 4 本に割らない。
  図形ごとの分岐は `['geometry-type']` が、`concept` の控えめなスタイルは `kind` が担う
- `kind` と `geometry.type` の対応を検査する必要が無くなる。
  導出の関係を持たないので、矛盾する組み合わせ自体が作れない

## 覆る条件

同じ geometry 型に 3 種類目のスタイルを当てたくなったとき。
