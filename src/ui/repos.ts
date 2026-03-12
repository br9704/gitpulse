import chalk from 'chalk';
import type { GitHubRepo } from '../types/index.js';
import { formatNumber, timeAgo, truncate } from '../utils/formatting.js';
import { getLanguageColor } from '../utils/colors.js';
import { renderSectionTitle, renderDivider } from './header.js';

export function renderTopRepos(repos: GitHubRepo[], limit: number = 6): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Top Repositories'));
  lines.push(renderDivider());

  const sorted = [...repos]
    .filter(r => !r.fork)
    .sort((a, b) => {
      // Score = stars * 3 + forks * 2 + watchers
      const scoreA = a.stargazers_count * 3 + a.forks_count * 2 + a.watchers_count;
      const scoreB = b.stargazers_count * 3 + b.forks_count * 2 + b.watchers_count;
      return scoreB - scoreA;
    })
    .slice(0, limit);

  if (sorted.length === 0) {
    lines.push(`  ${chalk.dim('No original repositories found')}`);
    return lines.join('\n');
  }

  for (let i = 0; i < sorted.length; i++) {
    const repo = sorted[i];
    const rank = chalk.dim(`${(i + 1).toString().padStart(2)}.`);
    const name = chalk.bold.white(repo.name);
    const lang = repo.language
      ? chalk.hex(getLanguageColor(repo.language))(repo.language)
      : chalk.dim('—');

    const stars = chalk.yellow(`★ ${formatNumber(repo.stargazers_count)}`);
    const forks = chalk.green(`⑂ ${formatNumber(repo.forks_count)}`);
    const updated = chalk.dim(`↻ ${timeAgo(repo.pushed_at)}`);

    lines.push(`  ${rank} ${name}`);

    const desc = repo.description
      ? chalk.dim(truncate(repo.description, 56))
      : chalk.dim.italic('No description');
    lines.push(`      ${desc}`);

    lines.push(`      ${lang}  ${stars}  ${forks}  ${updated}`);

    if (i < sorted.length - 1) {
      lines.push('');
    }
  }

  return lines.join('\n');
}
