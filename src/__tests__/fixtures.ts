import { buildProfile } from '../api/github.js';
import { DEMO_USER, DEMO_REPOS, DEMO_EVENTS, CAPTURED_AT } from '../__fixtures__/demo-profile.js';
import type { GitHubUser, GitHubRepo, GitHubEvent, UserProfile } from '../types/index.js';

/**
 * A fixed clock for every test that renders. The demo fixture is a real dated
 * snapshot, so pinning `now` to its capture time keeps "3 months ago" and the
 * activity window from drifting as the calendar moves.
 */
export const NOW = new Date(CAPTURED_AT).getTime();

/** The real captured profile — the main subject of the renderer snapshots. */
export const demoProfile: UserProfile = buildProfile(DEMO_USER, DEMO_REPOS, DEMO_EVENTS, NOW);

export function makeUser(overrides: Partial<GitHubUser> = {}): GitHubUser {
  return {
    login: 'testuser',
    name: 'Test User',
    bio: null,
    avatar_url: 'https://example.com/a.png',
    html_url: 'https://github.com/testuser',
    public_repos: 0,
    public_gists: 0,
    followers: 0,
    following: 0,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    location: null,
    company: null,
    blog: null,
    twitter_username: null,
    hireable: null,
    ...overrides,
  };
}

export function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    name: 'repo',
    full_name: 'testuser/repo',
    html_url: 'https://github.com/testuser/repo',
    description: 'A repository used in tests',
    fork: false,
    stargazers_count: 0,
    watchers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    language: 'TypeScript',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    pushed_at: '2026-08-01T00:00:00Z',
    size: 100,
    default_branch: 'main',
    topics: [],
    has_wiki: false,
    has_pages: false,
    license: null,
    ...overrides,
  };
}

export function makeEvent(overrides: Partial<GitHubEvent> = {}): GitHubEvent {
  return {
    type: 'PushEvent',
    created_at: '2026-08-10T12:00:00Z',
    repo: { name: 'testuser/repo' },
    payload: {},
    ...overrides,
  };
}

export function makeProfile(
  user: Partial<GitHubUser> = {},
  repos: GitHubRepo[] = [],
  events: GitHubEvent[] = [],
): UserProfile {
  return buildProfile(makeUser(user), repos, events, NOW);
}

// ── Edge cases the real fixture cannot express ──────────────────────────────

/** A brand-new account: no repos, no events, no feed at all. */
export const emptyProfile = makeProfile();

/** One repo, one language — exercises singular pluralisation. */
export const singleLanguageProfile = makeProfile(
  { public_repos: 1 },
  [makeRepo({ name: 'only-repo', language: 'Rust', stargazers_count: 1, forks_count: 1 })],
  [makeEvent()]
);

/** Six-digit counts — the case that breaks column alignment and count-ups. */
export const hugeProfile = makeProfile(
  { public_repos: 1140, followers: 316_300, following: 0, public_gists: 1 },
  [makeRepo({ name: 'big', stargazers_count: 242_800, forks_count: 63_900, watchers_count: 242_800 })],
  [makeEvent()]
);
