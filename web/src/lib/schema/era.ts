/**
 * 時代区分（era）のスキーマ。
 * スライダーが動く一次元の空間を、隙間なく並んだ区間の列として持つ。
 *
 * 年は西暦の整数で、負値が紀元前を指す。
 * 列は年の昇順で、前の区間の `end` と次の区間の `start` が一致していなければならない。
 * スライダー位置から現在窓を出すのは区間内の線形補間なので、隙間があるとそこを指した位置に対応する年が存在せず、重なりがあると同じ年が二箇所から指される。
 *
 * 最後の era だけは `end` に `ERA_END_PRESENT` を置ける。
 * まだ終わっていない時代へ終わりの年を書くと、その年が来たときに確かめ直す作業が残る。
 *
 * 手書きの書き間違いは黙って捨てられるとどこにも映らないので、スキーマに無いキーは落とす。
 *
 * 入口は parseEras。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/duplicates";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/**
 * まだ終わっていないことを表す `end` の値。
 * 消費側がこの綴りを直に書かなくて済むよう、名前で配る。
 */
export const ERA_END_PRESENT = "present";

/**
 * 区間の終わり。
 * 西暦の整数か、まだ終わっていないことを表す印。
 */
const eraEndSchema = z.union([z.int(), z.literal(ERA_END_PRESENT)]);

/**
 * 時代区分 1 件。
 * 幅の検査が効くのは `end` が年のときだけで、終わっていない区間はどの年より後ろにも伸びうる。
 */
export const eraSchema = z
  .strictObject({
    id: trimmedNonEmptyStringSchema,

    /** スライダーに出す時代の名前。 */
    label: trimmedNonEmptyStringSchema,

    /** 区間の始まりの年（この年を含む）。 */
    start: z.int(),

    /**
     * 区間の終わりの年（この年を含まない）。
     * 末尾の区間だけ `ERA_END_PRESENT` を置ける。
     */
    end: eraEndSchema,
  })
  .superRefine((era, ctx) => {
    if (era.end !== ERA_END_PRESENT && era.start >= era.end) {
      ctx.addIssue({
        code: "custom",
        message: `era ${era.id} の区間に幅が無い（start=${era.start}, end=${era.end}）`,
      });
    }
  });

/**
 * 時代区分の列。
 * 隣り合う区間が接していること、id が一意であること、終わっていない区間が末尾にしか無いことを見る。
 */
export const eraListSchema = z
  .array(eraSchema)
  // 空の列を許すと、スライダーが動く空間そのものが無くなる。
  .min(1)
  .superRefine((eras, ctx) => {
    for (const id of duplicatesOf(eras.map((era) => era.id))) {
      ctx.addIssue({ code: "custom", message: `id が重複している: ${id}` });
    }

    for (const [index, next] of eras.slice(1).entries()) {
      const previous = eras[index];

      // 終わっていない区間の後ろに区間を置くと、その区間がどこから始まるとも言えなくなる。
      if (previous.end === ERA_END_PRESENT) {
        ctx.addIssue({
          code: "custom",
          message: `era ${previous.id} は終わっていないので、後ろに ${next.id} を置けない`,
        });
        continue;
      }

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
