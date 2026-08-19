---
name: export-questionnaire-flowcharts
description: Generate and export Mermaid flowchart PDFs for the AI-Act questionnaires (Identification, Role and status, Risk category, Obligations) directly from their JSON schemas / code. Use when the user asks to "export/(re)generate the questionnaire flowcharts", "make the risk-category / identification / role / obligations flowchart", "update the flowchart PDFs", or wants branded decision-tree diagrams (Algorithm Audit logo + description, Avenir font, the house colour scheme) as PDFs. Auto-derives the graph from the schemas so the charts stay in sync; renders each as a tightly-sized PDF via mermaid-cli + headless Chrome.
---

# Export questionnaire flowcharts

Builds Mermaid flowcharts for the four AI-Act questionnaires **from the source of truth**
(the RJSF JSON schemas, and — for Role/Obligations — the app's decision logic), then renders each
to a branded PDF: **Algorithm Audit logo + a short description on top, the diagram below, all in
Avenir**, using the exact colour scheme from the curated charts in `~/Desktop/old mermaid`
(reproduced verbatim in `styles.ts`). Pages are sized tightly to the content while keeping node/edge
text at a readable 14px.

Outputs (default `flowcharts/{en,nl}/<chart>.pdf`): `identification`, `identification-ai`,
`identification-algo`, `identification-sadm`, `role`, `risk`, `obligations` — in English and Dutch.

## When this skill applies
- "Export / regenerate the questionnaire flowcharts (as PDF)."
- "Make/update the risk-category / identification / role-and-status / obligations flowchart."
- Any request for the branded AI-Act decision-tree diagrams.

## Prerequisites
- Node (repo uses v26) — runs the generator via `npx --yes tsx`.
- `npx --yes @mermaid-js/mermaid-cli` (downloaded on demand; no install needed).
- **Google Chrome.app** installed (used as the Puppeteer browser and for HTML→PDF). Path is in
  `puppeteer-config.json` / `render.mjs`.
- Avenir (macOS system font) — referenced in the Mermaid `themeCSS` and the page CSS.

## Procedure
Run from the repo root:

```bash
# 1) schema/code -> Mermaid .mmd  (writes <outDir>/{en,nl}/*.mmd)
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/generate.ts flowcharts

# 2) .mmd -> SVG (Avenir) -> HTML (logo + description) -> PDF  (writes the .pdf next to the .mmd)
npx --yes tsx .claude/skills/export-questionnaire-flowcharts/render.mjs flowcharts
```

The argument (`flowcharts`) is the output dir; omit it to default to `<repo>/flowcharts`.

## Files
- `generate.ts` — walks each schema (continuation-passing over `properties` +
  `dependencies.oneOf` + `$ref`, mirroring `src/components/WizardForm.tsx`), maps terminal markers
  (`riskOutcome`, `classification`, role) to colour classes, and emits `.mmd`. Role and Obligations
  are built from `src/utils/roleStatus.ts` + `src/components/ObligationsQuestionnaire.tsx` in
  `role-obligations.ts` (they have no JSON schema).
- `styles.ts` — the Mermaid `%%{init}%%` block + every `classDef` (copied verbatim from
  `~/Desktop/old mermaid`). **Edit here to change colours/fonts.**
- `descriptions.ts` — the EN/NL title + description shown under the logo. **Edit here to change wording.**
- `render.mjs` — mermaid-cli → SVG → HTML wrapper → Chrome `--print-to-pdf`, page auto-sized.
- `mmdc-config.json` (forces Avenir), `puppeteer-config.json` (points at installed Chrome).

## Customising
- Colours / node & terminal styling → `styles.ts` (per chart key).
- Header title + description → `descriptions.ts`.
- Logo path, header size, label wrap width, output dir → top of `render.mjs` / `generate.ts`.

## Known limitations / follow-ups
- The schema-driven charts (risk, identification) render the correct **backbone + branches**, but the
  deep-branch **terminal enumeration is not yet complete** — some outcome nodes further down a chain
  are not reached (e.g. risk currently surfaces the high-risk terminal but not every
  low/forbidden/exception leaf). Cause: the traversal's shared-block `expanded` guard collapses
  branches that share downstream questions. Fix by keying expansion on (question + continuation) or
  giving shared sub-flows context-specific node ids.
- Because of the above, the **3 Identification sub-charts** (AI / algorithm / sADM) currently come out
  empty (their outcome terminals aren't reached yet) and are skipped by `render.mjs`.
- Auto-generated labels come from the schema (`title`, `enum`, `ui:badges`); layout is auto
  (`flowchart LR`) — so logic/colours/fonts match the curated charts, but the hand-tuned wording and
  numbering of `~/Desktop/old mermaid` are not reproduced.
