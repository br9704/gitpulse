import type { ContributionDay, ContributionWindow, CommitPattern } from '../types/index.js';
import { sparkline } from '../utils/formatting.js';
import { renderSectionTitle, renderNote } from './header.js';
import { amber, dim, primary, rampAt, RAMP, GLYPH } from './theme.js';

// Level 0 used to be a space, which made every quiet day invisible and left the
// grid as a handful of glyphs floating in whitespace. A dim dot keeps the shape.
const HEAT_CHARS = [GLYPH.bullet, '░', '▒', '▓', '█'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * @param progress 0..1. The grid paints column by column, oldest week to newest
 *                 — it reads as replaying the period. At 1 this returns exactly
 *                 the static output.
 */
export function renderHeatmap(
  contributions: ContributionDay[],
  window: ContributionWindow,
  progress: number = 1,
): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Code Activity'));

  if (window.spanDays === 0) {
    lines.push(`  ${dim('No public events available for this account.')}`);
    lines.push(renderNote('the public Events API returned nothing — this is not the same as no activity'));
    return lines.join('\n');
  }

  lines.push(dim(`  last ${window.spanDays} days of public code events  ${window.from} ${GLYPH.arrow} ${window.to}`));
  lines.push('');

  // Group by weeks (columns) and days (rows).
  // Dates are UTC midnight, so the day-of-week must be read in UTC too —
  // getDay() would shift the whole grid by one column west of Greenwich.
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (let i = 0; i < contributions.length; i++) {
    const day = new Date(contributions[i].date).getUTCDay();
    if (day === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(contributions[i]);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Columns paint oldest to newest. Trailing columns are simply not emitted yet,
  // so no row ever changes width mid-paint.
  const visibleWeeks = progress >= 1 ? weeks.length : Math.round(weeks.length * progress);

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const label = dayOfWeek % 2 === 1 ? DAY_LABELS[dayOfWeek] : '   ';
    let row = `  ${dim(label)} `;

    for (const week of weeks.slice(0, visibleWeeks)) {
      const day = week.find(d => new Date(d.date).getUTCDay() === dayOfWeek);
      row += day ? rampAt(day.level)(HEAT_CHARS[day.level]) + ' ' : '  ';
    }

    lines.push(row);
  }

  lines.push('');
  let legend = `  ${dim('less')} `;
  for (let i = 0; i < RAMP.length; i++) {
    legend += rampAt(i)(HEAT_CHARS[i]) + ' ';
  }
  legend += dim('more');
  lines.push(legend);

  // Totals, stated in the same terms as the header above them.
  lines.push(`  ${dim(`${window.eventCount} code events across ${window.activeDays} active days`)}`);
  lines.push(renderNote('source: public Events API — push, pull-request and branch-creation events only'));
  lines.push(
    renderNote(
      window.eventsTruncated
        ? 'the feed is capped at 300 events, so activity before this window is invisible, not absent'
        : 'the feed reaches no further back than this window; earlier activity is invisible, not absent'
    )
  );

  return lines.join('\n');
}

export function renderCommitPatterns(pattern: CommitPattern): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Commit Patterns'));

  lines.push(dim('  by day'));
  const daySparkline = sparkline(pattern.byDay);
  for (let i = 0; i < 7; i++) {
    lines.push(`  ${dim(DAY_LABELS[i])} ${amber(daySparkline[i] || '▁')} ${dim(`(${pattern.byDay[i]})`)}`);
  }

  lines.push('');

  lines.push(dim('  by hour (UTC)'));
  const hourLabels = ['00', '03', '06', '09', '12', '15', '18', '21'];
  lines.push(`  ${amber(sparkline(pattern.byHour))}`);
  lines.push(`  ${dim(hourLabels.map(h => h.padEnd(3)).join(''))}`);

  const maxHour = pattern.byHour.indexOf(Math.max(...pattern.byHour));
  const maxDay = pattern.byDay.indexOf(Math.max(...pattern.byDay));
  const fullDayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  lines.push(
    `  ${dim('peak')} ${primary(`${fullDayNames[maxDay]} at ${maxHour.toString().padStart(2, '0')}:00 UTC`)}`
  );

  return lines.join('\n');
}
