# 0030. データの置き場の名前を `catalog/` にする

- **状態**: 採用
- **決定日**: 2026-09-06（#122）
- **関係する ADR**: 0011・0020・0029

## 文脈

データの置き場を起草時から `data/` と呼んできた。

`CODING.md` と skill `coding-standards` は `data`・`info`・`manager`・`process` を思考停止の兆候として名指しし、「何の」データかまで名前に押し込むことを求めている。
ところがディレクトリ名がその語なので、置き場に素直に沿って名付けるほど規約から外れる形になっていた。

`1b032ff` の実測で、9 つの識別子がディレクトリ名を写していた。
`DATA_DIR`・`readData`・`DATA_VALIDATORS`・`DATA_EXTENSIONS`・`dataFileNames`・`validate:data` と、ファイル名 `data-dir.ts`・`schema/data-files.ts`・`tests/data.test.ts` である。
どれも中身（シリーズ・事物・時代区分・エピソード）を語らず、置き場の名前を反射しているだけだった。

`data/` の文字列はリポジトリ全体に 96 箇所ある。
うち 36 箇所は ADR 本文にあり、規約 4 により書き換えられない。

## 決定

**データの置き場を `catalog/` へ改名し、コードの識別子も同じ語で揃える。**

1. `data/` を `catalog/` へ。中身のファイル名（`series.json`・`loci.geojson`・`eras.json`・`episodes.json`）は動かさない
2. 9 つの識別子を `CATALOG_DIR`・`readCatalogFile`・`CATALOG_VALIDATORS`・`CATALOG_EXTENSIONS`・`catalogFileNames`・`validate:catalog`・`catalog-dir.ts`・`schema/catalog-files.ts`・`tests/catalog.test.ts` へ
3. まだ実装の無い配り先 `public/data/episodes.json` も `public/catalog/episodes.json` へ
4. 既存 ADR の本文は書き換えない。読み替えの案内を `docs/adr/README.md` へ一行置く

置き場そのもの（`web/` の外のルート側。`ARCHITECTURE.md` §6）と二層の切り方（0029）は動かさない。
変えたのは名前だけである。

## 理由

**汎用語を生んでいるのはディレクトリ名である。**
識別子だけ直すと `data/` と新しい語の二つが同じ対象を指し、`CODING.md`「同じ対象に二つの名前を与えない」に当たる。
そのうえ次に `catalog/` へファイルを足す人は置き場に沿ってまた `dataXxx` と名付けるので、9 個を拭いても圧は残る。

**`catalog`（目録）は 4 本のファイルすべてを一語で覆う。**
シリーズも事物も時代区分もエピソードも、どれも項目の列挙である。

**払う代償は一度きりで、払わない代償は読むたびに掛かる。**
陳腐化する 36 箇所は ADR という滅多に読まれない層に閉じ、吸う仕組みは 0020 の読み替え注記として既にある。
対して二つの名前の並走は、これから `web/` を読むすべての人が毎回マッピングを持ち越す。

### 採らなかった案

- **識別子だけ直し、`data/` を据え置く。** ADR に触れず読み替え規則も増えないが、1 ファイルの中に語彙が二本走る。`catalog-dir.ts` の冒頭が「`data/` のファイルを読み」と書き、その 20 行下で `CATALOG_DIR` を定義することになる
- **`dataset/`。** 境界の定まった収集物を指すので、CC BY 4.0 を当てる単位（0011）としては `data/` より正確になる。しかし `DATASET_VALIDATORS`・`readDatasetFile` は依然として「何の」に答えない。境界を語っただけで中身を語っていない
- **`corpus/`。** 収まりは `catalog` と同等だが、言語学・文献学から借りた語なのでコードの読み手が即座に解けない。`CODING.md`「比喩は、使う場所で解けるときだけ使う」に当たる
- **`atlas/`。** リポジトリ名が `coten-atlas` で、`web/` が描くものが地図帳そのものである。同じ語が成果物とその素材の二つを指す
- **`sources/`。** MapLibre の `source` と衝突する。`SeriesLayers.tsx` が `<Source id={SERIES_SOURCE_ID}>` を持っている

## 帰結

- ADR 本文の 36 箇所が、実在しないパスを指したまま残る。
  `docs/adr/README.md` へ置いた一行がその橋になり、読み替え規則は 0020 の「テーマ」と合わせて二本になる
- `docs/adr/README.md` の一覧にある 0024 の行は `data/` のまま残す。
  0020 のとき 0005・0018 の行を書き換えなかったのと同じ扱いで、一覧は各レコードの語彙をそのまま写す
- 公開サイトの表示が変わる。
  `/about` のライセンス説明が置き場の名前を出している
- CI に影響は無い。
  `.github/workflows/` にパスの絞り込みが無く、`.worktreeinclude` も `mise.toml` も置き場を指していない

## 覆る条件

`catalog/` が項目の列挙でないもの——本文・画像・ビルドの生成物——を持つようになったとき。
目録という語が中身を覆えなくなるので、二層の切り方（0029）ごと問い直す。
