import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchUserProfile, buildProfile, resolveToken } from '../api/github.js';
import { makeUser, makeRepo, makeEvent, NOW } from './fixtures.js';

/**
 * `src/api/github.ts` is the only network surface in gitpulse and had no tests.
 * Every branch here is one a user can actually hit on a first run.
 */

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

/** Route by URL path so the three parallel requests can be answered independently. */
function stubFetch(routes: Array<{ match: RegExp; respond: () => Response }>) {
  globalThis.fetch = vi.fn(async (url: string | URL | Request) => {
    const href = typeof url === 'string' ? url : url.toString();
    const route = routes.find(r => r.match.test(href));
    if (!route) throw new Error(`unstubbed request: ${href}`);
    return route.respond();
  }) as unknown as typeof fetch;
}

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { status: 200, ...init });

beforeEach(() => {
  delete process.env.GITHUB_TOKEN;
  delete process.env.GH_TOKEN;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe('resolveToken', () => {
  it('prefers the explicit flag over the environment', () => {
    process.env.GITHUB_TOKEN = 'from-env';
    expect(resolveToken('from-flag')).toBe('from-flag');
  });

  it('falls back to GITHUB_TOKEN, then GH_TOKEN', () => {
    process.env.GH_TOKEN = 'gh';
    expect(resolveToken()).toBe('gh');
    process.env.GITHUB_TOKEN = 'github';
    expect(resolveToken()).toBe('github');
  });

  it('treats a blank or whitespace token as absent', () => {
    process.env.GITHUB_TOKEN = '   ';
    expect(resolveToken()).toBeUndefined();
    expect(resolveToken('')).toBeUndefined();
  });

  it('returns undefined when nothing is set', () => {
    expect(resolveToken()).toBeUndefined();
  });
});

describe('authorization header', () => {
  it('sends a bearer token when one is resolvable from the environment', async () => {
    process.env.GITHUB_TOKEN = 'ghp_test';
    stubFetch([
      { match: /\/users\/x$/, respond: () => json(makeUser()) },
      { match: /\/repos\?/, respond: () => json([]) },
      { match: /\/events\/public/, respond: () => json([]) },
    ]);

    await fetchUserProfile('x');

    const calls = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls;
    for (const [, init] of calls) {
      expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer ghp_test' });
    }
  });

  it('omits the header entirely when there is no token', async () => {
    stubFetch([
      { match: /\/users\/x$/, respond: () => json(makeUser()) },
      { match: /\/repos\?/, respond: () => json([]) },
      { match: /\/events\/public/, respond: () => json([]) },
    ]);

    await fetchUserProfile('x');

    const calls = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls;
    for (const [, init] of calls) {
      expect((init as RequestInit).headers).not.toHaveProperty('Authorization');
    }
  });
});

describe('error branches', () => {
  const failAllWith = (init: ResponseInit) =>
    stubFetch([{ match: /./, respond: () => new Response('{}', init) }]);

  it('reports a missing user plainly', async () => {
    failAllWith({ status: 404 });
    await expect(fetchUserProfile('nope')).rejects.toThrow('User not found');
  });

  it('names the token source on 401 so the user knows what to replace', async () => {
    process.env.GITHUB_TOKEN = 'bad';
    failAllWith({ status: 401 });
    await expect(fetchUserProfile('x')).rejects.toThrow(/GITHUB_TOKEN environment variable/);
  });

  it('distinguishes 401 with no token at all', async () => {
    failAllWith({ status: 401 });
    await expect(fetchUserProfile('x')).rejects.toThrow(/No token was supplied/);
  });

  it('onboards an unauthenticated user when the primary rate limit is hit', async () => {
    const reset = Math.floor(Date.now() / 1000) + 1800;
    failAllWith({
      status: 403,
      headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) },
    });

    await expect(fetchUserProfile('x')).rejects.toThrow(/60 requests\/hour \(unauthenticated\)/);
    // The whole point of the message: it must be actionable, not just accurate.
    await expect(fetchUserProfile('x')).rejects.toThrow(/github\.com\/settings\/tokens\/new/);
    await expect(fetchUserProfile('x')).rejects.toThrow(/gitpulse --demo/);
  });

  it('does not tell an already-authenticated user to get a token', async () => {
    const reset = Math.floor(Date.now() / 1000) + 600;
    failAllWith({
      status: 403,
      headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) },
    });

    let message = '';
    try {
      await fetchUserProfile('x', { token: 'ghp_real' });
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toMatch(/5,000 requests\/hour \(authenticated\)/);
    expect(message).not.toMatch(/settings\/tokens\/new/);
  });

  it('separates a secondary rate limit from an exhausted quota', async () => {
    failAllWith({ status: 403, headers: { 'retry-after': '45' } });
    await expect(fetchUserProfile('x')).rejects.toThrow(/secondary rate limit/);
    await expect(fetchUserProfile('x')).rejects.toThrow(/Wait 45 seconds/);
  });

  it('treats 429 the same as 403', async () => {
    failAllWith({ status: 429, headers: { 'retry-after': '10' } });
    await expect(fetchUserProfile('x')).rejects.toThrow(/secondary rate limit/);
  });

  it('surfaces unexpected statuses with the status text', async () => {
    failAllWith({ status: 500, statusText: 'Internal Server Error' });
    await expect(fetchUserProfile('x')).rejects.toThrow(/GitHub API error: 500/);
  });
});

