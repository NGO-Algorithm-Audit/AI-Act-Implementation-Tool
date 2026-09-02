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
paraphrase of each question, never the verbatim schema text. Two automatic checks enforce this before
every export, scoped to exactly the chart(s) being exported — `check-coverage.mjs` (does a node exist
for every question?) and `check-logic.mjs` (do a node's *arrows* actually go where the schema says
they must? — see "Logic check" below).

Charts (EN + NL): `identification`, `identification-ai`, `identification-algo`,
`identification-sadm`, `role`, `risk`, `obligations` → `flowcharts/{en,nl}/<chart>.pdf`.
Charts (NL only): `nta-wenselijkheid` (NTA 8047 ch. 6), `nta-ontwerp` (ch. 7),
`nta-verificatie` (ch. 8), `nta-gebruik` (ch. 9), plus `nta` — the four chapters merged into one
diagram — → `flowcharts/nl/<chart>.pdf`. These four are
Dutch-only because `src/schemas/nta/en/*.json` are still byte-identical copies of the Dutch
schemas; add the English masters (and the `en` entries in `descriptions.ts`) once they are
translated. They are also the only *linear* questionnaires: documentation forms whose screens are
NTA sections, so the charts are a chain of screen nodes (section number, condensed paraphrase,
number of requirements) ending in the result screen — no branches, no edge labels, one `Q` class
plus one terminal class. See the NTA rules below for how the merged `nta` chart is wired.

**Hard requirement: each PDF is exactly one page — the header and the diagram must never be split
across pages.** The page height is measured from the actual rendered layout rather than assumed, and
`render.mjs` verifies the page count of every PDF it writes.

## When this skill applies
- "Export / regenerate the questionnaire flowcharts (as PDF)."
- "Make/update the risk-category / identification / role-and-status / obligations flowchart."
- A questionnaire changed and its flowchart must follow.
- Any request for the branded AI-Act decision-tree diagrams.

## Prerequisites
- Node ≥18 (repo uses v26) — scripts run via `npx --yes tsx`. **Known environment quirk:** on at
  least one dev machine the `node` on `PATH` is v16 (too old for `tsx`/`esbuild`), with a working
  Node 20 install sitting unused at `/usr/local/Cellar/node/20.8.0/bin` (x86_64 under Rosetta on
  arm64 — functional, just a slow cold start; retry once if the first Puppeteer/Chrome launch times
  out). If `npx --yes tsx ...` fails with an `esbuild`/engine error, prefix commands with
  `PATH="/usr/local/Cellar/node/20.8.0/bin:$PATH"` rather than changing the system Node version.
- `npx --yes @mermaid-js/mermaid-cli` (downloaded on demand; no install needed).
- **Google Chrome.app** installed (Puppeteer browser + HTML→PDF). Path is in
  `puppeteer-config.json` / `render.mjs`.
- Avenir (macOS system font) — referenced in the Mermaid `themeCSS` and the page CSS.

## Procedure
Run from the repo root:

```bash
# 1) edit the curated master(s) by hand:  flowcharts/src/{en,nl}/<chart>.mmd
#    (follow the authoring rules below — this is where chart content lives)

# 2) .mmd -> SVG (Avenir) -> HTML (logo + description) -> PDF
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/render.mjs flowcharts
```

**Step 2 is gated.** Before rendering anything, `render.mjs` automatically runs `check-coverage.mjs`
and `check-logic.mjs` for exactly the chart(s) about to be exported (respecting the chart-key filter
below) and prints any drift as `PRECHECK <lang>/<chart>: ...` lines. If anything fails, **no PDF is
written** and the command exits non-zero — fix the drift, or re-run with `FLOWCHART_ALLOW_DRIFT=1` to
export anyway (prints a warning, still renders). `obligations` has no declarative source and is never
gated — see "Logic check" below.

Both checks are also independently runnable, for a human who wants to check without exporting:

```bash
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/check-coverage.mjs
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/check-logic.mjs [chart...]
```

The render argument (`flowcharts`) is the chart dir: masters are read from `<dir>/src/{en,nl}/`, PDFs
are written to `<dir>/{en,nl}/`. Any further arguments limit the run to those chart keys, so one
chapter can be re-exported (and only that chapter gated) without rewriting the other PDFs:

```bash
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/render.mjs flowcharts nta-gebruik
```

It logs `PDF: en/risk.pdf (9892x3604, 1 page)` per chart. **Every chart must say `1 page`** — a
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

These four questionnaires are linear documentation forms, so the charts follow the rules above with
these additions. They apply to the NTA charts and to nothing else.

