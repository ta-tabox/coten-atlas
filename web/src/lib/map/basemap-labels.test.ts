/**
 * ベースマップのスタイルの地名を日本語にする関数のテストを置く。
 * レイヤの形は OpenFreeMap の positron のスタイルから写した。
 */

import { describe, expect, it } from "vitest";
import { toJapaneseLabelStyle } from "@/lib/map/basemap-labels";

/** positron の地名のレイヤが持つ、`name:nonlatin` の有無で 1 行か 2 行かを分ける `text-field`。 */
const POSITRON_NAME_FIELD = [
  "case",
  ["has", "name:nonlatin"],
  ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
  ["coalesce", ["get", "name_en"], ["get", "name"]],
];

const COUNTRY_LABEL = {
  id: "label_country_1",
  type: "symbol",
  source: "openmaptiles",
  layout: {
    "text-field": POSITRON_NAME_FIELD,
    "text-font": ["Noto Sans Bold"],
    "text-max-width": 6.25,
  },
};

const ROAD_NUMBER = {
  id: "highway_shield",
  type: "symbol",
  source: "openmaptiles",
  layout: { "text-field": ["to-string", ["get", "ref"]] },
};

const BACKGROUND = {
  id: "background",
  type: "background",
  paint: { "background-color": "#f8f4f0" },
};

/** `layers` を持つスタイルを作る。 */
function styleOf(...layers: { type: string }[]) {
  return { version: 8, sources: {}, layers };
}

describe("toJapaneseLabelStyle", () => {
  it("positron の地名のレイヤの text-field を、日本語名・ラテン文字・現地の名前の順に選ぶ式にする", () => {
    const [label] = toJapaneseLabelStyle(styleOf(COUNTRY_LABEL)).layers;

    expect(label).toEqual({
      ...COUNTRY_LABEL,
      layout: {
        ...COUNTRY_LABEL.layout,
        "text-field": [
          "coalesce",
          ["get", "name:ja"],
          ["get", "name:latin"],
          ["get", "name"],
        ],
      },
    });
  });

  it("道路番号のレイヤと symbol でないレイヤは、入力と同じ値のまま残る", () => {
    const style = styleOf(ROAD_NUMBER, BACKGROUND);

    expect(toJapaneseLabelStyle(style).layers).toEqual([
      ROAD_NUMBER,
      BACKGROUND,
    ]);
  });

  it("入力のスタイルを書き換えない", () => {
    const style = styleOf(COUNTRY_LABEL, ROAD_NUMBER);
    const before = structuredClone(style);

    toJapaneseLabelStyle(style);

    expect(style).toEqual(before);
    expect(COUNTRY_LABEL.layout["text-field"]).toBe(POSITRON_NAME_FIELD);
  });

  it("スタイルのレイヤ以外の欄は入力のまま返す", () => {
    const style = styleOf(COUNTRY_LABEL);

    expect(toJapaneseLabelStyle(style)).toMatchObject({
      version: 8,
      sources: {},
    });
  });
});
