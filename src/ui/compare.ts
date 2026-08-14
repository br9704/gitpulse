import type { UserProfile } from '../types/index.js';
import { formatNumber, progressBar } from '../utils/formatting.js';
import { renderSectionTitle, renderNote } from './header.js';
import { amber, primary, dim, ahead, GLYPH } from './theme.js';

export function renderComparison(a: UserProfile, b: UserProfile): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Comparison'));

  lines.push(`  ${primary.bold(a.user.login)}  ${dim('vs')}  ${primary.bold(b.user.login)}`);
  lines.push('');

  const metrics = [
    { label: 'repositories', a: a.user.public_repos, b: b.user.public_repos },
    { label: 'stars', a: a.totalStars, b: b.totalStars },
    { label: 'forks', a: a.totalForks, b: b.totalForks },
    { label: 'followers', a: a.user.followers, b: b.user.followers },
    { label: 'following', a: a.user.following, b: b.user.following },
    { label: 'languages', a: Object.keys(a.languages).length, b: Object.keys(b.languages).length },
    { label: 'score', a: a.score.total, b: b.score.total },
    { label: 'current streak', a: a.streak.current, b: b.streak.current },
    { label: 'longest streak', a: a.streak.longest, b: b.streak.longest },
  ];

  const labelWidth = 16;
  const colWidth = 10;

  lines.push(
    `  ${''.padEnd(labelWidth)} ${dim(a.user.login.padStart(colWidth))}  ${dim(GLYPH.divider)}  ${dim(b.user.login.padEnd(colWidth))}`
  );
  lines.push(`  ${dim(GLYPH.rule.repeat(labelWidth))} ${dim(GLYPH.rule.repeat(colWidth))}──┼──${dim(GLYPH.rule.repeat(colWidth))}`);

  // Green means exactly one thing in this codebase: ahead.
  for (const m of metrics) {
    const aStr = formatNumber(m.a).padStart(colWidth);
    const bStr = formatNumber(m.b).padEnd(colWidth);

    lines.push(
      `  ${dim(m.label.padEnd(labelWidth))} ${m.a > m.b ? ahead.bold(aStr) : dim(aStr)}` +
      `  ${dim(GLYPH.divider)}  ${m.b > m.a ? ahead.bold(bStr) : dim(bStr)}`
    );
  }

  lines.push('');
  lines.push(dim('  score breakdown'));

  const categories = ['repoQuality', 'consistency', 'languageDiversity', 'readmeQuality', 'recentActivity'] as const;
  const maxScores = [25, 20, 15, 15, 25];
  const categoryLabels = ['repo quality', 'consistency', 'lang diversity', 'readme quality', 'recent activity'];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const valA = a.score.breakdown[cat];
    const valB = b.score.breakdown[cat];
    const barA = valA > valB ? ahead(progressBar(valA, maxScores[i], 10)) : dim(progressBar(valA, maxScores[i], 10));
    const barB = valB > valA ? ahead(progressBar(valB, maxScores[i], 10)) : dim(progressBar(valB, maxScores[i], 10));

    lines.push(
      `  ${dim(categoryLabels[i].padEnd(16))} ${dim(String(valA).padStart(4))} ${barA} ${dim(GLYPH.divider)} ${barB} ${dim(String(valB))}`
    );
  }

  lines.push('');

  if (a.score.total > b.score.total) {
    lines.push(`  ${amber(GLYPH.prompt)} ${ahead.bold(a.user.login)} leads, grade ${ahead.bold(a.score.grade)} vs ${dim(b.score.grade)}`);
  } else if (b.score.total > a.score.total) {
    lines.push(`  ${amber(GLYPH.prompt)} ${ahead.bold(b.user.login)} leads, grade ${ahead.bold(b.score.grade)} vs ${dim(a.score.grade)}`);
  } else {
    lines.push(`  ${amber(GLYPH.prompt)} level, both grade ${ahead.bold(a.score.grade)}`);
  }

  // Streaks on either side are bounded by that account's own event window, and
  // those windows are rarely the same length — so the comparison is not like-for-like.
  lines.push(
    renderNote(
      `streak windows differ: ${a.user.login} ${a.contributionWindow.spanDays}d, ` +
      `${b.user.login} ${b.contributionWindow.spanDays}d — not directly comparable`
    )
  );

  return lines.join('\n');
}