1. **One node per screen**, not per requirement: head line `§ <NTA-paragraaf> · <sectietitel>`, then
   a 2–4 line condensed paraphrase, then `(n vereisten)`. Requirements are listed inside the tool,
   not in the chart.
2. **No edge labels.** There are no answers to paraphrase — the screens simply follow each other.
3. **Each chapter ends in its own result node** (`Resultaat · Hoofdstuk <n> vastgelegd`), mirroring
   the result screen of that questionnaire.
4. **Merged chart `nta` — layout and wiring (mandatory).**
   - **The four chapters sit below each other, each as one left-to-right row**: top-level
     `flowchart TB`, one `subgraph` per chapter with `direction LR`. This keeps the PDF narrow
     (~6.700px instead of the ~16.100px of a single ribbon).
   - **No edge may cross a chapter's `subgraph` boundary.** Mermaid silently drops a cluster's
     `direction` as soon as an edge connects a node inside it to a node outside — verified with both
     the dagre and the elk renderer — and the whole diagram collapses into one serial chain. A node
     that a chapter links to therefore has to live *inside* that chapter.
   - The entry into every chapter is drawn as an **entry connector at the head of its row**, wired
     to the first screen of that chapter (`§ 6.2`, `§ 7.2`, `§ 8.2`, `§ 9.2.1`):
     `▶ Vanaf het NTA-scherm` for chapter 6, and `▶ Vanaf het NTA-scherm of Resultaat Hoofdstuk
     <n-1>` for chapters 7, 8 and 9. Each chapter still ends in its own result node, so the
     hand-off `Resultaat Hoofdstuk 6 → § 7.2` is readable across the rows. This off-page-connector
     convention is what a single arrow between the rows would be — mermaid cannot draw that arrow
     without destroying the row layout, so do not try.
   - Chapter order comes from **invisible links between the clusters** (never between nodes):
     `CH6 ~~~ CH7 ~~~ CH8 ~~~ CH9`. Cluster-level links do not break the inner `direction`.
   - Those three links inherit `linkStyle default` and would render as stray blue lines, so end the
     master with an explicit `linkStyle <i>,<j>,<k> stroke:none,stroke-width:0px`. The indices are
     0-based over all `-->` edges in declaration order — **recount them after adding or removing any
     edge**.
   - Node ids are prefixed per chapter (`W`, `O`, `T`, `G`) so the four chains can live in one
     diagram; `check-coverage.mjs` therefore skips the Q-number check for `nta` and relies on the
     four chapter charts.
   - **The rows are left-aligned**, so the entry connectors of the four chapters line up in one
     column and each row starts at the same x. Mermaid centres clusters of unequal width, so
     `render.mjs` does this after rendering: every cluster is emitted as a nested
     `<g class="root" transform="translate(x,y)">`, and each row's `x` is pulled to the smallest
     one (`LEFT_ALIGN_ROWS` in `render.mjs`, currently just `nta`). It is only safe because no
     visible edge crosses a cluster boundary — with such an edge the shift would tear it loose from
     its node, so keep the previous rule.
5. **Cluster styling** comes from the init block: `clusterBkg #f2f7fb`, `clusterBorder #9dbcd8`,
   `titleColor #005AA7` (Mermaid's default cluster orange is not house style).

## Keeping charts in sync with the questionnaires

`check-coverage.mjs` reads each chart's schema (risk/role: plain JSON; identification: the TS
factory, imported and executed to get the materialized schema object — same pattern as this check
always used), extracts the `ui:id` question numbers and compares them with the `Q<n>` nodes in each
master. It reports, per chart and language: questions in the schema missing from the chart, `Q` nodes
no longer in the schema, unused classDefs, and EN/NL node-id drift. Exit code is non-zero when
anything is off. **This is a presence check only** — it does not look at what a node's arrows point
to, which is why it can (and did) report a chart "ok" while 3 real logic bugs sat in it undetected.

Findings are for a human to resolve — the labels are legal content, so **never silently rewrite or
delete a question node to make the check pass**. Report the drift and ask.

### Logic check (`check-logic.mjs`)

Verifies branching *logic*, not just node presence, for `risk`, `role`, and `identification` (+ its 3
subset sub-charts, which reuse `identification`'s required edges). For every answer branch in the
schema that leads to another question or to a terminal outcome, the chart must have *some* path (not
necessarily a single hop — see below) from that question's node cluster (`Q7`, `Q7B`, ... all count as
cluster `Q7`) to the required destination.

