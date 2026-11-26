"use client";

/**
 * era スライダーの見出しに並べる、枠も背景も持たないアイコンのボタン 1 つを描く部品を置く。
 * 押したときの動作は持たず、呼び出し側が `onClick` で決める。
 */

import type { ReactNode } from "react";

type EraSliderIconButtonProps = {
  /** 画面に文字を出さないので、読み上げの名前になる文。 */
  label: string;
  icon: ReactNode;
  /** 渡すと、押した状態を伝えるトグルのボタンになり、押した状態では色が変わる。 */
  isPressed?: boolean;
  onClick: () => void;
};

/** マウスを載せると背景が出て、押した状態では文字色が変わるアイコンのボタン。 */
export default function EraSliderIconButton({
  label,
  icon,
  isPressed,
  onClick,
}: EraSliderIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isPressed}
      onClick={onClick}
      className="grid size-6.5 cursor-pointer place-items-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-rule/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point aria-pressed:text-point"
    >
      {icon}
    </button>
  );
}
