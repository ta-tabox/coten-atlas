#!/bin/bash
#
# クラウドのセッションの起動時に、scripts/setup.sh より前に要る分を揃える。
# 名義と mise の有無を確かめ、mise の shims を Claude のツールのシェルへ渡す。
# 共通の準備（git のフックの向き先・ランタイム・依存・ブラウザ）は scripts/setup.sh が持ち、スナップショットに残す分は scripts/cloud-snapshot.sh が持つ。
# 名義か mise が無ければ、直し方を告げて exit 1 で終わる。
# .claude/hooks/session-start.sh が、クラウドでだけ呼ぶ。

set -euo pipefail

# mise の shims の置き場。
# `mise activate bash --shims` はコンテナで何も出力しないので、scripts/setup.sh と同じ既定の置き場を書く。
MISE_SHIMS="$HOME/.local/share/mise/shims"

# author の名義は利用者に固有なので、リポジトリでなくクラウド環境の環境変数が持つ（docs/HARNESS.md「設定の置き場」）。
# 未設定のまま進めると author がコンテナの global config の Claude 名義になるので、止める。
# committer は署名鍵と紐づくので触らない。
require_git_author() {
  if [ -n "${GIT_AUTHOR_NAME:-}" ] && [ -n "${GIT_AUTHOR_EMAIL:-}" ]; then
    return
  fi

  echo "GIT_AUTHOR_NAME / GIT_AUTHOR_EMAIL がこの環境に無い。クラウド環境の環境変数へ入れ、セッションを立て直す（docs/HARNESS.md「設定の置き場」）" >&2
  exit 1
}

# mise 本体はセットアップスクリプト欄の scripts/cloud-snapshot.sh が入れる。
# 無いのは欄が空か失敗したときなので、ここで入れ直さず直し方を告げて止める。
require_mise() {
  if command -v mise > /dev/null 2>&1; then
    return
  fi

  echo "mise が無い。クラウド環境のセットアップスクリプト欄と許可ドメインを docs/HARNESS.md「設定の置き場」のとおりにし、/root/coten-atlas-setup.log を確かめる" >&2
  exit 1
}

# Claude のツールのシェルへ shims の PATH を渡す。
# 渡さないとツールのシェルはイメージ同梱の node と pnpm を使い、`pnpm check` が mise.toml と別の版で走る。
# 起動フックとツールのシェルは別のプロセスなので、届くのは追記専用の CLAUDE_ENV_FILE に書いた行だけで、resume のたびに同じ行が積まれないよう、無いときだけ書く。
handoff_shims() {
  if [ -z "${CLAUDE_ENV_FILE:-}" ]; then
    echo "[coten-atlas] CLAUDE_ENV_FILE が無いので PATH を渡せない。web/ で打つ前に $MISE_SHIMS を PATH の先頭へ通す"
    return
  fi

  local path_line="export PATH=\"$MISE_SHIMS:\$PATH\""
  grep -qxF "$path_line" "$CLAUDE_ENV_FILE" 2> /dev/null || echo "$path_line" >> "$CLAUDE_ENV_FILE"
}

require_git_author
require_mise
handoff_shims
