---
id: 7f22b2de-5eb4-42b4-8f66-dc0dbb94a89c
title: "Roadmap and Open Work"
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

# Roadmap and Open Work

## Sprint 7 — owner-gated, three items

**Bruno executes. None of these can be done by an agent.**

| # | Item | Why it needs a human |
|---|---|---|
| 1 | ⚠️ **Move npm releases onto trusted publishing (OIDC)** | So every version after the first carries a **provenance attestation** and **no long-lived token exists**. The workflow already exists at `.github/workflows/release.yml`; switching the registry setting does not. **Highest value of the three** |
| 2 | ⚠️ **Confirm the heatmap's column paint does not flicker in Terminal.app at 52 columns** | **An agent cannot see flicker.** No test can replace an eye here, and the masterplan says so explicitly |
| 3 | **Decide whether the bundled demo fixture stays `torvalds` or becomes Bruno's own profile** | It is entirely public data and the profile the docs already use — but it is another person's profile shipping inside a **published** package |

## Housekeeping — six stale local branches

⚠️ All merged, all still present:

```
docs/post-publish
docs/publish-record
docs/sprint-d
feat/publish-readiness      ← also survives as origin/feat/publish-readiness
fix/scoped-package-name
style/monochrome
```

Harmless, but it is the only real untidiness in the repo, and `origin/feat/publish-readiness`
is public.

## Declined, with reasons

| Item | Why it is not being built |
|---|---|
| ⚠️ **`MOTION.md`'s `> repos 34/61` fetch counter** | It would need per-page progress callbacks threaded out of the fetch layer, and **the counter would be fiction**: the repo total is not known until the first page returns, and the endpoint paginates at most twice. Declining it is the honest call |
| **GraphQL for a wider activity window** | Staying on REST was deliberate. The cost is stated on screen rather than hidden |

## Known gaps, disclosed rather than fixed

| Gap | Detail |
|---|---|
| **No end-to-end subprocess test in the suite** | The `--no-anim` byte-identity check drives the CLI as a subprocess, but needs a forced TTY and lives outside the suite |
| **Nothing enforces `assets/demo.svg` is current** | `npm run demo:record` regenerates it from a real run; remembering to is manual. ⚠️ This is the most likely thing to silently go stale |
| **The activity window is narrow and variable by nature** | Not fixable on REST. Printed on screen |
| **The score reads no code and cannot see private work** | Stated in `SCORING.md` **before** any formula |

## Hub-level task, not a code task

⚠️ **Fix `Main/Mesh/Notes/Projects/(Note) GitPulse.md`.** Its largest error is an **omission**:
it does not mention npm at all, and **the package is published**. Six corrections in
[[(Report) Gaps & Questions]].

## Sprints, for the record

| Sprint | State |
|---|---|
| 0 — first-run rescue | ✅ |
| 1 — truth in the data layer | ✅ |
| 2 — SIGNAL visual pass | ✅ |
| 3 — MOTION staging | ✅ |
| 4 — test the product surface | ✅ |
| 5 — repo hygiene + CI | ✅ |
| 6 — docs, scoring transparency, demo asset | ✅ |
| **7 — owner-gated** | ⚠️ **three items open** |
| D — documentation | ✅ closed `fe737cd` |
| E — monochrome | ✅ closed `6c9a774` |
| DECISION — `@aethereumdev` scoping | ✅ recorded |

`masterplan.md` also carries a *"Recorded deviation — aethereum sync"* section, which is the
project's own note that a standing workflow rule was not followed. Recorded rather than
hidden, which is the pattern across all three of these repos.
