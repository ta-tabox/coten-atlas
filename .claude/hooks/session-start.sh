#!/bin/bash
#
# セッション起動フック。
# 責務は、どの環境でも `web/` で打つ `pnpm check` が立つところまで組むことである。
# 手元（リポジトリ本体と worktree）の準備は scripts/setup.sh が持ち、このファイルが持つのはリモート（Claude Code on the web）の分だけである。
# リモートでスナップショットに残る分（mise・ランタイム・依存・ブラウザ）は scripts/cloud-setup.sh が持ち、ここが持つのはセッションごとに要る分である。
#
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

# コミット本文の禁止語を止める commit-msg フックは `.githooks/` にある。
# git は既定で `.git/hooks/` しか見ないので、このクローンの設定で向け先を替える。
enable_git_hooks() {
  git -C "$REPO_ROOT" config core.hooksPath .githooks
}

# mise 本体と、スナップショットに残る重い取得（ランタイム・依存・ブラウザ）は scripts/cloud-setup.sh がクラウド環境のセットアップスクリプト欄で入れる。
# mise が無いのは欄が空か失敗したときなので、ここで毎セッション入れ直さず、直し方を告げて止める。
require_mise() {
  if command -v mise > /dev/null 2>&1; then
    return
  fi

  echo "mise が無い。クラウド環境のセットアップスクリプト欄と許可ドメインを docs/HARNESS.md「設定の置き場」のとおりにし、/root/coten-atlas-setup.log を確かめる" >&2
  exit 1
}

# セッションのシェルは mise を活性化しないので、放っておくとイメージ同梱の node と pnpm を掴む。
# mise.toml の固定がフックの中でしか効かない状態になり、`pnpm check` が手元とも CI とも別の版で走る。
# 渡し口はセッションのツールシェルが読む追記専用ファイル CLAUDE_ENV_FILE の一つだけ。
handoff_shims() {
  # shims の置き場をこちらで書くと mise の既定が変わったとき黙って外れるので、PATH の行は mise 自身に書かせる。
  local path_line
  path_line="$(mise activate bash --shims)"

  # 下のべき等判定は出力が1行であることに依存する。
  # grep -F は改行を含むパターンを行ごとの選択肢へ分解するので、複数行になると1行の一致で「追記済み」と読み、残りを落としたまま抜ける。
  # 黙って PATH を欠けさせるより、渡さずに理由を言って止める。
  if [ "$(printf '%s\n' "$path_line" | wc -l)" -ne 1 ]; then
    log "mise activate の出力が1行ではない。PATH を渡さないので、web/ で打つ前に自分で通す"
    return
  fi

  if [ -z "${CLAUDE_ENV_FILE:-}" ]; then
    log "CLAUDE_ENV_FILE が無いので PATH を渡せない。web/ で打つ前に $path_line を通す"
    return
  fi

  # 追記専用なので、resume のたびに同じ行が積まれないことを書く前に見る。
  # フックのプロセスの PATH には前回の追記が反映されないため、PATH を見ても判定にならない。
  if ! grep -qxF "$path_line" "$CLAUDE_ENV_FILE" 2> /dev/null; then
    echo "$path_line" >> "$CLAUDE_ENV_FILE"
  fi
}

main() {
  # 手元とリモートを分ける材料はこれだけ。
  # 門を先に置けば、同じフックを両方の環境へ配れる。
  if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
    # 手元では止めない。
    # 準備が途中で止まってもセッションは立ち、足りない分は pnpm check が同じ相手で落ちて言う。
    bash "$REPO_ROOT/scripts/setup.sh" || echo "[coten-atlas] 手元の準備が途中で止まった。bash scripts/setup.sh を叩き直す" >&2
    exit 0
  fi

  require_git_author
  enable_git_hooks
  require_mise

  # クローンし直された設定ファイルは未信頼の扱いなので、mise install の前に通す。
  mise trust "$REPO_ROOT/mise.toml"

  # スナップショットより後のコミットで mise.toml や lockfile が変わっていても、ここで追いつく。
  # 揃っていれば何もしない。
  log "ランタイムと依存を揃える"
  # pnpm は mise が置いた shim なので、この時点の PATH にはまだ載っていない。
  # フックは自分の PATH をいじらず mise exec 越しに呼ぶ。
  #
  # mise はルートの mise.toml を、pnpm は web/ の package.json を読む（#39）。
  # 版とアプリで置き場が分かれたので、cd も二つに分かれる。
  (cd "$REPO_ROOT" && mise install)
  (cd "$REPO_ROOT/web" && mise exec -- pnpm install --frozen-lockfile)

  # 固定の版が揃うのはここまででフックの中だけなので、セッションのシェルへも渡す。
  handoff_shims

  log "準備完了。web/ で pnpm check が走る"
}

main "$@"
