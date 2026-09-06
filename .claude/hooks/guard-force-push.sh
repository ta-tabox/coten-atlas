#!/bin/bash
#
# 戻せない git push を人間の諾否へ回す PreToolUse フック。
#
# `.claude/settings.json` の権限パターンはコマンド文字列への前方一致なので、`Bash(git push --force:*)` はフラグが push の直後に来る語順にしか当たらない。
# `git push origin --force` のように remote 名が先に来る書き方は素の `Bash(git push:*)` の allow へ落ちる。
# ここはコマンド全文を見るので語順に依存しない。
#
# 前方一致では表現できない形も拾う——短オプションの束（`-fu`）・`+src:dst` の force refspec・`:branch` の削除 refspec。
#
# 判定は「戻せない形か」だけで、それ以外は何も言わず settings.json の判定へ委ねる。
# 迷ったら ask へ倒す。
# 余計に訊かれるのは摩擦で済むが、素通りは事故になる。
#
# settings.json の `if` は起動を絞るだけで、判定の責任は持たない。
# あれは best-effort で、`$( )` やバッククォートを含む行——sleep を待つ until ループのような、git と無縁のもの——では開いて倒れて起動してくるので、git push かどうかはこのスクリプトの側でも確かめる。

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

# コマンドを読み出せないときは通さない（戻せない操作は人間が諾否を決める）。
if ! command -v jq > /dev/null 2>&1; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"jq が無くコマンドを検査できない"}}'
  exit 0
fi

command_line=$(jq -r '.tool_input.command // ""') || {
  ask "フックの入力を読めなかった"
  exit 0
}

# --force / --force-with-lease / --delete / --mirror を語順を問わず拾う。
# `-[a-zA-Z]*[fd][a-zA-Z]*` は -f・-d と、それらを含む束（-fu）に当たる。
# -u だけなら当たらない。
destructive='(^|[[:space:]])--(force|delete|mirror)'
destructive+='|(^|[[:space:]])-[a-zA-Z]*[fd][a-zA-Z]*([[:space:]]|$)'
destructive+='|(^|[[:space:]])\+[^[:space:]]+:'
destructive+='|(^|[[:space:]]):[^[:space:]]+'

# 起動条件が素通しさせた無関係なコマンドは、ここで git push でないことを見て外す。
# 見ないと、シェルの no-op（`do :; done`）が削除 refspec に化けて、git を呼んでもいない行が ask になる。
# 過剰に拾う分には ask が増えるだけで済むので、git が push より前に現れる、で足りる。
git_push='(^|[[:space:]])git[[:space:]].*push([[:space:]]|$)'

# 判定はコマンド全文でなく、コマンドの区切りで割ったセグメントごとに行う。
# 全文を一息に見ると語とフラグが別々のコマンドから拾われるので、push を叩いていない行が ask になる。
# `git status; echo "未 push の有無"; gh api graphql -f query=…` が実例で、git と push は前の二つから、`-f` は三つ目から来ていた。
#
# 割るのはシェルと同じ規則に従うときだけである。
# 文字単位で割ると `git push origin 2>&1 --force` が `git push origin 2>` と `1 --force` へ、
# `git push origin 'feat&fix' --force` が `git push origin 'feat` と `fix' --force` へ割れ、
# どちらのセグメントも片方の条件しか満たさないので素通りする。
# 誤爆は摩擦で済むが素通りは事故なので、引用とリダイレクトを見て割る。

# `2>&1`・`>&2`・`&>file` の `&` はコマンドの区切りではない。
is_redirection() {
  local before=$1 after=$2

  case $before in
    *'>' | *'<') return 0 ;;
  esac

  [ "$after" = '>' ]
}

# 1 文字ずつ回すので所要時間はコマンド長の 2 乗で伸びる（実測で 12000 字が 0.9 秒、48000 字が 13 秒）。
# フックの timeout は 5 秒で、超えると判定そのものが失われる。
# ヒアドキュメントでファイルを書く類はここに届くので、上限を置いて割るのをやめる。
readonly split_limit=8000

# 語の境界にしかならない記号を空白へ潰して、セグメントを 1 行で出す。
#
# 潰すのは、上の二つの正規表現が語頭と語尾を空白か行頭行末でしか見ないためである。
# `echo $(git push --force origin main)` の `git` は `(` の直後に来るので語頭に当たらず、
# `$(git push -f)` の `-f` は `)` の直前に来るので語尾に当たらない。
# どちらもコマンド置換の中で本当に走る force push なのに、素通りしていた。
#
# 改行を潰すのは、行継続で次の行へ落とした `--force` を同じセグメントへ留めるためである。
emit_segment() {
  local text=$1
  local boundaries='[()`{}]'

  text=${text//$'\n'/ }
  printf '%s\n' "${text//$boundaries/ }"
}

# 引用の外にある `;` `|` `&` と改行でコマンドを割り、1 セグメント 1 行で出す。
split_into_segments() {
  local text=$1
  local segment='' quote='' escaped='' character next
  local index=0

  # 割らなければ語とフラグが別のコマンドから拾われて誤爆するが、素通りはしない。
  if [ "${#text}" -gt "$split_limit" ]; then
    emit_segment "$text"
    return
  fi

  while [ "$index" -lt "${#text}" ]; do
    character=${text:index:1}
    next=${text:index+1:1}
    index=$((index + 1))

    if [ -n "$escaped" ]; then
      segment+=$character
      escaped=''
      continue
    fi

    case $character in
      '\')
        # シングルクォートの中では `\` はただの文字である。
        if [ "$quote" = "'" ]; then segment+=$character; else escaped=1; fi
        ;;
      '"' | "'")
        if [ -z "$quote" ]; then
          quote=$character
        elif [ "$quote" = "$character" ]; then
          quote=''
        fi
        segment+=$character
        ;;
      ';' | '|' | '&' | $'\n')
        if [ -n "$quote" ] || { [ "$character" = '&' ] && is_redirection "$segment" "$next"; }; then
          segment+=$character
        else
          emit_segment "$segment"
          segment=''
        fi
        ;;
      *)
        segment+=$character
        ;;
    esac
  done

  emit_segment "$segment"
}

while IFS= read -r segment; do
  if grep -qE "$git_push" <<< "$segment" && grep -qE "$destructive" <<< "$segment"; then
    ask "戻せない push の可能性がある（force / delete / mirror）。人間の諾否が要る"
    exit 0
  fi
done <<< "$(split_into_segments "$command_line")"
