export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  hireable: boolean | null;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  topics: string[];
  has_wiki: boolean;
  has_pages: boolean;
  license: { spdx_id: string; name: string } | null;
}

export interface GitHubEvent {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: Array<{ message: string; sha: string }>;
    action?: string;
    ref?: string;
    ref_type?: string;
    size?: number;
  };
}

export interface LanguageBreakdown {
  [language: string]: number;
}

export interface CommitPattern {
  byDay: number[];   // 0=Sun, 6=Sat
  byHour: number[];  // 0-23
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4
}

export interface CodingStreak {
  current: number;
  longest: number;
  lastActive: string | null;
}

export interface HireabilityScore {
  total: number;         // 0-100
  grade: string;         // A+, A, B+, B, B-, C+, C, D, F
  breakdown: {
    repoQuality: number;       // 0-25
    consistency: number;       // 0-20
    languageDiversity: number; // 0-15
    readmeQuality: number;     // 0-15
    recentActivity: number;    // 0-25
  };
}

export interface UserProfile {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  languages: LanguageBreakdown;
  commitPattern: CommitPattern;
  contributions: ContributionDay[];
  streak: CodingStreak;
  score: HireabilityScore;
  totalStars: number;
  totalForks: number;
  fetchedAt: string;
}

export interface CLIOptions {
  token?: string;
  json?: boolean;
  minimal?: boolean;
  compare?: boolean;
  export?: boolean;
}

export interface ThreeJSExport {
  metadata: {
    generator: string;
    version: string;
    username: string;
    generatedAt: string;
  };
  scene: {
    nodes: ThreeJSNode[];
    connections: ThreeJSConnection[];
  };
}

export interface ThreeJSNode {
  id: string;
  type: 'repo' | 'language' | 'user';
  position: { x: number; y: number; z: number };
  color: string;
  size: number;
  label: string;
  metadata: Record<string, unknown>;
}

export interface ThreeJSConnection {
  source: string;
  target: string;
  weight: number;
}

export interface CacheEntry {
  data: UserProfile;
  cachedAt: number;
  ttl: number;
}
