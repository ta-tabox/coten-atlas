/**
 * パーサへ食わせる RSS の断片。
 * #13 で実取得した 1 件を種に、パースが取りこぼしやすい形だけを足してある。
 *
 * ネットワークへは出さない。
 * 実フィードを引くとテストが配信元の可用性で赤くなるので、形の検査はここへ閉じる。
 *
 * `description` と `itunes:summary` は落としてある。
 * 実物は 1 件で約 2400 字あるうえ、パーサはどちらも読まない。
 */

/**
 * 4 件を持つフィード。
 * 順に、通常回・先頭に空白の付いた URL 形式の guid・`itunes:season` を持たない回・番外編である。
 */
export const FEED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:dc="http://purl.org/dc/elements/1.1/">
	<channel>
		<title><![CDATA[歴史を面白く学ぶコテンラジオ （COTEN RADIO）]]></title>
		<item>
			<title><![CDATA[【66-10】五賢帝時代はじまる！【COTEN RADIO 帝政ローマ編10】]]></title>
			<link>https://podcasters.spotify.com/pod/show/coten/episodes/66-10COTEN-RADIO-10-e3m0l9q</link>
			<guid isPermaLink="false">4d80b4a3-deee-41f3-8045-d06ade19132f</guid>
			<dc:creator><![CDATA[COTEN inc.]]></dc:creator>
			<pubDate>Wed, 19 Aug 2026 21:00:00 GMT</pubDate>
			<enclosure url="https://anchor.fm/s/8c2088c/podcast/play/122753786/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-6-13%2F5c1734a4.mp3" length="51340704" type="audio/mpeg"/>
			<itunes:duration>00:52:48</itunes:duration>
			<itunes:season>66</itunes:season>
			<itunes:episode>10</itunes:episode>
			<itunes:episodeType>full</itunes:episodeType>
		</item>
		<item>
			<title><![CDATA[【94】COTEN RADIO 番組のお知らせ]]></title>
			<link>https://podcasters.spotify.com/pod/show/coten/episodes/94COTEN-RADIO-ebu6ld</link>
			<guid isPermaLink="false"> https://anchor.fm/coten/episodes/94COTEN-RADIO-ebu6ld</guid>
			<pubDate>Mon, 06 Jan 2020 21:00:00 GMT</pubDate>
			<enclosure url="https://anchor.fm/s/8c2088c/podcast/play/1000001/episode-94.mp3" length="12345678" type="audio/mpeg"/>
			<itunes:duration>00:30:00</itunes:duration>
			<itunes:season>12</itunes:season>
			<itunes:episode>3</itunes:episode>
		</item>
		<item>
			<title><![CDATA[【特別編】年末のごあいさつ]]></title>
			<link>https://podcasters.spotify.com/pod/show/coten/episodes/special-e0000001</link>
			<guid isPermaLink="false">7b1f2c3d-4e5a-6b7c-8d9e-0f1a2b3c4d5e</guid>
			<pubDate>Tue, 31 Dec 2024 15:00:00 GMT</pubDate>
			<enclosure url="https://anchor.fm/s/8c2088c/podcast/play/1000002/episode-special.mp3" length="23456789" type="audio/mpeg"/>
			<itunes:duration>18:20</itunes:duration>
		</item>
		<item>
			<title><![CDATA[【番外編＃115】中川政七商店とコテンラジオ]]></title>
			<link>https://podcasters.spotify.com/pod/show/coten/episodes/bangai-115-e0000002</link>
			<guid isPermaLink="false">9c8b7a6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d</guid>
			<pubDate>Fri, 14 Feb 2025 21:00:00 GMT</pubDate>
			<enclosure url="https://anchor.fm/s/8c2088c/podcast/play/1000003/episode-bangai-115.mp3" length="34567890" type="audio/mpeg"/>
			<itunes:duration>00:45:10</itunes:duration>
			<itunes:season>115</itunes:season>
		</item>
	</channel>
</rss>
`;

/**
 * `item` を 1 件も持たないフィード。
 * 取得は成功したが中身が空、という壊れ方を表す。
 */
export const EMPTY_FEED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
	<channel>
		<title><![CDATA[歴史を面白く学ぶコテンラジオ （COTEN RADIO）]]></title>
	</channel>
</rss>
`;
