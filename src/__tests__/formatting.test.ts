import { describe, it, expect } from 'vitest';
import { formatNumber, timeAgo, sparkline, progressBar, truncate, percent, centerText, accountAge } from '../utils/formatting.js';

describe('formatNumber', () => {
  it('formats small numbers as-is', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands with K', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(42000)).toBe('42.0K');
  });

  it('formats millions with M', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(2500000)).toBe('2.5M');
  });
});

describe('sparkline', () => {
  it('generates sparkline from values', () => {
    const result = sparkline([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(result).toHaveLength(8);
    expect(result[0]).toBe('▁');
    expect(result[7]).toBe('█');
  });

  it('returns empty for no values', () => {
    expect(sparkline([])).toBe('');
  });

  it('handles uniform values', () => {
    const result = sparkline([5, 5, 5]);
    expect(result).toHaveLength(3);
  });
});

describe('progressBar', () => {
  it('generates correct bar width', () => {
    const bar = progressBar(5, 10, 10);
    expect(bar).toHaveLength(10);
    expect(bar).toBe('█████░░░░░');
  });

  it('handles zero', () => {
    const bar = progressBar(0, 10, 10);
    expect(bar).toBe('░░░░░░░░░░');
  });

  it('handles max', () => {
    const bar = progressBar(10, 10, 10);
    expect(bar).toBe('██████████');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World This Is Long', 10)).toBe('Hello Wor…');
  });

  it('preserves short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });
});

describe('percent', () => {
  it('calculates percentage', () => {
    expect(percent(1, 4)).toBe('25.0%');
    expect(percent(1, 3)).toBe('33.3%');
  });

  it('handles zero total', () => {
    expect(percent(0, 0)).toBe('0%');
  });
});

describe('timeAgo', () => {
  it('returns "just now" for recent dates', () => {
    expect(timeAgo(new Date().toISOString())).toBe('just now');
  });

  it('returns days ago', () => {
    const d = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(timeAgo(d)).toBe('3 days ago');
  });
});
