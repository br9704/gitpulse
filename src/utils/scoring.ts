import type { GitHubRepo, GitHubEvent, LanguageBreakdown, HireabilityScore, CodingStreak, ContributionDay, ContributionWindow, CommitPattern } from '../types/index.js';

/**
 * Calculate the hire-ability score for a developer
 */
export function calculateScore(
  repos: GitHubRepo[],
  events: GitHubEvent[],
  languages: LanguageBreakdown,
  streak: CodingStreak,
  now: number = Date.now(),
): HireabilityScore {
  const repoQuality = calcRepoQuality(repos);
  const consistency = calcConsistency(events, streak, now);
  const languageDiversity = calcLanguageDiversity(languages);
  const readmeQuality = calcReadmeQuality(repos);
  const recentActivity = calcRecentActivity(repos, events, now);

  const total = Math.round(repoQuality + consistency + languageDiversity + readmeQuality + recentActivity);
  const grade = scoreToGrade(total);

  return {
    total,
    grade,
    breakdown: {
      repoQuality: Math.round(repoQuality * 10) / 10,
      consistency: Math.round(consistency * 10) / 10,
      languageDiversity: Math.round(languageDiversity * 10) / 10,
      readmeQuality: Math.round(readmeQuality * 10) / 10,
      recentActivity: Math.round(recentActivity * 10) / 10,
    },
  };
}

/**
 * Repo Quality (0-25): stars, forks, descriptions, topics, licenses
 */
function calcRepoQuality(repos: GitHubRepo[]): number {
  if (repos.length === 0) return 0;

  const nonForks = repos.filter(r => !r.fork);
  if (nonForks.length === 0) return 2;

  let score = 0;

  // Stars (0-8)
  const totalStars = nonForks.reduce((s, r) => s + r.stargazers_count, 0);
  score += Math.min(8, Math.log2(totalStars + 1) * 1.5);

  // Forks received (0-4)
  const totalForks = nonForks.reduce((s, r) => s + r.forks_count, 0);
  score += Math.min(4, Math.log2(totalForks + 1) * 1.2);

  // Descriptions present (0-4)
  const withDesc = nonForks.filter(r => r.description && r.description.length > 10).length;
  score += Math.min(4, (withDesc / nonForks.length) * 4);

  // Topics usage (0-4)
  const withTopics = nonForks.filter(r => r.topics && r.topics.length > 0).length;
  score += Math.min(4, (withTopics / nonForks.length) * 4);

  // Licenses (0-5)
  const withLicense = nonForks.filter(r => r.license).length;
  score += Math.min(5, (withLicense / nonForks.length) * 5);

  return Math.min(25, score);
}

/**
 * Consistency (0-20): coding streak, regular commits
 */
function calcConsistency(events: GitHubEvent[], streak: CodingStreak, now: number): number {
  let score = 0;

  // Current streak (0-8)
  score += Math.min(8, streak.current * 0.5);

  // Longest streak (0-6)
  score += Math.min(6, streak.longest * 0.3);

  // Event frequency - events in last 90 days (0-6)
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter(e => new Date(e.created_at).getTime() > ninetyDaysAgo).length;
  score += Math.min(6, recentEvents * 0.1);

  return Math.min(20, score);
}

/**
 * Language Diversity (0-15): variety and balance
 */
function calcLanguageDiversity(languages: LanguageBreakdown): number {
  const langs = Object.keys(languages);
  if (langs.length === 0) return 0;

  let score = 0;

  // Number of languages (0-8)
  score += Math.min(8, langs.length * 1.2);

  // Balance - Shannon entropy (0-7)
  const total = Object.values(languages).reduce((s, v) => s + v, 0);
  if (total > 0) {
    let entropy = 0;
    for (const count of Object.values(languages)) {
      const p = count / total;
      if (p > 0) entropy -= p * Math.log2(p);
    }
    const maxEntropy = Math.log2(langs.length) || 1;
    score += (entropy / maxEntropy) * 7;
  }

  return Math.min(15, score);
}

/**
 * README Quality (0-15): proxied by repo descriptions, wiki, and pages
 */
function calcReadmeQuality(repos: GitHubRepo[]): number {
  if (repos.length === 0) return 0;

  const nonForks = repos.filter(r => !r.fork);
  if (nonForks.length === 0) return 2;

  let score = 0;

  // Good descriptions (0-6)
  const goodDescs = nonForks.filter(r => r.description && r.description.length > 20).length;
  score += Math.min(6, (goodDescs / nonForks.length) * 6);

  // Has pages (0-3)
  const withPages = nonForks.filter(r => r.has_pages).length;
  score += Math.min(3, withPages * 1.5);

  // Has wiki (0-3)
  const withWiki = nonForks.filter(r => r.has_wiki).length;
  score += Math.min(3, (withWiki / nonForks.length) * 3);

  // Repo size > reasonable (implies actual code, not just README) (0-3)
  const substantialRepos = nonForks.filter(r => r.size > 50).length;
  score += Math.min(3, (substantialRepos / nonForks.length) * 3);

  return Math.min(15, score);
}

/**
 * Recent Activity (0-25): pushes, commits, updates in last 90 days
 */
