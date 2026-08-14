import { describe, it, expect } from 'vitest';
import { renderHeader, renderDivider, renderSectionTitle, renderNote } from '../ui/header.js';
import { renderProfile, renderStats } from '../ui/stats.js';
import { renderLanguages } from '../ui/languages.js';
import { renderTopRepos } from '../ui/repos.js';
import { renderHeatmap, renderCommitPatterns } from '../ui/heatmap.js';
import { renderScore, renderStreak } from '../ui/score.js';
import { renderComparison } from '../ui/compare.js';
import { renderMinimal } from '../ui/minimal.js';
import { generateThreeJSExport } from '../ui/export.js';
import {
  demoProfile,
  emptyProfile,
  singleLanguageProfile,
  hugeProfile,
  makeProfile,
  makeRepo,
} from './fixtures.js';

/**
 * The rendered output is the product, and until now none of it was tested.
 *
 * These are plain-text snapshots taken against a real, dated fixture with a
 * pinned clock, so a diff shows the actual report card changing rather than an
 * opaque hash. Colour is disabled globally in setup.ts.
 */

describe('header', () => {
  it('renders the wordmark', () => {
    expect(renderHeader()).toMatchSnapshot();
  });

  it('renders a section title as a label plus rule', () => {
    expect(renderSectionTitle('Profile')).toMatchSnapshot();
  });

  it('renders a divider at the standard width', () => {
    expect(renderDivider()).toHaveLength(64);
  });

  it('prefixes notes so they read as machine speech', () => {
    expect(renderNote('source: public Events API')).toBe('  > source: public Events API');
  });
});

describe('profile and stats', () => {
  it('renders the profile block', () => {
    expect(renderProfile(demoProfile)).toMatchSnapshot();
  });

  it('renders the stats grid', () => {
    expect(renderStats(demoProfile)).toMatchSnapshot();
  });

  it('keeps both columns separated with six-digit values', () => {
    const out = renderStats(hugeProfile);
    expect(out).toMatchSnapshot();
    // The bug this catches: a wide left value used to butt straight against the
    // right column's marker with no gap at all.
    for (const line of out.split('\n').slice(1)) {
      if (line.includes('▌') && line.lastIndexOf('▌') !== line.indexOf('▌')) {
        expect(line).toMatch(/ {2,}▌/);
      }
    }
  });

  it('renders a profile with no optional metadata', () => {
    expect(renderProfile(emptyProfile)).toMatchSnapshot();
  });
});

describe('languages', () => {
  it('renders the language bars', () => {
    expect(renderLanguages(demoProfile.languages)).toMatchSnapshot();
  });

  it('says "repo" not "repos" for a single repository', () => {
    const out = renderLanguages(singleLanguageProfile.languages);
    expect(out).toContain('(1 repo)');
    expect(out).not.toContain('(1 repos)');
  });

  it('states that percentages are a share of repositories, not of code', () => {
    expect(renderLanguages(demoProfile.languages)).toContain('share of repositories');
  });

  it('handles a profile with no language data', () => {
    expect(renderLanguages({})).toContain('No language data available');
  });

  it('summarises the tail beyond the top ten', () => {
    const many = Object.fromEntries(
      Array.from({ length: 14 }, (_, i) => [`Lang${String(i).padStart(2, '0')}`, 14 - i])
    );
    expect(renderLanguages(many)).toMatchSnapshot();
  });
});

describe('repositories', () => {
  it('renders the ranked repo list', () => {
    expect(renderTopRepos(demoProfile.repos, Date.parse(demoProfile.fetchedAt))).toMatchSnapshot();
  });

  it('reports when there are no original repositories', () => {
    expect(renderTopRepos([])).toContain('No original repositories found');
  });

  it('excludes forks from the ranking', () => {
    const out = renderTopRepos([
      makeRepo({ name: 'mine', stargazers_count: 1 }),
      makeRepo({ name: 'someone-elses', fork: true, stargazers_count: 9999 }),
    ]);
    expect(out).toContain('mine');
    expect(out).not.toContain('someone-elses');
  });
});

