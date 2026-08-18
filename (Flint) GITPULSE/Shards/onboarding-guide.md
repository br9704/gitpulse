---
id: 09f55989-1339-40da-aa9e-f0d966398af5
title: "Onboarding guide"
type: note
project: "GitPulse"
tags:
  - "#note"
  - "#shard"
  - "#ld/living"
  - "#cluster/personal"
status: active
created: "2026-08-17"
updated: "2026-08-17"
---

# Shard — onboarding-guide

**A from-cold walkthrough for a person or agent who has never seen this project.**

## Try it before reading anything

```bash
npx @aethereumdev/gitpulse torvalds
```

Ninety seconds, no install, no token, no clone. That is the whole product.

## Then the one idea it is built on

> **When the label and the data would disagree, the label changes, not the data.**

GitHub's public Events API returns at most **300** events over a **variable** span. Most tools
print a fixed `Last 90 days:` header over whatever they got. GitPulse derives the window from
the oldest event actually returned and prints it beside the number. Everything interesting
here follows from that.

## The path, in order

1. [[(Report) Project Summary]] — what it is, whether it works, what is risky.
2. [[(Note) What GitPulse Is]] — the product.
3. [[(Note) Windows and Labelling]] — the founding principle, and the bug inside its own fix.
4. [[(Note) The Pipeline]] — the two structural decisions.
5. [[(Note) The Scoring Model]] — ⚠️ read before quoting anyone's score.
6. [[(Note) Install and Develop]] — the development loop.
7. [[(Note) Honest State]] — what is not true about it.

## Clone and run

```bash
git clone https://github.com/br9704/gitpulse.git
cd gitpulse && npm install
npm run lint && npm run typecheck && npm run build && npm test
node dist/index.js --demo
```

⚠️ **The branch is `master`.** ⚠️ **Requires Node 20+.**

## The five things that surprise people

1. **45% of the score describes a partial window.** Consistency (20) and Recent Activity (25)
   both read the Events API.
2. ⚠️ **The star sub-item caps at 40 stars.** A 250,000-star repository scores identically to
   a 40-star one. The first draft of `SCORING.md` claimed ~215; writing the doc found the
   real number.
3. **`--demo` cannot drift from the product**, because `buildProfile()` is split out from
   `fetchUserProfile()` — the demo *is* the output with the fetches replaced.
4. **`progress === 1` returns exactly the static string.** The animation cannot diverge from
   the real output, because the last frame **is** the real output.
5. ⚠️ **The npm package is scoped** — `@aethereumdev/gitpulse` — because the unscoped name is
   not claimable. The binary is still plain `gitpulse`.

## Before writing any code

Read `masterplan.md` (**933** lines) — every sprint's acceptance gate, as-shipped delta and
deferral, plus the scoping decision. And `SCORING.md` (**180**) before touching the score.
`masterplan > CLAUDE.md > memory`.

⚠️ **Never run `npm publish`.** The package is live on the public registry.
