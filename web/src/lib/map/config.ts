/**
 * 公開の地図と管理画面の地図が MapLibre へ渡す、ベースマップの接続先・初期表示位置・worker の URL の定数を置く。
 *
 * 無償公開のタイルは API キーの要否も要求 attribution も提供元ごとに違うので、URL を差し替えるだけでは利用条件を満たせない。
 * OpenFreeMap を採った理由は docs/adr/20260823-openfreemap-positron.md が持つ。
 */

import { BASE_PATH } from "@/lib/base-path";

/**
 * ベースマップのスタイル定義（MapLibre style spec の JSON）の配信先。
 * タイルそのものの URL は、このスタイルが参照する TileJSON が持つ。
 * キーもリクエスト数の上限も持たない。
 */
export const BASEMAP_STYLE_URL =
  "https://tiles.openfreemap.org/styles/positron";

/**
 * 地図を最初に描くときのカメラ位置（経度・緯度は度、ズームは MapLibre の段階）。
 * ユーラシアからアフリカまでが一望に入る値を選んである。
 */
export const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 30,
  zoom: 1.6,
} as const;

/**
 * デスクトップの幅で、一覧パネルの右端までの画面の左端からの距離（px）。
 * 一覧パネルが開いている間、MapLibre の `padding.left` に渡し、点を描く範囲を一覧パネルの右側に限る。
 *
 * `MapCanvas` が一覧パネルを置く位置（`left-4`）と `SeriesPanel` の幅（18rem）と枠線（左右 1px ずつ）の和で、ルートの文字の大きさが 16px のときの値になる。
 * 一致は `tests/smoke/panel-clearance.spec.ts` が見る。
 */
export const PANEL_RIGHT_EDGE_PX = 306;

/**
 * デスクトップの幅とみなす画面の条件（Tailwind の `md`）。
 * この幅に満たない画面の一覧パネルの置き場は、地図の視野を動かさない。
 */
export const DESKTOP_MEDIA_QUERY = "(min-width: 48rem)";

/**
 * 公開画面の地図で拡大できる最大のズーム。
 *
 * 事物の点は「どの場所の話か」を示す目印なので、建物の水準まで拡大させると、点が値の持つ確からしさ以上の位置を指すように読める。
 * 10 は、同じ都市の中で 1.4〜1.8 km 離れた事物の点（例: フォロ・ロマーノとローマ）が分かれて見える最小のズームである。
 */
export const PUBLIC_MAP_MAX_ZOOM = 10;

/**
 * MapLibre がタイルのデコードに使う worker の在り処。
 *
 * バンドラは maplibre の worker を成果物へ含めないので、このリポジトリが worker とその依存を `public/` へ複製して配る。
 * 渡さないと maplibre は自分のチャンク URL からの相対で worker を探し、404 の HTML を掴んで地図だけが描画されなくなる。
 */
export const MAP_WORKER_URL = `${BASE_PATH}/maplibre-gl-worker.mjs`;
