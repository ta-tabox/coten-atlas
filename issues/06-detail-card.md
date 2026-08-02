# S3: テーマクリックで詳細カードを開く
labels: claude,ui

**前提**: #05 ／ **担当**: Claude ／ **参照**: `docs/plan.md` §3（UI 構成）、§2（episodes.json）

## 目的
地図を「見るだけのもの」から配信への導線にする。ここで作る selection state が
S5（パネルとの双方向同期）の土台になるので、**単一の state に集約**しておく。

## 作るもの
- `src/components/MapCanvas.tsx`
  - `const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)`
    （selection の正はここ一箇所。コンポーネントごとに持たせない）
  - `<Map interactiveLayerIds={[...]} onClick={...}>` — `e.features[0].properties.id`
    を拾って set。フィーチャ外のクリックは null
- `src/lib/episodes.ts`
  - `export function episodesForTheme(themeId: string): Episode[]`
  - `data/episodes.json` は S6 まで存在しない。**無い場合は空配列を返す**
    （例外を投げない。ここは欠損が正常な状態）
- `src/components/ThemeDetailCard.tsx`
  - `props: { theme: Theme; episodes: Episode[]; onClose: () => void }`
  - 表示: title / 年代（timeRange を「紀元前800年〜紀元550年」形式に整形）/
    summary / エピソード一覧 / Spotify リンク
  - `src/lib/format.ts` に `export function formatTimeRange(range: TimeRange): string`
    （負値を「紀元前」に。整形はコンポーネントから出す）
- テスト
  - `ThemeDetailCard.test.tsx` — title・整形済み年代・summary・Spotify リンクが出る。
    **エピソード0件でも壊れない**
  - `format.test.ts` — BC/AD 跨ぎ・同年・負値の3例

## 触らないもの
一覧パネル（S5）、era スライダー（S4）、`data/`

## 完了条件（機械判定）
- `mise run check` が緑
- `ThemeDetailCard.test.tsx` と `format.test.ts` が通る

## 人間の判定（別トラック）
クリックの当たり判定（Point の円が小さすぎないか）、Spotify への遷移。
