---
id: b4ca6ef0-f156-4c6c-ac77-bf7bcb774906
title: "Gaps & Questions"
type: report
project: "GitPulse"
tags:
  - "#report"
  - "#project"
  - "#ld/living"
  - "#stack/typescript"
  - "#status/shipped"
  - "#cluster/personal"
status: shipped
source_path: "/Users/brunojaamaa/Desktop/gitpulse"
created: "2026-08-17"
updated: "2026-08-17"
---

# Gaps & Questions

**The repo is internally consistent and matches its public claim. The stale artefact is the
hub note** — and here the biggest error is an **omission**: the hub does not know the project
is published on npm.

## The chain, checked end to end

| Source | Agrees with the code |
|---|---|
| `README.md` | ✅ |
| `SCORING.md` · `masterplan.md` · `PROJECT.json` | ✅ |
| GitHub repo description + topics | ✅ |
| **GitHub `homepageUrl`** | ✅ set to `https://brunojaamaa.dev/projects/gitpulse` |
| **npm registry** | ✅ `@aethereumdev/gitpulse@1.0.0` |
| **The live case study on brunojaamaa.dev** | ✅ fetched 2026-08-17 and verified |
| **The hub note in BRUNO HQ** | ❌ **six material errors, one of them an omission** |

### The GitHub website field

> The hub's `(Task) Portfolio Follow-ups` lists setting the GitHub "website" field as open
> work.

**Already done for this repo.** `gh repo view br9704/gitpulse --json homepageUrl` returns
`https://brunojaamaa.dev/projects/gitpulse`.

⚠️ **All three of the projects in this batch already have it set.** The backlog item can be
closed for the whole batch.

### The live case study was checked, not assumed

Fetched on 2026-08-17. It reports:

- `"Any GitHub profile as a terminal report card — every number states its window."` ✅
- package `@aethereumdev/gitpulse`, install `npx @aethereumdev/gitpulse torvalds` ✅
- ⚠️ `"Scope the package to @aethereumdev rather than rename the tool"` ✅ — **the site
  explains the scoping decision**, which is exactly the kind of thing that usually goes
  unstated
- status `"PUBLISHED ON NPM · MIT"` ✅
- 3 runtime dependencies, 0 install-time lifecycle scripts, 0 network calls on `--demo`, 3
  REST endpoints, 0–100 score ✅ — all match `package.json` and `src/api/github.ts`
- `"last 30 days of public code events"` with the example span ✅

**The public claim matches the code.**

## Open items

