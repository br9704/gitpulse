<div align="center">

# gitpulse

**A GitHub profile, rendered as a report card in your terminal.**

<img src="assets/demo.svg" alt="gitpulse rendering a developer report card in the terminal: wordmark, profile, statistics, language bars, ranked repositories, a code-activity heatmap, commit patterns, streak, and a hire-ability score" width="800">

<sub>Recorded from <code>gitpulse --demo</code> — a real capture of the staged render, not a mock-up.</sub>

[Install](#install) · [Usage](#usage) · [Scoring](SCORING.md) · [How it works](#how-it-works) · [Alternatives](#alternatives)

</div>

---

## Try it in one command

```bash
npx gitpulse --demo
```

Renders a bundled snapshot of a real profile — offline, no token, no rate limit, no configuration.

> `npx` asks for confirmation the first time it downloads a package. That prompt is npm, not a hang.

## Install

```bash
npm install -g gitpulse
# or run it directly
npx gitpulse torvalds
```

Requires **Node 20 or newer**.

## Set a token — you will want one

GitHub allows **60 unauthenticated requests per hour, per IP**, and that budget is usually already
spent by something else on your machine. A token raises it to 5,000/hour.

**No scopes are required** for public profile data. Create the token with every box unchecked.

```bash
# 1. Create a token (no scopes needed):
#    https://github.com/settings/tokens/new?description=gitpulse&scopes=

# 2. Persist it — gitpulse reads GITHUB_TOKEN and GH_TOKEN automatically
echo 'export GITHUB_TOKEN=ghp_xxxxxxxx' >> ~/.zshrc && source ~/.zshrc

# 3. Or pass it per run
gitpulse torvalds --token ghp_xxxxxxxx
```

Already using the [GitHub CLI](https://cli.github.com)? `export GITHUB_TOKEN=$(gh auth token)`.

If you hit the limit without a token, gitpulse prints these steps rather than a bare error.

## Usage

```bash
gitpulse <username>                        # full report card
gitpulse <username> --minimal              # four compact lines
gitpulse <username> --compare <other>      # head to head
gitpulse <username> --json                 # curated JSON, not a raw API dump
gitpulse <username> --export               # Three.js scene graph
gitpulse --demo                            # bundled fixture, offline
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--token <token>` | `-t` | GitHub personal access token |
| `--json` | `-j` | Curated JSON output |
| `--minimal` | `-m` | Compact output |
| `--export` | `-e` | Three.js scene data |
| `--compare <user>` | `-c` | Compare with another user |
| `--demo` | | Bundled fixture, offline — no token, no network |
| `--no-anim` | | Print instantly, with no staged reveal |
| `--no-cache` | | Bypass the cache and fetch fresh |
| `--clear-cache` | | Clear cached profiles |

### Environment

| Variable | Effect |
|---|---|
| `GITHUB_TOKEN` / `GH_TOKEN` | Token used when `--token` is not passed |
| `GITPULSE_CACHE_DIR` | Cache location (default `~/.gitpulse/cache`) |
| `NO_COLOR` | Disable all colour and staging |
| `CI` | Disable staging and spinners |

Output is plain and instant whenever it is piped, redirected, or run in CI. Scripts get clean text;
`--no-anim` produces byte-identical output to the staged render.

## What it shows

- **Profile and statistics** — repos, stars, forks, followers, gists
- **Languages** — share of repositories by primary language
- **Top repositories** — ranked by stars×3 + forks×2 + watchers
- **Code activity** — a heatmap of push, pull-request and branch-creation events
- **Commit patterns** — by day and hour, with a computed peak
- **Coding streak** — current and longest, within the measured window
- **Hire-ability score** — 0–100 across five components, [fully documented](SCORING.md)
- **Compare mode** and a **Three.js scene export**

## How it works

Three requests to GitHub's public REST API — the user, up to 200 repositories, and up to 300 public
events — then everything else is computed locally. No scraping, no GraphQL, no telemetry. Results
are cached for 30 minutes.

### What the numbers can and cannot tell you

gitpulse is careful about this, because a confident number is easy to print and hard to justify.

- **Activity comes from the public Events API**, which returns at most 300 events and reaches back a
  limited period — often far less than 90 days for a busy account. gitpulse prints the window it
  actually measured (`last 30 days of public code events`) rather than assuming a fixed 90. Activity
  older than that window is *invisible to the tool*, not absent from your life.
- **Streaks are bounded by that same window**, and the output says so next to the number.
- **"Languages" counts repositories, not lines of code.** Each non-fork repo contributes 1 to its
  primary language.
- **The score never reads any code**, and it cannot see private work. [SCORING.md](SCORING.md)
  documents every input, every weight, and what the score does not measure. Worth knowing before you
  read anything into it: Linus Torvalds scores 78.

## Alternatives

Honest comparison — these are all good, and they do different things:

| Tool | What it does | Versus gitpulse |
|---|---|---|
| [`github-stats`](https://www.npmjs.com/package/github-stats) | User and repo stats in the terminal | Broader data, plainer output |
| [`git-stats`](https://github.com/IonicaBizau/git-stats) | Contribution calendar from **local** git history | Local commits, all of them — no API limits, but only your machine |
| [`ghcal`](https://www.npmjs.com/package/ghcal) | Just the contribution calendar | Smaller and sharper if the calendar is all you want |
| [`github-readme-stats`](https://github.com/anuraghazra/github-readme-stats) | SVG cards for a profile README | Renders to the web, not a terminal |
| **gitpulse** | A composed report card: stats, languages, heatmap, patterns, score | One screen, designed, with its methodology written down |

If you want a true contribution calendar including private and squashed work, `git-stats` against a
local clone will beat anything built on the public Events API — including this.

## Development

```bash
git clone https://github.com/br9704/gitpulse.git
cd gitpulse
npm install
npm run build
npm test           # 121 tests
npm run lint
npm run typecheck

node dist/index.js --demo
npm run demo:record   # regenerate assets/demo.svg from a real run
```

**Three runtime dependencies** — `chalk`, `commander`, `ora`. No postinstall scripts, so `npx`
works under npm v12's lifecycle-script defaults. TypeScript strict, ESM.

## License

[MIT](LICENSE) — Bruno Jaamaa
