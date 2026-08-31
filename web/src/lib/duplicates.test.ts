import { describe, expect, it } from "vitest";
import { duplicatesOf } from "@/lib/duplicates";

describe("duplicatesOf", () => {
  it("重複が無ければ空を返す", () => {
    expect(duplicatesOf(["a", "b", "c"])).toEqual([]);
  });

  it("二度使われた値を拾う", () => {
    expect(duplicatesOf(["a", "b", "a"])).toEqual(["a"]);
  });

  it("三度以上使われた値も 1 回だけ返す", () => {
    expect(duplicatesOf(["a", "a", "a", "b", "b"])).toEqual(["a", "b"]);
  });
});
