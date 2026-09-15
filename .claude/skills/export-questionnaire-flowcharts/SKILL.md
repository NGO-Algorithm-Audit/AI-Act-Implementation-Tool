---
name: export-questionnaire-flowcharts
description: Export branded Mermaid flowchart PDFs for the AI-Act questionnaires (Identification, Role and status, Risk category, Obligations) from the curated .mmd masters in flowcharts/src. Use when the user asks to "export/(re)generate the questionnaire flowcharts", "make the risk-category / identification / role / obligations flowchart", "update the flowchart PDFs", or wants branded decision-tree diagrams (Algorithm Audit logo + description, Avenir font, the house colour scheme) as PDFs. Also use when a questionnaire changed and its chart must be brought back in sync — the skill carries the house authoring rules and a schema-coverage check.
---

# Export questionnaire flowcharts

Renders the four AI-Act questionnaire flowcharts to branded PDFs: **Algorithm Audit logo + title +
description on top, the diagram below, all in Avenir**, page sized tightly to the content.

**The charts are hand-curated Mermaid masters in `flowcharts/src/{en,nl}/<chart>.mmd`** — they are
the source of truth for what a chart shows and how it is worded. The questionnaires
(`src/schemas/**`, `src/utils/roleStatus.ts`, `src/components/ObligationsQuestionnaire.tsx`) are the
reference for **completeness and logic**, not for wording: a chart shows a condensed, hand-written
paraphrase of each question, never the verbatim schema text. `check-coverage.mjs` enforces that
every question and outcome in the questionnaire actually appears in the chart.

**The four `nta-*` masters plus the merged `nta` master are the one exception to "hand-curated": they
are generated**, by `nta-generate.mjs`, from the schemas in `src/schemas/nta/nl/` plus the paraphrase
sentences in `nta-content.ts` — see "NTA 8047 charts only" below. Never hand-edit
`flowcharts/src/nl/nta*.mmd` directly; edit `nta-content.ts` (wording) or the schema (questions) and
regenerate. Every other chart is still hand-curated as described above.

Charts (EN + NL): `identification`, `identification-ai`, `identification-algo`,
`identification-sadm`, `role`, `risk`, `obligations` → `flowcharts/{en,nl}/<chart>.pdf`.
Charts (NL only): `nta-wenselijkheid`, `nta-ontwerp`, `nta-verificatie`, `nta-gebruik` — the four NTA
8047 questionnaires the tool offers — plus `nta`, the four merged into one diagram — →
`flowcharts/nl/<chart>.pdf`. These four are Dutch-only because `src/schemas/nta/en/*.json` are still
byte-identical copies of the Dutch schemas; add the English masters (and the `en` entries in
`descriptions.ts`) once they are translated. They are also the only *linear* questionnaires:
documentation forms with no branches, so the charts are a chain of screen nodes (condensed
paraphrase, number of requirements) ending in the result screen — no edge labels, one `Q` class plus
one terminal class. **They do not cite the standard's own chapter or paragraph numbers anywhere** —
that framing is deliberately left out of the generated charts to avoid reproducing the standard's own
structure; see the NTA rules below for what a box shows instead, and for how the merged `nta` chart
is wired.

**Hard requirement: each PDF is exactly one page — the header and the diagram must never be split
across pages.** The page height is measured from the actual rendered layout rather than assumed, and
`render.mjs` verifies the page count of every PDF it writes.

## When this skill applies
- "Export / regenerate the questionnaire flowcharts (as PDF)."
- "Make/update the risk-category / identification / role-and-status / obligations flowchart."
- A questionnaire changed and its flowchart must follow.
- Any request for the branded AI-Act decision-tree diagrams.

## Prerequisites
- Node (repo uses v26) — scripts run via `npx --yes tsx`.
- `npx --yes @mermaid-js/mermaid-cli` (downloaded on demand; no install needed).
- **Google Chrome** installed (Puppeteer browser + HTML→PDF). `render.mjs` tries a short list of
  known install paths per platform (macOS app bundle, Windows `Program Files`) and picks whichever
  exists; add yours to the candidate list at the top of `render.mjs` if neither resolves.
