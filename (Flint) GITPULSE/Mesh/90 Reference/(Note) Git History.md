---
id: d1ac0b83-498b-4788-a9ee-4d944e2a4d33
title: "Git History"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/.git"
created: "2026-08-17"
updated: "2026-08-17"
---

# Git History

> ⚠️ **The branch is `master`, not `main`.** This is the only one of Bruno's three
> portfolio-linked repos that does this, and it will break any automation that hardcodes
> `main`. `git log origin/main..HEAD` fails here; use `origin/master..HEAD`.

**22 commits.** Working tree clean, **0** unpushed, last commit **2026-08-15**.

⚠️ **All 22 commits are authored by Bruno Jaamaa.** No bot authorship, no history rewrite
performed or needed — unlike the 3D GitHub Visualizer, where 48 of 72 are bot commits and the
rewrite is still owner-gated.

## Branches

| Branch | State |
|---|---|
| `master` | current, tracks `origin/master` |
| `origin/master` | in sync |
| ⚠️ `docs/post-publish` | merged, **stale** |
| ⚠️ `docs/publish-record` | merged, **stale** |
| ⚠️ `docs/sprint-d` | merged, **stale** |
| ⚠️ `feat/publish-readiness` | merged, **stale** — and survives as `origin/feat/publish-readiness` |
| ⚠️ `fix/scoped-package-name` | merged, **stale** |
| ⚠️ `style/monochrome` | merged, **stale** |

**Six stale local branches**, one of them also public. The only real housekeeping in the repo.

## Two eras

**March 2026 — the original build.** Four commits, ending at `ad94b70`. The tool worked and
looked finished, but ⚠️ **its own documented first command did not run**.

**August 2026 — the rescue and the publish.** Eighteen commits.

| Commit | Date | |
|---|---|---|
| `58d563b` | 08-14 | **rescue the first-run experience** |
| `c9f2c63` | 08-14 | **make every rendered number defensible** |
| `c599cf8` | 08-14 | apply the SIGNAL design system to every rendered surface |
| `9393637` | 08-14 | stage the report per MOTION.md |
| `66bc201` | 08-14 | **test the product surface** |
| `67465e8` | 08-14 | repo hygiene, CI, and an **OIDC release workflow** |
| `b03d9f8` | 08-14 | document the score, rewrite the README, record the demo |
| `1cb4dfc` | 08-14 | hand over the owner-gated work |
| `786e88e` | 08-14 | ⚠️ **make the Three.js scene export platform-independent** |
| `d5a8db0` | 08-14 | bump checkout and setup-node to v7 |
| `cc28afc` | 08-14 | update current state after push and green CI |
| `e0eefd0` | 08-14 | record the merge to master |
| `fe737cd` | 08-15 | close Sprint D — README rewrite, PROJECT.json, and a re-audit |
| `6c9a774` | 08-15 | **retire amber, render greyscale on near-black** |
| `aa07847` | 08-15 | ⚠️ **publish as @aethereumdev/gitpulse — unscoped name is not claimable** |
| `4eddfde` | 08-15 | 🚀 **record the publish — @aethereumdev/gitpulse@1.0.0 is live** |
| `87b10f5` | 08-15 | amend MOTION.md for the retired green, apply repo metadata |
| `4a43b82` | 08-15 | docs: link the case study on brunojaamaa.dev |

## Regenerating this

`Shards/changelog-from-git.md` rebuilds this note. ⚠️ It uses `master` explicitly. Read-only
git only — `log`, `show`, `status`, `branch`, `diff`.