**How it works:** recursively walks the schema's materialized `dependencies`/`oneOf`/`allOf`/`if-then`
tree (expanding `$ref`s to `definitions.*` in place), tracking which `ui:id`-tagged field "owns" each
branch — this is genuinely tricky in two ways worth knowing about if you touch this code: (1) a
schema sometimes declares a field's own follow-up logic as a flat **sibling** key in the same
`dependencies` object as the field that introduces it, rather than nesting it inside that branch (Q7's
safeguard checklist is declared this way relative to Q6) — the walker threads ownership through a
registry shared across the whole walk, not just the current recursive call, to get this right; (2) a
field's follow-up can share its parent's leading question number (`"q22"` vs `"q22 follow-up"` both
read as question 22) — the walker tracks each field's *full* `ui:id` string, not just the number, so
these aren't mistaken for a trivial self-loop and silently dropped. Terminal (`output.$ref`) targets
resolve to chart node ids via a small hand-maintained `TERMINAL_MAP` per chart, because the naming
isn't mechanical (`outputForbidden` → `FORB`, not `FORBIDDEN`) — `risk` has a full map; `role` and
`identification` are weak-only (existence-check: "reaches *some* terminal") because their terminals
are genuinely ambiguous or many-to-one at the schema level.

**On the chart side:** the required edge is checked via *bounded BFS* (6 hops), not a literal
single-hop arrow — `role.mmd` is why: `Q1`'s schema-required edge to `Q3` only exists as a two-hop
path through an intermediate role-label node (`ROLE_PD`) that has no schema counterpart at all. A
terminal is anything with zero outgoing edges (a topological sink) — node CSS class is *not* a
reliable signal (`ROLE_PD` carries a terminal-looking class but still has an outgoing edge).

**What this deliberately does NOT catch** (report drift for a human, same philosophy as above — never
silently patch a chart to make this pass):
- Wrong or misleading text on an otherwise-correct edge — labels are never compared, since house style
  condenses/paraphrases them and a verbatim match would be a dead end by design.
- Extra chart edges the schema doesn't require.
- A coincidentally-reachable path within the hop limit that isn't really "the same logic," just
  topologically connected.
- Exact terminal *identity* for `role`/`identification` (existence-only there, see above).

**`obligations` is intentionally excluded**, not silently skipped — it prints "not logic-checked (no
declarative source) — verify by hand" instead of a fake pass. It has no schema; it's a fixed
3-question form whose outcome text is chosen by ~15-20 imperative `switch`/`if`/ternary branches in
`ObligationsQuestionnaire.tsx`. A heuristic that scraped its i18n keys and checked they appear
somewhere in the chart would compare an implementation detail against deliberately-condensed chart
labels — noise, not signal, so it isn't attempted. `nta`/`nta-*` are out of scope too.

## Files
- `flowcharts/src/{en,nl}/*.mmd` — **the curated chart masters. Edit these.**
- `flowchart-shared.mjs` — primitives shared by both checkers: which file is chart X's source for
  language Y (`loadSchema`), `.mmd` node/edge parsing, and the `CHARTS`/`QUESTION_SOURCE`/`SUBSET_OK`/
  `NTA`/`NL_ONLY` tables. Kept in one place so the two checkers can't silently disagree about a
  chart's source.
- `check-coverage.mjs` — node-presence sync check (see above). Also exports `checkChartCoverage()`,
  called by `render.mjs`'s pre-export gate.
- `check-logic.mjs` — branching-logic sync check (see "Logic check" above). Also exports
  `checkChartLogic()`, called by `render.mjs`'s pre-export gate.
- `render.mjs` — runs the pre-export gate (both checks above, scoped to the chart(s) being exported),
  then mermaid-cli → SVG → HTML wrapper → Chrome `--print-to-pdf`. Also holds
  `LEFT_ALIGN_ROWS`, the set of charts whose subgraph rows are left-aligned after rendering. The page height is
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
- `risk` (EN + NL): fixed — was missing `q35` (`6.3`)'s node, plus 3 real branching-logic bugs
  (`check-coverage.mjs` couldn't see the latter; `check-logic.mjs` was built partly in response to
  that gap). Both checks now pass clean for `risk`.
- `identification`: the EN master has a `START` node the NL master lacks. **This now blocks an
  `identification` export** under the pre-export gate (coverage-checking is part of the same hard
  gate as the logic check) — fix it, or export with `FLOWCHART_ALLOW_DRIFT=1` in the meantime.

The `nta-*` charts are checked against `src/schemas/nta/nl/*.json` (their `ui:id`s number the
screens, not the individual requirements on a screen) and are skipped for EN.
