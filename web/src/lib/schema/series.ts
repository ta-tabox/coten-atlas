/**
 * コテンラジオの 1 シリーズのスキーマ。
 * `data/series.json` の形を、実行時に検査できるかたちで持つ。
 *
 * 年は西暦の整数で、負値が紀元前を表す（0 年は暦に存在しないが、区別しても得るものが無いので許す）。
 * 地図へ置く図形は持たない。
 * 図形は事物の側にあり、`locus.ts` が持つ（docs/adr/0027-series-and-loci.md）。
 * zod の既定は未知のキーを黙って捨て、手書きの書き間違いや規約外の欄の混入がどこにも映らないので、スキーマに無いキーは落とす。
 *
 * 描画も RSS 同期もこの形だけを前提にしてよい。
 * 渡された値を検査するだけで `data/` の在り処は呼ぶ側が知るので、ファイルの読み込み口はここが持たない。
 * 入口は parseSeries。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/duplicates";
import { linksSchema } from "@/lib/schema/link";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/**
 * 位置なしを表す `anchor` の値。
 * 消費側がこの文字列を直に書かなくて済むよう、名前で配る。
 */
export const ANCHOR_UNLOCATED = "unlocated";

/**
 * 描画スタイルの分岐キー。
 * 場所が一意に決まるかどうかだけを分ける（docs/adr/0023-kind-place-or-concept.md）。
 */
export const seriesKindSchema = z.enum(["place", "concept"]);

/**
 * シリーズが扱う年代の範囲。
 * 負値は紀元前を指す。
 * start == end の 1 年の出来事を表せるよう、両端を含む閉区間とする。
 * era の区間は半開（end を含まない）なので、重なりを判定する側は端の扱いを混同しない。
 */
export const seriesTimeRangeSchema = z
  .strictObject({
    start: z.int(),
    end: z.int(),
  })
  .superRefine((range, ctx) => {
    if (range.start > range.end) {
      ctx.addIssue({
        code: "custom",
        message: `timeRange が逆転している（start=${range.start} > end=${range.end}）`,
      });
    }
  });

/**
 * シリーズ 1 件。
 * 地図の描画・一覧パネル・詳細カード・RSS 同期の全部がここを読む。
 */
export const seriesSchema = z.strictObject({
  /** エピソードの `seriesId` と事物の `seriesId` が指す先。 */
  id: trimmedNonEmptyStringSchema,

  /**
   * シリーズ名。
   * 番組から引いてよいのは題号までなので、説明文をここへ入れない（docs/adr/0008-quote-titles-only.md）。
   */
  title: trimmedNonEmptyStringSchema,

  /**
   * 描画スタイルの分岐キー。
   * `concept` は場所が一意に決まらないもので、控えめに描く（docs/adr/0023-kind-place-or-concept.md）。
   */
  kind: seriesKindSchema,

  /**
   * 代表点の事物 id か、位置なしを表す `ANCHOR_UNLOCATED`。
   * そのシリーズの事物のうちどれが代表点かを示す印であって、シリーズと事物の紐づけではない（docs/adr/0027-series-and-loci.md）。
   * 紐づけは事物側の `seriesId` が担う。
   * 指す先が実在するかは 2 つのファイルを並べないと見えないので、`references.ts` が見る。
   */
  anchor: trimmedNonEmptyStringSchema,

  /**
   * シリーズが扱う年代の範囲。
   * era スライダーの現在窓との重なり率（0..1）をイージングに通した値が、表示 opacity になる。
   */
  timeRange: seriesTimeRangeSchema,

  /**
   * 自前で書く要約。
   * 番組の説明文を引かない代わりに置いた欄なので、書かれるまでは空である（docs/adr/0008-quote-titles-only.md）。
   */
  summary: z.string(),

  /**
   * 大まかな地域名。
   * `tags` と並べて、近接の判定（関連シリーズ行）が読む。
   */
  region: trimmedNonEmptyStringSchema,

  /**
   * 割当キーになる `itunes:season` の値（docs/adr/0018-season-as-assignment-key.md）。
   * 1 シリーズ = 1 値で、複数を束ねない。
   */
  season: z.int().positive(),

  /**
   * 配信ページへの導線。
   * 配信側にシリーズ単位のページが無いので、指す先は未決定である（当面は空）。
   */
  links: linksSchema,

  /**
   * 主題のラベル。
   * 主題の近さは地図にも era スライダーにも現れないので、これだけが表す。
   */
  tags: z.array(trimmedNonEmptyStringSchema),
});

/**
 * シリーズ全件。
 * `eras.json` と同じ素の配列で、GeoJSON ではない。
 *
 * `id` と `season` の重複をここで落とす。
 * `id` はエピソードと事物が指す先の鍵で、`season` は同期が組む season → seriesId の索引の鍵なので、どちらも重複すると引いた先が一つに定まらない。
 */
export const seriesListSchema = z
  .array(seriesSchema)
  .superRefine((list, ctx) => {
    for (const id of duplicatesOf(list.map((series) => series.id))) {
      ctx.addIssue({ code: "custom", message: `id が重複している: ${id}` });
    }

    for (const season of duplicatesOf(list.map((series) => series.season))) {
      ctx.addIssue({
        code: "custom",
        message: `season が複数のシリーズに割り当てられている: ${season}`,
      });
    }
  });

export type Series = z.infer<typeof seriesSchema>;
export type SeriesList = z.infer<typeof seriesListSchema>;
export type SeriesTimeRange = z.infer<typeof seriesTimeRangeSchema>;

/**
 * シリーズ全件を検査して返す。
 * 合わなければ、どの要素のどこが合わないかを添えて投げる。
 */
export function parseSeries(input: unknown): SeriesList {
  const parsed = seriesListSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `series がスキーマに合わない\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
