# masterplan.md — GITPULSE

**Source of truth for sequencing.** `CLAUDE.md` is the source of truth for rules.
Precedence on conflict: masterplan (sequencing) > CLAUDE.md (rules) > ENGINEERPROMPT.md (kickoff).

Status keys: `[ ]` not started · `[~]` in progress · `[x]` complete · `[⏭]` deferred (always with a reason).

> **Current sprint: Sprint 1 — Truth in the data layer**
> _(Sprint 0 closed 2026-08-14, gate passed.)_

Created 2026-08-14. Never delete or rewrite content here — expand it in place.

---

## Baseline (measured 2026-08-14, from the clone in `~/Desktop/gitpulse`)

| Check | Command | Result |
|---|---|---|
| Build | `npm run build` | exit 0, zero errors |
| Tests | `npm test` | 33/33 passing, 3 files |
| Lint | `npm run lint` | 3 errors, 14 warnings |
| Size | `wc -l src/**/*.ts` | 2,010 LOC / 19 files |
| npm name `gitpulse` | registry HTTP status | 404 — free |
| Git history | `git log --oneline` | 4 commits, last 2026-03-13, author Bruno Jaamaa |

### Findings from the live run (not in RESEARCH-CONTEXT.md)

Running `node dist/index.js torvalds --token <real>` surfaced four issues a static audit cannot see:

1. **Heatmap renders as a near-empty grid.** `HEAT_CHARS[0]` is a literal space
   (`src/ui/heatmap.ts:6`), so every zero-activity day draws nothing. The 90-day grid becomes
   ~5 sparse columns floating in whitespace. Reads as broken.
2. **Contribution and streak numbers are not true.** `generateContributions`
   (`src/utils/scoring.ts:225`) counts *every* public event type as a "contribution", and the
   Events API caps at 300 events / ~90 days. Torvalds renders `Current Streak: 30 days` where 30 is
   exactly the span of available data, under a `Last 90 days:` header, reporting
   `141 contributions in 30 active days` — three windows, one label. Violates the honesty rules.
3. **Output violates the SIGNAL design system throughout.** Six-colour rainbow wordmark
   (`src/ui/header.ts:12`), emoji section icons and data labels, six chalk colours in the stats grid.
4. **Smaller real bugs.** Footer prints `github.com/br9704/gitpulse-cli` — wrong repo name
   (`src/index.ts:140`). Version hardcoded at `src/index.ts:24`. `(1 repos)` never pluralises.
   Language `%` is percent-of-repos but reads as percent-of-code.

### Decisions taken 2026-08-14 (Bruno, via AskUserQuestion)

| Question | Decision |
|---|---|
| Streak/heatmap dishonesty | **Relabel honestly, REST only.** No GraphQL path. Count code events, derive window from real coverage, print the source caveat. |
| Three.js `--export` | **Keep**, add fixture tests, document the scene format. It is the bridge to github-3d-visualizer. |
| `engines.node` floor | **`>=20`.** Node 18 is EOL; 22 is too narrow for `npx` reach. |
| Aethereum sync | **Skipped this session.** See Recorded deviation. |
| Owner-gated work | **All deferred to Sprint 7**, per Bruno's instruction. |

### Standing constraints

- Zero new runtime dependencies. commander/chalk/boxen/ora/node-fetch is the ceiling.
- No postinstall scripts, ever.
- Stop and report at every sprint close. Never skip or partially complete a sprint.
- Sprints 0–6 touch **nothing** outside this repo — no npm, no git remote, no portfolio repo.
- Local commits at each sprint close on a working branch. **No `git push` until Sprint 7.**

---

## Sprint 0 — First-run rescue

The single reason the tool feels unfinished: `gitpulse torvalds` with no token hits the 60 req/hr
unauthenticated cap and errors. Only `--token` is honoured.

- [x] `src/api/github.ts` — resolve token from `opts.token || GITHUB_TOKEN || GH_TOKEN`
      (exported as `resolveToken()`, trims blanks so `GITHUB_TOKEN=""` is treated as absent)
- [x] `src/api/github.ts` — rewrite the 403 branch: distinguish primary rate limit, secondary rate
      limit, and bad credentials (401). On rate-limit, print the exact PAT URL, the scopes needed
      (**none**, for public data), and the `export GITHUB_TOKEN=` line to persist it
- [x] `src/index.ts` — add `--demo`, rendering a bundled fixture with **zero network calls**
- [x] `src/__fixtures__/demo-profile.ts` — real captured public snapshot, with a visible
      "fixture captured YYYY-MM-DD" line so it can never read as live data
- [x] `README.md` — token step moves to the top of Installation

**Acceptance gate — PASSED 2026-08-14**
- [x] `--demo` renders a full report offline. Verified by stubbing `globalThis.fetch` to **throw**;
      the report still rendered, proving zero network calls
- [x] env-var token path verified against the live torvalds profile — both `GITHUB_TOKEN` and
      `GH_TOKEN` produce `Grade: B+ (78/100)`
- [x] unauthenticated failure prints a copy-pasteable fix. All four branches verified against a
      stubbed fetch: unauth primary limit, authenticated primary limit, secondary limit, 401
