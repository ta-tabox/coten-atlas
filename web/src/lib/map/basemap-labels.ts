/**
 * ベースマップのスタイルの JSON から、地名を日本語で出すスタイルを作る純関数を置く。
 * スタイルの取得は持たず、地図の部品が持つ。
 *
 * 取得したスタイルを描画の前に書き換えるのは、`load` の後に書き換えると最初の一瞬だけ英語で描かれ、書き換えたスタイルをリポジトリが配ると上流の更新を手で追うことになるからである。
 * このモジュールは biome の設定で `maplibre-gl` の型を import できないので、スタイルを構造の型で受け、渡された型のまま返す。
 */

/**
 * 地名を出すレイヤの `text-field` に置く式。
 * 日本語名（`name:ja`）を出し、無ければラテン文字の名前（`name:latin`）だけを 1 行で出し、それも無ければ現地の名前（`name`）を出す。
 */
const JAPANESE_NAME_FIELD = [
  "coalesce",
  ["get", "name:ja"],
  ["get", "name:latin"],
  ["get", "name"],
];

/** `toJapaneseLabelStyle` が読むレイヤの欄だけを持つ形。 */
type StyleLayer = { type: string; layout?: Record<string, unknown> };

/**
 * `expression` が、`name` で始まるプロパティ（`name`・`name_en`・`name:latin` など）を `get` で読む式を含めば true を返す。
 * 道路番号の `["get", "ref"]` のように `name` を読まない式は false になる。
 */
function readsName(expression: unknown): boolean {
  if (!Array.isArray(expression)) {
    return false;
  }

  const [operator, property] = expression;

  if (operator === "get" && typeof property === "string") {
    return property.startsWith("name");
  }

  return expression.some(readsName);
}

/**
 * `layer` が地名を出す `symbol` レイヤなら、`text-field` を `JAPANESE_NAME_FIELD` に置き換えた新しいレイヤを返す。
 * 地名を出さないレイヤは `layer` をそのまま返す。
 */
function toJapaneseLabelLayer<Layer extends StyleLayer>(layer: Layer): Layer {
  if (layer.type !== "symbol" || !readsName(layer.layout?.["text-field"])) {
    return layer;
  }

  return {
    ...layer,
    layout: { ...layer.layout, "text-field": JAPANESE_NAME_FIELD },
  };
}

/**
 * `style` の地名を出す `symbol` レイヤの `text-field` を `JAPANESE_NAME_FIELD` に置き換えた、新しいスタイルを返す。
 * `style` は書き換えない。
 *
 * `style.layers` が配列でなければ throw する。
 */
export function toJapaneseLabelStyle<
  Style extends { layers: readonly StyleLayer[] },
>(style: Style): Style {
  return { ...style, layers: style.layers.map(toJapaneseLabelLayer) };
}
