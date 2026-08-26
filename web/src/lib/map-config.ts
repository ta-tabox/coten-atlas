/**
 * ベースマップの接続先と初期表示位置。
 *
 * 無償公開のタイルは API キーの要否も要求 attribution も提供元ごとに違うので、URL を差し替えるだけでは利用条件を満たせない。
 * 差し替えるときは docs/adr/0004-openfreemap-positron.md を先に読む。
 */

/** キーもリクエスト数の上限も持たない（#14「ベースマップの利用条件と attribution を確定する」で実取得して確認した）。 */
export const BASEMAP_STYLE_URL =
  "https://tiles.openfreemap.org/styles/positron";

/** ユーラシアからアフリカまでが一望に入る位置。 */
export const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 30,
  zoom: 1.6,
} as const;
