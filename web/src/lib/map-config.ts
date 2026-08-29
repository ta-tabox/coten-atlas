/**
 * ベースマップの接続先・初期表示位置・worker の在り処。
 *
 * 無償公開のタイルは API キーの要否も要求 attribution も提供元ごとに違うので、URL を差し替えるだけでは利用条件を満たせない。
 * 差し替えるときは docs/adr/0004-openfreemap-positron.md を先に読む。
 */

import { BASE_PATH } from "@/lib/base-path";

/**
 * ベースマップのスタイル定義（MapLibre style spec の JSON）の配信先。
 * タイルそのものの URL は、このスタイルが参照する TileJSON が持つ。
 * キーもリクエスト数の上限も持たない（#14「ベースマップの利用条件と attribution を確定する」で実取得して確認した）。
 */
export const BASEMAP_STYLE_URL =
  "https://tiles.openfreemap.org/styles/positron";

/**
 * 地図を最初に描くときのカメラ位置。
 * ユーラシアからアフリカまでが一望に入る値を選んである。
 */
export const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 30,
  zoom: 1.6,
} as const;

/**
 * MapLibre がタイルのデコードに使う worker の在り処。
 *
 * バンドラは maplibre の worker を成果物へ含めないので、このリポジトリが worker とその依存を `public/` へ複製して配る（docs/adr/0013-maplibre-worker-self-hosted.md）。
 * 渡さないと maplibre は自分のチャンク URL からの相対で worker を探し、404 の HTML を掴んで地図だけが描画されなくなる。
 */
export const MAP_WORKER_URL = `${BASE_PATH}/maplibre-gl-worker.mjs`;
