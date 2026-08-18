---
id: ea21cb16-1a74-4e12-b1c1-93146c779a60
title: "The Scoring Model"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/SCORING.md"
created: "2026-08-17"
updated: "2026-08-17"
---

# The Scoring Model

**0–100, five weighted components, letter-graded.** `SCORING.md` documents every input and
every weight — and, **before any of the formulas**, what the score does not measure. That
ordering is deliberate and it should be preserved.

## Read this first

> **The score reads public metadata only. It never opens a line of anyone's code, and it
> cannot see private work.**

⚠️ A staff engineer whose entire output is private will score badly. **That is a limit of the
data, not a finding about them.**

## The five components

| Component | Max | Share |
|---|---|---|
| Repo Quality | 25 | 25% |
| Consistency | 20 | 20% |
| Language Diversity | 15 | 15% |
| README Quality | 15 | 15% |
| Recent Activity | 25 | 25% |
| **Total** | **100** | |

⚠️ **Consistency (20) and Recent Activity (25) are both derived from the Events API window** —
at most 300 events over a variable span. That is **45% of the score describing a partial and
variable period**. It is the single most important thing to know before reading anyone's
number. See [[(Note) Windows and Labelling]].

## Repo Quality — 25 points

| Sub-item | Max | Formula |
|---|---|---|
| Stars | 8 | `min(8, log₂(totalStars + 1) × 1.5)` |
| Forks received | 4 | `min(4, log₂(totalForks + 1) × 1.2)` |
| Descriptions present | 4 | `(repos with a description > 10 chars ÷ repos) × 4` |
| Topics used | 4 | `(repos with ≥ 1 topic ÷ repos) × 4` |
| Licences | 5 | `(repos with a licence ÷ repos) × 5` |

### ⚠️ The star cap is the correction worth knowing

| Stars | Points |
|---|---|
| 0 | 0 |
| 10 | 5.19 |
| **40** | **8.00 — capped** |
| 1,000 | 8.00 — capped |
| 250,000 | 8.00 — capped |

**Above 40 stars that input stops discriminating entirely.** A 250,000-star repository scores
identically to a 40-star one.

The first draft of `SCORING.md` claimed the cap was around **215**. Writing the document
meant **checking** the weights rather than describing them, and the check found the real
number. The document now says so, because it materially changes how the score should be read.

That is the project's sharpest lesson about documentation: writing it correctly is a form of
testing.

## Consistency — 20 points

| Sub-item | Max | Formula |
|---|---|---|
| Current streak | 8 | `min(8, currentStreak × 0.5)` — caps at **16 days** |
| Longest streak | 6 | `min(6, longestStreak × 0.3)` — caps at **20 days** |
| Event frequency | 6 | `min(6, eventsInLast90Days × 0.1)` — caps at **60 events** |

⚠️ All three read the Events window, and all three cap early. Sixteen consecutive days scores
the same as three years.

## Language Diversity — 15 points

| Sub-item | Max | Formula |
|---|---|---|
| Number of languages | 8 | `min(8, languageCount × 1.2)` — caps at **7 languages** |
| Balance | 7 | **Shannon entropy**, normalised — `(entropy ÷ log₂(languages)) × 7` |

The Shannon entropy term is real and is at `src/utils/scoring.ts:101`. It rewards an even
spread across languages rather than one dominant language with a long tail.

⚠️ **"Languages" counts repositories, not lines of code.** Each non-fork repo contributes 1
to its GitHub-assigned primary language, so a 300,000-line C project and a one-file C script
count the same. The renderer prints that caveat above the bars.

## README Quality — 15 points · Recent Activity — 25 points

Full formulas in `SCORING.md`. Recent Activity is the second Events-window component.

## The pattern across every component

**Every sub-item caps, and most cap early.** The score is designed to distinguish a profile
with basic hygiene from one without — descriptions, topics, licences, some breadth, some
recent activity. It is **not** designed to rank the top of the distribution, and the caps say
so numerically rather than in prose.

Anyone quoting a GitPulse score should quote that property with it.

## Tested

`src/__tests__/scoring.test.ts` — **22** tests covering the components and their caps.
`src/ui/score.ts` (**103** lines) renders the number and its letter grade.
