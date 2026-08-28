# 0013. MapLibre の worker はこの器が配る（0012 を supersede）

- **状態**: 採用
- **決定日**: 2026-08-27
- **関係する ADR**: 0012（supersede する）、0003、0007

## 文脈

0012 は「v6 の worker が 404 になる」問題を、maplibre-gl を v5 系へ固定して避けた。
v6 の公開から数か月が経っており、この器は新しい版の恩恵を受けながら続いていきたい。
版を追う側に立つなら、避けるのではなく worker の配布をこの器が引き受ける必要がある。

worker が解決されない理屈は 0012 が持つ。

## 決定

v6 系を使い、worker はこの器が配る。三点で構成する。

- `pnpm dev` / `pnpm build` / `pnpm test` が、本体を走らせる前に `sync-map-worker` で worker とその依存を `web/public/` へ複製する
- 複製したファイルは追跡しない（`.gitignore`）
- 地図コンポーネントへ `workerUrl` で在り処を名指す。URL は `BASE_PATH` から組み立てる

複製するのは `maplibre-gl-worker.mjs` と `maplibre-gl-shared.mjs` の二つ。
worker は本体と共有するコードを後者へ切り出しており、worker だけを置くと今度は shared が 404 になる。
揃っているかは `web/tests/map-worker-assets.test.ts` が見る——worker の import 文を読み、参照先が `public/` にあるかを確かめるので、版が上がって依存が増えたときも赤で気付ける。

`BASE_PATH` は `web/src/lib/base-path.ts` が持ち、`next.config.ts` の `basePath` と worker の URL の両方がそこを見る。

## 理由

react-map-gl は `workerUrl` を受け取って `maplibregl.setWorkerUrl()` を呼ぶので、`maplibre-gl` をこちらから import せずに済む。
プリレンダの経路へ maplibre 本体が入らない性質を保てるため、`next/dynamic` の `ssr: false` は引き続き要らない。

複製先に `public/` を採るのは、static export が `out/` へそのまま持っていくため。
配信のためだけの経路を別に作らずに済む。

複製したファイルを追跡しないのは、依存を上げたときにコピーが古いまま残る形を作らないため。
追跡すると、版を上げた PR が worker の複製を忘れても機械判定は緑になる。

複製を `postinstall` に置かない。
pnpm は依存に変化が無い `install` でスクリプトを飛ばすので、「install したのにファイルが無い」状態が起こる。
走らせる口の側へ置けば、その口を通る限り必ず先に複製される。
`predev` のような npm の前段フックではなく各スクリプトの本体へ `&&` で繋ぐのは、定義を読めば複製が走ることが見えるようにするため。

v5 固定を続けない理由は、避け続ける限り v6 以降の機能を取れないことと、この配線が三点で閉じることの兼ね合いによる。

## 帰結

- `basePath` を変えるときは `base-path.ts` の一箇所で済む
- `next.config.ts` は `@/` を解決できないので `base-path.ts` を相対で読む。biome の相対 import 禁止からこのファイルを除外している
- `next build` を直に叩くと worker が配られない。口は `pnpm build`（`pnpm check` 経由）で一本のまま
- 画面が「attribution だけ乗った空白」になったら、まず worker の取得が 404 になっていないかを疑う
- source map（`.map`）は複製しない。shared の分だけで 2.4MB あり、配信物として引き合わない。DevTools を開いている間だけ 404 が出るが、実行には効かない

## 覆る条件

バンドラか react-map-gl が v6 の worker を自力で配るようになったとき。
そのときは複製と `workerUrl` を外し、`base-path.ts` は `basePath` の共有として残す。
