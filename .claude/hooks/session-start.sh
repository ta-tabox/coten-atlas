#!/bin/bash
#
# リモート環境（Claude Code on the web）のセッション起動フック。
# 責務は一点——mise の入っていないコンテナで `mise run check` と `mise run dev` が手元と同じ意味を持つところまで組む。
# 手元は mise が入っている前提なので、このフックはリモートでしか走らない。
#
# 置き場の振り分けは fermentary `playbooks/remote-settings-placement.md`。
# リポジトリから復元できるものだけがここに来る（名義はクラウド環境の環境変数が持つ）。

set -euo pipefail

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

log() {
  echo "[coten-atlas] $1"
}

# author の名義は利用者に固有なので、リポジトリでなくクラウド環境の環境変数が持つ。
# GIT_AUTHOR_* は config より優先されるので、リポジトリ側の user.name / user.email は要らない。
# committer はコンテナの global config（Claude 名義・署名鍵つき）から落ちるので触らない。
#
# 未設定のまま進めると author が Claude になり、
# 「第三者が出したものを承認した」という嘘の外形を誰も気づかないまま履歴へ残すので、止める。
require_git_author() {
  if [ -n "${GIT_AUTHOR_NAME:-}" ] && [ -n "${GIT_AUTHOR_EMAIL:-}" ]; then
    return
  fi

  echo "GIT_AUTHOR_NAME / GIT_AUTHOR_EMAIL がこの環境に無い。クラウド環境の環境変数へ入れ、セッションを立て直す" >&2
  exit 1
}

# コンテナから mise.run へは出られない（fermentary kb/claude-code-web.md「egress は許可制」）ので、
# 公式のインストーラは使わず npm から入れる（jdx/mise が同名で publish している）。
# イメージに同梱の node は mise.toml の指定と版が違うが、mise 本体を動かすだけなのでそのまま使う。
#
# mise 自体の版は固定しない。版を持つファイルがこの器に無く、手元でも環境側の都合で決まっているので、
# ここへ書くとリモートだけが宣言を持つ非対称ができる。
install_mise() {
  if command -v mise > /dev/null 2>&1; then
    return
  fi

  log "mise を入れる"
  npm install -g --silent mise
}

main() {
  # 手元とリモートを分ける材料はこれだけ（fermentary kb/claude-code-web.md）。
  # 門を先に置けば、同じフックを両方の環境へ配れる。
  if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
    exit 0
  fi

  require_git_author
  install_mise

  # クローンし直された設定ファイルは未信頼の扱いなので、tasks を走らせる前に通す。
  mise trust "$REPO_ROOT/mise.toml"

  # 版の正は mise.toml。node と pnpm はここで置かれるので、フックは読む側にも回らない。
  log "ランタイムと依存を入れる"
  (cd "$REPO_ROOT" && mise install && mise run install)

  # 第二マウントの口が無い環境なので、不在を毎回宣言する。
  # 宣言が無いと、CLAUDE.md 手順 0 を読んだセッションが不在を異常と受け取って止まる。
  log "fermentary は不在（リモートの既定）。膜へは書き込まない——CLAUDE.md「リモートの縮退モード」"
  log "準備完了。mise run check が走る"
}

main "$@"
