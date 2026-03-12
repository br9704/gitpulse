import chalk from 'chalk';
import type { UserProfile } from '../types/index.js';
import { formatNumber } from '../utils/formatting.js';
import { getLanguageColor } from '../utils/colors.js';

export function renderMinimal(profile: UserProfile): string {
  const { user, totalStars, totalForks, languages, score, streak } = profile;
  const lines: string[] = [];

  // Compact header
  const name = user.name ? `${user.name} (@${user.login})` : `@${user.login}`;
  lines.push(chalk.bold.cyan(`⚡ ${name}`));

  // One-line stats
  const stats = [
    `📦 ${formatNumber(user.public_repos)} repos`,
    `⭐ ${formatNumber(totalStars)} stars`,
    `⑂ ${formatNumber(totalForks)} forks`,
    `👥 ${formatNumber(user.followers)} followers`,
  ].join(chalk.dim(' │ '));
  lines.push(stats);
  lines.push(chalk.dim('─'.repeat(50)));

  // Top 5 languages inline
  const topLangs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => chalk.hex(getLanguageColor(lang))(lang))
    .join(chalk.dim(', '));
  lines.push(`💻 ${topLangs}`);

  // Score + streak
  const gradeColor = score.grade.startsWith('A') ? chalk.green :
                     score.grade.startsWith('B') ? chalk.cyan :
                     score.grade.startsWith('C') ? chalk.yellow : chalk.red;
  
  lines.push(`🎯 Score: ${gradeColor(chalk.bold(`${score.total} (${score.grade})`))}  🔥 Streak: ${chalk.yellow(`${streak.current}d`)} (best: ${chalk.cyan(`${streak.longest}d`)})`);

  return lines.join('\n');
}
