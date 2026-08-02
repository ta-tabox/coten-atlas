# S2: シード10シリーズを作り concept 系の置き方を確定する
labels: claude,tooling

**前提**: #03 ／ **担当**: Claude ／ **参照**: `docs/plan.md` §2（データモデル）、§5（S2 の閾値）

## 目的
描画のスタイル分岐が依存する `kind` の集合を、机上でなく実データで確定する。
「場所が一意でない」概念史をどう置くかは、10件書いてみないと決まらない。

## 作るもの
- `data/themes.geojson` — 地理的・時代的に分散した10シリーズ前後。
  **4 種の kind をすべて最低1件含める**。候補: 三国志 / スパルタ / 吉田松陰 /
  ペスト / アメリカ開拓史 / 世界三大宗教 / お金の歴史 / ヒトラー / 大航海時代 / クレオパトラ
  - 人物伝は活動の中心地を Point、生涯年代を timeRange
  - 概念史は MultiPoint か代表 Polygon + `kind: "concept"`
  - `match` は各シリーズのエピソードタイトルに当たる正規表現（S6 で使う）
- `docs/plan.md` §2 への追記 — concept 系の置き方の**規約**（この issue で確定した判断を
  一段落。「なぜ MultiPoint か / なぜ代表 Polygon か」の分岐条件を書く）
- テスト `src/lib/schema/seed.test.ts`
  - シードが `themeCollectionSchema` を通る
  - `kind` 4種がすべて出現する
  - `id` に重複がない

## 触らないもの
`src/components/`、描画スタイル（#05）

## 完了条件（機械判定）
- `mise run check` が緑（`validate` がシードを通す）
- 上記3本のテストが通る

## 人間の判定（別トラック）
座標・年代のざっくりした妥当性（叩き台品質で可。精度の作り込みは S7 の人間補正で）。
