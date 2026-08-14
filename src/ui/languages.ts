import type { LanguageBreakdown } from '../types/index.js';
import { percent, padRight } from '../utils/formatting.js';
import { renderSectionTitle } from './header.js';
import { amber, dim, note, seriesAt, GLYPH } from './theme.js';

const BAR_WIDTH = 30;

/**
 * @param progress 0..1. Bars fill left-to-right in a top-to-bottom cascade, each
 *                 starting slightly after the one above it. At 1 this returns
 *                 exactly the static output.
 */
export function renderLanguages(languages: LanguageBreakdown, progress: number = 1): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Languages'));

  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    lines.push(`  ${dim('No language data available')}`);
    return lines.join('\n');
  }

  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = entries[0][1];

  // These are repo counts by primary language, not bytes of code. Saying so
  // up front stops "88.9%" from reading as a share of everything written.
  lines.push(note(`  ${GLYPH.prompt} share of repositories by primary language, forks excluded`));
  lines.push('');

  const shown = entries.slice(0, 10);

  // Each bar starts 60ms after the one above it, expressed here as a fraction
  // of the section's total duration.
  const STAGGER = 0.18;
  const barProgress = (row: number) => {
    if (progress >= 1) return 1;
    const start = row * STAGGER;
    const span = 1 - STAGGER * Math.max(0, shown.length - 1);
    return Math.max(0, Math.min(1, (progress - start) / Math.max(0.01, span)));
  };

  shown.forEach(([lang, count], row) => {
    const full = Math.max(1, Math.round((count / max) * BAR_WIDTH));
    const barLen = progress >= 1 ? full : Math.round(full * barProgress(row));

    // GitHub's linguist colours were decoration here — the language name is
    // already on the line. One accent, with a dim tail for the remainder.
    const bar = amber('█'.repeat(barLen)) + dim('░'.repeat(BAR_WIDTH - barLen));
    const label = padRight(`  ${lang}`, 18);
    const pctStr = dim(percent(count, total).padStart(6));
    const countStr = dim(`(${count} ${count === 1 ? 'repo' : 'repos'})`);

    lines.push(`${label} ${bar} ${pctStr} ${countStr}`);
  });

  if (entries.length > 10) {
    lines.push(`  ${dim(`... and ${entries.length - 10} more (${percent(
      entries.slice(10).reduce((s, [, v]) => s + v, 0),
      total
    )})`)}`);
  }

  // Summary strip. Rank is encoded as amber luminance rather than as hue, so
  // the segments stay distinguishable without introducing new colours.
  lines.push('');
  const strip = shown.slice(0, 6);
  let summaryBar = '  ';
  strip.forEach(([, count], i) => {
    summaryBar += seriesAt(i)('█'.repeat(Math.max(1, Math.round((count / total) * 50))));
  });
  lines.push(summaryBar);

  let legend = '  ';
  strip.forEach(([lang], i) => {
    legend += seriesAt(i)(GLYPH.marker) + dim(` ${lang}  `);
  });
  lines.push(legend);

  return lines.join('\n');
}
