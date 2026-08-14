import type { UserProfile } from '../types/index.js';
import { formatNumber } from '../utils/formatting.js';
import { amber, primary, dim, value, label, GLYPH } from './theme.js';

export function renderMinimal(profile: UserProfile): string {
  const { user, totalStars, totalForks, languages, score, streak, contributionWindow } = profile;
  const lines: string[] = [];

  const name = user.name ? `${user.name} ${dim(`@${user.login}`)}` : `@${user.login}`;
  lines.push(`${amber(GLYPH.marker)} ${primary.bold(name)}`);

  const sep = dim(`  ${GLYPH.divider}  `);
  lines.push(
    [
      `${value(formatNumber(user.public_repos))} ${label('repos')}`,
      `${value(formatNumber(totalStars))} ${label('stars')}`,
      `${value(formatNumber(totalForks))} ${label('forks')}`,
      `${value(formatNumber(user.followers))} ${label('followers')}`,
    ].join(sep)
  );

  const topLangs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang)
    .join(dim(', '));
  if (topLangs) lines.push(`${label('languages')} ${dim(topLangs)}`);

  lines.push(
    `${label('score')} ${value(`${score.total} (${score.grade})`)}` +
    sep +
    `${label('streak')} ${value(`${streak.current}d`)} ${dim(`best ${streak.longest}d`)}`
  );

  // The streak is bounded by the event window even in compact output — dropping
  // the qualifier here would just move the misleading number somewhere quieter.
  lines.push(dim(`${GLYPH.prompt} streak measured within a ${contributionWindow.spanDays}-day event window`));

  return lines.join('\n');
}
