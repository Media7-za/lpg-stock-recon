#!/usr/bin/env node
/**
 * Markdown (headings, paragraphs, pipe tables, hr) → PDF through Playwright's Chromium, using the
 * shared statement stylesheet. Fallback for environments without `md-to-pdf` (generate_statement_of_account
 * --pdf uses npx md-to-pdf). Usage: md_to_pdf.mjs <in.md> <out.pdf> [css] [--landscape]
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const landscape = process.argv.includes('--landscape');
const [md, out, cssArg] = args;
if (!md || !out) {
  console.error('Usage: md_to_pdf.mjs <in.md> <out.pdf> [css] [--landscape]');
  process.exit(1);
}
const css = fs.readFileSync(cssArg || path.join(here, '../templates/statement_pdf.css'), 'utf8');
const req = createRequire(import.meta.url);
const roots = [process.cwd(), ...(process.env.NODE_PATH || '').split(':'), path.join(path.dirname(process.execPath), '../lib/node_modules')].filter(Boolean);
let chromium;
for (const r of roots) {
  try {
    chromium = req(req.resolve('playwright', { paths: [r, path.join(r, 'node_modules')] })).chromium;
    break;
  } catch { /* try the next root */ }
}
if (!chromium) {
  console.error('playwright not found (set NODE_PATH to a node_modules containing it)');
  process.exit(2);
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\\\|/g, '|');
const lines = fs.readFileSync(md, 'utf8').split('\n');
const h = [];
for (let i = 0; i < lines.length; ) {
  const l = lines[i];
  if (/^\|/.test(l)) {
    const rows = [];
    while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
    const cells = (r) => r.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim());
    const al = cells(rows[1]).map((c) => (c.endsWith(':') && !c.startsWith(':') ? 'right' : 'left'));
    h.push('<table><thead><tr>' + cells(rows[0]).map((c, k) => `<th style="text-align:${al[k]}">${inline(c)}</th>`).join('') + '</tr></thead><tbody>');
    for (const r of rows.slice(2)) h.push('<tr>' + cells(r).map((c, k) => `<td style="text-align:${al[k]}">${inline(c)}</td>`).join('') + '</tr>');
    h.push('</tbody></table>');
    continue;
  }
  const m = l.match(/^(#{1,4}) (.*)/);
  if (m) h.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
  else if (/^---\s*$/.test(l)) h.push('<hr>');
  else if (/^>/.test(l)) h.push(`<blockquote>${inline(l.replace(/^>\s?/, ''))}</blockquote>`);
  else if (l.trim()) {
    const p = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||---|>)/.test(lines[i])) p.push(inline(lines[i++].replace(/  $/, '')));
    h.push('<p>' + p.join('<br>') + '</p>');
    continue;
  }
  i++;
}
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}${landscape ? ' table{font-size:8.5pt} td,th{padding:2px 5px}' : ''}</style></head><body>${h.join('\n')}</body></html>`;
const exe = process.env.PLAYWRIGHT_BROWSERS_PATH ? undefined : undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
await page.setContent(html);
await page.pdf({ path: out, format: 'A4', landscape, margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' }, printBackground: true });
await browser.close();
console.log(`PDF ${out}`);
