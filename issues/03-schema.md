# S2: データスキーマを型とバリデータに落とす
labels: claude,lib

**前提**: #01 ／ **担当**: Claude ／ **参照**: `docs/plan.md` §2（データモデル・時系列モデル）

## 目的
描画（#05）と RSS 同期（S6）が共有する契約を、実行時に検査できる形で確定する。
スキーマが揺れたまま実装を積むと、両方を書き直すことになる。

## 作るもの
- 依存追加: `zod`
- `src/lib/schema/theme.ts`
  - `export const themeKindSchema = z.enum(['point', 'polygon', 'line', 'concept'])`
  - `export const timeRangeSchema` — `{ start: number; end: number }`、
    `superRefine` で `start <= end`（負値 = BC を許す）
  - `export const themePropertiesSchema` — id / title / kind / timeRange / summary /
    region / match / links / tags
  - `export const themeFeatureSchema` / `export const themeCollectionSchema`
    （GeoJSON FeatureCollection。geometry は Point / MultiPoint / Polygon / LineString）
  - `export type Theme = z.infer<typeof themeFeatureSchema>`
  - `export function parseThemes(input: unknown): ThemeCollection` — 失敗時は
    文脈付きで throw（`CODING.md`「エラーは発生源の近くで、文脈を付けて」）
- `src/lib/schema/era.ts` — `eraSchema` / `eraListSchema`。
  **`superRefine` で era 列の連続性を検査**（前の `end` == 次の `start`。
  隙間があるとスライダーの補間が破綻する）
- `src/lib/schema/episode.ts` — guid / title / pubDate / audioUrl / themeId（nullable）/ links
- `data/eras.json` — `docs/plan.md` §2 の7区分をそのまま
- `scripts/validate-data.ts` — `data/` 配下を全部読んで検査。mise task `validate` に登録し、
  `check` の連鎖に組み込む（`themes.geojson` が未生成の間は「無ければスキップ」で可）
- テスト `src/lib/schema/*.test.ts` — 正例1本ずつに加えて**反例**:
  未知の kind / `timeRange` 逆転 / era 列の隙間 が確実に失敗すること

## 触らないもの
`src/components/`、`data/themes.geojson`（シードは #04）

## 完了条件（機械判定）
- `mise run check` が緑（`validate` を含む）
- 反例テストがすべて「失敗を検出する」側で通る

## 人間の判定（別トラック）
なし
