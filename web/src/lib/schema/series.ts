/**
 * コテンラジオのシリーズを書く `catalog/series.json` の zod スキーマと、欄に置ける値の定数と、検査の関数を置く。
 * `catalog/series.json` の形を、実行時に検査できるかたちで持つ。
 *
 * 年は西暦の整数で、負値が紀元前を表す（0 年は暦に存在しないが、区別しても得るものが無いので許す）。
 * 地図へ置く図形は持たない。
 * 図形は事物の側にあり、`locus.ts` が持つ。
 * zod の既定は未知のキーを黙って捨て、手書きの書き間違いや規約外の欄の混入がどこにも映らないので、スキーマに無いキーは拒否する。
 *
 * 描画も RSS 同期もこの形だけを前提にしてよい。
 * 渡された値を検査するだけで `catalog/` のパスは呼ぶ側が知るので、ファイルを読み込む関数はここが持たない。
 * 入口は parseSeries。
 */

import * as z from "zod";
import { duplicatesOf } from "@/lib/schema/duplicates";
import { linksSchema } from "@/lib/schema/link";
import { trimmedNonEmptyStringSchema } from "@/lib/schema/text";

/**
 * シリーズが地図に代表点を持たないことを、`anchor` に置いて表す値。
 * 消費側がこの文字列を直に書かなくて済むよう、名前で配る。
 */
export const ANCHOR_UNLOCATED = "unlocated";

/**
 * シリーズが年代を持たないことを、`timeRange` に年の範囲の代わりに置いて表す値。
 * 置けるのは種別が `概念史` だけで位置なしのシリーズに限る。
 * 限る理由は docs/adr/20260910-untimed-concept-series.md が持つ。
 */
export const TIME_RANGE_UNTIMED = "untimed";

/**
 * `series.json` の `region` の欄に置ける区画の名前の並び。
 * 陸地を重ならないように割った 12 の区画と、区画を一つ選ぶと嘘になるシリーズが使う `地域なし` である。
 * 区画の境目は `.claude/skills/series-vocabulary/SKILL.md` の手順 6 が持つ。
 * 値を足すときは、この一覧と同じスキルの一覧を両方書き換え、足す理由を新しい ADR に書く。
 */
export const SERIES_REGIONS = [
  "日本",
  "朝鮮半島",
  "中国",
  "東南アジア",
  "南アジア",
  "中央ユーラシア",
  "西アジア",
  "アフリカ",
  "ヨーロッパ",
  "北アメリカ",
  "南アメリカ",
  "オセアニア",
  "地域なし",
] as const;

/** `SERIES_REGIONS` のうち、区画を一つ選ぶと嘘になるシリーズが置く値。 */
export const REGION_NONE = "地域なし" satisfies (typeof SERIES_REGIONS)[number];

/**
 * 詳細カードが `region` を札として出すので、表記のゆれで同じ区画が別の札にならないよう `SERIES_REGIONS` の閉じた集合に限る。
 */
export const seriesRegionSchema = z.enum(SERIES_REGIONS);

/**
 * `tags` へ最低 1 つ入れる種別。
 * そのシリーズの主語が誰かを表す。
 */
export const SERIES_CATEGORY_TAGS = [
  "人物",
  "集団",
  "出来事",
  "概念史",
] as const;

/**
 * `tags` へ入れない時代名。
 * `eras.json` の区分と同じ粒度の語で、`timeRange` と era スライダーが既に表す。
 * `幕末` や `三国志` のようにそれより細かい時代の名は、主題として入れてよい。
 */
const ERA_GRADE_TAGS = [
  "先史",
  "古代",
  "中世",
  "近世",
  "近代",
  "19世紀",
  "20世紀",
  "戦後",
];

/**
 * 1 シリーズの `tags` の数の上限で、種別のタグも数に含める。
 * tag 絞り込みのパネルは現在窓のタグを全部並べるので、1 件あたりを絞らないと一覧が読めなくなる。
 */
const MAX_TAGS = 4;

/**
 * `title` に残さない番組内のコーナー名。
 * `title` はシリーズの主題を指す名の列で、コーナー名は主題でない。
 */
const TITLE_PREFIXES = ["ショート", "ジンブンガク"];

/**
 * シリーズの `timeRange` に置く、`start` と `end` の年の組の zod スキーマ。
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
 * `catalog/series.json` の要素 1 件の zod スキーマ。
 * 地図の描画・一覧パネル・詳細カード・RSS 同期の全部がここを読む。
 */