- [x] `npm run build` exit 0 · 33/33 existing tests still green

**As-shipped delta**
- Fixture shipped as `.ts`, not `.json`. `tsc` does not copy JSON into `dist/`, and adding a copy
  step would have meant a build script or a new dependency. A typed TS module compiles for free
  and gives the fixture the same type-checking as the product code.
- **Added an injectable clock**, which the plan did not anticipate. The fixture carries absolute
  timestamps, so `--demo` would have decayed into an empty heatmap within ~3 months. `now` is now
  threaded through `buildProfile` / `generateContributions` / `calculateScore`, and the demo pins it
  to `CAPTURED_AT`. Side benefit: Sprint 4's tests become deterministic for free.
- **Extracted `buildProfile()`** from `fetchUserProfile()` so the demo runs the exact same
  derivation as the network path. Verified: demo and live both produce `B+ (78/100)`.
- 401 handling was not in the plan. Added because telling someone to "use a token" when their token
  is the problem is a dead end — the message now names which source the bad token came from.
- Also honoured `429` alongside `403`, and switched the day-arithmetic in `generateContributions`
  from local-time `setDate` to `setUTCDate` (it was mixing local and UTC day boundaries).

**Deferred**
- Footer URL bug (`gitpulse-cli` → `gitpulse`) and the hardcoded version string are real and known,
  but they belong to Sprint 1's scope. Not fixed here, to keep sprint boundaries honest.
- The fixture is a snapshot of `torvalds` — the profile the README already uses as its example, and
  entirely public data. Flagged for Bruno in case he would rather the shipped demo be his own profile.

---

## Sprint 1 — Truth in the data layer

Every label agrees with the data under it, or it does not ship.

- [ ] `src/utils/scoring.ts` — `generateContributions` counts only code events (`PushEvent`,
      `PullRequestEvent`, `CreateEvent` for branches). Other event types stop being "contributions"
- [ ] Derive the window from actual event coverage instead of the hardcoded 90-day loop; return the
      covered span alongside the days so renderers can label truthfully
- [ ] `src/ui/heatmap.ts` — header derives from that span; **level-0 days render a visible dim
      glyph** so the grid keeps its shape; add `> source: public Events API (last 300 events)`
- [ ] `src/ui/score.ts` — streak section carries `> streak measured within the event window above`
- [ ] `src/ui/languages.ts` — label the column **% of repos**; fix `(1 repos)` → `(1 repo)`
- [ ] `src/index.ts` — footer URL `gitpulse-cli` → `gitpulse`; read version from package.json
- [ ] `src/types/index.ts` — contribution window descriptor. **This is the `UserProfile` contract**
      that aethereum `declare_contract` would have carried; recorded here instead

**Acceptance gate**
- [ ] Rendered against 3 real profiles (high-activity, low-activity, brand-new account) with no
      on-screen label contradicting its own number
- [ ] `--json` reflects the same corrected fields
- [ ] build green · tests green

**As-shipped delta:** _(fill at close)_
**Deferred:** _(fill at close)_

---

## Sprint 2 — SIGNAL visual pass

The output is the product, and it is currently not in Bruno's design system.
Inherits SIGNAL from `~/bruno-portfolio/CLAUDE.md`; no new palette, font, or motion language.

- [ ] Strip **all** emoji from `src/ui/*` — section icons become bracket/box-drawing labels,
      data labels become monospace glyphs
- [ ] Palette collapses to **amber** `#ffb000` (key data, accents), **green** (positive/live/ahead
      values only), grayscale for everything else
- [ ] `src/ui/header.ts` — rainbow gradient wordmark → single-weight amber; subtitle loses its `⚡`
- [ ] `src/ui/stats.ts` — six-colour stat squares → one accent treatment
- [ ] `src/ui/languages.ts` — linguist colours are decoration here, not data; bars go amber with a
      dim tail, the label carries the identity
- [ ] `src/ui/heatmap.ts` — keep the green intensity ramp (a live-value ramp, sanctioned by
      MOTION.md) but reconcile it with the palette
- [ ] Honour `NO_COLOR` and non-TTY across every renderer

**Acceptance gate**
- [ ] Zero emoji anywhere in `src/` (grep-verified)
- [ ] No chalk colour outside {amber, green, gray/dim/white}
- [ ] `NO_COLOR=1` output is clean ASCII with zero escape codes
- [ ] build green · tests green

**As-shipped delta:** _(fill at close)_
**Deferred:** _(fill at close)_

---

## Sprint 3 — MOTION staging

`MOTION.md` is binding. gitpulse currently prints everything at once.

- [ ] `stage(fn, delay)` scheduler in `src/utils/` — renderers already return strings, so staging is
      purely a print-order concern
- [ ] The documented sequence: wordmark instant → profile +120ms → stats count-up → language
      cascade → heatmap column paint → commit patterns → repos → streak → score meter, with the
      grade letter last after a 150ms beat
