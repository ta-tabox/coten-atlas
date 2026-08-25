#!/bin/bash
#
# 戻せない git push を人間の諾否へ回す PreToolUse フック。
#
# `.claude/settings.json` の権限パターンはコマンド文字列への前方一致なので、
# `Bash(git push --force:*)` はフラグが push の直後に来る語順にしか当たらない。
# `git push origin --force` のように remote 名が先に来る書き方は素の
# `Bash(git push:*)` の allow へ落ちる。ここはコマンド全文を見るので語順に依存しない。
#
# 前方一致では表現できない形も拾う——短オプションの束（`-fu`）、
# `+src:dst` の force refspec、`:branch` の削除 refspec。
#
# 判定は「戻せない形か」だけで、それ以外は何も言わず settings.json の判定へ委ねる。
# 迷ったら ask へ倒す。余計に訊かれるのは摩擦で済むが、素通りは事故になる。
#
# 起動条件は settings.json の `if` が持つ（`Bash(git push:*)`）。
# 塞ぐ穴はちょうどその allow ルールが拾う集合なので、範囲を揃えてある。

set -euo pipefail

ask() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: $reason
    }
  }'
}

# コマンドを読み出せないときは通さない（fermentary RULES.md #5 は戻せない操作を人間へ渡す）。
if ! command -v jq > /dev/null 2>&1; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"jq が無くコマンドを検査できない"}}'
  exit 0
fi

command_line=$(jq -r '.tool_input.command // ""') || {
  ask "フックの入力を読めなかった"
  exit 0
}

# --force / --force-with-lease / --delete / --mirror を語順を問わず拾う。
# `-[a-zA-Z]*[fd][a-zA-Z]*` は -f・-d と、それらを含む束（-fu）に当たる。-u だけなら当たらない。
destructive='(^|[[:space:]])--(force|delete|mirror)'
destructive+='|(^|[[:space:]])-[a-zA-Z]*[fd][a-zA-Z]*([[:space:]]|$)'
destructive+='|(^|[[:space:]])\+[^[:space:]]+:'
destructive+='|(^|[[:space:]]):[^[:space:]]+'

if grep -qE "$destructive" <<< "$command_line"; then
  ask "戻せない push の可能性がある（force / delete / mirror）。fermentary RULES.md #5 により人間の諾否が要る"
fi
