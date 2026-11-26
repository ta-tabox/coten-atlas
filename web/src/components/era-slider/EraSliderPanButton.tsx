"use client";

/**
 * 拡大した era スライダーの表示範囲を、過去か未来の向きへずらすボタン 1 つを描く部品を置く。
 * ずらす幅と向きは持たず、呼び出し側が `onClick` で決める。
 */

import type { ReactNode } from "react";

type EraSliderPanButtonProps = {
  /** 画面に文字を出さないので、読み上げの名前になる文。 */
  label: string;
  /** 拡大しているときだけ true にして、幅を持たせる。 */
  isShown: boolean;
  /** これ以上ずらせない端にいるとき true にする。 */
  isDisabled: boolean;
  /** トラックとの境目の線を描く側。 */
  edge: "start" | "end";
  icon: ReactNode;
  onClick: () => void;
};

/** 拡大していないあいだは幅 0 で隠れ、拡大すると幅を広げて現れるボタン。 */
export default function EraSliderPanButton({
  label,
  isShown,
  isDisabled,
  edge,
  icon,
  onClick,
}: EraSliderPanButtonProps) {
  const shownClass = edge === "start" ? "w-6 border-r" : "w-6 border-l";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={!isShown || isDisabled}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center overflow-hidden border-rule bg-rule/25 text-ink-muted transition-[width,opacity,background-color,color] duration-200 ease-out-expo enabled:hover:bg-point/10 enabled:hover:text-point enabled:active:bg-point/20 disabled:text-ink-muted/40 ${isShown ? `${shownClass} opacity-100` : "pointer-events-none w-0 opacity-0"}`}
    >
      {icon}
    </button>
  );
}
