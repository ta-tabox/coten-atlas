/**
 * `/about` の「出典と引用の範囲」「ライセンス」の各文が、README の同名の節にも同じ文として載っていることのテストを置く。
 * 文言そのものが載っているかは `src/app/about/page.test.tsx` が見て、ここは二つの文書の食い違いだけを見る。
 *
 * 読み手が違う二つの文書（サイトを見た人とリポジトリを開いた人）に同じ表記を置くので、片方だけ直しても他の検査は赤にならない。
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const README_PATH = path.join(import.meta.dirname, "../../README.md");

import AboutPage from "@/app/about/page";

/** README と `/about` が同じ文を持つ節の見出し。 */
const SHARED_HEADINGS = ["出典と引用の範囲", "ライセンス"];

/**
 * README の `SHARED_HEADINGS` の節にある行を、`/about` の文と先頭から比べられる形で返す。
 *
 * 節が無ければ空配列を返す。
 */
function readmeLines(): string[] {
  const sections = readFileSync(README_PATH, "utf8").split(/^## /m);

  return sections
    .filter((section) =>
      SHARED_HEADINGS.some((heading) => section.startsWith(`${heading}\n`)),
    )
    .flatMap((section) => section.split("\n").slice(1))
    .map((line) =>
      line
        .replace(/（?\[[^\]]*\]\([^)]*\)）?/g, "")
        .replaceAll("`", "")
        .trim(),
    )
    .filter((line) => line !== "");
}

/**
 * `/about` の節の本文の文を、末尾の句点を外して返す。
 *
 * リンクの行は句点で終わらないので含まない。
 */
function aboutSentences(): string[] {
  const { container } = render(<AboutPage />);
  const paragraphs = [...container.querySelectorAll("main section p")];

  return paragraphs
    .map((paragraph) => paragraph.textContent ?? "")
    .filter((text) => text.endsWith("。"))
    .map((text) => text.slice(0, -1));
}

describe("/about と README の出典表記", () => {
  it("/about の各文を、README の同名の節のどれかの行が先頭に持つ", () => {
    const sentences = aboutSentences();
    const lines = readmeLines();

    expect(sentences.length).toBeGreaterThan(0);

    const missing = sentences.filter(
      (sentence) => !lines.some((line) => line.startsWith(sentence)),
    );

    expect(missing).toEqual([]);
  });
});
