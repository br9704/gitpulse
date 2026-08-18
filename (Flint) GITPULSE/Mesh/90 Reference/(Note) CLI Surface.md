---
id: d5b1195b-c98c-4a7a-bb3a-e4c8119ef91e
title: "CLI Surface"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/src/index.ts"
created: "2026-08-17"
updated: "2026-08-17"
---

# CLI Surface

```bash
gitpulse <username>                        # full report card
gitpulse <username> --minimal              # five compact lines
gitpulse <username> --compare <other>      # head to head
gitpulse <username> --json                 # curated JSON, not a raw API dump
gitpulse <username> --export               # Three.js scene graph
gitpulse --demo                            # bundled fixture, offline
```

## Flags

| Flag | Short | Description |
|---|---|---|
| `--token <token>` | `-t` | GitHub personal access token |
| `--json` | `-j` | Curated JSON output |
| `--minimal` | `-m` | Compact output |
| `--export` | `-e` | Three.js scene data |
| `--compare <user>` | `-c` | Compare with another user |
| `--demo` | | ⚠️ Bundled fixture, offline — **no token, no network** |
| `--no-anim` | | Print instantly. ⚠️ **byte-identical** to the staged path |
| `--no-cache` | | Bypass the cache and fetch fresh |
| `--clear-cache` | | Clear cached profiles |

⚠️ **`--json` is curated, not a raw API dump.** Stripping raw API noise from `--json` was an
explicit change at `37475ab`. Consumers get a stable shape rather than GitHub's.

## Environment

| Variable | Effect |
|---|---|
| `GITHUB_TOKEN` / `GH_TOKEN` | Token used when `--token` is not passed |
| `GITPULSE_CACHE_DIR` | Cache location, default `~/.gitpulse/cache` |
| `NO_COLOR` | Disable all colour **and** staging |
| `CI` | Disable staging and spinners |

**Staging turns itself off automatically** whenever output is piped, redirected, or run under
`CI` or `NO_COLOR`. Scripts get clean text without asking.

## The report sections

Rendered in reading order over **≤2.5 s**: header and profile · statistics · languages · top
repositories · code activity heatmap · commit patterns by day and hour · coding streak ·
score with letter grade. ⚠️ **The grade letter lands last, after a beat.**

Every section that derives from the Events API prints its window. See
[[(Note) Windows and Labelling]].

## ⚠️ `--export` is a cross-project contract

`src/ui/export.ts` (**143** lines) produces a **Three.js scene graph** consumed by the **3D
GitHub Visualizer**, which reads it in `src/scene/sceneGraph.js` as its
`github-3d-visualizer/scene` format.

Two consequences for anyone changing it:

1. **Every derived float is quantised to 6dp**, with a regression test. `Math.sin`/`cos`/
   `sqrt`/`log2` are not bit-identical across platforms — the export produced
   `x = 4.044661788320042` on macOS and `…043` on Linux, and CI failed on all three Node
   versions. A scene that differs between machines cannot be diffed or cached.
2. **Changing the shape breaks a published consumer.** The visualiser refuses an unknown
   `version` rather than guessing, so a bump is safe but a silent shape change is not.

## Failure output

If the rate limit is hit without a token, GitPulse **prints the steps to fix it** rather than
a bare error — the 403 branch is split into primary rate limit, secondary rate limit and bad
credentials so the message names the real problem.

That was the priority-one fix from the audit, and it was roughly twenty lines.

## The demo asset

`assets/demo.svg` (32 KB) is a **real timed capture** of `gitpulse --demo` via
`tools/record-demo.mjs`, not a mock-up. It is what the README and the case study display.
⚠️ **Nothing enforces that it is current.**
