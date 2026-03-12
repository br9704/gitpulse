import chalk from 'chalk';
import type { UserProfile } from '../types/index.js';
import { formatNumber, accountAge } from '../utils/formatting.js';
import { renderSectionTitle, renderDivider } from './header.js';

export function renderProfile(profile: UserProfile): string {
  const { user } = profile;
  const lines: string[] = [];

  lines.push(renderSectionTitle('Profile'));
  lines.push(renderDivider());
  
  // User info box
  const nameStr = user.name ? `${chalk.bold.white(user.name)} ${chalk.dim(`(@${user.login})`)}` : chalk.bold.white(`@${user.login}`);
  lines.push(`  ${nameStr}`);

  if (user.bio) {
    lines.push(`  ${chalk.italic.gray(user.bio)}`);
  }

  const meta: string[] = [];
  if (user.location) meta.push(`📍 ${user.location}`);
  if (user.company) meta.push(`🏢 ${user.company}`);
  if (user.blog) meta.push(`🔗 ${user.blog}`);
  if (user.twitter_username) meta.push(`🐦 @${user.twitter_username}`);
  
  if (meta.length > 0) {
    lines.push(`  ${chalk.dim(meta.join('  │  '))}`);
  }

  lines.push(`  ${chalk.dim(`Member for ${accountAge(user.created_at)}  │  ${user.html_url}`)}`);
  
  return lines.join('\n');
}

export function renderStats(profile: UserProfile): string {
  const { user, totalStars, totalForks, repos } = profile;
  const lines: string[] = [];

  lines.push(renderSectionTitle('Statistics'));
  lines.push(renderDivider());

  const nonForks = repos.filter(r => !r.fork).length;

  const stats = [
    { label: 'Repositories', value: formatNumber(user.public_repos), detail: `(${nonForks} original)`, color: chalk.cyan },
    { label: 'Stars Earned', value: formatNumber(totalStars), detail: '', color: chalk.yellow },
    { label: 'Forks Earned', value: formatNumber(totalForks), detail: '', color: chalk.green },
    { label: 'Followers', value: formatNumber(user.followers), detail: '', color: chalk.magenta },
    { label: 'Following', value: formatNumber(user.following), detail: '', color: chalk.blue },
    { label: 'Public Gists', value: formatNumber(user.public_gists), detail: '', color: chalk.red },
  ];

  // Display in 2-column layout
  for (let i = 0; i < stats.length; i += 2) {
    const left = stats[i];
    const right = stats[i + 1];

    let line = `  ${left.color('■')} ${chalk.dim(left.label + ':')} ${chalk.bold(left.value)}`;
    if (left.detail) line += ` ${chalk.dim(left.detail)}`;
    
    // Pad to column
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, '');
    const pad = Math.max(0, 36 - stripped.length);
    line += ' '.repeat(pad);

    if (right) {
      line += `${right.color('■')} ${chalk.dim(right.label + ':')} ${chalk.bold(right.value)}`;
      if (right.detail) line += ` ${chalk.dim(right.detail)}`;
    }

    lines.push(line);
  }

  return lines.join('\n');
}
