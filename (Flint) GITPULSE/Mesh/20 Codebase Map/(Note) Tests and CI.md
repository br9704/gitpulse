---
id: 7683b059-15a2-4442-a2da-3379fc116790
title: "Tests and CI"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/src/__tests__"
created: "2026-08-17"
updated: "2026-08-17"
---

# Tests and CI

**122 tests, 6 suites, all passing.** Verified by running `npx vitest run` on **2026-08-17**
— not read off a document.

| Suite | Tests | Covers |
|---|---|---|
| `renderers.test.ts` | **37** | the nine renderers, pinned by committed snapshots |
| `scoring.test.ts` | **22** | the five components and their caps |
| `github.test.ts` | **21** | the network layer against a mocked fetch |
| `formatting.test.ts` | **20** | numbers and dates |
| `cache.test.ts` | **11** | ⚠️ rewritten — the original asserted an inline expression and imported **no product code at all** |
| `anim.test.ts` | **11** | the staging primitives, including four `progress === 1` identity assertions |

Plus `fixtures.ts` (**97**) and `setup.ts` (**11**), which hold no tests of their own.

`src/__tests__/__snapshots__/renderers.test.ts.snap` pins what every renderer emits, **byte
for byte**. The output is the product, so the output is what is tested.

⚠️ **Colour is pinned off globally in `setup.ts`**, so snapshots are readable plain text and
**cannot pass locally while failing in CI**. That is a real class of flake, closed
deliberately.

## The network layer is tested without a network

`github.test.ts` drives a mocked fetch across **200, 404, 403 primary rate limit, 403
secondary rate limit, 401, 429, 500**, the pagination boundary, the flaky-Events-API path,
and auth-header presence **and** absence.

The 403 split matters: a generic 403 was what made a first-time user conclude the tool was
broken. Now the message names the real problem.

## CI — `.github/workflows/ci.yml`

Runs on **every push to every branch**, on **Node 20, 22 and 24**.

| Check | Proves |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run typecheck` | ⚠️ `src/` **and** the tests type-check. The build config **excludes** tests, so `tsc` alone would not see them — hence a separate `tsconfig.test.json` |
| `npm run build` | `tsc` exit 0 |
| `npm test` | every renderer and the network layer |
| `dist/__tests__` absent | ⚠️ test helpers **cannot leak into the published tarball again**. They once did |
| `node dist/index.js --demo` | the product actually renders |
| demo with `fetch` stubbed to throw | `--demo` makes **zero** network calls |
| piped output scanned | no character with the Unicode `Emoji_Presentation` property, no ANSI escape |
| `npm pack --dry-run` | package contents are what they should be |

Five of those nine are **publishing** checks rather than correctness checks. That balance is
deliberate for a package on a public registry.

## The second workflow

`.github/workflows/release.yml` — an **OIDC release workflow**, added at `67465e8`.
⚠️ Moving npm releases onto **trusted publishing** is still owner-gated in Sprint 7. Until it
is done, releases carry no provenance attestation and a long-lived token exists. See
[[(Note) Publishing]].

## What is not tested

| Gap | Detail |
|---|---|
| **No end-to-end subprocess test** | The `--no-anim` byte-identity check drives the CLI as a subprocess, but it needs a **forced TTY** and lives outside the suite |
| **`assets/demo.svg` currency** | Nothing asserts the committed SVG matches the current output |
| ⚠️ **Heatmap flicker in Terminal.app at 52 columns** | Owner-gated, because **an agent cannot see flicker.** This needs a human eye and no test can replace it |

## Reproduce

```bash
cd /Users/brunojaamaa/Desktop/gitpulse
npm ci
npm run lint && npm run typecheck && npm run build && npm test
```
