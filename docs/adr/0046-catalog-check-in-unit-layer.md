# 0046. `catalog/` の検査は独立した層にせず、L2 のユニットに置く

- **状態**: 採用
- **決定日**: 2026-08-30
- **関係する ADR**: 0009（判定の口を `pnpm check` へ移す）、0045（人間の目視は番号を持たない）、0030（データの置き場を `catalog/` にする。この決定の時点の名は `data/`）

## 文脈

`data/`（いまの `catalog/`）の現物がスキーマに合うかの検査は、素の node で走らせる `web/scripts/validate-data.ts` が担い、`HARNESS.md` の層構造では L2 ユニットと L4 ビルドの間に L3 データとして居た。
node は `tsconfig.json` の paths を読まないので、スクリプトから引く `web/src/lib/schema/` のスキーマ同士の import を相対パスへ曲げ、biome の相対 import 禁止から `src/lib/schema/**` を免除していた。

## 決定

`catalog/` の検査は `web/tests/catalog.test.ts` に置き、`vitest run`（L2）が回す。
連鎖へ別の段としては足さない。
`pnpm validate:catalog` はその 1 本だけを名指す切り分け用に残す。

## 理由

`HARNESS.md`「検証の層構造」に置いていた理由を原文のまま写す。

> `catalog/` の検査が L2 に居るのは、検査器が `web/src/lib/schema/` の zod スキーマそのもので、それを保証するのが同じ層の反例テストだから。
> 層を分けると、赤が出たときに「データが壊れている」のか「スキーマが壊れている」のかを人間が切り分けることになる。
> 型検査は `catalog/` を見ない（`tsconfig.json` の `include` が `web/` 配下しか見ない）ので、ここで拾わないとどの層にも掛からない。

採らなかった案。

- `tsx` を入れてスクリプトのまま import を `@` に寄せる ／ esbuild のビルドスクリプト承認が要り、CI を含む毎回の install で postinstall が走る
- L3 データの層を残す ／ 層が増えるたびに `HARNESS.md` の番号が繰り下がり、番号で指した ADR がずれる

## 帰結

- スキーマ同士も含めて import が `@/lib/schema/...` に揃い、biome の免除が消える
- 検査そのものの反例テストを同じ層に書ける
- 同じ検査を `pnpm check` の別の段として足すと二度走るので、足さない

## 覆る条件

`catalog/` の検査が vitest の起動より重くなり、切り分けのために連鎖の外へ出す方が安くなったとき。
