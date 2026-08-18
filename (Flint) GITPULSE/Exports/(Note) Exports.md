---
id: 01097d51-6099-4eaf-adf3-ba5c5982d6bc
title: "Exports"
type: note
project: "GitPulse"
tags:
  - "#note"
  - "#project"
  - "#ld/living"
  - "#status/shipped"
  - "#cluster/personal"
status: shipped
source_path: "/Users/brunojaamaa/Desktop/gitpulse/(Flint) GITPULSE/Exports"
created: "2026-08-17"
updated: "2026-08-17"
---

# Exports

**`Exports/` holds anything destined to leave this vault.** A note tagged `#export` has an
audience beyond Bruno and his agents.

⚠️ **Note the name collision.** This folder is about *vault* exports. GitPulse's own
`--export` flag produces a Three.js scene graph and is a completely different thing — that
lives in [[(Note) CLI Surface]].

## What belongs here

| Kind | Example for this project |
|---|---|
| Portfolio copy | text for `brunojaamaa.dev/projects/gitpulse` |
| npm README fragments | ⚠️ anything that must stay in sync with the **published** `README.md` |
| Interview material | the labelling principle, and the 40-star cap correction |

## The rules that make this safe

**1. Every claim must survive a run.** This project's own history contains "passing tests"
that verified nothing and a `Last 90 days:` header over a 30-day feed. Do not export a number
without producing it.

**2. Two numbers must always carry their caveat:**

- **any GitPulse score** — 45% of it (Consistency 20 + Recent Activity 25) is derived from an
  Events API window of at most 300 events over a *variable* span, and every sub-item caps
  early. ⚠️ **A 250,000-star repository scores identically to a 40-star one.**
- **any test count** — it is **122**, verified 2026-08-17 by running the suite. The hub note
  still says 33.

**3. The npm package name is `@aethereumdev/gitpulse`, and the binary is `gitpulse`.** Never
export an install line reading `npm i gitpulse` — that is a different, abandoned package.

## Currently

**Empty.**

Up: [[(Map) Master Map]]
