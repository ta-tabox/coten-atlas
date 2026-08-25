# 0009. 判定の口を `pnpm check` へ移す

- **状態**: 採用
- **決定日**: 2026-08-25
- **関係する ADR**: 0002（これを supersede する）、0001（`next build` を含める理由）

## 文脈

0002 は判定の口を `mise run check` 一本と定めた。
一方 toolchain 正典（`fermentary/playbooks/toolchain.md`）は同じ表で
「JS/TS 系の設定の置き場 = `package.json`」とも定めており、
タスクだけを別ファイルへ出すと置き場が二つに割れる。

また 0002 の口は `next build` を含んでおらず、static export の失敗を拾えない。

## 決定

**`pnpm check`** = `tsc --noEmit` → `biome ci .` → `vitest run` → `next build`。並びは安いものから落とす（L0 型 → L1 静的 → L2 ユニット → L3 ビルド）。

`mise.toml` は `[tools]` のみを持ちランタイム版管理に徹し、`run = "pnpm check"` の薄いラッパも置かない。

## 理由

issue の完了条件を一つのコマンドへ集約する。判定の口が複数あると、どれが緑なら閉じてよいかが毎回議論になる（決定日 2026-08-02）。**口を mise tasks から package.json の scripts へ移した（決定日 2026-08-25）**——toolchain 正典が JS/TS 系の設定の置き場を `package.json` と定めており、タスクだけ別ファイルへ出すと置き場が二つに割れる。`mise.toml` は `[tools]` のみを持ちランタイム版管理に徹し、`run = "pnpm check"` の薄いラッパも置かない（口が一本に見えて二本ある状態が、そもそも避けようとしたもの）。逸脱の記録は `CLAUDE.md`。**`next build` を含める**のは、static export がビルド時にしか壊れない失敗を持つため——判定の口が拾えないと PR は緑のまま公開が落ちる。

## 帰結

- 0002 は supersede 済みになる（本文は残す）
- toolchain 正典「タスクランナー = mise tasks」からの逸脱を明記する。記録の置き場は
  当初 `CLAUDE.md`、2026-08-25 の五層化で `HARNESS.md`「判定の口」へ移した。
  正典側の改定は fermentary へ諮ってある
- `mise.toml` はランタイム版管理（node / pnpm の固定）だけを持つ
- 波及先は package.json / mise.toml / CI 二本 / `.claude/settings.json` / `session-start.sh` / `CLAUDE.md` / PR・issue テンプレ / `NEXT.md`

## 覆る条件

toolchain 正典が「タスクランナー = mise tasks」と「JS/TS の設定の置き場 = `package.json`」の
衝突を別の向きで解いたとき（諮ってある改定の結論次第）。