- Avenir (macOS system font) — referenced in the Mermaid `themeCSS` and the page CSS. Falls back to
  Helvetica/system-sans where Avenir isn't installed (e.g. Windows) — close enough to proof a chart,
  but check the real font renders before treating a PDF as final.

## Procedure
Run from the repo root. **For every chart except the NTA ones:**

```bash
# 1) edit the curated master(s) by hand:  flowcharts/src/{en,nl}/<chart>.mmd
#    (follow the authoring rules below — this is where chart content lives)

# 2) check the masters against the questionnaires (questions, outcomes, EN/NL parity)
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/check-coverage.mjs

# 3) .mmd -> SVG (Avenir) -> HTML (logo + description) -> PDF
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/render.mjs flowcharts
```

**For the NTA charts** (`nta`, `nta-wenselijkheid`, `nta-ontwerp`, `nta-verificatie`, `nta-gebruik`),
step 1 is different — nothing under `flowcharts/src/nl/nta*.mmd` is hand-edited:

```bash
# 1) change wording in nta-content.ts, or questions in src/schemas/nta/nl/*.json, then rebuild
#    the five .mmd masters from them (this fully rewrites all five files every run)
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/nta-generate.mjs

# 2) and 3) same as above — check-coverage.mjs, then render.mjs
```

If a question is new (or its schema key changed) and has no `nta-content.ts` entry yet,
`nta-generate.mjs` stops and names it — add the paraphrase there first, then rerun.

The argument (`flowcharts`) is the chart dir: masters are read from `<dir>/src/{en,nl}/`, PDFs are
written to `<dir>/{en,nl}/`. Any further arguments limit the run to those chart keys, so one chapter
can be re-exported without rewriting the other PDFs:

```bash
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/render.mjs flowcharts nta-gebruik
```

Step 3 logs `PDF: en/risk.pdf (9892x3604, 1 page)` per chart. **Every chart must say `1 page`** — a
`2 pages, retrying taller` warning is self-healing, but a `still N pages — header/diagram split!`
error means the output is broken and must be fixed before shipping. To re-check existing PDFs:

```bash
python3 -c "
import re, glob
for f in sorted(glob.glob('flowcharts/*/*.pdf')):
    d = open(f,'rb').read()
    print(f, len(re.findall(rb'/Type\s*/Page[^s]', d)))"
```

## Chart authoring rules (house style)

These rules are what separates a real chart from a thin auto-generated one. Follow them whenever you
create or edit a master. The risk master (`flowcharts/src/en/risk.mmd`) is the reference example.

1. **Completeness.** Every question in the questionnaire gets its own node, and every outcome is
   reached. Risk = 34 questions + 7 terminals (`LOW`, `HIGH`, `HIGHSECA`, `HIGHSECB`, `HIGHEXCEPT`,
   `FORB`, `FORBEXCEPT`). A chart that shows a backbone and stops is not shippable — run
   `check-coverage.mjs`.
2. **Node ids.** `Q1..Qn` in flow order, matching the tool's `ui:id` numbering; suffix when one
   question forks (`Q2A`/`Q2B`). Terminals and shared screens get semantic uppercase ids (`LOW`,
   `HIGHSECA`, `EXCH`, `EXCF`, `PATH_A`, `ROLE_PD`). Never schema-key ids like `n_III_1_1`.
3. **Node labels — head line + condensed paraphrase.** First line is the question number plus **at
   most 2–3 short citations**, plain weight (no `<b>`). Then a paraphrase of the question in 2–4
   short lines ending in `?`. Never paste the schema `title`, and never dump the full `ui:badges`
   list (no "Draft guidelines on the classification of high-risk AI systems (122)-(124)"):

   ```
   Q7["Q7 · Art. 5(1)(h) · Annex III(1.2)<br/>Public safety or<br/>law enforcement?"]:::Q
   ```

   The header's closing sentence ("The complete questions can be found in the AI AQT tool itself")
   is what licenses this condensation — keep it in `descriptions.ts`.
