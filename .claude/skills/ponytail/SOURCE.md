# ponytail の出所

上流は https://github.com/DietrichGebert/ponytail の `96608e0`（MIT、著作権表示は同じディレクトリの `LICENSE`）である。
クラウドセッションはリポジトリが宣言した plugin を読み込まないので、`skills/` の `ponytail`・`ponytail-review`・`ponytail-audit` を `.claude/skills/` へ同梱してある。
上流の更新は手で取り込む。

## 上流との差

`ponytail/SKILL.md` から次を外してある。

- frontmatter の `argument-hint`
- `description` 末尾の `Levels: lite, full (default), ultra.` の一文
- 「Active for the whole session …」の行と `## Levels` の節
  強度の切り替えは hook とコマンドが前提で、同梱では効かない
- 「Comment only the why the code cannot show, in one line.」の行
  `.claude/rules/coding.md` の JSDoc 規則が勝つ

`ponytail-review`・`ponytail-audit` は、`## 4. Output` の「Very simple English: …」の段落だけを、出力を日本語にする指示へ置き換えてある。
`shortcut: <限界>, <作り直す時期>` のコメントの行は上流のまま残してある。
