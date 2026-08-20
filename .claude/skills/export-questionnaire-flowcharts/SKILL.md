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

Charts (EN + NL): `identification`, `identification-ai`, `identification-algo`,
`identification-sadm`, `role`, `risk`, `obligations` → `flowcharts/{en,nl}/<chart>.pdf`.

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
- **Google Chrome.app** installed (Puppeteer browser + HTML→PDF). Path is in
  `puppeteer-config.json` / `render.mjs`.
- Avenir (macOS system font) — referenced in the Mermaid `themeCSS` and the page CSS.

## Procedure
Run from the repo root:

```bash
# 1) edit the curated master(s) by hand:  flowcharts/src/{en,nl}/<chart>.mmd
#    (follow the authoring rules below — this is where chart content lives)

# 2) check the masters against the questionnaires (questions, outcomes, EN/NL parity)
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/check-coverage.mjs

# 3) .mmd -> SVG (Avenir) -> HTML (logo + description) -> PDF
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/render.mjs flowcharts
```

The argument (`flowcharts`) is the chart dir: masters are read from `<dir>/src/{en,nl}/`, PDFs are
written to `<dir>/{en,nl}/`.

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

## Keeping charts in sync with the questionnaires

`check-coverage.mjs` reads the risk JSON schema and the identification schema factory, extracts the
`ui:id` question numbers and compares them with the `Q<n>` nodes in each master. It reports, per
chart and language: questions in the schema missing from the chart, `Q` nodes no longer in the
schema, unused classDefs, and EN/NL node-id drift. Exit code is non-zero when anything is off.

Findings are for a human to resolve — the labels are legal content, so **never silently rewrite or
delete a question node to make the check pass**. Report the drift and ask.

## Files
- `flowcharts/src/{en,nl}/*.mmd` — **the curated chart masters. Edit these.**
- `check-coverage.mjs` — questionnaire ↔ chart sync check (see above).
- `render.mjs` — mermaid-cli → SVG → HTML wrapper → Chrome `--print-to-pdf`. The page height is
  **measured** in a headless-Chrome `--dump-dom` pass (the header wraps differently per chart and
  language), so header + diagram always land on a single page; the page count of each PDF is
  checked afterwards and re-rendered once, taller, if it ever splits.
- `descriptions.ts` — the EN/NL title + lead paragraph shown under the logo (curated house wording:
  title names the articles covered, lead enumerates the screens and closes with the pointer to the
  tool). **Edit here to change wording.**
- `styles.ts` — the Mermaid `%%{init}%%` block + every `classDef` used by the charts. **Edit here to
  change colours/fonts.**
- `generate.ts` — **scaffold only, never shipped.** Derives a rough skeleton from the schemas into
  `flowcharts/.scaffold/` (gitignored). Useful as raw material for a brand-new questionnaire, but its
  `expanded` guard collapses every branch that converges on a shared block, and its labels are the
  verbatim schema title + full badge list. Treat its output as a checklist, not a chart.
- `mmdc-config.json` (Avenir + `wrappingWidth`), `puppeteer-config.json` (installed Chrome).

## Customising
- Chart content, wording, structure → the masters in `flowcharts/src/`.
- Colours / node & terminal styling → `styles.ts` (per chart key).
- Header title + description → `descriptions.ts`.
- Logo path, page padding, output dir → top of `render.mjs`.

## Known drift (as of the last export)
`check-coverage.mjs` currently reports, for a human to decide on:
- `risk` (EN + NL): schema question `q35` (`6.3`) has no node in the chart, and the chart's `Q19`
  no longer exists in the schema.
- `identification`: the EN master has a `START` node the NL master lacks.