export const seriesSchema = z
  .strictObject({
    /** エピソードの `seriesId` と事物の `seriesId` が指す先。 */
    id: trimmedNonEmptyStringSchema,

    /**
     * シリーズの主題の名で、番組の題の「〇〇編」から「編」とコーナー名を除いた語。
     * 番組から引用してよいのは題号までなので、説明文をここへ入れない。
     */
    title: trimmedNonEmptyStringSchema,

    /**
     * 代表点の事物 id か、位置なしを表す `ANCHOR_UNLOCATED`。
     * そのシリーズの事物のうちどれが代表点かを示す欄であって、シリーズと事物の紐づけではない。
     * 紐づけは事物側の `seriesId` が担う。
     * 指す先が実在するかは 2 つのファイルを並べないと見えないので、`references.ts` が見る。
     */
    anchor: trimmedNonEmptyStringSchema,

    /**
     * era スライダーの現在窓と比べる、シリーズが扱う年代の範囲（時期を持たなければ `TIME_RANGE_UNTIMED`）。
     * era スライダーの現在窓との重なり率（0..1）をイージングに通した値が、表示 opacity になる。
     */
    timeRange: z.union([seriesTimeRangeSchema, z.literal(TIME_RANGE_UNTIMED)]),

    /**
     * そのシリーズが扱う地理の広がりを表す区画。
     * 代表点の在り処ではないので、`anchor` の値とは独立に決まる。
     * `tags` と並べて、近接の判定（関連シリーズ行）が読む。
     */
    region: seriesRegionSchema,

    /**
     * 割当キーになる `itunes:season` の値。
     * 1 シリーズ = 1 値で、複数を束ねない。
     */
    season: z.int().positive(),

    /**
     * シリーズ単位の配信ページの URL を、配信基盤ごとに持つ欄。
     * 配信側にシリーズ単位のページが無いので、指す先は未決定である（当面は空）。
     */
    links: linksSchema,

    /**
     * 種別と主題のラベル。
     * 主題の近さは地図にも era スライダーにも現れないので、これだけが表す。
     */
    tags: z.array(trimmedNonEmptyStringSchema),
  })
  .superRefine((series, ctx) => {
    const prefix = TITLE_PREFIXES.find((name) => series.title.startsWith(name));

    if (prefix !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: `title が番組内のコーナー名で始まっている: ${prefix}`,
      });
    }

    if (series.timeRange === TIME_RANGE_UNTIMED) {
      const categories = series.tags.filter((tag) =>
        SERIES_CATEGORY_TAGS.some((c) => c === tag),
      );

      if (categories.length !== 1 || categories[0] !== "概念史") {
        ctx.addIssue({
          code: "custom",
          message: `timeRange が ${TIME_RANGE_UNTIMED} なのに、tags の種別が概念史だけでない`,
        });
      }

      if (series.anchor !== ANCHOR_UNLOCATED) {
        ctx.addIssue({
          code: "custom",
          message: `timeRange が ${TIME_RANGE_UNTIMED} なのに、anchor が ${ANCHOR_UNLOCATED} でない`,
        });
      }
    }

    if (
      !series.tags.some((tag) => SERIES_CATEGORY_TAGS.some((c) => c === tag))
    ) {
      ctx.addIssue({
        code: "custom",
        message: `tags に種別が 1 つも無い（${SERIES_CATEGORY_TAGS.join(" / ")} のどれかを入れる）`,
      });
    }

    if (series.tags.length > MAX_TAGS) {
      ctx.addIssue({
        code: "custom",
        message: `tags が ${MAX_TAGS} 個を超えている: ${series.tags.length} 個`,
      });
    }

    for (const tag of series.tags.filter((tag) =>
      ERA_GRADE_TAGS.includes(tag),
    )) {
      ctx.addIssue({
        code: "custom",
        message: `tags に era と同じ粒度の時代名がある: ${tag}`,
      });
    }
  });

/**
 * `catalog/series.json` の全体の zod スキーマ。
 * `eras.json` と同じ素の配列で、GeoJSON ではない。
 *
 * `id` と `season` の重複をここで拒否する。
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
 * `catalog/series.json` から読んだ値（`input`）を `seriesListSchema` に通して返す。
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