| # | Gap | Where I looked | Severity |
|---|---|---|---|
| 1 | ⚠️ **The hub note does not mention npm at all.** `@aethereumdev/gitpulse@1.0.0` has been published since 2026-08-15. This is the **single biggest state change in the project's history** and the hub is unaware of it | hub note vs `package.json`, `4eddfde` | **high** |
| 2 | ⚠️ **Hub note records `path: none — clone from GitHub if needed`.** The repo is on the Desktop at `/Users/brunojaamaa/Desktop/gitpulse`, 80 MB, clean, 0 unpushed. The note even says *"Clone it before it becomes a link on a portfolio pointing at code nobody has locally"* — that concern is now resolved | hub note frontmatter | **high** |
| 3 | ⚠️ **Hub note records `status: dormant`** and tags `#no-local-repo` and `#status/dormant`. It is published, public and portfolio-linked. Correct value is `shipped` | hub note frontmatter + tags | **high** |
| 4 | ⚠️ **Hub note records "33 tests passing".** Actual: **122**, verified by running `npx vitest run` on 2026-08-17. And **two of the original 33 verified nothing** — `cache.test.ts` asserted an inline expression and imported no product code at all | hub note vs a real test run | **medium** |
| 5 | ⚠️ **Hub note says "TypeScript targeting Node 18+".** `package.json` `engines` says **`>=20.0.0`**, and CI runs Node **20, 22 and 24**. Node 18 is not supported | hub note vs `package.json` | **medium** |
| 6 | Hub note frontmatter reads `year: "2025"`. First commit is **2026-03-12** | hub note vs `git log` | low |
| 7 | Hub note's ccline comparison — *"1,035 tests to GitPulse's 33"* — uses the stale figure. The direction still holds; the number does not | hub note | low |
| 8 | ⚠️ **The branch is `master`, not `main`.** The only one of Bruno's three portfolio repos that does this. Any automation hardcoding `main` fails here, and `assets/demo.svg` is served to the README from `raw.githubusercontent.com/.../master/`, so renaming the branch would break the README image on GitHub **and on npm** | `git branch -a`, `README.md` | **medium** — cheap to handle, expensive to discover |
| 8b | 🔴 **`ctxbench` pins 7 of its 24 benchmark tasks to commits in this repo** — hand-authored defects, prefixed `gp-`, on `src/utils/formatting.ts` and `src/utils/scoring.ts`. The hub records no such link, and neither did this vault before 2026-08-17. **Any history rewrite invalidates a published experiment**, and branch deletion needs a reachability check first. See [[(Note) Downstream Consumers]] | ctxbench's task corpus and gap register | **high** — silent until it breaks |
| 9 | ⚠️ **Six stale local branches**, all merged: `docs/post-publish`, `docs/publish-record`, `docs/sprint-d`, `feat/publish-readiness`, `fix/scoped-package-name`, `style/monochrome`. `origin/feat/publish-readiness` also survives on the **remote** | `git branch -a` | medium — housekeeping |
| 10 | ⚠️ **Trusted publishing (OIDC) is not yet in effect.** `release.yml` exists but the registry switch is owner-gated. Until then every version after the first carries **no provenance attestation** and **a long-lived npm token exists** | `.github/workflows/release.yml`, masterplan Sprint 7 | **medium** |
| 11 | ⚠️ **The bundled `--demo` fixture is `torvalds`** — another person's profile, 1,512 lines, shipping inside a **published** package. Entirely public data, and the profile the docs already use, but it is an open owner decision | `src/__fixtures__/demo-profile.ts` | medium — disclosed |
| 12 | **Nothing enforces `assets/demo.svg` is current.** `npm run demo:record` regenerates it from a real run; remembering to is manual. ⚠️ This is the most likely thing to silently go stale, and it is what the README and the case study display | `tools/record-demo.mjs`, README | medium — disclosed |
| 13 | **No end-to-end test drives the CLI as a subprocess inside the suite.** The `--no-anim` byte-identity check does, but needs a forced TTY and lives outside it | `src/__tests__/`, README | low — disclosed |
| 14 | ⚠️ **Heatmap flicker at 52 columns in Terminal.app has never been confirmed by a human.** Owner-gated, because **an agent cannot see flicker.** No test can replace this | masterplan Sprint 7 | low — but genuinely unresolvable by automation |
| 15 | `~/bruno-portfolio` **does not exist on this machine**, so the hub's named public source of truth (`lib/projects.ts`) could not be diffed locally. Verified against the **live page** instead | `ls ~/bruno-portfolio` | medium — affects all three projects |

## What the hub note gets *right*

- **Shannon entropy for language diversity** ✅ — real, at `src/utils/scoring.ts:101`, and
  the normalisation is `(entropy ÷ log₂(languages)) × 7`
- **30-minute cache layer** ✅ — `src/api/cache.ts`, evicting at 50 profiles
- **Three.js scene export as the bridge to the 3D GitHub Visualizer** ✅ — confirmed on both
  sides: `src/ui/export.ts` here, `src/scene/sceneGraph.js` there
- **Terminal-native with zero browser dependency, deliberately** ✅
- **Five weighted score dimensions** ✅ — Repo Quality 25, Consistency 20, Language Diversity
  15, README Quality 15, Recent Activity 25
- **`ccline` as the mature descendant** ✅ — same instincts a year apart

## Questions only Bruno can answer

1. **Move npm releases onto trusted publishing (OIDC)?** Until it happens, no version carries
   a provenance attestation and a long-lived token exists. Highest-value item in the
   owner-gated block.
2. **Does the heatmap flicker in Terminal.app at 52 columns?** ⚠️ **An agent cannot see
   flicker.** This is the one item in the whole batch that automation genuinely cannot close.
3. **Does the bundled demo fixture stay `torvalds`, or become Bruno's own profile?** It is
   public data, but it is another person's profile shipping inside a published package.
4. **Delete the six stale branches?** All merged by content; `origin/feat/publish-readiness`
   is public. ⚠️ **Confirm ctxbench's pinned commits stay reachable from `master` first** —
   deleting a branch that is the sole path to a pinned commit would break the benchmark.

## What could not be checked

- **The npm registry was not queried directly.** Publication is taken from `package.json` at
  1.0.0, commit `4eddfde` recording the publish, the README's npm badge, and the case study's
  `"PUBLISHED ON NPM"` status. **Four independent sources agree**, but no registry call was
  made from this session.
- **No `.env` file exists in this repo**, so nothing was skipped for secrecy. `GITHUB_TOKEN`,
  `GH_TOKEN` and `GITPULSE_CACHE_DIR` are documented variable **names** read from the README.
  **No credential was found in tracked source.**

## One thing verified rather than assumed

⚠️ **The 122-test figure came from running the suite**, not from reading a document:

```
Test Files  6 passed (6)
     Tests  122 passed (122)
  Duration  200ms
```

That matters here specifically, because this project's own history contains a case of
"passing tests" that verified nothing.
