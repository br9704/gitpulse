import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { UserProfile, CacheEntry } from '../types/index.js';

const CACHE_DIR = join(homedir(), '.gitpulse', 'cache');
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 50; // max cached profiles

function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCachePath(username: string): string {
  return join(CACHE_DIR, `${username.toLowerCase()}.json`);
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

    const files = readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      unlinkSync(join(CACHE_DIR, file));
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
    const files = readdirSync(CACHE_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: join(CACHE_DIR, f),
        mtime: statSync(join(CACHE_DIR, f)).mtimeMs,
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
