# 0022. 地図の上に載せるものは React 側で書き、MapLibre の DOM は canvas と attribution に限る

- **状態**: 採用
- **決定日**: 2026-08-31
- **関係する ADR**: 0003、0004、0021

## 文脈

MapLibre は canvas の外にも DOM を吐く。
attribution・NavigationControl・ScaleControl・Popup は素の DOM 要素で、位置・背景・余白・フォントを `maplibre-gl.css` が持つ。

S5（詳細カード・パネル・関連シリーズ行）から、地図の上に載る overlay が増える。
それを MapLibre の Popup で書くか、地図の外に置いた React の要素で書くかを決めていない。
決めずに書き始めると、同じ「地図の上のカード」が二つの体系で書かれる。

いま MapLibre 由来で DOM に出ているのは attribution ただ一つである。
`MapCanvas` は built-in control を一つも足しておらず、Marker も Popup も無い。

## 決定

**地図の上に載せるものは React + Tailwind で書く。MapLibre が吐く DOM は canvas コンテナと attribution に限る。**

- `<Marker>` は使う。位置決め（`transform: translate()`）だけを担い、中身は React children なのでユーティリティクラスが効く
- `<Popup>` は使わない。詳細カード（#6）は地図の外に置く overlay として書く
- built-in control（Navigation・Scale 等）を足さない。要るなら自前の React コンポーネントから `useMap()` を叩く
- `maplibre-gl.css` は読み込む。canvas コンテナのレイアウトを持っており、外すと地図が壊れる

## 理由

MapLibre の DOM へユーティリティクラスを当てても効かない。
`maplibre-gl.css` はレイヤなしで読み込まれ、Tailwind の生成物は `@layer theme, base, components, utilities` に入るので、レイヤなしの側が常に勝つ（[0021](0021-tailwind-v4.md) で実測した）。
`.maplibregl-popup-content` に `padding` と `background` を当てようとしても maplibre の値が残るので、書いた人は効かない理由を探すことになる。

同じ性質が attribution を preflight から守っている。
勝ち負けの向きは一つなので、片方を守る仕組みがもう片方の禁止則をそのまま生む。

Marker が例外になるのは、maplibre の規則が children へ届かないからである。
`maplibre-gl.css` が `.maplibregl-marker` へ与えるのは `position: absolute` と `top`・`left`・`will-change`・`transition` だけで、子孫を選択する規則が無い（6.6.0 で確認した）。
裏返しとして、ルート要素へ当てたユーティリティはこの 5 つと当たる範囲で負ける。
位置と重なりはルートの外側の要素で決め、Marker の中身は children 側へ書く。

## 帰結

- 地図の上の要素の重なり順は React 側で決まる。canvas は 1 枚の背景で、その上の z-index は `globals.css` の `@theme` が一箇所で持つ（0021）
- **地物のクリックから詳細カードまでの経路は React の state を通る**。Popup を使わないので、選択は `ARCHITECTURE.md`「4. UI 構成」の単一の selection state が運ぶ
- 地図の操作 UI（ズーム・方位リセット）を足すときは、見た目を自分で書く分だけ費用が増える
- **`maplibre-gl.css` を外す最適化は採れない**。attribution の位置と背景（[0004](0004-openfreemap-positron.md)）も canvas コンテナのレイアウトもこの CSS が持つ
- attribution だけは MapLibre のスタイルで出る。サイト全体の見た目と揃わないが、揃えようとすると `attributionControl: false` へ倒すことになり、0004 が要求する自動追随を失う

## 覆る条件

MapLibre 側の DOM を触る必要が実際に出たとき。
そのときはレイヤの勝ち負けを変える（`maplibre-gl.css` を `@layer` 付きで import する）ことになり、attribution が preflight に負ける側へ回るので、0004 の要求を別の手段で満たしてから決める。
