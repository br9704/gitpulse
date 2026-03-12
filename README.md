# ⚡ GitPulse

> Generate beautiful developer profile report cards in the terminal from GitHub profiles.

![MIT License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Quick Start

```bash
npx gitpulse <username>
```

## Features

- 📊 **Full Stats** — repos, stars, forks, followers, gists
- 💻 **Language Breakdown** — colored bar charts with GitHub language colors
- 🔥 **Contribution Heatmap** — 90-day activity grid using block characters
- ⏰ **Commit Patterns** — discover when they code most (day & hour analysis)
- 🎯 **Hire-ability Score** — algorithmic scoring with letter grades (A+ to F)
- ⭐ **Top Repos** — ranked by stars and impact
- 🔥 **Streak Detection** — current and longest coding streaks
- ⚖️ **Compare Mode** — side-by-side developer comparison
- 📦 **JSON Output** — machine-readable data for pipelines
- 🎨 **Three.js Export** — scene data for 3D visualizations
- 💾 **Local Cache** — fast repeat lookups with 30-min TTL

## Installation

```bash
# Run directly (no install)
npx gitpulse torvalds

# Or install globally
npm install -g gitpulse
gitpulse torvalds
```

## Usage

### Scan a Profile

```bash
gitpulse br9704
```

```
 ██████╗ ██╗████████╗██████╗ ██╗   ██╗██╗     ███████╗███████╗
██╔════╝ ██║╚══██╔══╝██╔══██╗██║   ██║██║     ██╔════╝██╔════╝
██║  ███╗██║   ██║   ██████╔╝██║   ██║██║     ███████╗█████╗
██║   ██║██║   ██║   ██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝
╚██████╔╝██║   ██║   ██║     ╚██████╔╝███████╗███████║███████╗
 ╚═════╝ ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝
  ⚡ Developer Profile Report Card ⚡

👤 Profile
────────────────────────────────────────────────────────────────
  John Doe (@johndoe)
  Full-stack developer & open source enthusiast
  📍 Melbourne, AU  │  🔗 johndoe.dev

📊 Statistics
────────────────────────────────────────────────────────────────
  ■ Repositories: 42 (38 original)    ■ Stars Earned: 1.2K
  ■ Forks Earned: 156                 ■ Followers: 890

💻 Languages
────────────────────────────────────────────────────────────────
  TypeScript       ██████████████████████████████  35.2% (15 repos)
  Python           ████████████████░░░░░░░░░░░░░░  22.1% (9 repos)
  Rust             ████████░░░░░░░░░░░░░░░░░░░░░░  12.4% (5 repos)

🎯 Hire-ability Score
────────────────────────────────────────────────────────────────
  ╔═╗ ╔═╗
  ║ ║ ╔═╝
  ╚═╝ ╚══

  Grade: B+

  Repo Quality         █████████████░░ 18/25
  Consistency          ████████████░░░ 14/20
  Language Diversity   ████████████░░░ 11/15
  README Quality       ██████████░░░░░ 10/15
  Recent Activity      ████████████████ 19/25
```

### Compare Two Developers

```bash
gitpulse user1 --compare user2
```

### Minimal Output

```bash
gitpulse br9704 --minimal
```

```
⚡ Bruno (@br9704)
📦 42 repos │ ⭐ 1.2K stars │ ⑂ 156 forks │ 👥 890 followers
💻 TypeScript, Python, Rust, Go, Swift
🎯 Score: 72 (B+)  🔥 Streak: 14d (best: 45d)
```

### JSON Output

```bash
gitpulse br9704 --json
```

### Three.js Export

```bash
gitpulse br9704 --export > scene.json
```

Generates JSON with node positions, colors, and sizes based on repo stats — ready to feed into a Three.js scene.

### With GitHub Token

For higher API rate limits (60 → 5000 requests/hour):

```bash
gitpulse br9704 --token ghp_xxxxxxxxxxxx
```

### Cache Management

```bash
# Bypass cache
gitpulse br9704 --no-cache

# Clear all cached data
gitpulse --clear-cache

# Clear specific user cache
gitpulse username --clear-cache
```

## Hire-ability Score

The hire-ability score (0-100) is calculated from five categories:

| Category | Max Points | What It Measures |
|----------|-----------|-----------------|
| Repo Quality | 25 | Stars, forks, descriptions, topics, licenses |
| Consistency | 20 | Coding streaks, commit regularity |
| Language Diversity | 15 | Number of languages, balance of usage |
| README Quality | 15 | Descriptions, documentation, project substance |
| Recent Activity | 25 | Recent pushes, repo updates, event variety |

### Grade Scale

| Grade | Score Range |
|-------|-----------|
| A+ | 95-100 |
| A | 88-94 |
| A- | 82-87 |
| B+ | 76-81 |
| B | 70-75 |
| B- | 64-69 |
| C+ | 56-63 |
| C | 48-55 |
| C- | 40-47 |
| D | 30-39 |
| F | 0-29 |

## API & Rate Limits

GitPulse uses the GitHub REST API for public data. Without authentication:
- **60 requests/hour** per IP
- Sufficient for ~10 profile scans per hour

With a personal access token (`--token`):
- **5,000 requests/hour**
- No special scopes needed — public data only

## Tech Stack

- **TypeScript** — type-safe codebase
- **chalk** — terminal colors
- **boxen** — boxed output
- **commander** — CLI argument parsing
- **ora** — loading spinners
- **vitest** — testing

## Development

```bash
git clone https://github.com/br9704/gitpulse.git
cd gitpulse
npm install
npm run build
npm test

# Run locally
node dist/index.js <username>
```

## License

MIT © Bruno Jaamaa
