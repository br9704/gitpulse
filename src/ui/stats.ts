import type { UserProfile } from '../types/index.js';
import { formatNumber, accountAge } from '../utils/formatting.js';
import { countUp } from '../utils/anim.js';
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

/**
 * @param progress 0..1 for the count-up animation. At 1 this returns exactly the
 *                 static output — that identity is what makes `--no-anim`
 *                 byte-identical to the animated path.
 */
export function renderStats(profile: UserProfile, progress: number = 1): string {
  const { user, totalStars, totalForks, repos } = profile;
  const lines: string[] = [];

  lines.push(renderSectionTitle('Statistics'));

  const nonForks = repos.filter(r => !r.fork).length;

  // Values are padded to their final width before counting up, so no column
  // can shift as the numbers climb.
  const n = (v: number) => countUp(v, progress, formatNumber);

  // Six chalk colours used to distinguish these six numbers, which encoded
  // nothing — the labels already do that. One accent now.
  const stats = [
    { label: 'repositories', value: n(user.public_repos), detail: `${nonForks} original` },
    { label: 'stars earned', value: n(totalStars), detail: '' },
    { label: 'forks earned', value: n(totalForks), detail: '' },
    { label: 'followers', value: n(user.followers), detail: '' },
    { label: 'following', value: n(user.following), detail: '' },
    { label: 'public gists', value: n(user.public_gists), detail: '' },
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
