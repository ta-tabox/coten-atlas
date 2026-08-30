/**
 * 時代区分（era）の契約。
 * スライダーが動く一次元の空間を、隙間なく並んだ区間の列として持つ。
 *
 * 年は西暦の整数で、負値が紀元前を指す。
 * 列は年の昇順で、**前の区間の `end` と次の区間の `start` が一致していなければならない**。
 * スライダー位置から現在窓を出すのは区間内の線形補間なので、隙間があるとそこを指した位置に対応する年が存在せず、重なりがあると同じ年が二箇所から指される。
 *
 * 入口は parseEras。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/schema/duplicates";

/**
 * 時代区分 1 件。
 * `start` を含み `end` を含まない半開区間として扱う（隣と `end` == `start` で接するため）。
 */
export const eraSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    start: z.int(),
    end: z.int(),
  })
  .superRefine((era, ctx) => {
    if (era.start >= era.end) {
      ctx.addIssue({
        code: "custom",
        message: `era ${era.id} の区間に幅が無い（start=${era.start}, end=${era.end}）`,
      });
    }
  });

/**
 * 時代区分の列。
 * 隣り合う区間が接していることと、id が一意であることを見る。
 */
export const eraListSchema = z
  .array(eraSchema)
  .min(1)
  .superRefine((eras, ctx) => {
    for (const id of duplicatesOf(eras.map((era) => era.id))) {
      ctx.addIssue({ code: "custom", message: `id が重複している: ${id}` });
    }

    for (const [index, next] of eras.slice(1).entries()) {
      const previous = eras[index];

      if (previous.end !== next.start) {
        ctx.addIssue({
          code: "custom",
          message: `era ${previous.id} と ${next.id} が接していない（${previous.end} → ${next.start}）`,
        });
      }
    }
  });

export type Era = z.infer<typeof eraSchema>;
export type EraList = z.infer<typeof eraListSchema>;

/**
 * 時代区分の列を検査して返す。
 * 合わなければ、どの要素のどこが合わないかを添えて投げる。
 */
export function parseEras(input: unknown): EraList {
  const parsed = eraListSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `eras がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
