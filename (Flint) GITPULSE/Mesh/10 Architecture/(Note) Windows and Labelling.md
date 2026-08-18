---
id: d8660429-3eb0-4a09-822b-1b39417050c6
title: "Windows and Labelling"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/src/utils/scoring.ts"
created: "2026-08-17"
updated: "2026-08-17"
---

# Windows and Labelling

**This is the idea the whole tool is built on**, and the reason it is not just another
terminal stats printer.

> **When the label and the data would disagree, the label changes, not the data.**

## The problem

GitHub's public Events API returns **at most 300 events** and reaches back a **limited and
variable** period — often far less than 90 days for a busy account. There is no parameter to
widen it. The feed is what the feed is.

Most tools built on it print a fixed `Last 90 days:` header over whatever they got. That
header is a **guess presented as a measurement**, on a screen about a real person.

## What GitPulse does instead

It derives the window from **the oldest event the feed actually returned** and prints that
window beside the number:

```
CODE ACTIVITY ────────────────────────────────────────────────
  last 30 days of public code events  2026-07-16 → 2026-08-14
  ...
  119 code events across 30 active days
  > source: public Events API — push, pull-request and branch-creation events only
  > the feed reaches no further back than this window; earlier activity is invisible, not absent
```

And a streak carries its own scope:

```
CODING STREAK ────────────────────────────────────────────────
  current      30 days
  longest      30 days
  last active  2026-08-14
  > measured within the 30-day event window above, not all-time
```

⚠️ **"Invisible, not absent"** is doing real work in that line. It tells the reader the
number is a property of the *feed*, not of the person.

## What the audit found here

`generateContributions` had been counting **every** public event type as a "contribution"
under a hardcoded `Last 90 days:` header, while reporting an active-day count derived from a
**third** window. **Three windows, one label.**

The rewrite counts **only code events** — push, pull-request and branch-creation — and
derives the span from real coverage.

## The bug inside the fix

⚠️ Worth knowing, because it is the exact failure mode this principle exists to prevent.

The **first implementation of the rewrite** widened the window to GitHub's nominal 90-day
retention whenever the 300-event cap was **not** hit. That rendered `torvalds` as a 90-day
grid containing **60 days of fabricated inactivity**, for a feed that only reaches back 30.

It looked correct. It was a lie with better formatting. **The sprint's own acceptance gate
caught it**, by rendering a real profile and reading the result rather than checking that
the code ran.

## What inherits the window

Everything derived from the Events API describes that window **and no more**:

- the code-activity heatmap
- commit patterns by day and hour
- current and longest streak
- ⚠️ **two of the five score components** — Consistency (20 pts) and Recent Activity (25 pts),
  which together are **45% of the score**

See [[(Note) The Scoring Model]]. That 45% figure is the most important thing to know before
reading anyone's number.

## The related labelling call

The `LANGUAGES` section prints `> share of repositories by primary language, forks excluded`
directly above the bars, because **"languages" counts repositories, not lines of code**. A
300,000-line C project and a one-file C script contribute the same 1.

Same principle: the caveat lives **on screen**, not in a footnote nobody reads.
