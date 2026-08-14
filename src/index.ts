#!/usr/bin/env node

import { createRequire } from 'module';
import { Command } from 'commander';
import ora from 'ora';
import { fetchUserProfile, buildProfile } from './api/github.js';
import { getCached, setCache, clearCache } from './api/cache.js';
import { CAPTURED_AT, DEMO_USER, DEMO_REPOS, DEMO_EVENTS } from './__fixtures__/demo-profile.js';
import { renderHeader, renderDivider } from './ui/header.js';
import { renderProfile, renderStats } from './ui/stats.js';
import { renderLanguages } from './ui/languages.js';
import { renderHeatmap, renderCommitPatterns } from './ui/heatmap.js';
import { renderTopRepos } from './ui/repos.js';
import { renderScore, renderStreak } from './ui/score.js';
import { renderComparison } from './ui/compare.js';
import { renderMinimal } from './ui/minimal.js';
import { generateThreeJSExport } from './ui/export.js';
import { amber, dim, primary, GLYPH } from './ui/theme.js';
import { resolveAnimation, paint, reveal, after, type AnimationContext } from './utils/anim.js';
import { timeAgo } from './utils/formatting.js';
import type { UserProfile } from './types/index.js';

const program = new Command();

/**
 * Read the version from package.json rather than repeating it here, so the
 * --version flag and the report footer cannot drift from the published package.
 */
function readVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    return (require('../package.json') as { version: string }).version;
  } catch {
    return 'unknown';
  }
}

const VERSION = readVersion();

program
  .name('gitpulse')
  .description('Generate beautiful developer profile report cards from GitHub')
  .version(VERSION)
  .argument('[username]', 'GitHub username to analyze')
  .option('-t, --token <token>', 'GitHub personal access token for higher rate limits')
  .option('-j, --json', 'Output raw JSON data')
  .option('-m, --minimal', 'Compact minimal output')
  .option('-e, --export', 'Export Three.js-compatible scene data as JSON')
  .option('-c, --compare <username>', 'Compare with another user')
  .option('--demo', 'Render a bundled fixture profile offline — no token, no network')
  .option('--no-anim', 'Print the report instantly, with no staging')
  .option('--no-cache', 'Bypass cache and fetch fresh data')
  .option('--clear-cache', 'Clear cached data')
  .action(async (username: string | undefined, options) => {
    try {
      // Handle clear-cache
      if (options.clearCache) {
        const count = clearCache(username);
        console.log(dim(`${GLYPH.prompt} cleared ${count} cached ${count === 1 ? 'profile' : 'profiles'}`));
        return;
      }

      // Demo mode short-circuits every network path.
      if (options.demo) {
        await renderDemo(options);
        return;
      }

      if (!username) {
        program.help();
        return;
      }

      // Fetch or load profile
      const profile = await loadProfile(username, options);

      // Compare mode
      if (options.compare) {
        const otherProfile = await loadProfile(options.compare, options);
        if (options.json) {
          console.log(JSON.stringify({ a: profile, b: otherProfile }, null, 2));
        } else {
          console.log(renderHeader());
          console.log(renderComparison(profile, otherProfile));
          console.log('\n' + renderDivider());
        }
        return;
      }

      // JSON output (clean, curated data — not raw API dump)
      if (options.json) {
        console.log(JSON.stringify(cleanJsonOutput(profile), null, 2));
        return;
      }

      // Three.js export
      if (options.export) {
        const sceneData = generateThreeJSExport(profile);
        console.log(JSON.stringify(sceneData, null, 2));
        return;
      }

      // Minimal output
      if (options.minimal) {
        console.log(renderMinimal(profile));
        return;
      }

      // Full report card
      await renderFullReport(profile, animationFor(options, profile));
    } catch (error) {
      if (error instanceof Error) {
        // Amber, not red. SIGNAL permits one accent, and amber is the warning
        // colour on the instrument panel this system is modelled on.
        console.error(`\n  ${amber(GLYPH.prompt)} ${error.message}\n`);
      } else {
        console.error(`\n  ${amber(GLYPH.prompt)} An unexpected error occurred\n`);
      }
      process.exit(1);
    }
  });

/**
 * Render the bundled fixture with zero network calls.
 *
 * The clock is pinned to the fixture's capture time, so the demo renders the way
 * it did on the day it was captured instead of decaying into an empty heatmap.
 */
async function renderDemo(options: CliOptions): Promise<void> {
  const profile = buildProfile(DEMO_USER, DEMO_REPOS, DEMO_EVENTS, new Date(CAPTURED_AT).getTime());

  if (options.json) {
    console.log(JSON.stringify(cleanJsonOutput(profile), null, 2));
    return;
  }

  if (options.export) {
    console.log(JSON.stringify(generateThreeJSExport(profile), null, 2));
    return;
  }

  if (options.minimal) {
    console.log(renderMinimal(profile));
    return;
  }

  await renderFullReport(profile, animationFor(options, profile));
  console.log(
    dim(
      `  ${GLYPH.prompt} demo — bundled fixture captured ${CAPTURED_AT.split('T')[0]}, rendered as of that date. Not live data.`
    )
  );
  console.log(dim(`  ${GLYPH.prompt} run ${primary(`gitpulse ${DEMO_USER.login}`)} for the live profile`));
  console.log('');
}

