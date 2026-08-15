/**
 * Record `gitpulse --demo` into an animated SVG for the README.
 *
 * This is a real capture, not a mock-up: it spawns the CLI with a forced TTY so
 * the staging path runs, timestamps every chunk it writes, replays the stream
 * through a minimal ANSI interpreter, and records the moment each screen line
 * first reaches its final content. Those timings drive the SVG, so what plays
 * back is the schedule the tool actually ran.
 *
 * No dependencies — a recording tool is not worth a supply chain.
 *
 *   npm run build && node tools/record-demo.mjs
 */
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'assets', 'demo.svg');

const HOLD_MS = 2000; // beat on the final frame before looping
const CHAR_W = 8.4;   // advance width of the 14px monospace stack below
const LINE_H = 17;
const PAD = 20;

// SIGNAL, from src/ui/theme.ts.
// Both lifted from ~/bruno-portfolio/app/globals.css so the recording sits on
// the same ground as the site: --desktop and --text-secondary.
const BG = '#080808';
const DEFAULT_FG = '#b0b0b0';

// ── capture ─────────────────────────────────────────────────────────────────

// Written outside the repo so a recording run never leaves anything behind.
const forceTty = join(tmpdir(), `gitpulse-force-tty-${process.pid}.mjs`);
writeFileSync(forceTty, 'process.stdout.isTTY = true;\nprocess.stdout.columns = 100;\n');

const chunks = await new Promise((resolve, reject) => {
  const started = Date.now();
  const out = [];
  const child = spawn(
    process.execPath,
    ['--import', `file://${forceTty}`, join(root, 'dist', 'index.js'), '--demo'],
    { env: { ...process.env, FORCE_COLOR: '3' } }
  );
  child.stdout.on('data', d => out.push({ t: Date.now() - started, text: d.toString() }));
  child.on('error', reject);
  child.on('close', code => (code === 0 ? resolve(out) : reject(new Error(`exit ${code}`))));
});

// ── replay ──────────────────────────────────────────────────────────────────

/** Interprets only what gitpulse emits: \x1b[{n}A (up) and \x1b[0J (erase down). */
function makeScreen() {
  return { lines: [], cursor: 0 };
}

function feed(screen, text) {
  const tokens = text.split(/(\x1b\[\d*A|\x1b\[0J)/);
  let pending = '';
  const flush = () => {
    if (!pending) return;
    const parts = pending.split('\n');
    for (let i = 0; i < parts.length; i++) {
      screen.lines[screen.cursor] = (screen.lines[screen.cursor] ?? '') + parts[i];
      if (i < parts.length - 1) screen.cursor++;
    }
    pending = '';
  };
  for (const tok of tokens) {
    const up = /^\x1b\[(\d*)A$/.exec(tok);
    if (up) { flush(); screen.cursor = Math.max(0, screen.cursor - (up[1] === '' ? 1 : +up[1])); continue; }
    if (tok === '\x1b[0J') { flush(); screen.lines.length = screen.cursor; continue; }
    pending += tok;
  }
  flush();
}

const screen = makeScreen();
const finalScreen = makeScreen();
for (const c of chunks) feed(finalScreen, c.text);
const finalLines = finalScreen.lines;

// The time each line first shows its final content.
const appearAt = new Array(finalLines.length).fill(null);
for (const c of chunks) {
  feed(screen, c.text);
  for (let i = 0; i < finalLines.length; i++) {
    if (appearAt[i] === null && screen.lines[i] === finalLines[i]) appearAt[i] = c.t;
  }
}
for (let i = 0; i < appearAt.length; i++) if (appearAt[i] === null) appearAt[i] = 0;

const runtime = Math.max(...appearAt, 0);
const total = runtime + HOLD_MS;

// ── ANSI colour -> spans ────────────────────────────────────────────────────

function parseLine(line) {
  const spans = [];
  let colour = DEFAULT_FG;
  let bold = false;
  let text = '';

  const push = () => { if (text) spans.push({ text, colour, bold }); text = ''; };

  const parts = line.split(/(\x1b\[[0-9;]*m)/);
  for (const part of parts) {
    if (!part) continue;
    const sgr = /^\x1b\[([0-9;]*)m$/.exec(part);
    if (!sgr) { text += part; continue; }
    push();
    const codes = sgr[1].split(';').filter(Boolean).map(Number);
    if (codes.length === 0 || codes[0] === 0) { colour = DEFAULT_FG; bold = false; continue; }
    for (let i = 0; i < codes.length; i++) {
      if (codes[i] === 1) bold = true;
      else if (codes[i] === 22) bold = false;
      else if (codes[i] === 39) colour = DEFAULT_FG;
      else if (codes[i] === 38 && codes[i + 1] === 2) {
        colour = '#' + codes.slice(i + 2, i + 5).map(n => (n ?? 0).toString(16).padStart(2, '0')).join('');
        i += 4;
      }
    }
  }
  push();
  return spans;
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const width = Math.round(
  Math.max(...finalLines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').length)) * CHAR_W + PAD * 2
);
const height = finalLines.length * LINE_H + PAD * 2;

// Every line shares one timeline of length `total` and holds its final state to
// the end of the loop. A line therefore needs its own keyframes, switching on at
// its own percentage — `animation-delay` cannot express this, because a shared
// duration with staggered delays desynchronises after the first cycle.
// Delays are bucketed so a 122-line report needs ~30 rules rather than 122.
const BUCKET = 0.5;
const bucketOf = ms => Math.min(99, Math.round(((ms / total) * 100) / BUCKET) * BUCKET);

const buckets = new Set();

const body = finalLines
  .map((line, i) => {
    const spans = parseLine(line);
    if (!spans.length) return '';
    const b = bucketOf(appearAt[i]);
    buckets.add(b);
    let col = 0;
    const tspans = spans
      .map(s => {
        const x = (PAD + col * CHAR_W).toFixed(1);
        col += s.text.length;
        return `<tspan x="${x}" fill="${s.colour}"${s.bold ? ' font-weight="bold"' : ''}>${esc(s.text)}</tspan>`;
      })
      .join('');
    return `<text class="s${String(b).replace('.', '_')}" y="${PAD + (i + 1) * LINE_H}">${tspans}</text>`;
  })
  .filter(Boolean)
  .join('\n');

const keyframes = [...buckets]
  .sort((a, b) => a - b)
  .map(b => {
    const cls = `s${String(b).replace('.', '_')}`;
    const on = b === 0 ? 0 : b;
    return `.${cls}{animation-name:k${cls}}\n@keyframes k${cls}{0%{opacity:0}${
      on > 0 ? `${on}%{opacity:0}` : ''
    }${(on + 0.01).toFixed(2)}%{opacity:1}100%{opacity:1}}`;
  })
  .join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="14">
<style>
text{opacity:0;white-space:pre;animation-duration:${(total / 1000).toFixed(2)}s;animation-timing-function:linear;animation-iteration-count:infinite}
${keyframes}
@media (prefers-reduced-motion: reduce){text{opacity:1;animation:none}}
</style>
<rect width="100%" height="100%" fill="${BG}"/>
${body}
</svg>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg);

rmSync(forceTty, { force: true });

console.log(`wrote ${OUT}`);
console.log(`  lines      ${finalLines.length}`);
console.log(`  staged run ${(runtime / 1000).toFixed(2)}s`);
console.log(`  loop       ${(total / 1000).toFixed(2)}s (incl. ${HOLD_MS / 1000}s hold)`);
console.log(`  size       ${(svg.length / 1024).toFixed(1)} kB`);