4. **Edge labels.** Short paraphrase of the answer, 2–6 words, at most 2 lines:
   `|"Facial-recognition database"|`, `|"None of the below"|`, `|"High-risk option"|`. Never the
   verbatim option sentence, never a placeholder count like `19 answers`.
5. **Shared nodes, not duplicated branches.** A question or screen reached from several branches is
   declared **once** and linked to from all of them (`EXCH`, `EXCF`, `Q29`, `Q11`). Never drop a
   branch because its follow-up questions already appear elsewhere — the convergence *is* the logic.
6. **Line breaks are authored, not left to the renderer.** Break every label with explicit `<br/>`.
   `mmdc-config.json` sets `wrappingWidth: 2500` so mermaid-cli does not re-wrap at its 200px
   default (that default turns the obligations chart from 5350×3272 into a 2963×7347 column).
7. **Sectioning.** One `%% ════════ Qn — topic ════════` banner per question/domain, with the node
   declaration immediately followed by its outgoing edges.
8. **Classes.** Use every class the chart declares: `Q` for questions, `gate` for the Annex III
   fan-out, `exc` for exception screens, `cat_*` for outcomes. Unused classDefs mean a missing part
   of the flow — `check-coverage.mjs` reports them. Colours come from `styles.ts`; spacing per
   chart: risk `nodeSpacing 100 / rankSpacing 140`, identification & role `80/110`, obligations
   `90/130`.
9. **High-fanout edge colouring.** Where many domain branches converge on two targets, colour them
   with tail `linkStyle` lines — `#b08968` (brown) for edges into `EXCH`, `#9370DB` (purple) for
   edges into `Q29`. Indices are 0-based in edge declaration order, so **recount them after any edge
   is added, removed or reordered**.
10. **Terminal wording.** Outcome nodes carry their legal basis, e.g.
    `HIGHSECA["High-risk AI system<br/>Annex I — Section A<br/>(Art. 6(1); full Art. 8–17,<br/>conformity assessment,<br/>registration, post-market<br/>monitoring)"]:::cat_high`.
11. **EN/NL parity.** Both languages use the same node ids and the same structure; only the wording
    differs. `check-coverage.mjs` diffs the node id sets.
12. **One page.** See the hard requirement above.

## NTA 8047 charts only (`nta`, `nta-*`)

These four questionnaires are linear documentation forms with no branches, and — unlike every other
chart in this skill — **their masters are not hand-edited**. `nta-generate.mjs` rebuilds all five
`.mmd` files from the schemas plus `nta-content.ts` on every run. The rules below describe what it
builds, for anyone reading or changing that script; day to day, the only file to edit is
`nta-content.ts` (wording) or the schema (questions).

1. **One node per screen**, not per requirement: head line is the schema's `ui:groupTitle` (nothing
   else — see point 6), then the 2–4 line condensed paraphrase from `nta-content.ts`, then
   `(n vereisten)`. Requirements themselves are listed inside the tool, not in the chart.
2. **Requirement count**, computed from the schema, never typed by hand: a `checkboxes` question
   counts its `enum` options, minus any option that reads as "none of the above" or "not applicable"
   (`geen van de bovenstaande…` / `niet van toepassing…`, case-insensitive prefix match — see
   `NONE_OF_ABOVE` / `NOT_APPLICABLE` in `nta-schema.ts`). A `radio` question always counts as **1**
   requirement, regardless of how many answer options it has — the question itself is the
   requirement, not each option.
3. **No edge labels.** There are no answers to paraphrase — the screens simply follow each other.
4. **Each chapter ends in its own result node** (`Resultaat<br/>vastgelegd`), mirroring the result
   screen of that questionnaire.
