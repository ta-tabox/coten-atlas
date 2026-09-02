import { describe, expect, it } from "vitest";
import { parseInbox } from "@/lib/schema/inbox";

/** 同期が書き出したままの 1 件。 */
const entry = {
  guid: "5d85b4e4-ec6a-4502-b075-36b7408d673b",
  title: "【番外編＃144】まっすぐ！バングラデシュの教育現場より②",
  season: null,
  link: "https://podcasters.spotify.com/pod/show/coten/episodes/144-e3l45dq",
};

/** 渡したエントリだけを持つ inbox 1 本。 */
function inboxOf(...episodes: unknown[]): unknown {
  return { syncedAt: "2026-09-02T11:19:23.902Z", episodes };
}

describe("parseInbox", () => {
  it("同期が書き出したままの形を通す", () => {
    expect(parseInbox(inboxOf(entry)).episodes).toHaveLength(1);
  });

  it("1 件も無い inbox を通す", () => {
    expect(parseInbox(inboxOf()).episodes).toEqual([]);
  });

  it("season を持つ回を通す", () => {
    expect(
      parseInbox(inboxOf({ ...entry, season: 66 })).episodes[0].season,
    ).toBe(66);
  });

  // ここから下は、人間が開いて編集したときに起きうる壊れ方。
  it("season が文字列の回を落とす", () => {
    expect(() => parseInbox(inboxOf({ ...entry, season: "66" }))).toThrow();
  });

  it("season が 0 以下の回を落とす", () => {
    expect(() => parseInbox(inboxOf({ ...entry, season: 0 }))).toThrow();
  });

  it("link が URL でない回を落とす", () => {
    expect(() =>
      parseInbox(inboxOf({ ...entry, link: "あとで調べる" })),
    ).toThrow();
  });

  it("guid の前後に空白が付いた回を落とす", () => {
    expect(() => parseInbox(inboxOf({ ...entry, guid: " abc " }))).toThrow();
  });

  it("題名が空の回を落とす", () => {
    expect(() => parseInbox(inboxOf({ ...entry, title: "" }))).toThrow();
  });

  it("覚え書きの欄を足した回を落とす", () => {
    expect(() =>
      parseInbox(inboxOf({ ...entry, memo: "あとで調べる" })),
    ).toThrow();
  });

  it("syncedAt が ISO 8601 でない inbox を落とす", () => {
    expect(() =>
      parseInbox({ syncedAt: "2026-09-02", episodes: [entry] }),
    ).toThrow();
  });
});