- [ ] `--no-anim` flag; auto-off when `!process.stdout.isTTY`, `CI`, `NO_COLOR`, `--json`, `--minimal`
- [ ] Brand the ora spinner: `> scanning @username...` with a live `> repos 34/61` counter
- [ ] Cache hit prints `> cached 4m ago — use --no-cache for live` and halves all staging gaps

**Acceptance gate** — folded from MOTION.md
- [ ] Full staged render ≤2.5s after data; cache-hit ≤1.2s
- [ ] Piped / `--json` / `CI=1` output has zero staging, zero spinner frames, zero ANSI under `NO_COLOR`
- [ ] Count-ups never shift column widths (verified against a 6-digit star count)
- [ ] Heatmap column paint verified at 52 columns without flicker (Terminal.app, default size)
- [ ] `--no-anim` produces **byte-identical** final output to the animated path

**As-shipped delta:** _(fill at close)_
**Deferred:** _(fill at close)_

---

## Sprint 4 — Test the product surface

33 tests cover scoring, formatting, cache. `src/api/github.ts` and every `src/ui/*` renderer — the
actual product — have zero coverage.

- [ ] Fixture-based snapshot tests for every renderer, run under `NO_COLOR` for stable output
- [ ] `src/api/github.ts` against a mocked fetch: 200, 404, 403 primary, 403 secondary, 401,
      pagination boundary, Events-API-flaky path
- [ ] `src/ui/export.ts` snapshot test pinning the Three.js scene shape. **This is the export
      contract** that aethereum `declare_contract` would have carried
- [ ] Edge fixtures: zero repos, zero events, one language, 6-digit star counts

**Acceptance gate**
- [ ] Every `src/ui/*` module and `src/api/github.ts` has at least one test
- [ ] Full suite green; snapshots committed

**As-shipped delta:** _(fill at close)_
**Deferred:** _(fill at close)_

---

## Sprint 5 — Repo hygiene + CI

- [ ] `package.json` — add `repository`, `homepage`, `bugs`; `engines.node` → `>=20`; verify
      `files`/`bin`/`prepublishOnly`; confirm **no postinstall**
- [ ] `.eslintrc.json` — disable `no-control-regex` (the 3 errors are correct ANSI-stripping code;
      do not mangle the regexes); clear the 14 unused-import warnings
- [ ] `.github/workflows/ci.yml` — install → lint → build → test on Node 20/22/24
- [ ] `.github/workflows/release.yml` — OIDC trusted publishing on tag, `permissions: id-token: write`,
      provenance automatic. **Authored but not runnable until Sprint 7**

**Acceptance gate**
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `tsc --noEmit` green
- [ ] Workflow YAML validates

**As-shipped delta:** _(fill at close)_
**Deferred:** _(fill at close)_

---

## Sprint 6 — Docs, scoring transparency, demo asset

- [ ] **`SCORING.md`** (required deliverable): every input, every weight, the grade boundaries, and
      an honest "what this does and doesn't measure" section stating the Events-API window
      limitation up front
- [ ] `README.md` rewrite — recorded demo at the top, token step first, honest positioning against
      the real alternatives (`github-stats`, `git-stats`, `ghcal`, `neofetch-profile`), and a note
      that first-run `npx` prompts before installing so it isn't mistaken for a hang
- [ ] Terminal recording generated from `--demo`, committed to the repo as an asset

**Acceptance gate**
- [ ] Every number in README/SCORING.md backed by a committed artifact — no figure from memory
- [ ] Demo asset renders in GitHub's markdown
- [ ] MOTION.md demo checklist item satisfied (≤8s, recorded from `--demo`, top of README)

**As-shipped delta:** _(fill at close)_
**Deferred:** _(fill at close)_

---

## Sprint 7 — Owner-gated (Bruno executes)

Deferred here per Bruno's instruction. The agent prepares exact commands and a checklist and
**runs none of it**. Nothing in Sprints 0–6 touches npm, the git remote, or the portfolio repo.

- [ ] Enrol FIDO/passkey 2FA on the npm account
- [ ] Re-verify `gitpulse` is still free
- [ ] Bootstrap-publish with a granular access token — **required**, because trusted publishing
      cannot be configured for a package that does not yet exist on the registry
- [ ] Configure the trusted publisher on npmjs.com
- [ ] Confirm the OIDC release workflow on a follow-up tag; check the provenance badge appears
- [ ] `git push` the branch / open the PR
- [ ] Update `~/bruno-portfolio` copy, which currently presents gitpulse as shipped

**As-shipped delta:** _(fill at close)_
**Deferred:** _(fill at close)_

---

## Recorded deviation — aethereum sync

`CLAUDE.md` requires `share_intent` / `declare_contract` / `record_decision` / `record_verification`
at every sprint. **Skipped this session at Bruno's explicit direction (2026-08-14).**

Context: the CLI is installed but not on `$PATH` — globally linked as `hive` at
`~/.npm-global/bin`, which is absent from `$PATH` — and gitpulse has no room in
`~/.aethereum/config.json`.

The artifacts that would have been published are recorded in this file instead:
- **Decisions** → the decisions table above
- **Contracts** → the `UserProfile` shape (Sprint 1) and the Three.js export format (Sprint 4)
- **Verifications** → the acceptance gates, filled in at each sprint close