/** Commander shape. `--no-x` flags arrive as `x: false`, not `noX: true`. */
interface CliOptions {
  token?: string;
  json?: boolean;
  minimal?: boolean;
  export?: boolean;
  compare?: string;
  demo?: boolean;
  anim?: boolean;
  cache?: boolean;
}

/** Tracks whether the last load came from cache, so staging can be halved. */
let lastLoadWasCacheHit = false;

function animationFor(options: CliOptions, _profile: UserProfile): AnimationContext {
  return resolveAnimation({
    noAnim: options.anim === false,
    json: options.json,
    minimal: options.minimal,
    export: options.export,
    cacheHit: lastLoadWasCacheHit,
  });
}

async function loadProfile(username: string, options: CliOptions): Promise<UserProfile> {
  // Check cache first
  if (options.cache !== false) {
    const cached = getCached(username);
    if (cached) {
      lastLoadWasCacheHit = true;
      // A cache hit should feel fast, so this prints instantly and says so.
      console.log(
        dim(`${GLYPH.prompt} cached ${timeAgo(cached.fetchedAt)} — use --no-cache for live`)
      );
      return cached;
    }
  }

  lastLoadWasCacheHit = false;

  const spinner = ora({
    text: dim(`${GLYPH.prompt} scanning ${primary(`@${username}`)}...`),
    // MOTION.md specifies these frames for the branded fetch state.
    spinner: { interval: 80, frames: ['⠋', '⠙', '⠸', '⠴', '⠦', '⠇'] },
  }).start();

  try {
    const profile = await fetchUserProfile(username, { token: options.token });
    spinner.succeed(dim(`loaded ${primary(`@${username}`)}`));

    // Cache the result
    setCache(username, profile);

    return profile;
  } catch (error) {
    spinner.fail(amber(`could not load @${username}`));
    throw error;
  }
}

/**
 * The render sequence from MOTION.md.
 *
 * Total staging budget is 2.5s after data arrives, halved on a cache hit. Every
 * timing below is the spec's; the only judgement here is how they compose.
 *
 * When staging is disabled every call collapses to a plain write, which is why
 * the animated and static paths cannot diverge.
 */
async function renderFullReport(profile: UserProfile, ctx: AnimationContext): Promise<void> {
  // The wordmark prints instantly and complete. Never animate the logo.
  process.stdout.write(renderHeader() + '\n');

  await after(ctx, 120, renderProfile(profile) + '\n');

  // Stat values count 0 -> final, right-aligned so widths never shift.
  await paint(ctx, p => renderStats(profile, p), 320);
  process.stdout.write('\n');

  // Bars fill left to right, each starting after the one above it.
  await paint(ctx, p => renderLanguages(profile.languages, p), 320);
  process.stdout.write('\n');

  await reveal(ctx, renderTopRepos(profile.repos, Date.parse(profile.fetchedAt)), 8);
  process.stdout.write('\n');

  // Paints column by column, oldest week to newest — it reads as a replay.
  // MOTION.md specifies ~12ms per column, so the duration scales with the
  // window; a capped ceiling keeps a 52-column year inside the total budget.
  const columns = Math.ceil(profile.contributions.length / 7);
  await paint(
    ctx,
    p => renderHeatmap(profile.contributions, profile.contributionWindow, p),
    Math.min(560, columns * 12),
    12
  );
  process.stdout.write('\n');

  await reveal(ctx, renderCommitPatterns(profile.commitPattern), 14);
  process.stdout.write('\n');

  await after(ctx, 80, renderStreak(profile.streak, profile.contributionWindow) + '\n');

  // The meter fills, then a 150ms beat, then the grade letter lands. It is the
  // punchline of the whole report and it arrives last.
  await paint(ctx, p => renderScore(profile.score, p), 380, 40, 140);

  process.stdout.write('\n' + renderDivider() + '\n');
  process.stdout.write(
    dim(`  ${primary('gitpulse')} v${VERSION}  ${GLYPH.divider}  github.com/br9704/gitpulse`) + '\n'
  );
  process.stdout.write('\n');
}

/**
 * Produce a clean, curated JSON output — strips raw API noise
 */
function cleanJsonOutput(profile: UserProfile) {
  return {
    user: {
      login: profile.user.login,
      name: profile.user.name,
      bio: profile.user.bio,
      avatar_url: profile.user.avatar_url,
      url: profile.user.html_url,
      location: profile.user.location,
      company: profile.user.company,
      blog: profile.user.blog,
      twitter: profile.user.twitter_username,
      public_repos: profile.user.public_repos,
      public_gists: profile.user.public_gists,
      followers: profile.user.followers,
      following: profile.user.following,
      created_at: profile.user.created_at,
    },
    repos: profile.repos.map(r => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      fork: r.fork,
      topics: r.topics,
      pushed_at: r.pushed_at,
      license: r.license?.spdx_id ?? null,
    })),
    languages: profile.languages,
    commitPattern: profile.commitPattern,
    contributions: {
      // Named and scoped to match what the terminal output claims.
      source: 'github-public-events',
      countedEventTypes: ['PushEvent', 'PullRequestEvent', 'CreateEvent:branch'],
      window: profile.contributionWindow,
      total: profile.contributionWindow.eventCount,
      activeDays: profile.contributionWindow.activeDays,
      days: profile.contributions.filter(d => d.count > 0),
    },
    streak: profile.streak,
    score: profile.score,
    totalStars: profile.totalStars,
    totalForks: profile.totalForks,
    fetchedAt: profile.fetchedAt,
  };
}

program.parse();
