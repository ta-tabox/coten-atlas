# 0006. 配信リンクは RSS の `<link>` をそのまま使う

- **状態**: 採用
- **決定日**: 2026-08-23（#13）
- **関係する ADR**: 0005（データの二層）

## 文脈

詳細カードから配信基盤のエピソードページへ飛ばしたい。
リンクの出所として RSS 以外を使うと、取得系が一つ増える。

## 決定

RSS の `<link>`（Spotify のエピソードページ）をそのまま使う。取れない回だけ番組 URL `https://open.spotify.com/show/3qiAapMhh8UgWVfDWTSq2f` + タイトル検索へ落とす。

## 理由

全 752 件が `podcasters.spotify.com/pod/show/coten/episodes/…`（`creators.spotify.com` へリダイレクト）を持っており、エピソード単位のリンクは RSS だけで賄えるので検索導線は例外扱いでよい。`open.spotify.com/episode/…` はフィードに無く Spotify Web API 無しでは引けないため採らない。データ側は `links` を配列にして基盤追加に開いておく（決定日 2026-08-23、#13）。

## 帰結

- Spotify Web API の認証情報を持たない
- `links` は配列（あるいはキー付きオブジェクト）で持ち、後から基盤を足せる
- リンクの鮮度は RSS の鮮度に一致する

## 覆る条件

`podcasters.spotify.com` のリンクが失効するか、Apple Podcasts など別基盤への導線を
要件に入れると決めたとき。
