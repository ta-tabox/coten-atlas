import { describe, expect, it } from "vitest";
import {
  CATALOG_VALIDATORS,
  unvalidatedNames,
} from "@/lib/schema/catalog-files";

describe("unvalidatedNames", () => {
  it("対応表に載っているファイルは漏れとして返さない", () => {
    expect(unvalidatedNames([...CATALOG_VALIDATORS.keys()])).toEqual([]);
  });

  it("検査する口を持たないデータファイルを名指しで返す", () => {
    expect(unvalidatedNames(["eras.json", "regions.json"])).toEqual([
      "regions.json",
    ]);
  });

  it("geojson も拾う", () => {
    expect(unvalidatedNames(["borders.geojson"])).toEqual(["borders.geojson"]);
  });

  it("データでない添え物は数えない", () => {
    expect(unvalidatedNames(["LICENSE", "README.md"])).toEqual([]);
  });

  it("複数の漏れを名前順で返す", () => {
    expect(unvalidatedNames(["b.json", "a.json"])).toEqual([
      "a.json",
      "b.json",
    ]);
  });
});
