"use client";

/**
 * ツールチップを、代表点の上に画面の端からはみ出さない位置へ置く枠を描く。
 */

import { useLayoutEffect, useRef, useState } from "react";
import SeriesTooltip from "@/components/series-tooltip/SeriesTooltip";
import type { ScreenPoint } from "@/lib/map/overlap-candidates";
import { tooltipLeftOf, tooltipTopOf } from "@/lib/map/tooltip-position";
import type { Series } from "@/lib/schema/series";

/**
 * ツールチップを、代表点の中心から離す距離（px）。
 * 円（半径 6px）に重ならない余白を残す。
 */
const TOOLTIP_GAP_PX = 12;

type SeriesTooltipOverlayProps = {
  series: Series[];
  /** ツールチップが指す代表点の、地図の左上からの位置。 */
  anchor: ScreenPoint;
};

/**
 * `series` のツールチップを、`anchor` の代表点の上に絶対配置して描く。
 * 幅は内容の幅のままにし、端に寄っても折り返さず、水平位置だけをずらす。
 * 上にヘッダーが重なる高さの点では、代表点の下へ置く。
 */
export default function SeriesTooltipOverlay({
  series,
  anchor,
}: SeriesTooltipOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // 位置は大きさから決まるので、描画の前に大きさを測って置き直す。
  // biome-ignore lint/correctness/useExhaustiveDependencies: 大きさが変わるのは中身のシリーズが変わったときだけで、同じ大きさなら状態は変わらない。
  useLayoutEffect(() => {
    const width = ref.current?.offsetWidth ?? 0;
    const height = ref.current?.offsetHeight ?? 0;

    // 親の描画のたびに別の配列が渡るので、同じ大きさなら状態を変えて再描画させない。
    setSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }, [series]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-20 w-max"
      style={{
        left: tooltipLeftOf(anchor.x, size.width, window.innerWidth),
        top: tooltipTopOf({
          pointY: anchor.y,
          tooltipHeight: size.height,
          gap: TOOLTIP_GAP_PX,
          topClearance:
            document.querySelector("header")?.getBoundingClientRect().bottom ??
            0,
        }),
      }}
    >
      <SeriesTooltip series={series} />
    </div>
  );
}
