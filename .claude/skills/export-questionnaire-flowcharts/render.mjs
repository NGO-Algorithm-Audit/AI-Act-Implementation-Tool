/*
 * render.mjs — render each <outDir>/{en,nl}/<chart>.mmd to a branded PDF:
 * Algorithm Audit logo + description header (Avenir) on top, the Mermaid diagram
 * below, page sized tightly to the content.
 *
 * Run:  node .claude/skills/export-questionnaire-flowcharts/render.mjs <outDir>
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdtempSync, readdirSync } from "node:fs";
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

const html = (svg, w, h, title, desc) => {
  const PAD = 28, LOGO_W = 240, HEADER_H = 150;
  const pageW = Math.max(w + PAD * 2, LOGO_W + PAD * 2 + 40, 640);
  const pageH = h + HEADER_H + PAD;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: ${pageW}px ${pageH}px; margin: 0; }
  * { box-sizing: border-box; }
  html,body { margin:0; padding:0; font-family:"Avenir Next","Avenir",Helvetica,sans-serif; color:#1a1a1a; }
  .page { width:${pageW}px; padding:${PAD}px; }
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
  </div></body></html>`;
};

const charts = ["identification", "identification-ai", "identification-algo", "identification-sadm", "role", "risk", "obligations"];
const tmp = mkdtempSync(join(tmpdir(), "fc-"));

for (const lang of ["en", "nl"]) {
  const dir = join(outDir, lang);
  if (!existsSync(dir)) continue;
  for (const chart of charts) {
    const mmd = join(dir, `${chart}.mmd`);
    if (!existsSync(mmd)) continue;
    const svgPath = join(tmp, `${lang}-${chart}.svg`);
    // 1) mermaid -> svg (Avenir themeCSS, installed Chrome)
    execFileSync("npx", ["--yes", "@mermaid-js/mermaid-cli", "-i", mmd, "-o", svgPath,
      "-c", join(__dirname, "mmdc-config.json"), "-p", join(__dirname, "puppeteer-config.json"),
      "-b", "white"], { stdio: "inherit" });
    const svg = readFileSync(svgPath, "utf8").replace(/<\?xml[^>]*\?>/, "");
    const { w, h } = svgSize(svg);
    if (w <= 40 && h <= 40) { console.warn("SKIP empty:", `${lang}/${chart}`); continue; }
    const d = DESC[lang]?.[chart] || { title: chart, text: "" };
    const page = join(tmp, `${lang}-${chart}.html`);
    writeFileSync(page, html(svg, w, h, d.title, d.text));
    // 2) html -> pdf (Chrome, page sized to content)
    const pdf = join(dir, `${chart}.pdf`);
    execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer",
      `--print-to-pdf=${pdf}`, `file://${page}`], { stdio: "inherit" });
    console.log("PDF:", `${lang}/${chart}.pdf`, `(${w}x${h})`);
  }
}
console.log("done ->", outDir);
