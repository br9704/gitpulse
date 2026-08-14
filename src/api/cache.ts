import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { UserProfile, CacheEntry } from '../types/index.js';

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 50; // max cached profiles

/**
 * Where cached profiles live.
 *
 * Resolved per call rather than once at module load, and overridable via
 * `GITPULSE_CACHE_DIR`. Baking `homedir()` into a module-level constant meant
 * the cache could only ever be exercised against the developer's real home
 * directory — which is how a test run once evicted a real cache.
 */
function cacheDir(): string {
  const override = process.env.GITPULSE_CACHE_DIR?.trim();
  return override ? override : join(homedir(), '.gitpulse', 'cache');
}

function ensureCacheDir(): void {
  const dir = cacheDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getCachePath(username: string): string {
  return join(cacheDir(), `${username.toLowerCase()}.json`);
}

/**
 * Get a cached profile if it exists and isn't expired
 */
export function getCached(username: string): UserProfile | null {
  try {
    const path = getCachePath(username);
    if (!existsSync(path)) return null;

    const raw = readFileSync(path, 'utf-8');
    const entry: CacheEntry = JSON.parse(raw);

    if (Date.now() - entry.cachedAt > entry.ttl) {
      // Expired
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Cache a user profile
 */
export function setCache(username: string, data: UserProfile): void {
  try {
    ensureCacheDir();
    evictOldEntries();

    const entry: CacheEntry = {
      data,
      cachedAt: Date.now(),
      ttl: DEFAULT_TTL,
    };

    writeFileSync(getCachePath(username), JSON.stringify(entry), 'utf-8');
  } catch {
    // Cache write failure is non-fatal
  }
}

/**
 * Clear the cache for a specific user or all users
 */
export function clearCache(username?: string): number {
  try {
    ensureCacheDir();

    if (username) {
      const path = getCachePath(username);
      if (existsSync(path)) {
        unlinkSync(path);
        return 1;
      }
      return 0;
    }

    const dir = cacheDir();
    const files = readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      unlinkSync(join(dir, file));
    }
    return files.length;
  } catch {
    return 0;
  }
}

/**
 * Evict oldest entries if cache is too large
 */
function evictOldEntries(): void {
  try {
    const dir = cacheDir();
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: join(dir, f),
        mtime: statSync(join(dir, f)).mtimeMs,
      }))
      .sort((a, b) => a.mtime - b.mtime);

    while (files.length >= MAX_CACHE_SIZE) {
      const oldest = files.shift();
      if (oldest) unlinkSync(oldest.path);
    }
  } catch {
    // Non-fatal
  }
}
