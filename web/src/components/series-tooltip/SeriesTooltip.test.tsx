import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SeriesTooltip from "@/components/series-tooltip/SeriesTooltip";
import { type Series, TIME_RANGE_UNTIMED } from "@/lib/schema/series";

const ALEXANDER: Series = {
  id: "alexander",
  title: "アレクサンドロス大王",
  anchor: "pella",
  timeRange: { start: -356, end: -323 },
  region: "ヨーロッパ",
  season: 1,
  links: {},
  tags: [],
};

const OKANE: Series = {
  ...ALEXANDER,
  id: "okane-no-rekishi",
  title: "お金の歴史",
  timeRange: TIME_RANGE_UNTIMED,
};

describe("SeriesTooltip", () => {
  it("タイトルと、単位「年」を付けない年代を出す", () => {
    render(<SeriesTooltip series={[ALEXANDER]} />);

    expect(screen.getByRole("tooltip").textContent).toBe(
      "アレクサンドロス大王前356〜前323",
    );
  });

  it("時期を持たないシリーズは、年代を出さずタイトルだけを出す", () => {
    render(<SeriesTooltip series={[OKANE]} />);

    expect(screen.getByRole("tooltip").textContent).toBe("お金の歴史");
  });
});
