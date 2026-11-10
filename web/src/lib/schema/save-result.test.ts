import { describe, expect, it } from "vitest";
import { parseSaveResult } from "@/lib/schema/save-result";

describe("parseSaveResult", () => {
  it("理由の文の配列を持つ応答を受ける", () => {
    expect(parseSaveResult({ problems: ["理由"] })).toEqual({
      problems: ["理由"],
    });
  });

  it("problems を持たない応答は throw する", () => {
    expect(() => parseSaveResult({ ok: true })).toThrow();
  });
});
