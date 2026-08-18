---
id: e2e90f2f-c61d-433d-8346-a5b731b7b01e
title: "What GitPulse Is"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/README.md"
created: "2026-08-17"
updated: "2026-08-17"
---

# What GitPulse Is

**A GitHub profile, rendered as a report card in your terminal — where every number says
which window it was measured over.**

GitHub's own profile page is a scroll. It gives you a follower count and a green calendar and
leaves you to assemble everything else across a dozen tabs. GitPulse renders the same public
data as **one screen**: profile, statistics, language share, ranked repositories, a
code-activity heatmap, commit patterns by day and hour, coding streaks, and a **0–100 score**
with a letter grade.

It reads **three public REST endpoints** — the user, their repositories, their public events
— and computes everything else locally. **No scraping, no GraphQL, no telemetry, no
account.** Results cache for **30 minutes** under `~/.gitpulse/cache`, evicting at **50**
profiles.

## What actually makes it different

Not the rendering. **The labelling.**

GitHub's public Events API returns at most **300** events and reaches back a limited and
*variable* period — often far less than 90 days for a busy account. Most tools built on it
print a fixed `Last 90 days:` header over whatever they got.

GitPulse derives the window from **the oldest event the feed actually returned** and prints
that window next to the number:

```
last 30 days of public code events  2026-07-16 → 2026-08-14
```

A streak carries `measured within the 30-day event window above, not all-time`.

> **When the label and the data would disagree, the label changes, not the data.**

That one line is the whole tool. Everything else follows from it. See
[[(Note) Windows and Labelling]].

## The output is the product

So the output is what is tested and what CI enforces. **Committed snapshots pin what every
renderer emits, byte for byte.**

The report is **staged** rather than dumped: sections arrive in reading order over **≤2.5 s**,
stat values count up without shifting column widths, the heatmap paints column by column, and
the grade letter lands last after a beat.

⚠️ `--no-anim` produces **byte-identical** output to the staged path, and staging turns itself
off automatically whenever output is piped, redirected, or run under `CI` or `NO_COLOR`.
Scripts get clean text.

## The score, with its caveat attached

Five weighted components, 0–100, letter-graded. It reads **public metadata only** — it never
opens a line of anyone's code, and it cannot see private work.

`SCORING.md` documents every input, every weight, and — **before any of the formulas** — what
the score does not measure. See [[(Note) The Scoring Model]].

## Where it runs

| | |
|---|---|
| npm | `@aethereumdev/gitpulse@1.0.0` — **published and live** |
| Install | `npm install -g @aethereumdev/gitpulse`, then plain `gitpulse` |
| No install | `npx @aethereumdev/gitpulse torvalds` |
| Offline | `gitpulse --demo` renders the whole report with **no token and no network** |
| Case study | `https://brunojaamaa.dev/projects/gitpulse` |

⚠️ **The package is scoped; the command is not.** The scope exists because npm's similarity
filter reserves `gitpulse` against the existing `git-pulse`, which has not shipped since
2022.

Next: [[(Note) The Pipeline]] · [[(Note) Honest State]]
