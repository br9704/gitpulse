import chalk from 'chalk';
import type { ContributionDay, CommitPattern } from '../types/index.js';
import { sparkline } from '../utils/formatting.js';
import { renderSectionTitle, renderDivider } from './header.js';

const HEAT_CHARS = [' ', '░', '▒', '▓', '█'];
const HEAT_COLORS = [
  chalk.dim,
  chalk.hex('#0e4429'),
  chalk.hex('#006d32'),
  chalk.hex('#26a641'),
  chalk.hex('#39d353'),
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function renderHeatmap(contributions: ContributionDay[]): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Contribution Heatmap'));
  lines.push(renderDivider());
  lines.push(chalk.dim('  Last 90 days:'));
  lines.push('');

  // Group by weeks (columns) and days (rows)
  // Each column = 1 week, each row = day of week
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (let i = 0; i < contributions.length; i++) {
    const day = new Date(contributions[i].date).getDay();
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
      const day = week.find(d => new Date(d.date).getDay() === dayOfWeek);
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

  // Total contributions
  const totalContribs = contributions.reduce((s, d) => s + d.count, 0);
  const activeDays = contributions.filter(d => d.count > 0).length;
  lines.push(`  ${chalk.dim(`${totalContribs} contributions in ${activeDays} active days`)}`);

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
  lines.push(`  ${chalk.dim('Peak:')} ${chalk.white(`${DAY_LABELS[maxDay]}s at ${maxHour.toString().padStart(2, '0')}:00 UTC`)}`);

  return lines.join('\n');
}