function calcRecentActivity(repos: GitHubRepo[], events: GitHubEvent[], now: number): number {
  let score = 0;

  // Recent pushes (0-10)
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

  const pushEvents = events.filter(e => e.type === 'PushEvent');
  const recentPushes = pushEvents.filter(e => new Date(e.created_at).getTime() > thirtyDaysAgo).length;
  score += Math.min(10, recentPushes * 0.8);

  // Recently updated repos (0-8)
  const recentlyUpdated = repos.filter(r => new Date(r.pushed_at).getTime() > ninetyDaysAgo).length;
  score += Math.min(8, recentlyUpdated * 0.8);

  // Variety of event types (0-7)
  const recentEventTypes = new Set(
    events.filter(e => new Date(e.created_at).getTime() > ninetyDaysAgo).map(e => e.type)
  );
  score += Math.min(7, recentEventTypes.size * 1.5);

  return Math.min(25, score);
}

/**
 * Convert numeric score to letter grade
 */
export function scoreToGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 82) return 'A-';
  if (score >= 76) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 64) return 'B-';
  if (score >= 56) return 'C+';
  if (score >= 48) return 'C';
  if (score >= 40) return 'C-';
  if (score >= 30) return 'D';
  return 'F';
}

/**
 * Calculate language breakdown from repos
 */
export function calculateLanguages(repos: GitHubRepo[]): LanguageBreakdown {
  const languages: LanguageBreakdown = {};
  for (const repo of repos) {
    if (repo.language && !repo.fork) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  }
  return languages;
}

/**
 * Analyze commit patterns from events
 */
export function analyzeCommitPattern(events: GitHubEvent[]): CommitPattern {
  const byDay = new Array(7).fill(0);
  const byHour = new Array(24).fill(0);

  for (const event of events) {
    if (event.type === 'PushEvent') {
      const date = new Date(event.created_at);
      byDay[date.getUTCDay()]++;
      byHour[date.getUTCHours()]++;
    }
  }

  return { byDay, byHour };
}

/**
 * The GitHub public Events API returns at most 300 events. Hitting that ceiling
 * means earlier activity exists but is invisible to us, which changes how the
 * window may honestly be labelled.
 */
const EVENTS_API_CAP = 300;

/** The longest span the public Events API retains, in days. */
const EVENTS_API_RETENTION_DAYS = 90;

/**
 * Event types that represent someone actually writing code.
 *
 * Starring, watching, forking and commenting are all public events, but calling
 * them "contributions" inflates the number into something the label cannot
 * defend. Only authoring events count here.
 */
function isCodeEvent(event: GitHubEvent): boolean {
  switch (event.type) {
    case 'PushEvent':
    case 'PullRequestEvent':
      return true;
    case 'CreateEvent':
      // Branch creation is authoring; repo and tag creation are not.
      return event.payload?.ref_type === 'branch';
    default:
      return false;
  }
}

function toISODate(value: string | number): string {
  return new Date(value).toISOString().split('T')[0];
}

/** Whole days between two ISO dates, inclusive of both ends. */
function inclusiveDaySpan(fromISO: string, toISO: string): number {
  const ms = new Date(`${toISO}T00:00:00Z`).getTime() - new Date(`${fromISO}T00:00:00Z`).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/**
 * Build the daily activity series from public events, along with an honest
 * description of what that series actually covers.
 *
 * The old implementation always emitted exactly 90 days and counted every event
 * type, so a profile whose events only spanned a month still rendered under a
 * "Last 90 days" header. The window is now derived from the data.
 */
export function generateContributions(
  events: GitHubEvent[],
  now: number = Date.now(),
): { days: ContributionDay[]; window: ContributionWindow } {
  const codeEvents = events.filter(isCodeEvent);
  const today = toISODate(now);

  const dayMap = new Map<string, number>();
  for (const event of codeEvents) {
    const date = toISODate(event.created_at);
    dayMap.set(date, (dayMap.get(date) || 0) + 1);
  }

  // Our visibility ends at the oldest event the feed handed us — of ANY type,
  // since that is what bounds the feed, not what bounds authoring.
  //
  // It is tempting to always render 90 days because that is GitHub's nominal
  // retention. Doing so paints every day the feed does not reach as a day with
  // no activity, which is a claim the data cannot support: torvalds' feed stops
  // after 34 days, and the 56 blank days before it were pure fabrication.
  const oldestEvent = events.length
    ? events.map(e => toISODate(e.created_at)).sort()[0]
    : null;

  const eventsTruncated = events.length >= EVENTS_API_CAP;
  const from = oldestEvent ?? toISODate(now - (EVENTS_API_RETENTION_DAYS - 1) * 86_400_000);
  const spanDays = oldestEvent ? inclusiveDaySpan(from, today) : 0;

  const days: ContributionDay[] = [];
  for (let i = spanDays - 1; i >= 0; i--) {
    const dateStr = toISODate(now - i * 86_400_000);
    const count = dayMap.get(dateStr) || 0;
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
    days.push({ date: dateStr, count, level });
  }

  return {
    days,
    window: {
      from,
      to: today,
      spanDays,
      eventCount: codeEvents.length,
      activeDays: days.filter(d => d.count > 0).length,
      eventsTruncated,
    },
  };
}

/**
 * Detect coding streaks from contributions
 */
export function detectStreak(contributions: ContributionDay[]): CodingStreak {
  let current = 0;
  let longest = 0;
  let tempStreak = 0;
  let lastActive: string | null = null;

  // Find current streak (from most recent backwards)
  for (let i = contributions.length - 1; i >= 0; i--) {
    if (contributions[i].count > 0) {
      if (current === 0) lastActive = contributions[i].date;
      current++;
    } else {
      break;
    }
  }

  // Find longest streak
  for (const day of contributions) {
    if (day.count > 0) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { current, longest, lastActive };
}