5. **Merged chart `nta` — layout and wiring (mandatory).**
   - **The four chapters sit below each other, each as one left-to-right row**: top-level
     `flowchart TB`, one `subgraph` per chapter with `direction LR`. This keeps the PDF narrow
     (~6.700px instead of the ~16.100px of a single ribbon).
   - **No edge may cross a chapter's `subgraph` boundary.** Mermaid silently drops a cluster's
     `direction` as soon as an edge connects a node inside it to a node outside — verified with both
     the dagre and the elk renderer — and the whole diagram collapses into one serial chain. A node
     that a chapter links to therefore has to live *inside* that chapter.
   - The entry into every chapter is drawn as an **entry connector at the head of its row**, wired to
     that chapter's first screen: `▶ Vanaf het NTA-scherm` for the first chapter, and
     `▶ Vanaf het NTA-scherm of Resultaat <titel van de vorige vragenlijst>` for the rest — the
     previous chapter's own `JSONSchema.title`, not a chapter number. Each chapter still ends in its
     own result node, so the hand-off is readable across the rows. This off-page-connector convention
     is what a single arrow between the rows would be — mermaid cannot draw that arrow without
     destroying the row layout, so do not try.
   - Chapter order comes from **invisible links between the clusters** (never between nodes):
     `CH_W ~~~ CH_O ~~~ CH_T ~~~ CH_G`. Cluster-level links do not break the inner `direction`. This
     is a fixed workflow order the tool walks the four questionnaires in, not the standard's own
     chapter numbers.
   - Those three links inherit `linkStyle default` and would render as stray blue lines, so the
     master ends with an explicit `linkStyle <i>,<j>,<k> stroke:none,stroke-width:0px`.
     `nta-generate.mjs` computes these indices itself (total edges so far = one entry-edge plus one
     chain-edge per question, summed per chapter) — this is no longer something a human recounts.
   - Node ids are prefixed per chapter (`W`, `O`, `T`, `G` — initials, not chapter numbers) so the
     four chains can live in one diagram; `check-coverage.mjs` therefore skips the Q-number check for
     `nta` and relies on the four chapter charts.
   - **The rows are left-aligned**, so the entry connectors of the four chapters line up in one
     column and each row starts at the same x. Mermaid centres clusters of unequal width, so
     `render.mjs` does this after rendering: every cluster is emitted as a nested
     `<g class="root" transform="translate(x,y)">`, and each row's `x` is pulled to the smallest
     one (`LEFT_ALIGN_ROWS` in `render.mjs`, currently just `nta`). It is only safe because no
     visible edge crosses a cluster boundary — with such an edge the shift would tear it loose from
     its node, so keep the previous rule.
6. **No standard numbering anywhere in the generated output** — no chapter number ("hoofdstuk 6"),
   no paragraph number ("§ 6.2"), on any node, entry connector, or cluster title. Everything a box
   needs comes from the schema's own `JSONSchema.title` / `ui:groupTitle` and from `nta-content.ts`.
   (`descriptions.ts`, the header text under the logo, is edited by hand separately and is out of
   scope for this rule.)
7. **Cluster styling** comes from the `nta` entry in `styles.ts`'s init block: `clusterBkg #f2f7fb`,
   `clusterBorder #9dbcd8`, `titleColor #005AA7` (Mermaid's default cluster orange is not house
   style). The four standalone chapter charts have no subgraphs, so their `styles.ts` entries carry
   no cluster variables and no `entry` classDef — both would be flagged as unused by
   `check-coverage.mjs`.

## Keeping charts in sync with the questionnaires

`check-coverage.mjs` reads the risk JSON schema and the identification schema factory, extracts the
`ui:id` question numbers and compares them with the `Q<n>` nodes in each master. It reports, per
chart and language: questions in the schema missing from the chart, `Q` nodes no longer in the
schema, unused classDefs, and EN/NL node-id drift. Exit code is non-zero when anything is off.

For the four `nta-*` charts it runs two further, NTA-specific checks, since those masters are
generated rather than hand-curated: every schema question must have an `nta-content.ts` entry
(otherwise `nta-generate.mjs` itself already refuses to run), and the `(n vereisten)` shown on each
box in the `.mmd` must match a fresh count from the schema — a mismatch there means the schema
changed since `nta-generate.mjs` last ran, and the fix is to rerun it, not to hand-edit the count.

Findings are for a human to resolve — the labels are legal content, so **never silently rewrite or
delete a question node to make the check pass**. Report the drift and ask. (For the `nta-*` charts,
"rewrite" here means the paraphrase in `nta-content.ts` — the same rule applies to it.)

