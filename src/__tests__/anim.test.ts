import { describe, it, expect } from 'vitest';
import { resolveAnimation, countUp } from '../utils/anim.js';
import { renderStats } from '../ui/stats.js';
import { renderLanguages } from '../ui/languages.js';
import { renderHeatmap } from '../ui/heatmap.js';
import { renderScore } from '../ui/score.js';
import { buildProfile } from '../api/github.js';
import { DEMO_USER, DEMO_REPOS, DEMO_EVENTS, CAPTURED_AT } from '../__fixtures__/demo-profile.js';
import { formatNumber } from '../utils/formatting.js';

const profile = buildProfile(DEMO_USER, DEMO_REPOS, DEMO_EVENTS, new Date(CAPTURED_AT).getTime());

/** Visible width, ignoring colour. */
const widths = (s: string) =>
  // eslint-disable-next-line no-control-regex
  s.split('\n').map(line => line.replace(/\x1b\[[0-9;]*m/g, '').length);

const STEPS = [0, 0.05, 0.17, 0.33, 0.5, 0.66, 0.83, 0.99, 1];

describe('MOTION acceptance — progress(1) is the static render', () => {
  // This identity is what makes --no-anim byte-identical to the animated path.
  // If it ever breaks, the animation is no longer showing the real output.
  it('renderStats', () => {
    expect(renderStats(profile, 1)).toBe(renderStats(profile));
  });
  it('renderLanguages', () => {
    expect(renderLanguages(profile.languages, 1)).toBe(renderLanguages(profile.languages));
  });
  it('renderHeatmap', () => {
    expect(renderHeatmap(profile.contributions, profile.contributionWindow, 1)).toBe(
      renderHeatmap(profile.contributions, profile.contributionWindow)
    );
  });
  it('renderScore', () => {
    expect(renderScore(profile.score, 1)).toBe(renderScore(profile.score));
  });
});

describe('MOTION acceptance — count-ups never shift column widths', () => {
  it('holds every stats line at a constant width through the count-up', () => {
    const reference = widths(renderStats(profile, 1));
    for (const p of STEPS) {
      expect(widths(renderStats(profile, p)), `progress ${p}`).toEqual(reference);
    }
  });

  // The case MOTION.md calls out explicitly, and the one that breaks naive
  // implementations: "255.7K" is six characters but "25.6K" is five.
  it('holds width against a six-digit star count', () => {
    const big = { ...profile, totalStars: 255_700, totalForks: 654_321 };
    const reference = widths(renderStats(big, 1));
    for (const p of STEPS) {
      expect(widths(renderStats(big, p)), `progress ${p}`).toEqual(reference);
    }
  });

  it('countUp pads to the final width at every step', () => {
    const final = formatNumber(255_700);
    for (const p of STEPS) {
      expect(countUp(255_700, p, formatNumber).length).toBe(final.length);
    }
  });
});

describe('MOTION acceptance — staging is off unless a human is watching', () => {
  const tty = process.stdout.isTTY;
  const restore = () => {
    process.stdout.isTTY = tty;
    delete process.env.CI;
    delete process.env.NO_COLOR;
  };

  it('is off for --json, --minimal, --export and --no-anim', () => {
    process.stdout.isTTY = true;
    expect(resolveAnimation({ json: true }).enabled).toBe(false);
    expect(resolveAnimation({ minimal: true }).enabled).toBe(false);
    expect(resolveAnimation({ export: true }).enabled).toBe(false);
    expect(resolveAnimation({ noAnim: true }).enabled).toBe(false);
    restore();
  });

  it('is off when piped, under CI, and under NO_COLOR', () => {
    process.stdout.isTTY = false;
    expect(resolveAnimation({}).enabled).toBe(false);

    process.stdout.isTTY = true;
    process.env.CI = '1';
    expect(resolveAnimation({}).enabled).toBe(false);
    delete process.env.CI;

    process.env.NO_COLOR = '1';
    expect(resolveAnimation({}).enabled).toBe(false);
    restore();
  });

  it('halves every gap on a cache hit', () => {
    process.stdout.isTTY = true;
    expect(resolveAnimation({ cacheHit: true }).scale).toBe(0.5);
    expect(resolveAnimation({ cacheHit: false }).scale).toBe(1);
    restore();
  });
});

describe('MOTION acceptance — heatmap paints columns without changing row count', () => {
  it('emits a stable row count while columns fill in', () => {
    const reference = renderHeatmap(profile.contributions, profile.contributionWindow, 1).split('\n').length;
    for (const p of STEPS) {
      const rows = renderHeatmap(profile.contributions, profile.contributionWindow, p).split('\n').length;
      expect(rows, `progress ${p}`).toBe(reference);
    }
  });
});
