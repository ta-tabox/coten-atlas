#!/bin/bash
#
# 手元のチェックアウト（リポジトリ本体と worktree）で、`pnpm check` と `pnpm dev` が前置き無しで動くところまで揃える。
# 何度走らせても同じ状態に落ち着く。
#
# 揃えるもの。
#   - git のフックの向き先（`.githooks`）
#   - ランタイム（`mise install`）
#   - 依存（`pnpm install`。store は web/pnpm-workspace.yaml の storeDir で本体と worktree が同じ場所を使う）
#   - smoke テストのブラウザ（`playwright install chromium`）
#
# 版の正は mise.toml と web/pnpm-lock.yaml にあり、ここには書かない。
# リモート（Claude Code on the web）の準備は .claude/hooks/session-start.sh が別に持ち、手元ではそのフックがこのスクリプトを呼ぶ。
# 人間が叩くときは、リポジトリのルートで `bash scripts/setup.sh`（どのディレクトリから呼んでも、このファイルが在るチェックアウトを揃える）。

set -euo pipefail

ROOT=$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)
cd "$ROOT"

log() {
  echo "[setup] $1"
}

# mise の shims が PATH に無いプロセス（エディタやフックから起動された場合）でも、mise が入れた pnpm と node を掴む。
MISE_SHIMS="$HOME/.local/share/mise/shims"
export PATH="$MISE_SHIMS:$PATH"

# 同じプロセスでは mise 本体も PATH に無いことがあるので、shims のリンク先（mise 本体）で補う。
# 見つからなければ空文字を返す。
find_mise() {
  command -v mise || readlink "$MISE_SHIMS/node" || true
}

# 相対パスにする。
# 絶対パスだと worktree の .githooks を直しても本体の版が走る。
# worktree ごとの設定（extensions.worktreeConfig）に絶対パスが残っていると共有の設定より優先されるので、先に消す。
if git config --worktree --get core.hooksPath > /dev/null 2>&1; then
  git config --worktree --unset core.hooksPath
fi
git config core.hooksPath .githooks

# mise は mise.toml を場所ごとに信頼するので、新しく切った worktree の mise.toml は未信頼のまま残り、shims も install も止まる。
MISE=$(find_mise)
if [ -n "$MISE" ]; then
  "$MISE" trust --quiet "$ROOT/mise.toml"
  log "ランタイムを入れる"
  "$MISE" install --quiet
else
  log "mise が無いので、ランタイムは PATH にある node と pnpm を使う"
fi

# predev と prebuild が地図の worker と catalog/episodes.json を写すので、依存が入れば dev と build の前置きは要らない。
#
# confirmModulesPurge を false にするのは、既に在る node_modules を別の store から張っていたときに pnpm が作り直しの確認を求めるためである。
# このスクリプトは TTY を持たないプロセスからも走るので、確認を求められた時点で ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY で止まる。
log "依存を入れる"
(cd web && pnpm install --frozen-lockfile --config.confirmModulesPurge=false --reporter=silent)

# 版は web/pnpm-lock.yaml の @playwright/test が決める。
# 入っていれば playwright 自身がダウンロードを飛ばす。
log "smoke テストのブラウザを入れる"
(cd web && pnpm exec playwright install chromium)

log "準備完了。web/ で pnpm check と pnpm dev が走る"
