import type { GitHubUser, GitHubRepo, GitHubEvent, UserProfile } from '../types/index.js';
import { calculateLanguages, analyzeCommitPattern, generateContributions, detectStreak, calculateScore } from '../utils/scoring.js';

const API_BASE = 'https://api.github.com';

interface FetchOptions {
  token?: string;
}

async function githubFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'gitpulse-cli/1.0.0',
  };

  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { headers });

  if (response.status === 404) {
    throw new Error(`User not found`);
  }

  if (response.status === 403) {
    const resetHeader = response.headers.get('x-ratelimit-reset');
    const resetTime = resetHeader ? new Date(parseInt(resetHeader) * 1000).toLocaleTimeString() : 'unknown';
    throw new Error(
      `GitHub API rate limit exceeded. Resets at ${resetTime}.\n` +
      `Use --token <your-github-token> for higher rate limits.`
    );
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
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
 * Fetch a complete user profile
 */
export async function fetchUserProfile(username: string, opts: FetchOptions = {}): Promise<UserProfile> {
  // Fetch user, repos, and events in parallel
  const [user, repos, events] = await Promise.all([
    githubFetch<GitHubUser>(`/users/${username}`, opts),
    fetchAllRepos(username, opts),
    fetchEvents(username, opts),
  ]);

  // Compute derived data
  const languages = calculateLanguages(repos);
  const commitPattern = analyzeCommitPattern(events);
  const contributions = generateContributions(events);
  const streak = detectStreak(contributions);
  const score = calculateScore(repos, events, languages, streak);

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  return {
    user,
    repos,
    events,
    languages,
    commitPattern,
    contributions,
    streak,
    score,
    totalStars,
    totalForks,
    fetchedAt: new Date().toISOString(),
  };
}
