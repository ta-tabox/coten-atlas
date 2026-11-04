#!/bin/bash
#
# セッション起動フック。
# 実行環境を見分けて、準備のスクリプトを呼ぶ順だけを持つ。
#   手元と worktree: scripts/setup.sh
#   クラウド:        scripts/cloud-session.sh → scripts/setup.sh
# 準備の中身は呼ぶ先のスクリプトが持ち、ここには書かない。

set -euo pipefail

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

# フックの標準入力（JSON）を最初に読み切る。
# 端末につながっているときは待たずに空とする。
HOOK_INPUT=""
if [ ! -t 0 ]; then
  HOOK_INPUT="$(cat || true)"
fi

# 標準入力の JSON の `cwd` を返す。
# デスクトップアプリの worktree セッションでは、`CLAUDE_PROJECT_DIR` とフックの作業ディレクトリが本体を指し、worktree の位置は `cwd` にだけ入る。
# JSON が空・壊れている・`cwd` が無いときは、何も出さずに成功で終わる。
read_hook_cwd() {
  local script='let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const c=JSON.parse(s).cwd;if(typeof c==="string")process.stdout.write(c)}catch{}})'

  if command -v node > /dev/null 2>&1; then
    printf '%s' "$HOOK_INPUT" | node -e "$script" 2> /dev/null || true
  elif command -v python3 > /dev/null 2>&1; then
    printf '%s' "$HOOK_INPUT" | python3 -c 'import json,sys
try:
    c = json.load(sys.stdin).get("cwd")
    sys.stdout.write(c if isinstance(c, str) else "")
except Exception:
    pass' 2> /dev/null || true
  fi
}

# 準備する対象のチェックアウトのルートを返す。
# `cwd` が git の作業ツリーでなければ `REPO_ROOT` を返す。
resolve_checkout_root() {
  local hook_cwd
  hook_cwd="$(read_hook_cwd)"

  if [ -n "$hook_cwd" ] && git -C "$hook_cwd" rev-parse --show-toplevel 2> /dev/null; then
    return
  fi

  echo "$REPO_ROOT"
}

main() {
  local checkout_root
  checkout_root="$(resolve_checkout_root)"
  cd "$checkout_root"

  if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
    bash scripts/cloud-session.sh
    bash scripts/setup.sh
    return
  fi

  # 手元では止めない。
  # 準備が途中で止まってもセッションは立ち、足りない分は pnpm check が同じ相手で落ちて言う。
  bash scripts/setup.sh || echo "[coten-atlas] 手元の準備が途中で止まった。bash scripts/setup.sh を叩き直す" >&2
}

main "$@"
