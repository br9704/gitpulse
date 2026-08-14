import type { HireabilityScore, CodingStreak, ContributionWindow } from '../types/index.js';
import { renderSectionTitle, renderNote } from './header.js';
import { amber, dim, hairline, value, label, GLYPH, WIDTH } from './theme.js';

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

/**
 * @param progress 0..1. The meter fills and the number counts in sync; the grade
 *                 letter is the punchline and only appears at the very end.
 *                 At 1 this returns exactly the static output.
 */
export function renderScore(score: HireabilityScore, progress: number = 1): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Hire-ability Score'));

  const shownTotal = progress >= 1 ? score.total : Math.round(score.total * progress);

  // The grade used to be colour-coded green through red, which made the report
  // card render a value judgement about a real person in traffic-light colours.
  // One accent states the number and lets the reader draw the conclusion.
  for (const row of renderBigNumber(shownTotal)) {
    lines.push(`  ${amber(row)}`);
  }

  // MOTION.md: the grade letter is the last thing to appear, after a beat.
  lines.push(
    progress >= 1
      ? `  ${label('grade')} ${value(score.grade)} ${dim(`${score.total}/100`)}`
      : `  ${label('grade')} ${dim('—')} ${dim(`${shownTotal}/100`)}`
  );
  lines.push('');
  lines.push('  ' + hairline(GLYPH.rule.repeat(WIDTH - 2)));
  lines.push('');

  const breakdown = [
    { label: 'repo quality', value: score.breakdown.repoQuality, max: 25 },
    { label: 'consistency', value: score.breakdown.consistency, max: 20 },
    { label: 'language diversity', value: score.breakdown.languageDiversity, max: 15 },
    { label: 'readme quality', value: score.breakdown.readmeQuality, max: 15 },
    { label: 'recent activity', value: score.breakdown.recentActivity, max: 25 },
  ];

  for (const item of breakdown) {
    const full = Math.round((item.value / item.max) * 15);
    const filled = progress >= 1 ? full : Math.round(full * progress);
    const bar = amber('█'.repeat(filled)) + dim('░'.repeat(15 - filled));
    lines.push(`  ${dim(item.label.padEnd(20))} ${bar} ${dim(`${item.value}/${item.max}`)}`);
  }

  lines.push(renderNote('methodology and weights: SCORING.md'));

  return lines.join('\n');
}

export function renderStreak(streak: CodingStreak, window: ContributionWindow): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Coding Streak'));

  const days = (n: number) => (n === 1 ? 'day' : 'days');

  lines.push(`  ${label('current'.padEnd(12))} ${value(String(streak.current))} ${dim(days(streak.current))}`);
  lines.push(`  ${label('longest'.padEnd(12))} ${value(String(streak.longest))} ${dim(days(streak.longest))}`);

  if (streak.lastActive) {
    lines.push(`  ${label('last active'.padEnd(12))} ${dim(streak.lastActive)}`);
  }

  // A streak is only as long as the window it was measured in. Without this the
  // number reads as a lifetime record when it is bounded by the event feed.
  lines.push(renderNote(`measured within the ${window.spanDays}-day event window above, not all-time`));

  return lines.join('\n');
}
