import { describe, it, expect } from 'vitest';
import { calculateScore, scoreToGrade, calculateLanguages, analyzeCommitPattern, generateContributions, detectStreak } from '../utils/scoring.js';
import type { GitHubRepo, GitHubEvent, LanguageBreakdown, CodingStreak } from '../types/index.js';

// Mock data factories
function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    name: 'test-repo',
    full_name: 'user/test-repo',
    html_url: 'https://github.com/user/test-repo',
    description: 'A test repository with a good description',
    fork: false,
    stargazers_count: 10,
    watchers_count: 10,
    forks_count: 3,
    open_issues_count: 2,
    language: 'TypeScript',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    size: 500,
    default_branch: 'main',
    topics: ['typescript', 'cli'],
    has_wiki: true,
    has_pages: false,
    license: { spdx_id: 'MIT', name: 'MIT License' },
    ...overrides,
  };
}

function makeEvent(overrides: Partial<GitHubEvent> = {}): GitHubEvent {
  return {
    type: 'PushEvent',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
    repo: { name: 'user/test-repo' },
    payload: {
      commits: [{ message: 'fix: stuff', sha: 'abc123' }],
      size: 1,
    },
    ...overrides,
  };
}

describe('scoreToGrade', () => {
  it('returns A+ for 95+', () => {
    expect(scoreToGrade(95)).toBe('A+');
    expect(scoreToGrade(100)).toBe('A+');
  });

  it('returns A for 88-94', () => {
    expect(scoreToGrade(88)).toBe('A');
    expect(scoreToGrade(94)).toBe('A');
  });

  it('returns B for 70-75', () => {
    expect(scoreToGrade(70)).toBe('B');
    expect(scoreToGrade(75)).toBe('B');
  });

  it('returns F for below 30', () => {
    expect(scoreToGrade(0)).toBe('F');
    expect(scoreToGrade(29)).toBe('F');
  });

  it('covers all grades', () => {
    expect(scoreToGrade(82)).toBe('A-');
    expect(scoreToGrade(76)).toBe('B+');
    expect(scoreToGrade(64)).toBe('B-');
    expect(scoreToGrade(56)).toBe('C+');
    expect(scoreToGrade(48)).toBe('C');
    expect(scoreToGrade(40)).toBe('C-');
    expect(scoreToGrade(30)).toBe('D');
  });
});

describe('calculateLanguages', () => {
  it('counts languages from non-fork repos', () => {
    const repos = [
      makeRepo({ language: 'TypeScript' }),
      makeRepo({ language: 'TypeScript' }),
      makeRepo({ language: 'Python' }),
      makeRepo({ language: 'Python', fork: true }), // should be excluded
      makeRepo({ language: null }),
    ];
    const result = calculateLanguages(repos);
    expect(result).toEqual({ TypeScript: 2, Python: 1 });
  });

  it('returns empty object for no repos', () => {
    expect(calculateLanguages([])).toEqual({});
  });
});

describe('analyzeCommitPattern', () => {
  it('counts push events by day and hour', () => {
    const events = [
      makeEvent({ created_at: '2024-01-15T10:00:00Z' }), // Monday
      makeEvent({ created_at: '2024-01-15T14:00:00Z' }), // Monday
      makeEvent({ created_at: '2024-01-16T10:00:00Z' }), // Tuesday
    ];
    const pattern = analyzeCommitPattern(events);
    expect(pattern.byDay).toHaveLength(7);
    expect(pattern.byHour).toHaveLength(24);
    expect(pattern.byHour[10]).toBe(2); // Two events at hour 10
    expect(pattern.byHour[14]).toBe(1);
  });

  it('handles empty events', () => {
    const pattern = analyzeCommitPattern([]);
    expect(pattern.byDay.every(v => v === 0)).toBe(true);
    expect(pattern.byHour.every(v => v === 0)).toBe(true);
  });
});

