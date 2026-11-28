/**
 * Spotify の Web API の応答（トークンと番組の回の一覧）を検査する zod スキーマと、`parse*` の関数を置く。
 * 取得は持たず、ネットワークを叩くモジュールが持つ。
 *
 * 回の一覧の `items` には `null` の要素が混ざって返る（地域で再生できない回）ので、読み飛ばす。
 * `null` でない要素の欄が欠けていれば、応答の形が変わったと見て throw する。
 *
 * 入口は `parseSpotifyToken` と `parseSpotifyEpisodesPage`。
 */

import * as z from "zod";

const spotifyTokenSchema = z.looseObject({
  access_token: z.string().min(1),
});

/** 回の一覧の 1 ページを、`items` の外形と次のページの URL だけで読む zod スキーマ。 */
const spotifyPageSchema = z.object({
  items: z.array(z.looseObject({}).nullable()),
  next: z.url().nullable(),
});

/** 回の 1 件の、突き合わせと URL に使う欄だけを `SpotifyEpisode` の形へ写す zod スキーマ。 */
const spotifyEpisodeSchema = z
  .looseObject({
    name: z.string().min(1),
    release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    external_urls: z.looseObject({ spotify: z.url() }),
  })
  .transform(({ name, release_date, external_urls }) => ({
    title: name,
    releaseDate: release_date,
    url: external_urls.spotify,
  }));

/**
 * Spotify の 1 回。
 * `releaseDate` は `YYYY-MM-DD`（UTC の公開日）、`url` は Spotify でその回を開く URL。
 */
export type SpotifyEpisode = z.infer<typeof spotifyEpisodeSchema>;

/**
 * 回の一覧の 1 ページ。
 * `nextUrl` は最後のページで null。
 */
export type SpotifyEpisodesPage = {
  episodes: SpotifyEpisode[];
  nextUrl: string | null;
};

/**
 * トークンの応答（`input`）からアクセストークンを取り出す。
 * `access_token` が無ければ throw する。
 */
export function parseSpotifyToken(input: unknown): string {
  const token = spotifyTokenSchema.safeParse(input);

  if (!token.success) {
    throw new Error(
      `Spotify のトークンの応答がスキーマに合わない\n${z.prettifyError(token.error)}`,
    );
  }

  return token.data.access_token;
}

/**
 * 回の一覧の 1 ページ（`input`）から、回と次のページの URL を取り出す。
 * `null` の要素は読み飛ばす。
 *
 * 応答の外形が違うか、`null` でない要素に `name`・`release_date`・`external_urls.spotify` が無ければ throw する。
 */
export function parseSpotifyEpisodesPage(input: unknown): SpotifyEpisodesPage {
  const page = spotifyPageSchema.safeParse(input);

  if (!page.success) {
    throw new Error(
      `Spotify の回の一覧がスキーマに合わない\n${z.prettifyError(page.error)}`,
    );
  }

  const episodes = page.data.items
    .filter((item) => item !== null)
    .map((item) => {
      const episode = spotifyEpisodeSchema.safeParse(item);

      if (!episode.success) {
        throw new Error(
          `Spotify の回がスキーマに合わない\n${z.prettifyError(episode.error)}`,
        );
      }

      return episode.data;
    });

  return { episodes, nextUrl: page.data.next };
}
