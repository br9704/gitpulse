import chalk from 'chalk';
import type { UserProfile } from '../types/index.js';
import { formatNumber, progressBar } from '../utils/formatting.js';
import { renderSectionTitle, renderDivider } from './header.js';

export function renderComparison(profileA: UserProfile, profileB: UserProfile): string {
  const lines: string[] = [];
  const a = profileA;
  const b = profileB;

  lines.push(renderSectionTitle('Comparison'));
  lines.push(renderDivider());

  // Header
  const nameA = chalk.cyan.bold(a.user.login);
  const nameB = chalk.magenta.bold(b.user.login);
  lines.push(`  ${nameA}  ${ chalk.dim('vs') }  ${nameB}`);
  lines.push(renderDivider());

  // Stats comparison
  const metrics = [
    { label: 'Repositories', a: a.user.public_repos, b: b.user.public_repos },
    { label: 'Stars', a: a.totalStars, b: b.totalStars },
    { label: 'Forks', a: a.totalForks, b: b.totalForks },
    { label: 'Followers', a: a.user.followers, b: b.user.followers },
    { label: 'Following', a: a.user.following, b: b.user.following },
    { label: 'Languages', a: Object.keys(a.languages).length, b: Object.keys(b.languages).length },
    { label: 'Score', a: a.score.total, b: b.score.total },
    { label: 'Current Streak', a: a.streak.current, b: b.streak.current },
    { label: 'Longest Streak', a: a.streak.longest, b: b.streak.longest },
  ];

  const labelWidth = 16;
  const colWidth = 10;

  // Column headers
  lines.push(
    `  ${''.padEnd(labelWidth)} ${chalk.cyan(a.user.login.padStart(colWidth))}  ${chalk.dim('│')}  ${chalk.magenta(b.user.login.padEnd(colWidth))}`
  );
  lines.push(`  ${'─'.repeat(labelWidth)} ${'─'.repeat(colWidth)}──${'┼'}──${'─'.repeat(colWidth)}`);

  for (const m of metrics) {
    const winner = m.a > m.b ? 'a' : m.b > m.a ? 'b' : 'tie';
    const aStr = formatNumber(m.a).padStart(colWidth);
    const bStr = formatNumber(m.b).padEnd(colWidth);

    const aColored = winner === 'a' ? chalk.green.bold(aStr) : chalk.dim(aStr);
    const bColored = winner === 'b' ? chalk.green.bold(bStr) : chalk.dim(bStr);

    const label = m.label.padEnd(labelWidth);
    lines.push(`  ${chalk.dim(label)} ${aColored}  ${chalk.dim('│')}  ${bColored}`);
  }

  lines.push('');

  // Score comparison bars
  lines.push(chalk.dim('  Score Breakdown:'));
  const categories = ['repoQuality', 'consistency', 'languageDiversity', 'readmeQuality', 'recentActivity'] as const;
  const maxScores = [25, 20, 15, 15, 25];
  const categoryLabels = ['Repo Quality', 'Consistency', 'Lang Diversity', 'README Quality', 'Recent Activity'];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const maxS = maxScores[i];
    const label = categoryLabels[i].padEnd(16);
    const barA = chalk.cyan(progressBar(a.score.breakdown[cat], maxS, 10));
    const barB = chalk.magenta(progressBar(b.score.breakdown[cat], maxS, 10));
    const valA = chalk.dim(`${a.score.breakdown[cat]}`);
    const valB = chalk.dim(`${b.score.breakdown[cat]}`);
    lines.push(`  ${chalk.dim(label)} ${valA} ${barA} ${chalk.dim('│')} ${barB} ${valB}`);
  }

  lines.push('');

  // Winner
  const gradeA = a.score.grade;
  const gradeB = b.score.grade;
  if (a.score.total > b.score.total) {
    lines.push(`  🏆 ${chalk.cyan.bold(a.user.login)} wins with grade ${chalk.green.bold(gradeA)} vs ${chalk.dim(gradeB)}`);
  } else if (b.score.total > a.score.total) {
    lines.push(`  🏆 ${chalk.magenta.bold(b.user.login)} wins with grade ${chalk.green.bold(gradeB)} vs ${chalk.dim(gradeA)}`);
  } else {
    lines.push(`  🤝 ${chalk.yellow.bold("It's a tie!")} Both scored ${chalk.green.bold(gradeA)}`);
  }

  return lines.join('\n');
}
