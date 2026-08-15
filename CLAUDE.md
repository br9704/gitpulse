# CLAUDE.md — GITPULSE
# Terminal CLI that turns any GitHub profile into a report card.

Read this at the start of every session. `masterplan.md` (which you create in Phase 3 of `ENGINEERPROMPT.md`) is the source of truth for sequencing. `RESEARCH-CONTEXT.md` is the measured audit — read it before trusting anything in the README.

---

## Owner

| | |
|---|---|
| Name | Bruno Jaamaa · jaamaabruno@gmail.com · GitHub `br9704` |
| Repo | github.com/br9704/gitpulse |
| npm | **Unpublished.** The name `gitpulse` was free as of Aug 2026 — re-verify before publishing |

## What this is

A zero-runtime-bloat TypeScript CLI. `gitpulse <username>` renders a developer report card in the terminal: profile block, stats grid, language bars, a `░▒▓█` contribution heatmap, commit-pattern sparklines, coding streaks, a 0–100 hire-ability score, compare mode, `--json`, `--minimal`, and a Three.js scene `--export`.

**The output IS the product.** This is a visual CLI. Every change is judged by what appears in the terminal, not by what the code looks like.

## Current state (verified by running it, Aug 2026)

Build exit 0 · 33/33 tests pass · zero TODOs or stubs · 2,010 LOC / 19 files · the only one of Bruno's three GitHub repos genuinely authored by him.

**But the documented command fails.** `gitpulse torvalds` with no token → rate-limit error, because unauthenticated GitHub is 60 req/hr per IP and only the `--token` flag is honoured. First-time users conclude the tool is broken. **This is the priority-one fix and it is ~20 lines.**

## Locked decisions (do not relitigate)

- **Zero runtime bloat.** Every dependency must justify itself. The current set (commander, chalk, boxen, ora, node-fetch) is the ceiling, not a starting point.
- **TypeScript strict, ESM, Node ≥ 18.** `tsc --noEmit` green before any sprint closes.
- **No postinstall scripts, ever.** npm v12 turns lifecycle scripts off by default — a CLI that needs postinstall breaks under `npx`.
- **Publish via trusted publishing (OIDC) + provenance from GitHub Actions.** Classic npm tokens were revoked Dec 2025. Requires npm ≥ 11.5.1, Node ≥ 22.14.0, `id-token: write`.
- **Graceful failure always.** Every network path must fail with a message that tells the user exactly what to do next. This is a CLI; an unhandled stack trace is a shipped bug.
- **The hire-ability score is either documented or gone.** An undocumented 0–100 score about a real person is the same credibility failure the portfolio copy audit targets. If it stays, `SCORING.md` documents every input and weight.

## Known bugs (found while rendering, Aug 2026)

- Heatmap header prints **"Last 90 days:"** but renders every day it is given, then reports a different active-day count. Label and data disagree.
- Language lines read `82.0% (82 repos)` — ambiguous whether the number is repos or percent of code.
- 3 eslint errors, all `no-control-regex` firing on correct ANSI-stripping regexes in `src/utils/formatting.ts` and `src/ui/stats.ts`. **Disable the rule; do not mangle the regexes.**
- `package.json` missing `repository`, `homepage`, `bugs` — the npm page will have no link to source.

## Architecture

```
src/
├── index.ts          # commander entry, renderFullReport()
├── api/
│   ├── github.ts     # fetchUserProfile() — the only network surface
│   └── cache.ts      # 30-min TTL, 50-profile eviction
├── ui/               # header · stats · languages · repos · heatmap · score · compare · minimal · export
├── utils/            # formatting (ANSI-aware), scoring
├── types/            # UserProfile and friends
└── __tests__/        # scoring · formatting · cache (renderers are UNTESTED — that's the gap)
```

**Testing gap:** current tests cover scoring, formatting and cache. `src/api/github.ts` and every `src/ui/*` renderer — the actual product — have no tests. Fixture-based snapshot tests of rendered output close this cheaply.

---

## Aethereum sync — required workflow (canonical block, identical across every project)

This project coordinates through Aethereum. Account config lives at `~/.aethereum/config.json` and this machine is already logged in.

- **First session:** run `aethereum init` in the repo root and create/join this project's room.
- **`share_intent`** — one line at the start of every sprint, before any code. Marking a task complete without having shared intent for its sprint is a workflow violation.
- **`declare_contract`** — for every interface other code consumes (types, schemas, event shapes, API contracts). Bump the version when the shape changes. Here: the `UserProfile` shape and the Three.js export format.
- **`record_decision`** — at every architectural fork or irreversible choice, with the *why*. Here especially: the hire-ability score question and the package name.
- **`ask_human`** — whenever the decision is Bruno's: spending money, publishing, deleting, rewriting git history, naming, or anything with an external side effect. Do not guess and do not block — keep working other tasks until answered.
- **`record_verification`** — at every sprint gate, pass/fail with evidence.

## Masterplan discipline (canonical block)

The masterplan is the **single source of truth for sequencing**. This file is the source of truth for *rules*. Precedence on conflict: masterplan (sequencing) > CLAUDE.md (rules) > ENGINEERPROMPT.md (kickoff).

