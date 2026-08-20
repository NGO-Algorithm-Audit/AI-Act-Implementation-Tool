/*
 * render.mjs — render each curated master <outDir>/src/{en,nl}/<chart>.mmd to a
 * branded PDF at <outDir>/{en,nl}/<chart>.pdf: Algorithm Audit logo + description
 * header (Avenir) on top, the Mermaid diagram below, page sized tightly to the
 * content and always a single page.
 *
 * Run:  node .claude/skills/export-questionnaire-flowcharts/render.mjs <outDir>
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "../../..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LOGO = "/Users/jurriaan/Library/CloudStorage/OneDrive-AlgorithmAudit/Team Algorithm Audit/House style/01 Logo/logo_MAIN.svg";
const outDir = process.argv[2] || resolve(REPO, "flowcharts");

const DESC = (await import("./descriptions.ts")).DESCRIPTIONS ??
  (await import("./descriptions.js")).DESCRIPTIONS;

const logoDataUri = existsSync(LOGO)
  ? "data:image/svg+xml;base64," + readFileSync(LOGO).toString("base64")
  : "";

const svgSize = (svg) => {
  let w = +(svg.match(/<svg[^>]*\swidth="([\d.]+)"/)?.[1] || 0);
  let h = +(svg.match(/<svg[^>]*\sheight="([\d.]+)"/)?.[1] || 0);
  if (!w || !h) {
    const vb = svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/);
    if (vb) { w = +vb[1]; h = +vb[2]; }
  }
  return { w: Math.ceil(w) || 1200, h: Math.ceil(h) || 800 };
};

const PAD = 28, LOGO_W = 240;
const pageWidth = (w) => Math.max(w + PAD * 2, LOGO_W + PAD * 2 + 40, 640);

// pageH === null -> measure mode: no @page rule, page height is auto and the measured
// height of .page is reported back through <title> (read via Chrome --dump-dom).
const html = (svg, w, h, title, desc, pageH) => {
  const pageW = pageWidth(w);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  ${pageH ? `@page { size: ${pageW}px ${pageH}px; margin: 0; }` : ""}
  * { box-sizing: border-box; }
  html,body { margin:0; padding:0; font-family:"Avenir Next","Avenir",Helvetica,sans-serif; color:#1a1a1a; }
  .page { width:${pageW}px; padding:${PAD}px; break-inside:avoid; }
  .hdr { border-bottom:2px solid #005AA7; padding-bottom:14px; margin-bottom:${PAD}px; }
  .hdr img { width:${LOGO_W}px; height:auto; display:block; margin-bottom:10px; }
  .hdr h1 { font-family:"Avenir Next","Avenir",sans-serif; font-size:19px; font-weight:700; margin:0 0 6px; color:#005AA7; }
  .hdr p { font-size:13px; line-height:1.45; margin:0; max-width:${Math.min(pageW - PAD * 2, 900)}px; color:#333; }
  .diagram { }
  .diagram svg { max-width:none !important; }
  </style></head><body><div class="page">
    <div class="hdr">${logoDataUri ? `<img src="${logoDataUri}" alt="Algorithm Audit"/>` : ""}
      <h1>${title}</h1><p>${desc}</p></div>
    <div class="diagram">${svg}</div>
  </div></body></html>${pageH ? "" : `<script>document.title = "H=" + Math.ceil(document.querySelector(".page").getBoundingClientRect().height)</script>`}`;
};

// Run the measure-mode page in headless Chrome and read back the laid-out height.
// Falls back to an estimate (logo aspect ratio + text/padding) if that fails.
const measurePageHeight = (htmlPath, h) => {
  try {
    const dom = execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--dump-dom", `file://${htmlPath}`],
      { stdio: ["ignore", "pipe", "ignore"], encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
    const m = dom.match(/<title>H=(\d+)<\/title>/);
    if (m) return +m[1] + 4; // slack for Chrome's px -> pt rounding
  } catch (e) {
    console.warn("measure failed:", e.message);
  }
  const logo = logoDataUri ? svgSize(readFileSync(LOGO, "utf8")) : { w: 1, h: 0 };
  const logoH = logoDataUri ? Math.ceil(LOGO_W * (logo.h / logo.w)) + 10 : 0;
  console.warn("using estimated header height");
  return PAD * 2 + logoH + 130 + h;
};

const pdfPageCount = (path) =>
  (readFileSync(path).toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;

const charts = ["identification", "identification-ai", "identification-algo", "identification-sadm", "role", "risk", "obligations"];
const tmp = mkdtempSync(join(tmpdir(), "fc-"));

for (const lang of ["en", "nl"]) {
  // curated masters live in <outDir>/src/<lang>; PDFs are written to <outDir>/<lang>
  const srcDir = join(outDir, "src", lang);
  const dir = join(outDir, lang);
  if (!existsSync(srcDir) && !existsSync(dir)) continue;
  mkdirSync(dir, { recursive: true });
  for (const chart of charts) {
    const mmd = [join(srcDir, `${chart}.mmd`), join(dir, `${chart}.mmd`)].find(existsSync);
    if (!mmd) continue;
    const svgPath = join(tmp, `${lang}-${chart}.svg`);
    // 1) mermaid -> svg (Avenir themeCSS, installed Chrome)
    execFileSync("npx", ["--yes", "@mermaid-js/mermaid-cli", "-i", mmd, "-o", svgPath,
      "-c", join(__dirname, "mmdc-config.json"), "-p", join(__dirname, "puppeteer-config.json"),
      "-b", "white"], { stdio: "inherit" });
    const svg = readFileSync(svgPath, "utf8").replace(/<\?xml[^>]*\?>/, "");
    const { w, h } = svgSize(svg);
    if (w <= 40 && h <= 40) { console.warn("SKIP empty:", `${lang}/${chart}`); continue; }
    const d = DESC[lang]?.[chart] || { title: chart, text: "" };
    // 2) measure the real content height (header wraps differently per chart/language)
    const measure = join(tmp, `${lang}-${chart}.measure.html`);
    writeFileSync(measure, html(svg, w, h, d.title, d.text, null));
    let pageH = measurePageHeight(measure, h);
    // 3) html -> pdf (Chrome, page sized to content); retry once if it still splits
    const page = join(tmp, `${lang}-${chart}.html`);
    const pdf = join(dir, `${chart}.pdf`);
    let pages = 0;
    for (const attempt of [0, 1]) {
      writeFileSync(page, html(svg, w, h, d.title, d.text, pageH));
      execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer",
        `--print-to-pdf=${pdf}`, `file://${page}`], { stdio: "inherit" });
      pages = pdfPageCount(pdf);
      if (pages <= 1) break;
      if (attempt === 0) { console.warn(`${lang}/${chart}: ${pages} pages, retrying taller`); pageH += 40; }
      else console.error(`${lang}/${chart}: still ${pages} pages — header/diagram split!`);
    }
    console.log("PDF:", `${lang}/${chart}.pdf`, `(${pageWidth(w)}x${pageH}, ${pages} page)`);
  }
}
console.log("done ->", outDir);
