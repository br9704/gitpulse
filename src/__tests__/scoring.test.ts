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
  it('generates 90 days of contribution data', () => {
    const events = [makeEvent()];
    const contributions = generateContributions(events);
    expect(contributions).toHaveLength(90);
  });

  it('assigns correct levels', () => {
    const contributions = generateContributions([]);
    // All zeros = level 0
    expect(contributions.every(c => c.level === 0)).toBe(true);
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
