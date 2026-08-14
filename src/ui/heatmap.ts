import chalk from 'chalk';
import type { ContributionDay, ContributionWindow, CommitPattern } from '../types/index.js';
import { sparkline } from '../utils/formatting.js';
import { renderSectionTitle, renderDivider } from './header.js';

// Level 0 used to be a space, which made every quiet day invisible and left the
// grid as a handful of glyphs floating in whitespace. A dim dot keeps the shape.
const HEAT_CHARS = ['·', '░', '▒', '▓', '█'];
const HEAT_COLORS = [
  chalk.dim,
  chalk.hex('#0e4429'),
  chalk.hex('#006d32'),
  chalk.hex('#26a641'),
  chalk.hex('#39d353'),
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function renderHeatmap(contributions: ContributionDay[], window: ContributionWindow): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Code Activity'));
  lines.push(renderDivider());

  if (window.spanDays === 0) {
    lines.push(`  ${chalk.dim('No public events available for this account.')}`);
    lines.push(`  ${chalk.dim('> the public Events API returned nothing — this is not the same as no activity')}`);
    return lines.join('\n');
  }

  lines.push(chalk.dim(`  Last ${window.spanDays} days of public code events (${window.from} → ${window.to}):`));
  lines.push('');

  // Group by weeks (columns) and days (rows)
  // Each column = 1 week, each row = day of week
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  // Dates are UTC midnight, so the day-of-week must be read in UTC too —
  // getDay() would shift the whole grid by one column west of Greenwich.
  for (let i = 0; i < contributions.length; i++) {
    const day = new Date(contributions[i].date).getUTCDay();
    if (day === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(contributions[i]);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Render 7 rows (one per day of week)
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const label = dayOfWeek % 2 === 1 ? DAY_LABELS[dayOfWeek] : '   ';
    let row = `  ${chalk.dim(label)} `;

    for (const week of weeks) {
      const day = week.find(d => new Date(d.date).getUTCDay() === dayOfWeek);
      if (day) {
        const colorFn = HEAT_COLORS[day.level];
        row += colorFn(HEAT_CHARS[day.level] || '░') + ' ';
      } else {
        row += '  ';
      }
    }

    lines.push(row);
  }

  // Legend
  lines.push('');
  let legend = `  ${chalk.dim('Less')} `;
  for (let i = 0; i < 5; i++) {
    legend += HEAT_COLORS[i](HEAT_CHARS[i] || ' ') + ' ';
  }
  legend += chalk.dim('More');
  lines.push(legend);

  // Totals, stated in the same terms as the header above them.
  lines.push(
    `  ${chalk.dim(`${window.eventCount} code events across ${window.activeDays} active days`)}`
  );
  lines.push(
    `  ${chalk.dim('> source: public Events API — push, pull-request and branch-creation events only')}`
  );
  lines.push(
    `  ${chalk.dim(
      window.eventsTruncated
        ? '> the feed is capped at 300 events, so activity before this window is invisible, not absent'
        : '> the feed reaches no further back than this window; earlier activity is invisible, not absent'
    )}`
  );

  return lines.join('\n');
}

export function renderCommitPatterns(pattern: CommitPattern): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Commit Patterns'));
  lines.push(renderDivider());

  // By day of week
  lines.push(chalk.dim('  By Day:'));
  const daySparkline = sparkline(pattern.byDay);
  for (let i = 0; i < 7; i++) {
    const bar = chalk.cyan(daySparkline[i] || '▁');
    const count = chalk.dim(`(${pattern.byDay[i]})`);
    lines.push(`  ${chalk.dim(DAY_LABELS[i])} ${bar} ${count}`);
  }

  lines.push('');

  // By hour (compact sparkline)
  lines.push(chalk.dim('  By Hour (UTC):'));
  const hourLabels = ['00', '03', '06', '09', '12', '15', '18', '21'];
  const hourSparkline = sparkline(pattern.byHour);
  lines.push(`  ${chalk.cyan(hourSparkline)}`);
  lines.push(`  ${chalk.dim(hourLabels.map(h => h.padEnd(3)).join(''))}`);

  // Peak hours
  const maxHour = pattern.byHour.indexOf(Math.max(...pattern.byHour));
  const maxDay = pattern.byDay.indexOf(Math.max(...pattern.byDay));
  const fullDayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  lines.push(`  ${chalk.dim('Peak:')} ${chalk.white(`${fullDayNames[maxDay]} at ${maxHour.toString().padStart(2, '0')}:00 UTC`)}`);

  return lines.join('\n');
}
