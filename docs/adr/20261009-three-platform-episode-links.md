# エピソードの配信リンクを Spotify・Apple Podcasts・YouTube の 3 基盤で持ち、RSS の `<link>` を使わない（20260823-rss-link-as-episode-url を supersede）

- **状態**: 採用
- **決定日**: 2026-10-09
- **関係する ADR**: 20260823-rss-link-as-episode-url（これを supersede する）、20260904-two-layer-data-without-inbox（`episodes.json` は同期が毎回組み直す。`links` はその例外になる）、20260823-quote-titles-only（引用は題号に限る）

## 文脈

20260823-rss-link-as-episode-url は、エピソードの配信リンクに RSS の `<link>`（`podcasters.spotify.com/pod/show/coten/episodes/…`）をそのまま使うと決めた。

その URL は配信者向けの Spotify for Creators のページへリダイレクトし、リスナーはその回に届かない。
人間は Apple Podcasts と YouTube への導線も持つと決めた。
これは 20260823-rss-link-as-episode-url の覆る条件「Apple Podcasts など別基盤への導線を要件に入れると決めたとき」に当たる。

回ごとの URL はフィードに無く、各基盤から取得する。
`episodes.json` は同期が毎回フィードから組み直すので、取得した URL をそのまま書くと次の同期で消える。

## 決定

- **基盤**: エピソードの `links` は Spotify・Apple Podcasts・YouTube の 3 基盤のリンクを持てる
  基盤の値域は `links` のスキーマが閉じた enum で持つ
- **RSS の `<link>`**: 配信リンクに使わず、同期はフィードの `<link>` を読まない
- **同期と `links`**: 同期は `links` をフィードから作らず、前回の `episodes.json` の同じ guid の回から引き継ぐ
  前回に無い回の `links` は空にする
- **回の URL を持たない基盤**: その基盤の番組ページ（YouTube は番組の公式チャンネル）を開く
- **詳細カード**: 各回の行に 3 基盤のボタンを並べ、どの回でも 3 本とも出す

20260904-two-layer-data-without-inbox の「自動層（`episodes.json`）は同期が毎回組み直す」に対して、`links` だけは前回の値を引き継ぐ例外にする。
`links` 以外の欄（題名・日付・season・`seriesId`）は従来どおり毎回組み直す。

決定時点の例: 基盤の値は `web/src/lib/schema/link.ts` の `PLATFORMS`、番組ページの URL と開く URL を決める関数は `web/src/lib/links/listen-url.ts`、引き継ぎは `web/src/lib/feed/episode.ts` の `toEpisode` が持つ。
現況はコードが持つ。

## 理由

- RSS の `<link>` はリスナーをその回へ届けないので、配信リンクとしての役目を果たさない
- 回の URL は基盤の API から取得する値で、フィードから導けないので、組み直すと取得し直すまで消える
- 引き継ぐのを `links` に限れば、題名や割当はフィードと `series.json` の現状に毎回揃い続ける
- 番組ページを開けば、回の URL が取れない回でもボタンが押せて、その基盤で番組までは届く

採らなかった案:

- **RSS の `<link>` を Spotify のリンクとして残す** ／ リスナーがその回に届かないリンクを、届くリンクと同じ見た目で並べることになる
- **回の URL を `catalog/` の別ファイル（手動層）に置く** ／ 回の URL は人間が書くのでなく取得の処理が書くので、手動層に置くと自動の書き手が手動層へ入る
- **同期のたびに各基盤の API から全件を取得し直す** ／ 3 基盤の認証と取得が同期の毎回に乗り、どれかが落ちた日に `links` が消える
- **回の URL が無い基盤のボタンを出さない** ／ 回ごとにボタンの数と位置が変わり、取得の進み具合が画面の揺れとして見える

## 帰結

- RSS の `<link>` 由来の Spotify for Creators の URL は `episodes.json` から消え、取得の処理が書くまで各回の `links` は空になる
- 回ごとの URL を各基盤から取得する処理は、`episodes.json` の `links` へ書けば同期を越えて残る
- フィードから消えた回の `links` は、回と一緒に `episodes.json` から消える
- `links` は前回の `episodes.json` に依存するので、`episodes.json` を消してから同期すると取得した URL も消える
- シリーズの `links` は、シリーズ単位のページが基盤に無いので空のまま

## 覆る条件

回ごとの URL がフィードから取れるようになったとき（`links` を毎回組み直す形へ戻せる）。
または、配信基盤を足すか外すと決めたとき。
または、`links` 以外にも、同期の外で書いた値を `episodes.json` に持たせたくなったとき（引き継ぐ欄を一つずつ足すより、自動層の分け方を決め直す）。
