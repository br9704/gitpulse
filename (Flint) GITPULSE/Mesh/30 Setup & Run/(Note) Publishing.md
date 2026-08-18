---
id: 60d6cee6-b229-4adc-a45f-5290f76b10fa
title: "Publishing"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/.github/workflows/release.yml"
created: "2026-08-17"
updated: "2026-08-17"
---

# Publishing

> ⚠️ **`@aethereumdev/gitpulse@1.0.0` is live on the public npm registry.**
> **Never run `npm publish` from an agent session.** Publishing is owner-executed.

## The package

| | |
|---|---|
| Name | `@aethereumdev/gitpulse` |
| Version | **1.0.0**, published **2026-08-15** |
| Binary | plain `gitpulse` |
| Licence | MIT |
| `files` | `dist/`, `README.md`, `SCORING.md`, `LICENSE` — nothing else ships |
| Lifecycle scripts | **`prepublishOnly` only**, which builds. **Zero** install-time scripts |

## ⚠️ Why the package is scoped

**The unscoped name is not claimable.** npm's similarity filter reserves `gitpulse` against
the existing [`git-pulse`](https://www.npmjs.com/package/git-pulse), which **has not shipped
since 2022**.

The decision — recorded as its own section in `masterplan.md`, *"DECISION — the package is
`@aethereumdev/gitpulse`, not `gitpulse`"* — was to **scope the package rather than rename
the tool**. The product keeps its name and its binary; only the registry coordinate changes.

Attempted and corrected in-flight: `aa07847`, *"publish as @aethereumdev/gitpulse — unscoped
name is not claimable"*, then `4eddfde`, *"record the publish — @aethereumdev/gitpulse@1.0.0
is live"*.

## What CI checks before anything ships

Five of the nine CI checks are publishing checks rather than correctness checks:

| Check | Prevents |
|---|---|
| `dist/__tests__` absent | ⚠️ test helpers leaking into the tarball. **This once happened** — Sprint 4's helpers were compiling into `dist/` |
| `npm pack --dry-run` | the package containing something unexpected |
| `node dist/index.js --demo` | shipping a build that does not run |
| demo with `fetch` stubbed to throw | shipping a `--demo` that secretly needs a network |
| piped output scanned for emoji and ANSI | shipping output that breaks in a pipe |

## ⚠️ The open publishing item

**Trusted publishing (OIDC) is not yet in effect.** `.github/workflows/release.yml` exists —
an OIDC release workflow added at `67465e8` — but moving npm releases onto it is **owner-gated
in Sprint 7**.

Until that is done:

- every version after the first carries **no provenance attestation**
- **a long-lived npm token exists**

Both are the stated reasons for doing it. This is the highest-value item in the owner-gated
block. See [[(Note) Roadmap and Open Work]].

## Before any future release

1. Confirm `assets/demo.svg` is current — ⚠️ **nothing enforces this**. Run
   `npm run demo:record`.
2. Confirm `SCORING.md` still matches `src/utils/scoring.ts`. The two have diverged once
   already, and the correction (the **40-star cap**, not ~215) was material.
3. Run the full local gate: `npm ci && npm run lint && npm run typecheck && npm run build && npm test`.
4. ⚠️ Decide the fixture question first if it is still open — the bundled `--demo` profile is
   **`torvalds`**, another person's profile shipping inside a published package.
