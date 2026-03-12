import chalk from 'chalk';
import type { LanguageBreakdown } from '../types/index.js';
import { getLanguageColor } from '../utils/colors.js';
import { percent, padRight } from '../utils/formatting.js';
import { renderSectionTitle, renderDivider } from './header.js';

const BAR_WIDTH = 30;

export function renderLanguages(languages: LanguageBreakdown): string {
  const lines: string[] = [];
  
  lines.push(renderSectionTitle('Languages'));
  lines.push(renderDivider());

  const entries = Object.entries(languages)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    lines.push(`  ${chalk.dim('No language data available')}`);
    return lines.join('\n');
  }

  const total = entries.reduce((s, [, v]) => s + v, 0);
  const max = entries[0][1];

  // Show top 10
  const shown = entries.slice(0, 10);

  for (const [lang, count] of shown) {
    const pct = (count / total) * 100;
    const barLen = Math.max(1, Math.round((count / max) * BAR_WIDTH));
    const color = getLanguageColor(lang);

    const bar = chalk.hex(color)('█'.repeat(barLen)) + chalk.dim('░'.repeat(BAR_WIDTH - barLen));
    const label = padRight(`  ${lang}`, 18);
    const pctStr = chalk.dim(percent(count, total).padStart(6));
    const countStr = chalk.dim(`(${count} repos)`);

    lines.push(`${label} ${bar} ${pctStr} ${countStr}`);
  }

  if (entries.length > 10) {
    const otherCount = entries.slice(10).reduce((s, [, v]) => s + v, 0);
    lines.push(`  ${chalk.dim(`... and ${entries.length - 10} more (${percent(otherCount, total)})`)}`);
  }

  // Compact language summary bar
  lines.push('');
  let summaryBar = '  ';
  for (const [lang, count] of shown.slice(0, 6)) {
    const width = Math.max(1, Math.round((count / total) * 50));
    summaryBar += chalk.hex(getLanguageColor(lang))('█'.repeat(width));
  }
  lines.push(summaryBar);

  // Legend
  let legend = '  ';
  for (const [lang] of shown.slice(0, 6)) {
    legend += chalk.hex(getLanguageColor(lang))('●') + chalk.dim(` ${lang} `);
  }
  lines.push(legend);

  return lines.join('\n');
}