- Status keys, used live in the file as work happens: `[ ]` not started · `[~]` in progress · `[x]` complete · `[⏭]` deferred (always with a one-line reason).
- **Never delete or rewrite masterplan content.** Expand it in place — add sub-tasks, file paths, edge cases, findings. Deepen, don't replace.
- Mark tasks as you go, never batched at the end of a session.
- A sprint closes only when its acceptance criteria pass. Then: fill the **As-shipped delta** and **Deferred** notes, move the Current-sprint pointer, and update the Current-state line at the bottom of this file.
- Never skip a sprint. Never partially complete one and move on.
- Stop and report at every sprint close before starting the next.

## Honesty rules (canonical block)

- Never state a number in a README, the site, or any public copy that a committed artifact cannot back.
- Verified counts only — never restate a figure from memory.
- If a claim and the code disagree, that is a bug in one of them. Fix it or flag it; never leave it ambiguous.
- `[PLACEHOLDER — description]` for anything unknown. Never invent content.

**Specific to this repo:** the portfolio currently presents gitpulse as a shipped CLI tool. **It is not published.** Either publish it or the portfolio copy changes — see `~/bruno-portfolio/COPY-AUDIT-ENGINEERPROMPT.md`.

---

## Current state

> Update at every sprint close.

**Current state (2026-08-14):** Sprints 0–6 of `masterplan.md` complete, all gates passed. `feat/publish-readiness` is **merged into `master`** (fast-forward, no merge commit) and pushed;
**CI is green on `master` across Node 20/22/24**. Not published — the remainder of Sprint 7 needs
npm credentials this machine does not have, and is waiting on Bruno.

Build exit 0 · **122 tests** (was 33) · lint **0 errors, 0 warnings** (was 3/14) · **3 runtime
dependencies** (was 5; `boxen` and `node-fetch` were declared and never imported) · `gitpulse`
re-verified free on npm.

The first CI run failed on all three Node versions and the failure was real: `Math.sin`/`cos`/
`sqrt`/`log2` are not bit-identical across platforms, so the Three.js scene export differed between
macOS and Linux in the last digit. Scene floats are now quantised to 6dp with a regression test.

Shipped this session: `--demo` renders offline with zero network calls and `GITHUB_TOKEN`/`GH_TOKEN`
are honoured, so the documented first run works; every rendered number now agrees with its label
(the activity window is derived from real event coverage instead of a hardcoded 90 days); the output
was rebuilt in SIGNAL — zero emoji, amber-on-warm-black, all colour through `src/ui/theme.ts`; the
MOTION render sequence is implemented with `--no-anim` byte-identical to the staged path; the
renderers and network layer are tested; CI runs on Node 20/22/24 and an OIDC release workflow is
ready; `SCORING.md` documents every weight; and `assets/demo.svg` is a real recorded capture at the
top of the README.

Known and recorded, not fixed: the `> repos 34/61` fetch counter from MOTION.md is not implemented
(reasoning in the Sprint 3 Deferred notes), and aethereum sync was skipped at Bruno's direction —
see the Recorded deviation section of `masterplan.md`.

**Sprint D — Documentation (closed 2026-08-15).** `README.md` rewritten to the docs-prompt structure
(hook → badges → what it does → Mermaid architecture → how it was built → verification → usage →
limitations → alternatives → status), and `PROJECT.json` added at the repo root as the single source
of truth for what the portfolio may say about this project. Every number re-traced to a command:
that found the README's **121 tests** (now **122**), its "three requests to the REST API" (three
*endpoints*, 3–6 requests once pagination is counted), and its "0 lifecycle scripts" (`prepublishOnly`
exists — the true claim is 0 *install-time* hooks). README doc links are absolute `blob/master` URLs
so the npm page resolves them. One `src/` line changed, the `--json` help text. Lint, typecheck,
build and **122 tests** all green after every edit.

**Sprint D was then re-audited independently, and the re-audit found seven more defects — two of
them inside gate items already marked passed.** The README's "captured output" block was not
verbatim (a section truncated, two sections dropped with no elision marker); the Mermaid diagram said
the repos fetch excludes forks when it excludes *organisation* repos; Limitations quoted a `% of
repos` label the product never prints; `--minimal` was documented as four lines and emits five. And
**three of the four rows in the Alternatives table were wrong**, which only installing and running
the tools revealed — `ghcal` renders an empty calendar for every user because it scrapes attributes
GitHub no longer emits, `github-stats` prints a pie chart rather than text and was last published in
2020, and `github-readme-stats` was deprecated in June 2026. All fixed; the table now reports what
each tool did when run. Full record in the Second verification pass section of `masterplan.md`.
**The lesson worth keeping: the agent that writes the docs cannot be the only one that checks them.**

**Standing honesty debt:** `PROJECT.json` says `status: "published"` and the README carries an npm
badge and an `npx gitpulse` command **at Bruno's explicit direction, written before the package
exists.** The registry returned 404 on 2026-08-15. Until Sprint 7.3 runs, that badge renders broken
and that command fails. Re-check with
`curl -s -o /dev/null -w "%{http_code}\n" https://registry.npmjs.org/gitpulse`.

**Next:** Sprint 7.2–7.5 in `masterplan.md` — npm 2FA, one manual bootstrap publish (trusted
publishing cannot be configured for a package that does not yet exist), then trusted publishing for
every release after that. Then apply the tightened repo description recorded in
`PROJECT.json` → `github.description` with `gh repo edit`.

## MOTION.md (binding)

`MOTION.md` in this folder is the animation specification — sequences, timings, per-surface rules, acceptance gates. It has the same authority as this file. When you author `masterplan.md` in Phase 3, fold its acceptance checklist into the relevant sprint gates and reference it from the plan.