describe('code activity', () => {
  it('renders the heatmap', () => {
    expect(renderHeatmap(demoProfile.contributions, demoProfile.contributionWindow)).toMatchSnapshot();
  });

  it('labels the window from the data, never a hardcoded 90', () => {
    const out = renderHeatmap(demoProfile.contributions, demoProfile.contributionWindow);
    expect(out).toContain(`last ${demoProfile.contributionWindow.spanDays} days`);
    expect(out).toContain(demoProfile.contributionWindow.from);
    expect(out).toContain(demoProfile.contributionWindow.to);
  });

  it('distinguishes an empty feed from an inactive account', () => {
    const out = renderHeatmap(emptyProfile.contributions, emptyProfile.contributionWindow);
    expect(out).toContain('not the same as no activity');
    expect(out).toMatchSnapshot();
  });

  it('renders quiet days as a visible glyph so the grid keeps its shape', () => {
    // Level 0 was a literal space, which left the grid as glyphs floating in
    // whitespace. Every rendered row must carry a mark.
    const quiet = makeProfile({}, [], [
      { type: 'PushEvent', created_at: '2026-07-20T00:00:00Z', repo: { name: 'r' }, payload: {} },
      { type: 'PushEvent', created_at: '2026-08-14T00:00:00Z', repo: { name: 'r' }, payload: {} },
    ]);
    const out = renderHeatmap(quiet.contributions, quiet.contributionWindow);
    expect(out).toContain('·');
  });

  it('renders commit patterns with a computed peak', () => {
    expect(renderCommitPatterns(demoProfile.commitPattern)).toMatchSnapshot();
  });
});

describe('score and streak', () => {
  it('renders the score block', () => {
    expect(renderScore(demoProfile.score)).toMatchSnapshot();
  });

  it('points at the documented methodology', () => {
    expect(renderScore(demoProfile.score)).toContain('SCORING.md');
  });

  it('renders the streak with its measuring window', () => {
    const out = renderStreak(demoProfile.streak, demoProfile.contributionWindow);
    expect(out).toContain('not all-time');
    expect(out).toMatchSnapshot();
  });

  it('says "day" not "days" for a one-day streak', () => {
    const out = renderStreak(
      { current: 1, longest: 1, lastActive: '2026-08-14' },
      demoProfile.contributionWindow
    );
    expect(out).toContain('1 day');
    expect(out).not.toContain('1 days');
  });
});

describe('compare', () => {
  it('renders a head-to-head comparison', () => {
    expect(renderComparison(demoProfile, hugeProfile)).toMatchSnapshot();
  });

  it('warns that streaks measured over different windows are not comparable', () => {
    expect(renderComparison(demoProfile, hugeProfile)).toContain('not directly comparable');
  });

  it('handles two identical profiles without declaring a winner', () => {
    expect(renderComparison(demoProfile, demoProfile)).toContain('level');
  });
});

describe('minimal', () => {
  it('renders the compact one-liner form', () => {
    expect(renderMinimal(demoProfile)).toMatchSnapshot();
  });

  it('keeps the streak qualifier even in compact output', () => {
    expect(renderMinimal(demoProfile)).toContain('event window');
  });

  it('renders an empty account without crashing', () => {
    expect(renderMinimal(emptyProfile)).toMatchSnapshot();
  });
});

describe('three.js export — scene contract', () => {
  it('pins the scene shape', () => {
    const scene = generateThreeJSExport(demoProfile);
    expect(scene).toMatchSnapshot();
  });

  it('centres the user node at the origin', () => {
    const scene = generateThreeJSExport(demoProfile);
    const user = scene.scene.nodes.find(n => n.type === 'user');
    expect(user).toBeDefined();
    expect(user!.position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('emits a node for every language and connects it to the user', () => {
    const scene = generateThreeJSExport(demoProfile);
    const langNodes = scene.scene.nodes.filter(n => n.type === 'language');
    expect(langNodes).toHaveLength(Object.keys(demoProfile.languages).length);
    for (const node of langNodes) {
      expect(scene.scene.connections.some(c => c.target === node.id || c.source === node.id)).toBe(true);
    }
  });

  it('never emits a connection to a node that does not exist', () => {
    const scene = generateThreeJSExport(demoProfile);
    const ids = new Set(scene.scene.nodes.map(n => n.id));
    for (const c of scene.scene.connections) {
      expect(ids.has(c.source), `dangling source ${c.source}`).toBe(true);
      expect(ids.has(c.target), `dangling target ${c.target}`).toBe(true);
    }
  });

  it('produces a valid scene for an empty account', () => {
    const scene = generateThreeJSExport(emptyProfile);
    expect(scene.scene.nodes.length).toBeGreaterThan(0);
    expect(() => JSON.stringify(scene)).not.toThrow();
  });
});
