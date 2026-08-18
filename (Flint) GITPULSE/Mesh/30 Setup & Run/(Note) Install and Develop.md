---
id: 7bb6d7f9-a0ea-4038-99d7-e2a10d96b6f0
title: "Install and Develop"
type: note
project: "GitPulse"
tags:
  - "#note"
  - "#project"
  - "#ld/living"
  - "#stack/typescript"
  - "#status/shipped"
  - "#cluster/personal"
status: shipped
source_path: "/Users/brunojaamaa/Desktop/gitpulse/package.json"
created: "2026-08-17"
updated: "2026-08-17"
---

# Install and Develop

## Install

```bash
npm install -g @aethereumdev/gitpulse
gitpulse torvalds

# or run it without installing
npx @aethereumdev/gitpulse torvalds
```

⚠️ **The package is scoped; the command is not.** Once installed the binary is plain
`gitpulse`.

**Requires Node 20 or newer.** `npx` asks for confirmation the first time it downloads a
package — that prompt is npm, not a hang.

## The token, and why you want one

GitHub allows **60 unauthenticated requests per hour, per IP**, and that budget is usually
already spent by something else on your machine. A token raises it to **5,000/hour**.

⚠️ **No scopes are required** for public profile data. Create the token with every box
unchecked.

```bash
# gitpulse reads GITHUB_TOKEN and GH_TOKEN automatically
export GITHUB_TOKEN=<token>

# or per run
gitpulse torvalds --token <token>

# already using the GitHub CLI?
export GITHUB_TOKEN=$(gh auth token)
```

> **Names only in this vault.** No token value is recorded anywhere here, and `.env*` is
> never opened.

If you hit the limit without a token, **GitPulse prints these steps rather than a bare
error**. That was the priority-one fix from the audit.

## No setup at all

```bash
gitpulse --demo
```

Renders the whole report from a bundled fixture — **no token, no network**. CI asserts it
makes **zero** network calls by stubbing `fetch` to throw.

## Environment

| Variable | Effect |
|---|---|
| `GITHUB_TOKEN` / `GH_TOKEN` | Token used when `--token` is not passed |
| `GITPULSE_CACHE_DIR` | Cache location, default `~/.gitpulse/cache` |
| `NO_COLOR` | Disable all colour **and** staging |
| `CI` | Disable staging and spinners |

Output is plain and instant whenever it is piped, redirected, or run in CI. **Scripts get
clean text without asking for it.**

## Development

```bash
git clone https://github.com/br9704/gitpulse.git
cd gitpulse
npm install
npm run build
npm test
npm run lint
npm run typecheck

node dist/index.js --demo
npm run demo:record   # regenerate assets/demo.svg from a real run
```

⚠️ **The branch is `master`.** Not `main`.

## The scripts

| Command | Does |
|---|---|
| `npm run build` | `tsc` → `dist/` |
| `npm run typecheck` | ⚠️ `tsc -p tsconfig.test.json` — checks `src/` **and** the tests. The build config excludes tests, so `tsc` alone would not see them |
| `npm run dev` | `ts-node src/index.ts` |
| `npm test` | Vitest, **122** tests |
| `npm run lint` | ESLint over `src/` |
| `npm run demo:record` | build, then regenerate `assets/demo.svg` from a real timed run |
| `npm run prepublishOnly` | ⚠️ builds. **The only lifecycle script**, and it runs at publish time on the author's machine |

**Nothing runs on install**, so `npx` is unaffected by npm v12 turning dependency lifecycle
scripts off by default. That is a deliberate property, and the README counts it as a metric.

## Local cache

`~/.gitpulse/cache` — 30-minute TTL, evicting at 50 profiles. `--no-cache` bypasses,
`--clear-cache` clears.
