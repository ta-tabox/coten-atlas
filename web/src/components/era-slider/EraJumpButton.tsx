"use client";

/**
 * era スライダーの端へ一度で移るボタン 1 つを描く部品を置く。
 * 押したときの移動先は持たず、呼び出し側が `onClick` で決める。
 */

import type { ReactNode } from "react";

type EraJumpButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

/** 文言を画面に出し、同じ文言を読み上げの名前にするボタン。 */
export default function EraJumpButton({
  children,
  onClick,
}: EraJumpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-control border border-rule bg-paper px-2 py-1.5 text-[0.7rem] whitespace-nowrap text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point"
    >
      {children}
    </button>
  );
}
