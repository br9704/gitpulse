---
id: 614c5e89-8e38-4e92-809f-8c37df4aed53
title: "Media"
type: index
project: "GitPulse"
tags:
  - "#index"
  - "#project"
  - "#ld/living"
  - "#status/shipped"
  - "#cluster/personal"
status: shipped
source_path: "/Users/brunojaamaa/Desktop/gitpulse/assets"
created: "2026-08-17"
updated: "2026-08-17"
---

# Media

**Nothing is copied here.** One asset, pointed at by absolute path.

| Asset | Path | Size | What it is |
|---|---|---|---|
| Demo capture | `/Users/brunojaamaa/Desktop/gitpulse/assets/demo.svg` | **32 KB** | A **real timed capture** of `gitpulse --demo` via `tools/record-demo.mjs` — not a mock-up. Shows the wordmark, profile, statistics, language bars, ranked repositories, heatmap, commit patterns, streak and score |

## Two things to know about it

⚠️ **It is served to the README from `raw.githubusercontent.com` on the `master` branch.**
Renaming the branch breaks the README image **on GitHub and on npm**.

⚠️ **Nothing enforces that it is current.** Regenerate with:

```bash
cd /Users/brunojaamaa/Desktop/gitpulse
npm run demo:record
```

The README says so in its limitations, and it is the most likely thing in this project to
silently go stale — because it is exactly what a visitor to the case study looks at first.

## Why SVG rather than a GIF

The output is text. An SVG of a terminal capture stays crisp at any size, is a fraction of
the weight of a recording, and is diffable in a commit. The other two projects in this
cluster ship GIFs because their output is pixels.

Up: [[(Map) Master Map]]
