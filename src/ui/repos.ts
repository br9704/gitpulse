import type { GitHubRepo } from '../types/index.js';
import { formatNumber, timeAgo, truncate } from '../utils/formatting.js';
import { renderSectionTitle } from './header.js';
import { amber, primary, dim, GLYPH } from './theme.js';

/**
 * @param now Clock for relative times. Defaults to the wall clock, but callers
 *            pass the profile's fetch time so "3 months ago" is relative to when
 *            the data was gathered rather than to when it happens to be
 *            re-rendered. Without this the same profile renders differently
 *            every hour.
 */
export function renderTopRepos(repos: GitHubRepo[], now: number = Date.now(), limit: number = 6): string {
  const lines: string[] = [];

  lines.push(renderSectionTitle('Top Repositories'));

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
    lines.push(`  ${dim('No original repositories found')}`);
    return lines.join('\n');
  }

  lines.push(dim(`  ranked by stars×3 + forks×2 + watchers`));
  lines.push('');

  for (let i = 0; i < sorted.length; i++) {
    const repo = sorted[i];
    const rank = dim(`${(i + 1).toString().padStart(2)}.`);
    const lang = repo.language ? dim(repo.language) : dim('—');

    lines.push(`  ${rank} ${primary.bold(repo.name)}`);

    const desc = repo.description ? dim(truncate(repo.description, 56)) : dim('No description');
    lines.push(`      ${desc}`);

    lines.push(
      `      ${lang}  ${amber(GLYPH.star)} ${dim(formatNumber(repo.stargazers_count))}` +
      `  ${amber(GLYPH.fork)} ${dim(formatNumber(repo.forks_count))}` +
      `  ${dim(`${GLYPH.updated} ${timeAgo(repo.pushed_at, now)}`)}`
    );

    if (i < sorted.length - 1) lines.push('');
  }

  return lines.join('\n');
}
