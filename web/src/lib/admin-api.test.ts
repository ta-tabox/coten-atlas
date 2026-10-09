/**
 * 保存の API を呼ぶ関数が、応答の理由の文と、届かなかったときの理由の文を返すかを見る。
 * API の本体が保存するかは `src/lib/catalog-dir.test.ts` が見る。
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { postLocusMove } from "@/lib/admin-api";

/** グローバルの `fetch` を、本文が `body` の応答を返すモックに差し替える。 */
function stubFetchJson(body: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(Response.json(body))),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("postLocusMove", () => {
  it("保存できた応答なら空配列を返す", async () => {
    stubFetchJson({ problems: [] });

    const problems = await postLocusMove({
      id: "hagi",
      coordinates: [131, 34],
    });

    expect(problems).toEqual([]);
  });

  it("保存しなかった応答なら、応答の理由の文をそのまま返す", async () => {
    stubFetchJson({ problems: ["事物 nowhere が loci.geojson に無い"] });

    const problems = await postLocusMove({
      id: "nowhere",
      coordinates: [131, 34],
    });

    expect(problems).toEqual(["事物 nowhere が loci.geojson に無い"]);
  });

  it("応答の形が違えば、保存の API を呼べなかった旨を理由の文にして返す", async () => {
    stubFetchJson({ ok: true });

    const problems = await postLocusMove({
      id: "hagi",
      coordinates: [131, 34],
    });

    expect(problems).toEqual([
      expect.stringMatching(/^保存の API を呼べなかった/),
    ]);
  });

  it("fetch が reject すれば、保存の API を呼べなかった旨を理由の文にして返す", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
    );

    const problems = await postLocusMove({
      id: "hagi",
      coordinates: [131, 34],
    });

    expect(problems).toEqual([
      expect.stringMatching(/^保存の API を呼べなかった.*Failed to fetch$/),
    ]);
  });
});
