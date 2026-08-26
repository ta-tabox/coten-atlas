# 0010. gh-review の起動を絞るのは job 側の `if:` の一本にする

- **状態**: 採用
- **決定日**: 2026-08-25（#44 周辺の調査）
- **関係する ADR**: なし

## 文脈

`claude.yml` の run の大半が `skipped` で終わる。
run 一覧がノイズで埋まるので、`on:` 側で絞るか、bot のコメントを弾く条件を足すかを検討した。

## 決定

`claude.yml` の起動を絞るのは job 側の `if:` の一本。`on:` を絞る改修も、bot のコメントを弾く条件の追加も行わない（判断日 2026-08-25）。

## 理由

`issue_comment` / `pull_request_review_comment` / `pull_request_review` が `on:` に持てるフィルタは `types:` だけで、コメント本文にも投稿者にも掛けられない（`branches` / `paths` はこの三経路に無い）ので、job 側の `if:` が唯一の絞り口になる。あらゆるコメントが run を作り大半が `skipped` で終わるのはその帰結で、`if:` が false の job はランナーを起動しないため Actions 分を消費しない（GitHub 中の人の回答: `https://github.com/orgs/community/discussions/26456`）。`github.event.comment.user.type != 'Bot'` を足しても run 自体は作られるので、run 一覧のノイズは減らない。残るコストは run 一覧と履歴のノイズだけなので、受け入れる。

## 帰結

- `claude.yml` はワークフロー側を触らない。雛形の写しで「FILL 以外は契約」と自己宣言しており、
  コメント一行でも逸脱になる
- run 一覧に `skipped` が並ぶのは正常。`skipped` を異常と読んで調べ直さない
- `get_workflow_run_usage` は消費実績の出典に使えない——この器では 335 秒走った success の run も
  `total_ms: 0` を返すので、`skipped` の 0 と区別が付かない

## 覆る条件

GitHub が `issue_comment` 系の `on:` に投稿者や本文のフィルタを足したとき、
あるいは `skipped` の run が Actions 分を消費するようになったとき。
