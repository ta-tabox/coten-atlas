# 0033. 従わせる規則は `.claude/rules/` に置き、`docs/` には記述だけを残す

- **状態**: 採用
- **決定日**: 2026-09-06
- **関係する ADR**: 0032

## 文脈

[0032](0032-docs-under-docs.md) は `CODING.md` を `docs/` へ寄せ、その移動を「雛形が配り先を `docs/CODING.md` へ変えること」を前提にした。
雛形の側は同日に配り先を `docs/` でなく `.claude/rules/` へ変えた（`fermentary/playbooks/coding-standards.md` 2026-09-06 改定。経緯は同 `coding-standards-rationale.md` #9）。
0032 の「覆る条件」が名指ししていた事態そのものなので、`CODING.md` の行き先だけを本レコードで改める。
0032 の主文（ルートに置くのは道具が要求するものだけ）は動かない。

0032 は `DESIGN.md`（AI が守るデザイン指針）の置き場を未決にしていた。
条件は `docs/` と答えるが、`ARCHITECTURE.md` §4 と ADR-0021・0022 が持つ UI 規範との境界が引けなかった。

## 決定

1. 従わせる規則（コーディング・文章・UI・言語固有の作法）は `.claude/rules/` に置く。
   `writing.md` は frontmatter の `paths` を持たず起動時に読み込まれ、`coding.md`・`design.md`・`languages/*.md` は `paths` の glob に当たるファイルを Read した時点で読み込まれる
2. `docs/CODING.md` は消す。
   本文は `.claude/rules/writing.md`（文章・コミットの粒度）と `coding.md`（命名〜テスト）に分かれ、この器で足した「比喩は使う場所で解けるときだけ」は `coding.md` の「プロジェクト固有」欄へ移す
3. skill `coding-standards` の `languages/typescript.md` は `.claude/rules/languages/` へ移す。
   SKILL.md は判断基準集のまま skill に残す
4. `DESIGN.md` は `.claude/rules/design.md` として持つ。
   置くのは AI に守らせる規則だけで、画面の現況は `docs/ARCHITECTURE.md` §4、決定の経緯は ADR が持つ
5. `CLAUDE.md` は規範本文を `@` でインポートしない。
   入口には規約の所在、skill を開く時点、隣接ファイルを読まずに新規ファイルを書くときは先に rules を Read する旨の三行だけを置く

## 理由

`docs/` に置く条件は「誰が読むか」では引けない。
`docs/ARCHITECTURE.md` も AI が読むので、それで切ると記述までルートへ戻る（0032 理由節）。
「従わせる（規範）か参照させる（記述）か」で切ると、規範は道具の読み込み口である `.claude/rules/` へ、記述は `docs/` へ分かれる。
`.claude/` は Claude Code がそのパスを決め打ちで読むので、0032 の条件にも合致する。

読み込みの機構が変わる。
`@docs/CODING.md` は起動時に無条件で展開されるので、コードに触らないセッションでもコードの規約の分を払う。
`paths` の glob 一致に契機を移すと、文脈を払うのはコードに触ったセッションだけになり、「該当言語のファイルを書き始める前に開く」という散文の指示にも頼らなくて済む。
`docs/CODING.md` のまま `@` で読む案は、位置が変わるだけで機構が変わらないので採らなかった。

SKILL.md（約 300 行）を rules に載せない。
rules は一度注入されると以後の全ターンに残るので、コードに触るたびに固定費になる。

`DESIGN.md` を `docs/` に置く案は、規範と記述の境界を引けないまま置くことになるので採らなかった。
`design.md` の各項は規則で、現況の記述（どの画面がどう組まれているか）は書かない。
書きたくなったら `docs/ARCHITECTURE.md` §4 の側へ移す。

## 帰結

- `.claude/rules/{writing,coding,design}.md` と `.claude/rules/languages/typescript.md` が雛形からの写しに加わる。
  `CLAUDE.md`「配布物の追随」の一覧は `docs/CODING.md` でなく `.claude/rules/` を指す
- `design.md` は雛形の骨格のままで、各項は UI に着手する次のセッションで埋める。
  埋めたものは「プロジェクト固有」欄でなく各節に書く（骨格の見出しは器が埋める前提で配られている）
- 0031 までのレコードが名指しする `CODING.md` は `.claude/rules/coding.md` または `writing.md` と読む。
  `docs/adr/README.md` の読み替え規則に足す
- `web/biome.json` の `noRestrictedImports` のメッセージと `web/scripts/lint-comments.ts` のコメントは `.claude/rules/` を指す。
  どちらも雛形の写しで、雛形の側が同日に直っている
- 人間が GitHub 上で規約を探すときは `README.md`「文書」節の一行から `.claude/rules/` へ辿る

## 覆る条件

Cowork のクラウド実行で project の `.claude/rules/` の `paths` が効かないと実測されたとき。
その場合は `paths` を外して無条件読み込みに落とし、ファイル構成は変えない。
判定は `web/src/` の `.ts` を一つ Read した直後の `/context` に `coding.md` と `languages/typescript.md` が載るかで行う。

Claude Code が `.claude/rules/` の機構を廃止したとき。
そのときは 0032 の条件に戻り、規範も `docs/` へ入って `@` で読む。
