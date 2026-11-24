#!/bin/bash
#
# `gh api` のうち、戻せない書き込みを人間の諾否へ回す PreToolUse フック。
#
# `gh` の権限は「戻せるか」で三層に切ってあり（CLAUDE.md「git」節）、その線は操作の性質で引かれている。
# ところが `.claude/settings.json` の権限パターンはコマンド文字列への前方一致なので、`gh api` はコマンド文字列が一通りしか無く層を分けられない。
# 全部を ask にすると、レビューの読み取りや返信——`gh issue comment` が allow なのと同じ「戻せるコメント」——まで毎回訊かれる。
# ここがコマンド全文を見て、戻せない側だけを ask へ回す。
#
# 確認を挟まずに通すのは次の形だけである。
#
# - 読み取り（メソッドを書かず、フィールドも渡さない呼び出し）
# - コメント・返信・PR・issue の作成（`/comments`・`/replies`・`/pulls`・`/issues` への POST。編集も close もできる）
# - PR 自体の書き換え（`PATCH …/pulls/N`）
# - レビューコメントの resolve / unresolve（REST の `POST …/comments/ID/resolve` と GraphQL。互いに戻せる）
#
# 判定は「戻せない形か」だけで、それ以外は何も言わず settings.json の判定へ委ねる。
# 迷ったら ask を返す。
# 余計に訊かれるのは摩擦で済むが、確認なしで通すと事故になる。
#
# settings.json の `if` は起動を絞るだけで、判定の責任は持たない。
# `settings.json` の `if` は best-effort で `$( )` を含む行では絞り込みが効かないので、`gh api` かどうかはこのスクリプトの側でも確かめる。

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

# ヒアドキュメントの本体を取り除く。
# 本体は別のコマンドへ渡す文章（PR 本文など）で、`gh api -X PATCH` の語が出ても実行されない。
# 開始行（`<<'EOF'` を含む行）は残すので、`cat <<'EOF' && git push -f` のような同じ行のコマンドは検査に残る。
strip_heredocs() {
  awk '
    skip { t = $0; sub(/^[ \t]+/, "", t); if (t == tag) skip = 0; next }
    { print }
    match($0, /(^|[^<])<<-?[ \t]*["\x27]?[A-Za-z_][^ \t"\x27;|&()<>]*/) {
      s = substr($0, RSTART, RLENGTH); sub(/^[^<]?<<-?[ \t]*["\x27]?/, "", s); tag = s; skip = 1
    }
  '
}

command_line=$(jq -r '.tool_input.command // ""') || {
  ask "フックの入力を読めなかった"
  exit 0
}
# GraphQL の mutation 検査だけは、ファイルへ書いた query も見たいので元の全文で行う。
full_command_line=$command_line
command_line=$(strip_heredocs <<< "$command_line")

# 起動条件の絞り込みを通ってきた無関係なコマンドは、ここで `gh api` でないことを見て外す。
if ! grep -qE '(^|[[:space:]])gh[[:space:]]+api([[:space:]]|$)' <<< "$command_line"; then
  exit 0
fi

# secret は `gh secret` が deny なので、api 経由でも同じ扱いにする。
if grep -qE '/(actions|dependabot|codespaces)/secrets' <<< "$command_line"; then
  ask "secret へ api 経由で届いている。gh secret は deny なので人間の諾否が要る"
  exit 0
fi

# PR 自体の書き換え（`PATCH repos/o/r/pulls/N`）は、本文・title・base・state のどれも GitHub の編集履歴か close と reopen で戻せるので通す。
# 見るのはエンドポイントの位置だけで、`pulls/N/…` の下位（レビューの削除など）は対象にしない。
pr_update='(^|[[:space:]])gh[[:space:]]+api[[:space:]]+'
pr_update+='((-X|--method)[[:space:]]+PATCH[[:space:]]+)?'
pr_update+='[^-[:space:]][^[:space:]]*/pulls/[0-9]+([[:space:]]|$)'

# 既存を書き換える／消すメソッドは、PR 自体の書き換えを除き、対象を問わず戻せない。
if grep -qiE '(^|[[:space:]])(-X|--method)[[:space:]]+(PATCH|PUT|DELETE)([[:space:]]|$)' <<< "$command_line"; then
  if ! grep -qiE '(-X|--method)[[:space:]]+PATCH' <<< "$command_line" || ! grep -qE "$pr_update" <<< "$command_line"; then
    ask "既存を書き換えるか消す api 呼び出しである。人間の諾否が要る"
    exit 0
  fi
fi

# GraphQL はメソッドでなく mutation の有無が書き込みを決める。
# `-f query=` は読み取りの query にも付くので、フィールドの有無では判定できない。
if grep -qE '(^|[[:space:]])graphql([[:space:]]|$)' <<< "$command_line"; then
  if grep -qE 'mutation[[:space:]]*[({]' <<< "$full_command_line"; then
    if ! grep -qE 'mutation[[:space:]]*[({][[:space:]]*(resolve|unresolve)ReviewThread' <<< "$full_command_line" \
      || grep -qiE '(delete|remove|transfer|archive|secret)' <<< "$full_command_line"; then
      ask "レビュースレッドの resolve 以外の mutation である。人間の諾否が要る"
    fi
  fi
  exit 0
fi

# ここから先は REST。
# `gh api` はフィールドを渡すと自動で POST になるので、メソッドを書かない書き込みも拾う。
writes='(^|[[:space:]])(-X|--method)[[:space:]]+POST([[:space:]]|$)'
writes+='|(^|[[:space:]])(-f|-F|--field|--raw-field|--input)([[:space:]]|=)'

# コメント・返信・PR と issue の作成だけは戻せる操作として確認なしで通す（`gh issue comment`・`gh pr create`・`gh issue create` が allow なのと同じ層）。
# 作成した PR と issue は close で戻せる。PR 以外を書き換える PATCH は上で ask にしてある。
#
# 見るのはエンドポイントの位置だけで、コマンド全体を探さない。
# 全体を探すと、フィールドの値がたまたま `/comments` を含むだけで別の書き込みが確認なしで通る（`gh api repos/o/r/issues -f title="see /comments"` は issue の作成である）。
# エンドポイントは `gh api` の直後か、メソッド指定を挟んだ直後にしか来ない。
comment_endpoint='(^|[[:space:]])gh[[:space:]]+api[[:space:]]+'
comment_endpoint+='((-X|--method)[[:space:]]+[A-Za-z]+[[:space:]]+)?'
comment_endpoint+='[^-[:space:]][^[:space:]]*/(comments|replies|pulls|issues)([[:space:]]|$)'

# レビューコメントの resolve / unresolve（`…/comments/ID/resolve`）も戻せる操作として確認なしで通す。
# ID はシェル変数のことがあるので、`/` 以外の語なら当てる。
resolve_endpoint='(^|[[:space:]])gh[[:space:]]+api[[:space:]]+'
resolve_endpoint+='((-X|--method)[[:space:]]+[A-Za-z]+[[:space:]]+)?'
resolve_endpoint+='[^-[:space:]][^[:space:]]*/comments/[^[:space:]/]+/(resolve|unresolve)([[:space:];]|$)'

if grep -qiE "$writes" <<< "$command_line"; then
  if ! grep -qE "$comment_endpoint" <<< "$command_line" \
    && ! grep -qE "$pr_update" <<< "$command_line" \
    && ! grep -qE "$resolve_endpoint" <<< "$command_line"; then
    ask "コメント投稿以外の書き込みである。人間の諾否が要る"
  fi
fi