## Files
- `flowcharts/src/{en,nl}/*.mmd` — **the curated chart masters. Edit these** — except
  `flowcharts/src/nl/nta*.mmd`, which `nta-generate.mjs` overwrites; edit `nta-content.ts` instead.
- `check-coverage.mjs` — questionnaire ↔ chart sync check (see above).
- `nta-generate.mjs` — **builds `flowcharts/src/nl/nta*.mmd`.** Reads the four schemas in
  `src/schemas/nta/nl/` (via `nta-schema.ts`) and the paraphrases in `nta-content.ts`, and writes all
  five NTA masters. Stops and names the question if one has no `nta-content.ts` entry yet, instead of
  shipping a blank or guessed box. See "NTA 8047 charts only" above for what it builds and why.
- `nta-schema.ts` — shared question-extraction/counting logic (schema → ordered list of
  `{qid, groupTitle, count}`), imported by both `nta-generate.mjs` and `check-coverage.mjs` so the
  counting rule (see NTA rule 2 above) can't drift between what a chart shows and what the check
  expects.
- `nta-content.ts` — **the hand-written NTA paraphrases. Edit here to change NTA chart wording.** One
  entry per chapter per question id; both the standalone chapter chart and the merged `nta` chart are
  built from the same entry, so a wording change here updates both at once.
- `render.mjs` — mermaid-cli → SVG → HTML wrapper → Chrome `--print-to-pdf`. Also holds
  `LEFT_ALIGN_ROWS`, the set of charts whose subgraph rows are left-aligned after rendering. The page height is
  **measured** in a headless-Chrome `--dump-dom` pass (the header wraps differently per chart and
  language), so header + diagram always land on a single page; the page count of each PDF is
  checked afterwards and re-rendered once, taller, if it ever splits. Chrome path, the logo path, and
  the `npx`/mermaid-cli invocation are all resolved per-platform (candidate paths near the top of the
  file) since this has been run from both macOS and Windows checkouts.
- `descriptions.ts` — the EN/NL title + lead paragraph shown under the logo (curated house wording:
  title names the articles covered, lead enumerates the screens and closes with the pointer to the
  tool). **Edit here to change wording** — including the NTA header text, which still names the
  standard's chapters/paragraphs by hand; that is a deliberate exception to NTA rule 6 above.
- `styles.ts` — the Mermaid `%%{init}%%` block + every `classDef` used by the charts. **Edit here to
  change colours/fonts.**
- `generate.ts` — **scaffold only, never shipped, and does not cover the NTA charts.** Derives a
  rough skeleton from the schemas into `flowcharts/.scaffold/` (gitignored) for `identification`,
  `risk`, `role` and `obligations` only — its branching/terminal-classification model doesn't fit the
  NTA questionnaires' linear, no-branch shape, which is why `nta-generate.mjs` is a separate script
  rather than an addition to this one. Even where `generate.ts` does apply, its `expanded` guard
  collapses every branch that converges on a shared block, and its labels are the verbatim schema
  title + full badge list. Treat its output as a checklist, not a chart.
- `mmdc-config.json` (Avenir + `wrappingWidth`), `puppeteer-config.json` (installed Chrome — a
  per-run copy with the resolved path is written to a temp dir by `render.mjs`; this file's own
  `executablePath` is just the macOS default).

## Customising
- Chart content, wording, structure → the masters in `flowcharts/src/`, **except the `nta-*` charts**
  → `nta-content.ts` (wording) or the schema (questions), then `nta-generate.mjs`.
- Colours / node & terminal styling → `styles.ts` (per chart key).
- Header title + description → `descriptions.ts`.
- Logo path, page padding, output dir, Chrome path → top of `render.mjs`.

## Known drift (as of the last export)
`check-coverage.mjs` currently reports, for a human to decide on:
- `risk` (EN + NL): schema question `q35` (`6.3`) has no node in the chart, and the chart's `Q19`
  no longer exists in the schema.
- `identification`: the EN master has a `START` node the NL master lacks.

The `nta-*` charts are checked against `src/schemas/nta/nl/*.json` (their `ui:id`s number the
screens, not the individual requirements on a screen) and are skipped for EN.
