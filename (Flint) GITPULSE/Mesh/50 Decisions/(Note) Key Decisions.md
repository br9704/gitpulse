---
id: 7e0a03e2-08bd-402b-b417-914938b1f8cd
title: "Key Decisions"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/masterplan.md"
created: "2026-08-17"
updated: "2026-08-17"
---

# Key Decisions

## The package is `@aethereumdev/gitpulse`, not `gitpulse`

Its own section in `masterplan.md`. **Forced, not chosen.** npm's similarity filter reserves
`gitpulse` against the existing `git-pulse`, which has not shipped since 2022.

**The response was to scope the package rather than rename the tool.** The product keeps its
name, the binary stays plain `gitpulse`, and only the registry coordinate changes. Renaming
would have cost the identity for a constraint that lives entirely in one registry's namespace.

## Stay on REST, do not move to GraphQL

GraphQL would widen the activity window past the Events API's 300-event, variable-span limit.
It was declined.

The cost is stated in the output itself rather than hidden: *"the feed reaches no further
back than this window; earlier activity is invisible, not absent."* ⚠️ It is also the reason
**two of the five score components describe a partial window** — 45% of the score.

## The label changes, not the data

The founding principle. Most terminal GitHub tools print a fixed `Last 90 days:` header over
whatever the Events API returned. GitPulse derives the window from the oldest event actually
returned and prints it.

⚠️ **The first implementation of this got it wrong in the other direction** — widening to
GitHub's nominal 90-day retention whenever the 300-event cap was not hit, which produced 60
days of fabricated inactivity for `torvalds`. The sprint's acceptance gate caught it. See
[[(Note) Windows and Labelling]].

## `buildProfile()` is split out from `fetchUserProfile()`

So `--demo` runs the **exact same derivation** the network path runs. The demo is incapable
of drifting from the product, because it is not a mock-up of the output — it *is* the output
with the fetches replaced.

⚠️ The consequence, which had to be designed for: **the clock is injectable**, because the
fixture carries absolute timestamps and would otherwise have decayed into an empty heatmap
within months.

## `progress === 1` returns the static string, exactly

Every animated renderer takes `progress: number = 1`. The last frame **is** the real output,
so the animation cannot diverge from it.

This turns `MOTION.md`'s "`--no-anim` must be byte-identical" from a thing you verify after
the fact into a thing **the type signature enforces**. Four unit tests assert it directly.

## Coverage by surface, not by line

Every one of the nine renderers and the network layer has at least one test. No line-coverage
target.

The justification is in the failure it replaced: `cache.test.ts` **asserted an inline
expression and imported no product code at all**, so two of the then-33 "passing tests"
verified nothing. Line coverage would not have caught that. A surface checklist does.

## Every derived float is quantised to 6dp

⚠️ `Math.sin`, `cos`, `sqrt` and `log2` are **not required to be bit-identical across
platforms and are not**. The Three.js export produced `x = 4.044661788320042` on macOS and
`…043` on Linux, and CI failed on all three Node versions.

**A scene that differs between machines cannot be diffed or cached**, which defeats the point
of a contract another tool consumes.

## Three runtime dependencies, and zero install-time scripts

`chalk`, `commander`, `ora`. `boxen` and `node-fetch` were declared and **imported nowhere**,
worth **24 packages** in the install tree — removed.

**Zero install-time lifecycle scripts** means `npx` works under npm v12 defaults. The README
counts it as a metric, which is the right framing: it is a property somebody has to maintain,
not an accident.

## Retire amber and green — greyscale on near-black

Sprint E, `6c9a774`. The palette carried a green that implied a value judgement the data did
not support. `MOTION.md` was amended for the retired green at `87b10f5`.

## Write the docs by checking, not by describing

Writing `SCORING.md` meant **checking** the weights rather than describing them, and produced
the sharpest correction in the project: ⚠️ **the star sub-item caps at 40 stars, not the ~215
the first draft claimed.** A 250,000-star repository scores identically to a 40-star one.

The document now says so, because it materially changes how the number should be read. See
[[(Note) The Scoring Model]].

## Run the alternatives before describing them

Four competing tools were **installed and run** in August 2026. ⚠️ **Two of the four no longer
do what they say.** The README also names the one tool GitPulse does **not** replace —
`git-stats` against a local clone.

That last row is the decision worth copying: **a comparison table that never concedes
anything is not a comparison table.**
