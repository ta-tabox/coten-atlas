/**
 * 画面の幅がデスクトップの幅（`DESKTOP_MEDIA_QUERY`）かを返すフックを置く。
 *
 * 静的な書き出しで描く最初の HTML には画面の幅が無いので、サーバ側の値は false にする。
 */

import { useSyncExternalStore } from "react";
import { DESKTOP_MEDIA_QUERY } from "@/lib/map/config";

/** 画面の幅の条件が変わったときに `onChange` を呼ぶ購読を始め、止める関数を返す。 */
function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(DESKTOP_MEDIA_QUERY);

  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

/**
 * 画面の幅がデスクトップの幅なら true を返す。
 * 幅が変わると再描画する。
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
    () => false,
  );
}
