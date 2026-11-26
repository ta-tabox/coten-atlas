"use client";

/**
 * ツールチップを、代表点の上に画面の端からはみ出さない位置へ置く枠を描く。
 */

import { useLayoutEffect, useRef, useState } from "react";
import SeriesTooltip from "@/components/series-tooltip/SeriesTooltip";
import type { ScreenPoint } from "@/lib/map/overlap-candidates";
import { tooltipLeftOf } from "@/lib/map/tooltip-position";
import type { Series } from "@/lib/schema/series";

/**
 * ツールチップの下辺を、代表点の中心から上へ離す距離（px）。
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
 */
export default function SeriesTooltipOverlay({
  series,
  anchor,
}: SeriesTooltipOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // 位置は幅から決まるので、描画の前に幅を測って置き直す。
  // biome-ignore lint/correctness/useExhaustiveDependencies: 幅は中身のシリーズが変わったときだけ変わる。
  useLayoutEffect(() => {
    setWidth(ref.current?.offsetWidth ?? 0);
  }, [series]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-20 w-max -translate-y-full"
      style={{
        left: tooltipLeftOf(anchor.x, width, window.innerWidth),
        top: anchor.y - TOOLTIP_GAP_PX,
      }}
    >
      <SeriesTooltip series={series} />
    </div>
  );
}
