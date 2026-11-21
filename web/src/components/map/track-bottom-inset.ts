/**
 * 地図の下端に重ねた要素の高さを、地図のコンテナの CSS 変数 `--map-bottom-inset` へ写す関数を置く。
 * `globals.css` が、この変数の分だけ MapLibre の右下の出典表記を持ち上げる。
 */

/**
 * `element` の高さを `--map-bottom-inset` へ写し続け、止める関数を返す。
 * 高さが変わるたびに更新し、止めると変数を消す。
 * `element` が null か `.maplibregl-map` の中に無ければ、何もせず undefined を返す。
 *
 * 出典表記は MapLibre が出す DOM のままにするので、重ねた要素の上へ逃がすには、高さを CSS へ渡すしかない。
 */
export function trackBottomInset(
  element: HTMLElement | null,
): (() => void) | undefined {
  const mapContainer = element?.closest<HTMLElement>(".maplibregl-map");

  if (element === null || mapContainer == null) {
    return undefined;
  }

  const observer = new ResizeObserver(() => {
    mapContainer.style.setProperty(
      "--map-bottom-inset",
      `${element.offsetHeight}px`,
    );
  });

  observer.observe(element);

  return () => {
    observer.disconnect();
    mapContainer.style.removeProperty("--map-bottom-inset");
  };
}
