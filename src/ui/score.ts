import chalk from 'chalk';
import type { HireabilityScore, CodingStreak } from '../types/index.js';
import { progressBar } from '../utils/formatting.js';
import { renderSectionTitle, renderDivider } from './header.js';

// Big number font for score display
const BIG_DIGITS: Record<string, string[]> = {
  '0': ['╔═╗', '║ ║', '╚═╝'],
  '1': [' ╗ ', ' ║ ', ' ╩ '],
  '2': ['╔═╗', '╔═╝', '╚══'],
  '3': ['╔═╗', ' ═╣', '╚═╝'],
  '4': ['╗ ╗', '╚═╣', '  ╩'],
  '5': ['╔══', '╚═╗', '╚═╝'],
  '6': ['╔══', '╠═╗', '╚═╝'],
  '7': ['══╗', '  ║', '  ╩'],
  '8': ['╔═╗', '╠═╣', '╚═╝'],
  '9': ['╔═╗', '╚═╣', '╚═╝'],
};

function getGradeColor(grade: string): (str: string) => string {
  if (grade.startsWith('A')) return chalk.hex('#39d353');
  if (grade.startsWith('B')) return chalk.hex('#45B7D1');
  if (grade.startsWith('C')) return chalk.hex('#FED330');
  if (grade === 'D') return chalk.hex('#FF8E53');
  return chalk.hex('#FF6B6B');
}

function renderBigNumber(num: number): string[] {
  const digits = num.toString().split('');
  const rows: string[] = ['', '', ''];

  for (const digit of digits) {
    const glyph = BIG_DIGITS[digit];
    if (glyph) {
      rows[0] += glyph[0] + ' ';
      rows[1] += glyph[1] + ' ';
      rows[2] += glyph[2] + ' ';
    }
  }

  return rows;
}

export function renderScore(score: HireabilityScore): string {
  const lines: string[] = [];
  const colorFn = getGradeColor(score.grade);

  lines.push(renderSectionTitle('Hire-ability Score'));
  lines.push(renderDivider());

  // Big score number
  const bigNum = renderBigNumber(score.total);
  for (const row of bigNum) {
    lines.push(`  ${colorFn(row)}  ${' '.repeat(4)}`);
  }

  // Grade letter
  const gradeDisplay = colorFn(chalk.bold(`  Grade: ${score.grade}`));
  lines.push(`  ${gradeDisplay}`);
  lines.push('');

  // Score breakdown with bars
  const breakdown = [
    { label: 'Repo Quality', value: score.breakdown.repoQuality, max: 25, color: chalk.cyan },
    { label: 'Consistency', value: score.breakdown.consistency, max: 20, color: chalk.green },
    { label: 'Language Diversity', value: score.breakdown.languageDiversity, max: 15, color: chalk.yellow },
    { label: 'README Quality', value: score.breakdown.readmeQuality, max: 15, color: chalk.magenta },
    { label: 'Recent Activity', value: score.breakdown.recentActivity, max: 25, color: chalk.blue },
  ];

  for (const item of breakdown) {
    const label = item.label.padEnd(20);
    const bar = item.color(progressBar(item.value, item.max, 15));
    const valueStr = chalk.dim(`${item.value}/${item.max}`);
    lines.push(`  ${chalk.dim(label)} ${bar} ${valueStr}`);
  }

  return lines.join('\n');
}

export function renderStreak(streak: CodingStreak): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Coding Streak'));
  lines.push(renderDivider());

  const fire = streak.current > 0 ? '🔥' : '❄️';
  lines.push(`  ${fire} Current Streak: ${chalk.bold.yellow(streak.current.toString())} days`);
  lines.push(`  🏆 Longest Streak:  ${chalk.bold.cyan(streak.longest.toString())} days`);
  
  if (streak.lastActive) {
    lines.push(`  📅 Last Active:     ${chalk.dim(streak.lastActive)}`);
  }

  return lines.join('\n');
}
