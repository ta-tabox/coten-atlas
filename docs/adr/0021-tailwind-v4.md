# 0021. スタイルを Tailwind v4 で書く（0015 を supersede）

- **状態**: 採用
- **決定日**: 2026-08-31
- **関係する ADR**: 0001、0004、0014、0015

## 文脈

[0015](0015-css-modules.md) は CSS Modules で書き、CSS フレームワークを入れないと決めた。
そこで挙げた Tailwind への反対は三つで、うち二つは 0015 自身が否定している。
`output: "export"`（[0001](0001-nextjs-static-export.md)）との衝突は「v4 の生成は `next build` の中で閉じるので起きない」、`maplibre-gl.css` の破壊は「レイヤなしの規則がレイヤ付きの全規則に勝つので確度は低い」。
残るのは規模の一点だけで、8 コンポーネント・500 行はユーティリティクラスの採算点に届かない、というものだった。

その見積もりは人間が手で CSS を書く前提に立っている。
デザインを外部ツール（Stitch・Figma）で詰めることになり、その前提が消えた。
Stitch の出力は HTML + Tailwind CSS で、Figma も Dev Mode のプラグインが Tailwind を吐く（Figma variables を v4 の `@theme` へ変換するものがある）。
CSS Modules のままだと外部ツールの出力は毎回クラス名の読み替えになるが、Tailwind なら貼って整える作業になる。
0015 を書いた時点にこの文脈は無かった。

入れ替えの費用がいま最小である。
`web/` が持つ CSS は `src/app/globals.css` の `body { margin: 0 }` 1 規則だけで、`*.module.css` は 0 枚（2026-08-31 実測）。
0015 は「S4 が最初の 1 枚を置く」と決めていて、その適用はまだ始まっていない。

## 決定

**スタイルは Tailwind v4 のユーティリティで書く。0015 を supersede する。**

- 依存は `tailwindcss` と `@tailwindcss/postcss` の 2 つ。`web/postcss.config.mjs` がプラグインをビルドへ挿す
- `globals.css` は `@import "tailwindcss"` の 1 行にする。色・余白・重なり順のトークンは同じファイルの `@theme` へ置く（トークンの置き場を 1 箇所にする方針は 0015 から引き継ぐ）
- preflight は切らない
- `globals.css` の `body { margin: 0 }` は削る。preflight が同じことをする
- `MapCanvas` の `style` prop（寸法）は残す。`MapLibreMap` が `className` を公開していないので、逃がす先が無い（0015 に記載）
- `*.module.css` は置かない

## 理由

外部ツールの出力を語彙の変換なしに受けられる。
これが 0015 の前提を崩した唯一の変化で、他の理由はどれも 0015 の時点から動いていない。

0 枚のいま入れ替えれば、書き換える既存物がゼロで済む。
0015 の適用が S4 から始まる予定だったので、S4 より前に決めれば以後の UI 作業が全部同じ作法から始まる。

attribution が preflight で崩れないことを実測した。
0015 は「確度は低い」と評価しただけで確かめていない。
`https://tiles.openfreemap.org` へ出られる環境で開き、`MapLibre | OpenFreeMap © OpenMapTiles Data from OpenStreetMap` が白背景・12px/20px・右下 10px の余白で出ることを確認した（2026-08-31）。
背景色・余白・リンク色は `maplibre-gl.css` の値のままである。
`maplibre-gl.css` がレイヤなしで読み込まれ、Tailwind の生成物が全部 `@layer theme, base, components, utilities` に入るので、preflight の `*, ::before, ::after { margin: 0; padding: 0 }` が maplibre の規則に負ける。
0015 の机上の判断が実測で裏付いた形になる。

### CSS Modules を続けなかった理由

規模の見積もりが変わっていない以上、手書き前提なら 0015 の結論はいまも正しい。
覆したのは規模ではなく、CSS を誰が書くかである。

### preflight を切らなかった理由

ユーティリティは初期状態が正規化されていることを前提に値を決めている。
切ると外部ツールが吐いた出力の見え方と手元の実際がずれ、貼って整える作業が読み替えに戻る。
maplibre と当たる面は attribution の 1 箇所しかないので、そこ 1 箇所のために全体の前提を崩す対価が合わない。

### attribution を自前の React で出す案を採らなかった理由

`attributionControl: false` にして同じ文言を自分で書けば preflight と当たる面がゼロになるが、スタイル URL が要求する attribution を自動で拾う性質を失う。
[0004](0004-openfreemap-positron.md) の「覆る条件」で Carto へ倒したとき、文言の追随が手作業になる。
実測で崩れなかったので、この案を採る理由が無い。

## 帰結

- **`body { margin: 0 }` を削れたことが、Tailwind が効いた証拠になる**。preflight が margin を担うので、効いていなければ canvas が viewport 大で立たず L4 のスモーク（[0014](0014-e2e-offline-smoke.md)）が赤くなる。導入の成否を既存の機械判定だけで確定できる
- **`web/biome.json` に `css.parser.tailwindDirectives` を置く**。既定の Biome は `@theme` を構文エラーにするので、これが無いと最初のトークンを書いた人の `pnpm check` が落ちる。`@import "tailwindcss"` だけなら既定でも通るため、設定を省くと通る書き方と落ちる書き方が同じファイルに混在する（2026-08-31 実測）
- **`@theme` は使う画面が現れてから書く**。消費者が無いまま値を置くと、後から来た画面が既存の値に合わせる側に回る
- Biome の CSS 整形はそのまま効く。`includes` が `**` なので設定の追加は要らない（0015 の帰結を引き継ぐ）
- **CSS のコメントは機械が見ない**。`scripts/lint-comments.ts` の対象は `.ts` / `.tsx` / `.mts` だけなので、`CODING.md` のコメント規約は人間が守る（0015 の帰結を引き継ぐ）
- **attribution の崩れは機械では拾えない**。L4 が見るのは同一オリジンへの 4xx/5xx・console error・canvas 寸法の三点だけで、位置と背景はどれにも掛からない。守るのは人間の目視である
- ビルド依存にネイティブバイナリ（`@tailwindcss/oxide`）が 1 つ増える
- JSX のインラインスタイルは使わない。コンポーネント API が寸法や座標を要求する場合だけが例外（0015 の帰結を引き継ぐ）
- CSS-in-JS へは寄せない。実行時にスタイルを生成する層は `output: "export"` と噛み合わない（0015 の帰結を引き継ぐ）
- **この決定が扱うのは DOM のスタイルだけ**。`kind` による地物の描き分け（`ARCHITECTURE.md`「データモデル」）は MapLibre の layer paint プロパティなので、ユーティリティクラスでは書けない（0015 の帰結を引き継ぐ）

## 覆る条件

外部ツールでデザインを詰めるのをやめたとき。
Tailwind を採った理由がそれ一つなので、手書きへ戻るなら 0015 の結論がそのまま復活する。

preflight が maplibre の DOM を実際に壊したとき。
そのときは 0021 ごと覆すのではなく、attribution へ効く最小の規則を `globals.css` へ足すか、`attributionControl: false` と自前表示へ倒すかを新しい ADR で決める。
