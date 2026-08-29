# 0012. maplibre-gl は v5 系に固定する

- **状態**: supersede 済み（→ 0013）
- **決定日**: 2026-08-27
- **関係する ADR**: 0003（地図ライブラリ）、0001（static export）

## 文脈

maplibre-gl v6 は worker を本体から切り離し、`maplibre-gl-worker.mjs` という別ファイルを `import.meta.url` からの相対で取りに行く。
バンドル後の `import.meta.url` は Turbopack が吐いたチャンクの URL なので、worker は `/_next/static/chunks/maplibre-gl-worker.mjs` を指す。
そこにファイルは無く、dev サーバも static export もそのパスへ HTML（404 ページ）を返す。
ブラウザは `Failed to load module script: The server responded with a non-JavaScript MIME type of "text/html"` を出し、worker が起動しない。

worker はタイルのデコードを担うので、無いと地図は描画されない。
スタイル・TileJSON・スプライトの取得と attribution の表示だけは成功するため、画面には attribution が乗った空白が出る。

v5 系は worker を本体へインライン化しており、この経路を持たない（別ファイルの worker は CSP 版だけが使う）。

## 決定

`web/package.json` の `maplibre-gl` を `^5` に固定する。
caret は major を跨がないので、`pnpm update` では v6 へ上がらない。

## 理由

v6 を使うなら、バンドラへ worker の配布先を教える配線が要る——worker を `public/` へ複製するビルド前スクリプト、`setWorkerUrl` の呼び出し、そこへ渡す basePath の共有の三つ。
配線が増えるだけでなく、`basePath` が絡む URL を手で組み立てる箇所が生まれる。
GitHub Pages はリポジトリ名を挟む場所へ配信する（ADR-0007）ので、この URL がずれると本番だけ地図が出ない事故に戻る。

v5 は配線ゼロで同じことができる。
react-map-gl 8 の peer 宣言は `maplibre-gl >= 1.13.0` なので、v5 は対応範囲の内側にある。

## 帰結

- v6 で入った機能（globe 投影など）は使えない
- 依存を上げるときは major を跨がせない。跨ぐなら worker の配布をこのリポジトリが引き受ける
- 画面が「attribution だけ乗った空白」になったら、まず worker の取得が 404 になっていないかを疑う

## 覆る条件

react-map-gl か Next.js の側が v6 の worker を解決するようになったとき。
または、このリポジトリが worker の配布を引き受けると決めたとき（globe 投影のように v6 でしか得られないものが要るようになった場合）。
