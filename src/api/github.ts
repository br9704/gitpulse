import type { GitHubUser, GitHubRepo, GitHubEvent, UserProfile } from '../types/index.js';
import { calculateLanguages, analyzeCommitPattern, generateContributions, detectStreak, calculateScore } from '../utils/scoring.js';

const API_BASE = 'https://api.github.com';

const TOKEN_HELP = [
  'A token is not required for public data, but unauthenticated requests are',
  'limited to 60 per hour per IP — which is usually already spent.',
  '',
  '  1. Create one (no scopes needed for public profiles):',
  '     https://github.com/settings/tokens/new?description=gitpulse&scopes=',
  '',
  '  2. Use it once:',
  '     gitpulse <username> --token ghp_xxxxxxxx',
  '',
  '  3. Or persist it — gitpulse reads GITHUB_TOKEN and GH_TOKEN automatically:',
  '     echo \'export GITHUB_TOKEN=ghp_xxxxxxxx\' >> ~/.zshrc && source ~/.zshrc',
  '',
  'No token to hand? Run `gitpulse --demo` to see the full output offline.',
].join('\n');

interface FetchOptions {
  token?: string;
  /** Injectable clock, so fixtures and tests render deterministically. */
  now?: number;
}

/**
 * Resolve a token from the explicit flag first, then the environment.
 * Most developers already export one of these.
 */
export function resolveToken(explicit?: string): string | undefined {
  const candidate = explicit || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : undefined;
}

async function githubFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'gitpulse-cli',
  };

  const token = resolveToken(opts.token);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { headers });

  if (response.status === 404) {
    throw new Error('User not found');
  }

  // A supplied token that GitHub rejects. Distinct from being rate limited —
  // telling someone to "use a token" when their token is the problem is a dead end.
  if (response.status === 401) {
    throw new Error(
      'GitHub rejected the token (401 Unauthorized).\n\n' +
      (token
        ? '  The token gitpulse used is expired, revoked, or malformed.\n' +
          `  It came from ${tokenSource(opts.token)}.\n` +
          '  Create a fresh one at https://github.com/settings/tokens/new?description=gitpulse&scopes=\n'
        : '  No token was supplied.\n')
    );
  }

  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const resetHeader = response.headers.get('x-ratelimit-reset');
    const retryAfter = response.headers.get('retry-after');

    // Primary rate limit: the quota itself is exhausted.
    if (remaining === '0' && resetHeader) {
      const resetTime = new Date(parseInt(resetHeader, 10) * 1000);
      const minutes = Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 60000));
      const limit = token ? '5,000 requests/hour (authenticated)' : '60 requests/hour (unauthenticated)';

      throw new Error(
        `GitHub API rate limit exceeded — ${limit}.\n` +
        `Resets at ${resetTime.toLocaleTimeString()} (about ${minutes} minute${minutes === 1 ? '' : 's'}).\n\n` +
        (token
          ? '  You are already authenticated, so this is a genuinely heavy run.\n' +
            '  Cached profiles are reused for 30 minutes — drop --no-cache to take advantage of that.\n'
          : TOKEN_HELP)
      );
    }

    // Secondary rate limit / abuse detection: quota remains, GitHub wants you to slow down.
    throw new Error(
      'GitHub applied a secondary rate limit (too many requests too quickly).\n' +
      `Wait ${retryAfter ?? '60'} seconds and try again.\n` +
      (token ? '' : '\n' + TOKEN_HELP)
    );
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/** Where the token came from, so a 401 message can point at the right place. */
function tokenSource(explicit?: string): string {
  if (explicit?.trim()) return 'the --token flag';
  if (process.env.GITHUB_TOKEN?.trim()) return 'the GITHUB_TOKEN environment variable';
  if (process.env.GH_TOKEN?.trim()) return 'the GH_TOKEN environment variable';
  return 'an unknown source';
}

/**
 * Fetch all repos with pagination (up to 200)
 */
async function fetchAllRepos(username: string, opts: FetchOptions): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  const perPage = 100;

  for (let page = 1; page <= 2; page++) {
    const batch = await githubFetch<GitHubRepo[]>(
      `/users/${username}/repos?per_page=${perPage}&page=${page}&sort=pushed&type=owner`,
      opts
    );
    repos.push(...batch);
    if (batch.length < perPage) break;
  }

  return repos;
}

/**
 * Fetch recent events (up to 300)
 */
async function fetchEvents(username: string, opts: FetchOptions): Promise<GitHubEvent[]> {
  const events: GitHubEvent[] = [];
  const perPage = 100;

  for (let page = 1; page <= 3; page++) {
    try {
      const batch = await githubFetch<GitHubEvent[]>(
        `/users/${username}/events/public?per_page=${perPage}&page=${page}`,
        opts
      );
      events.push(...batch);
      if (batch.length < perPage) break;
    } catch {
      // Events API can be flaky, don't fail completely
      break;
    }
  }

  return events;
}

/**
 * Assemble a UserProfile from raw API parts.
 *
 * Split out from fetchUserProfile so the bundled --demo fixture runs the exact
 * same derivation the network path does — the demo cannot drift from the product.
 */
export function buildProfile(
  user: GitHubUser,
  repos: GitHubRepo[],
  events: GitHubEvent[],
  now: number = Date.now(),
): UserProfile {
  const languages = calculateLanguages(repos);
  const commitPattern = analyzeCommitPattern(events);
  const { days: contributions, window: contributionWindow } = generateContributions(events, now);
  const streak = detectStreak(contributions);
  const score = calculateScore(repos, events, languages, streak, now);

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  return {
    user,
    repos,
    events,
    languages,
    commitPattern,
    contributions,
    contributionWindow,
    streak,
    score,
    totalStars,
    totalForks,
    fetchedAt: new Date(now).toISOString(),
  };
}

/**
 * Fetch a complete user profile
 */
export async function fetchUserProfile(username: string, opts: FetchOptions = {}): Promise<UserProfile> {
  // Fetch user, repos, and events in parallel
  const [user, repos, events] = await Promise.all([
    githubFetch<GitHubUser>(`/users/${username}`, opts),
    fetchAllRepos(username, opts),
    fetchEvents(username, opts),
  ]);

  return buildProfile(user, repos, events, opts.now ?? Date.now());
}
