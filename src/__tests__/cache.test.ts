import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { makeUser, makeRepo, NOW } from './fixtures.js';
import { buildProfile } from '../api/github.js';
import { getCached, setCache, clearCache } from '../api/cache.js';

/**
 * The previous version of this file asserted that `Date.now() - t > ttl`
 * evaluates correctly — arithmetic, inline, with the cache module never
 * imported. It passed, contributed two tests to the badge, and verified
 * nothing. These exercise the real module.
 *
 * Each test points GITPULSE_CACHE_DIR at a throwaway directory. An earlier
 * attempt stubbed HOME instead; it did not take effect, and the run wrote 50
 * fixtures into the developer's real ~/.gitpulse/cache. Hence the explicit
 * override in the module itself — a cache you cannot redirect is a cache you
 * cannot safely test.
 */

let dir: string;

const profile = buildProfile(makeUser({ login: 'alice' }), [makeRepo()], [], NOW);

beforeEach(() => {
  dir = join(mkdtempSync(join(tmpdir(), 'gitpulse-cache-')), 'cache');
  vi.stubEnv('GITPULSE_CACHE_DIR', dir);
});

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(dir, { recursive: true, force: true });
});

const cacheDir = () => dir;

describe('cache round-trip', () => {
  it('returns null before anything is cached', () => {
    expect(getCached('alice')).toBeNull();
  });

  it('stores and retrieves a profile', () => {
    setCache('alice', profile);
    const got = getCached('alice');
    expect(got).not.toBeNull();
    expect(got!.user.login).toBe('alice');
  });

  it('is case-insensitive, matching GitHub usernames', () => {
    setCache('Alice', profile);
    expect(getCached('alice')).not.toBeNull();
    expect(getCached('ALICE')).not.toBeNull();
  });

  it('creates the cache directory on first write', () => {
    expect(existsSync(cacheDir())).toBe(false);
    setCache('alice', profile);
    expect(existsSync(cacheDir())).toBe(true);
  });

  it('survives a corrupt cache file instead of throwing', () => {
    setCache('alice', profile);
    writeFileSync(join(cacheDir(), 'alice.json'), 'not json at all');
    expect(getCached('alice')).toBeNull();
  });
});

describe('TTL', () => {
  it('honours a 30-minute TTL', () => {
    setCache('alice', profile);

    // Push the entry's clock back past the TTL by rewriting cachedAt.
    const path = join(cacheDir(), 'alice.json');
    const entry = JSON.parse(readFileSync(path, 'utf-8'));
    expect(entry.ttl).toBe(30 * 60 * 1000);
    entry.cachedAt = Date.now() - (entry.ttl + 1000);
    writeFileSync(path, JSON.stringify(entry));

    expect(getCached('alice')).toBeNull();
  });

  it('keeps an entry that is still inside its TTL', () => {
    setCache('alice', profile);
    const path = join(cacheDir(), 'alice.json');
    const entry = JSON.parse(readFileSync(path, 'utf-8'));
    entry.cachedAt = Date.now() - 60_000;
    writeFileSync(path, JSON.stringify(entry));

    expect(getCached('alice')).not.toBeNull();
  });
});

describe('clearCache', () => {
  it('clears a single named profile and reports one removed', () => {
    setCache('alice', profile);
    setCache('bob', profile);

    expect(clearCache('alice')).toBe(1);
    expect(getCached('alice')).toBeNull();
    expect(getCached('bob')).not.toBeNull();
  });

  it('reports zero when the named profile was not cached', () => {
    expect(clearCache('nobody')).toBe(0);
  });

  it('clears everything and reports the count', () => {
    setCache('alice', profile);
    setCache('bob', profile);
    expect(clearCache()).toBe(2);
    expect(readdirSync(cacheDir())).toHaveLength(0);
  });
});

describe('eviction', () => {
  it('caps the cache at 50 profiles', () => {
    // Written in order, so mtimes ascend naturally and eviction removes the
    // oldest. Deliberately no mtime rewriting: eviction runs *during* setCache,
    // so a file touched after the fact may already be gone.
    for (let i = 0; i < 55; i++) {
      setCache(`user${String(i).padStart(3, '0')}`, profile);
    }

    const remaining = readdirSync(cacheDir());
    expect(remaining.length).toBeLessThanOrEqual(50);
    // Whatever else is evicted, the most recent write must survive.
    expect(remaining).toContain('user054.json');
  });
});