describe('pagination and resilience', () => {
  it('fetches a second page only when the first is full, and stops after two', async () => {
    const full = Array.from({ length: 100 }, (_, i) => makeRepo({ name: `r${i}` }));
    const pages: string[] = [];

    stubFetch([
      { match: /\/users\/x$/, respond: () => json(makeUser()) },
      {
        match: /\/repos\?/,
        respond: () => {
          pages.push('repos');
          return json(pages.length === 1 ? full : full.slice(0, 30));
        },
      },
      { match: /\/events\/public/, respond: () => json([]) },
    ]);

    const profile = await fetchUserProfile('x');
    expect(pages).toHaveLength(2);
    expect(profile.repos).toHaveLength(130);
  });

  it('stops after one page when it comes back short', async () => {
    let repoCalls = 0;
    stubFetch([
      { match: /\/users\/x$/, respond: () => json(makeUser()) },
      { match: /\/repos\?/, respond: () => { repoCalls++; return json([makeRepo()]); } },
      { match: /\/events\/public/, respond: () => json([]) },
    ]);

    await fetchUserProfile('x');
    expect(repoCalls).toBe(1);
  });

  it('degrades gracefully when the events feed fails', async () => {
    // The events endpoint is flaky in practice. A profile without activity data
    // is far better than no profile at all.
    stubFetch([
      { match: /\/users\/x$/, respond: () => json(makeUser({ public_repos: 1 })) },
      { match: /\/repos\?/, respond: () => json([makeRepo()]) },
      { match: /\/events\/public/, respond: () => new Response('{}', { status: 500 }) },
    ]);

    const profile = await fetchUserProfile('x');
    expect(profile.events).toEqual([]);
    expect(profile.repos).toHaveLength(1);
    expect(profile.contributionWindow.spanDays).toBe(0);
  });
});

describe('buildProfile', () => {
  it('derives totals from the repos it was given', () => {
    const profile = buildProfile(
      makeUser(),
      [makeRepo({ stargazers_count: 10, forks_count: 3 }), makeRepo({ stargazers_count: 5, forks_count: 2 })],
      [],
      NOW
    );
    expect(profile.totalStars).toBe(15);
    expect(profile.totalForks).toBe(5);
  });

  it('stamps fetchedAt from the injected clock, not the wall clock', () => {
    expect(buildProfile(makeUser(), [], [], NOW).fetchedAt).toBe(new Date(NOW).toISOString());
  });

  it('is deterministic for the same inputs and clock', () => {
    const user = makeUser();
    const repos = [makeRepo()];
    const events = [makeEvent()];
    expect(JSON.stringify(buildProfile(user, repos, events, NOW))).toBe(
      JSON.stringify(buildProfile(user, repos, events, NOW))
    );
  });

  it('keeps the contribution window self-consistent', () => {
    const profile = buildProfile(makeUser(), [], [makeEvent(), makeEvent()], NOW);
    const w = profile.contributionWindow;
    expect(profile.contributions).toHaveLength(w.spanDays);
    expect(w.eventCount).toBe(profile.contributions.reduce((s, d) => s + d.count, 0));
    expect(w.activeDays).toBe(profile.contributions.filter(d => d.count > 0).length);
  });
});
