#!/bin/bash
#
# クラウドの開発環境のセットアップスクリプト欄が呼ぶ本体。
# 欄には `bash /home/user/coten-atlas/scripts/cloud-snapshot.sh` の一行だけを置き、中身はこのファイルが持つ。
#
# 揃えるもの。
#   - mise（イメージ同梱の npm で `MISE_VERSION` の版を入れる）と、`mise.toml` の版の node と pnpm
#   - 依存（`pnpm install --frozen-lockfile`）
#   - smoke テストのブラウザ（`playwright install chromium`。版は web/pnpm-lock.yaml の `@playwright/test` が決める）
#
# 欄の結果はファイルシステムのスナップショットとして残り、セッションごとには走らない。
# セッションごとの準備は .claude/hooks/session-start.sh が呼ぶ scripts/cloud-session.sh と scripts/setup.sh が持つ。
# 欄は root で、クラウド環境の環境変数が入る前に走る。
# 欄が失敗すると環境そのものが立たないので、段が失敗しても exit 0 で終え、失敗した段は、セッションごとに scripts/cloud-session.sh が mise の欠けを告げて止め、scripts/setup.sh が残りを補う。
# 各段の所要秒と成否は `/root/coten-atlas-setup.log` に残す。

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG=/root/coten-atlas-setup.log

# mise 本体の版。
# npm のレジストリから入れるので、許可ドメインに mise の配布元を足さずに済む。
MISE_VERSION=2026.10.25

export PATH="$HOME/.local/share/mise/shims:$PATH"
export MISE_YES=1

# 段の名前と所要秒と成否を `LOG` に一行で書く。
# 段の失敗で全体を止めないので、終了コードは返さない。
run_step() {
  local name="$1"
  shift

  local started=$SECONDS

  if "$@" >> "$LOG" 2>&1; then
    echo "[cloud-snapshot] $name: ok ($((SECONDS - started))s)" | tee -a "$LOG"
  else
    echo "[cloud-snapshot] $name: failed ($((SECONDS - started))s)" | tee -a "$LOG"
  fi
}

install_mise() {
  if command -v mise > /dev/null 2>&1; then
    return
  fi

  npm install -g "mise@$MISE_VERSION"
}

install_toolchain() {
  mise trust "$ROOT/mise.toml"
  (cd "$ROOT" && mise install)
}

install_dependencies() {
  (cd "$ROOT/web" && pnpm install --frozen-lockfile)
}

# 配信元（cdn.playwright.dev）は既定の許可ドメインに無いので、クラウド環境のネットワーク設定で足してある前提で取る。
install_chromium() {
  (cd "$ROOT/web" && pnpm exec playwright install chromium)
}

main() {
  local started=$SECONDS

  echo "[cloud-snapshot] start $(date -u +%FT%TZ)" >> "$LOG"
  run_step mise install_mise
  run_step toolchain install_toolchain
  run_step dependencies install_dependencies
  run_step chromium install_chromium
  echo "[cloud-snapshot] total: $((SECONDS - started))s" | tee -a "$LOG"
}

main "$@"
exit 0
