import type { UserProfile } from '../types/index.js';
import { formatNumber, accountAge } from '../utils/formatting.js';
import { renderSectionTitle } from './header.js';
import { amber, primary, dim, note, value, label, GLYPH } from './theme.js';

export function renderProfile(profile: UserProfile): string {
  const { user } = profile;
  const lines: string[] = [];

  lines.push(renderSectionTitle('Profile'));

  const nameStr = user.name
    ? `${primary.bold(user.name)} ${dim(`@${user.login}`)}`
    : primary.bold(`@${user.login}`);
  lines.push(`  ${nameStr}`);

  if (user.bio) {
    lines.push(`  ${dim(user.bio)}`);
  }

  // These were emoji pins, buildings and birds. Short lowercase keys carry the
  // same meaning, align predictably, and survive terminals with no emoji font.
  const meta: string[] = [];
  if (user.location) meta.push(`${dim('loc')} ${user.location}`);
  if (user.company) meta.push(`${dim('org')} ${user.company}`);
  if (user.blog) meta.push(`${dim('web')} ${user.blog}`);
  if (user.twitter_username) meta.push(`${dim('x')} @${user.twitter_username}`);

  if (meta.length > 0) {
    lines.push(`  ${meta.join(dim(`  ${GLYPH.divider}  `))}`);
  }

  lines.push(
    `  ${note(`member ${accountAge(user.created_at)}`)}  ${dim(GLYPH.divider)}  ${note(user.html_url)}`
  );

  return lines.join('\n');
}

export function renderStats(profile: UserProfile): string {
  const { user, totalStars, totalForks, repos } = profile;
  const lines: string[] = [];

  lines.push(renderSectionTitle('Statistics'));

  const nonForks = repos.filter(r => !r.fork).length;

  // Six chalk colours used to distinguish these six numbers, which encoded
  // nothing — the labels already do that. One accent now.
  const stats = [
    { label: 'repositories', value: formatNumber(user.public_repos), detail: `${nonForks} original` },
    { label: 'stars earned', value: formatNumber(totalStars), detail: '' },
    { label: 'forks earned', value: formatNumber(totalForks), detail: '' },
    { label: 'followers', value: formatNumber(user.followers), detail: '' },
    { label: 'following', value: formatNumber(user.following), detail: '' },
    { label: 'public gists', value: formatNumber(user.public_gists), detail: '' },
  ];

  const render = (s: (typeof stats)[number]) => {
    let out = `${amber(GLYPH.marker)} ${label(s.label)} ${value(s.value)}`;
    if (s.detail) out += ` ${dim(`(${s.detail})`)}`;
    return out;
  };

  for (let i = 0; i < stats.length; i += 2) {
    const left = stats[i];
    const right = stats[i + 1];

    let line = `  ${render(left)}`;

    // Pad to the second column. Always leave at least two spaces: a wide left
    // value would otherwise butt straight against the right column's marker.
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, '');
    line += ' '.repeat(Math.max(2, 38 - stripped.length));

    if (right) line += render(right);

    lines.push(line);
  }

  return lines.join('\n');
}