describe('generateContributions', () => {
  const NOW = new Date('2026-08-14T12:00:00Z').getTime();
  const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();

  // The window is bounded by how far the event feed actually reaches. Rendering
  // a fixed 90 days would paint every unreachable day as a day with no activity.
  it('bounds the window at the oldest event the feed returned', () => {
    const events = [
      makeEvent({ type: 'PushEvent', created_at: daysAgo(40) }),
      makeEvent({ type: 'PushEvent', created_at: daysAgo(3) }),
    ];
    const { days, window } = generateContributions(events, NOW);
    expect(window.spanDays).toBe(41);
    expect(days).toHaveLength(41);
    expect(window.from).toBe('2026-07-05');
    expect(window.to).toBe('2026-08-14');
  });

  it('bounds the window by any event type, not just code events', () => {
    // A star 60 days ago proves the feed reaches back 60 days, even though a
    // star is not itself a contribution.
    const events = [
      makeEvent({ type: 'WatchEvent', created_at: daysAgo(60) }),
      makeEvent({ type: 'PushEvent', created_at: daysAgo(2) }),
    ];
    const { window } = generateContributions(events, NOW);
    expect(window.spanDays).toBe(61);
    expect(window.eventCount).toBe(1);
  });

  it('reports an empty window rather than inventing 90 blank days', () => {
    const { days, window } = generateContributions([], NOW);
    expect(days).toHaveLength(0);
    expect(window.spanDays).toBe(0);
    expect(window.eventCount).toBe(0);
  });

  it('assigns correct levels', () => {
    const { days } = generateContributions([makeEvent({ created_at: daysAgo(10) })], NOW);
    expect(days.every(c => c.level === 0 || c.level === 1)).toBe(true);
  });

  // The bug this sprint exists to kill: the header used to claim 90 days
  // regardless of what the event feed actually covered.
  it('narrows the window to real coverage when the event cap is hit', () => {
    const events = Array.from({ length: 300 }, (_, i) =>
      makeEvent({ type: 'PushEvent', created_at: daysAgo(i % 30) })
    );
    const { window, days } = generateContributions(events, NOW);
    expect(window.eventsTruncated).toBe(true);
    expect(window.spanDays).toBe(30);
    expect(days).toHaveLength(30);
  });

  it('counts only code-authoring events, not stars and forks', () => {
    const events = [
      makeEvent({ type: 'PushEvent', created_at: daysAgo(1) }),
      makeEvent({ type: 'PullRequestEvent', created_at: daysAgo(1) }),
      makeEvent({ type: 'WatchEvent', created_at: daysAgo(1) }),
      makeEvent({ type: 'ForkEvent', created_at: daysAgo(1) }),
      makeEvent({ type: 'IssueCommentEvent', created_at: daysAgo(1) }),
    ];
    const { window } = generateContributions(events, NOW);
    expect(window.eventCount).toBe(2);
  });

  it('counts branch creation but not tag or repo creation', () => {
    const events = [
      makeEvent({ type: 'CreateEvent', created_at: daysAgo(1), payload: { ref_type: 'branch' } }),
      makeEvent({ type: 'CreateEvent', created_at: daysAgo(1), payload: { ref_type: 'tag' } }),
      makeEvent({ type: 'CreateEvent', created_at: daysAgo(1), payload: { ref_type: 'repository' } }),
    ];
    expect(generateContributions(events, NOW).window.eventCount).toBe(1);
  });

  it('reports a window whose totals match the days it emits', () => {
    const events = [
      makeEvent({ type: 'PushEvent', created_at: daysAgo(2) }),
      makeEvent({ type: 'PushEvent', created_at: daysAgo(2) }),
      makeEvent({ type: 'PushEvent', created_at: daysAgo(5) }),
    ];
    const { days, window } = generateContributions(events, NOW);
    expect(window.eventCount).toBe(days.reduce((s, d) => s + d.count, 0));
    expect(window.activeDays).toBe(days.filter(d => d.count > 0).length);
    expect(window.activeDays).toBe(2);
  });
});

describe('detectStreak', () => {
  it('detects current streak', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const contributions = [
      { date: yesterday, count: 3, level: 2 },
      { date: today, count: 1, level: 1 },
    ];
    const streak = detectStreak(contributions);
    expect(streak.current).toBe(2);
    expect(streak.longest).toBe(2);
  });

  it('returns zero for no activity', () => {
    const contributions = [
      { date: '2024-01-01', count: 0, level: 0 },
      { date: '2024-01-02', count: 0, level: 0 },
    ];
    const streak = detectStreak(contributions);
    expect(streak.current).toBe(0);
    expect(streak.longest).toBe(0);
  });
});

describe('calculateScore', () => {
  it('returns a score between 0 and 100', () => {
    const repos = [makeRepo(), makeRepo({ language: 'Python', stargazers_count: 50 })];
    const events = Array.from({ length: 20 }, () => makeEvent());
    const languages = { TypeScript: 5, Python: 3, Go: 1 };
    const streak: CodingStreak = { current: 5, longest: 14, lastActive: new Date().toISOString() };

    const score = calculateScore(repos, events, languages, streak);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.grade).toBeTruthy();
  });

  it('returns low score for empty profile', () => {
    const score = calculateScore([], [], {}, { current: 0, longest: 0, lastActive: null });
    expect(score.total).toBeLessThan(20);
  });

  it('breakdown sums match total', () => {
    const repos = [makeRepo()];
    const events = [makeEvent()];
    const languages = { TypeScript: 1 };
    const streak: CodingStreak = { current: 1, longest: 1, lastActive: null };

    const score = calculateScore(repos, events, languages, streak);
    const sum = Object.values(score.breakdown).reduce((s, v) => s + v, 0);
    // Allow small rounding difference
    expect(Math.abs(sum - score.total)).toBeLessThanOrEqual(1);
  });
});
