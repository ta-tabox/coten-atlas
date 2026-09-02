/**
 * @vitest-environment node
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { readInbox, writeInbox } from "@scripts/inbox";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FeedItem } from "@/lib/feed/schema";

const SYNCED_AT = "2026-09-02T11:19:23.902Z";

/** その日の inbox が書かれる先。 */
function inboxFile(directory: string): string {
  return path.join(directory, "2026-09-02.json");
}

/**
 * 未割当の回 1 件。
 * guid だけが突き合わせに効く。
 */
function item(guid: string): FeedItem {
  return {
    guid,
    title: `【番外編＃${guid}】まっすぐ！バングラデシュの教育現場より`,
    link: `https://podcasters.spotify.com/pod/show/coten/episodes/${guid}`,
    pubDate: "2026-08-19T21:00:00.000Z",
    audioUrl: `https://anchor.fm/s/8c2088c/podcast/play/1/${guid}.mp3`,
    season: null,
    episodeNumber: null,
    durationSec: null,
  };
}

let directory: string;

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), "inbox-"));
});

afterEach(() => {
  fs.rmSync(directory, { recursive: true, force: true });
});

describe("writeInbox", () => {
  it("置き場が空なら渡した回をそのまま並べる", () => {
    writeInbox(directory, SYNCED_AT, [item("a"), item("b")]);

    expect(readInbox(inboxFile(directory))).toHaveLength(2);
  });

  it("日付を名前にしたファイルへ書く", () => {
    const file = writeInbox(directory, SYNCED_AT, [item("a")]);

    expect(file).toBe(inboxFile(directory));
  });

  it("同じ日の 2 度目は、1 度目の回を残して新しい回だけ足す", () => {
    writeInbox(directory, SYNCED_AT, [item("a"), item("b")]);
    writeInbox(directory, SYNCED_AT, [item("c")]);

    const guids = readInbox(inboxFile(directory)).map((entry) => entry.guid);

    // 丸ごと書き換えると、まだ判定していない a と b がここで消える。
    expect(guids).toEqual(["a", "b", "c"]);
  });

  it("既に並んでいる guid を二重に足さない", () => {
    writeInbox(directory, SYNCED_AT, [item("a")]);
    writeInbox(directory, SYNCED_AT, [item("a"), item("b")]);

    const guids = readInbox(inboxFile(directory)).map((entry) => entry.guid);

    expect(guids).toEqual(["a", "b"]);
  });

  it("人間が書き足した欄が残っていれば投げて、上書きしない", () => {
    const file = writeInbox(directory, SYNCED_AT, [item("a")]);
    const edited = JSON.parse(fs.readFileSync(file, "utf8"));
    edited.episodes[0].memo = "あとで調べる";
    fs.writeFileSync(file, JSON.stringify(edited));

    expect(() => writeInbox(directory, SYNCED_AT, [item("b")])).toThrow();
    expect(JSON.parse(fs.readFileSync(file, "utf8")).episodes[0].memo).toBe(
      "あとで調べる",
    );
  });
});

describe("readInbox", () => {
  it("ファイルが無ければ空を返す", () => {
    expect(readInbox(inboxFile(directory))).toEqual([]);
  });

  it("JSON として壊れていれば在り処を添えて投げる", () => {
    const file = inboxFile(directory);
    fs.writeFileSync(file, '{ "episodes": [ broken');

    expect(() => readInbox(file)).toThrow(file);
  });
});
