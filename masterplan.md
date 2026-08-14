# masterplan.md — GITPULSE

**Source of truth for sequencing.** `CLAUDE.md` is the source of truth for rules.
Precedence on conflict: masterplan (sequencing) > CLAUDE.md (rules) > ENGINEERPROMPT.md (kickoff).

Status keys: `[ ]` not started · `[~]` in progress · `[x]` complete · `[⏭]` deferred (always with a reason).

> **Current sprint: Sprint 6 — Docs, scoring transparency, demo asset**
> _(Sprints 0–5 closed 2026-08-14, gates passed.)_

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

- [x] `src/utils/scoring.ts` — `generateContributions` counts only code events (`PushEvent`,
      `PullRequestEvent`, `CreateEvent` for branches). Other event types stop being "contributions"
- [x] Derive the window from actual event coverage instead of the hardcoded 90-day loop; return the
      covered span alongside the days so renderers can label truthfully
- [x] `src/ui/heatmap.ts` — header derives from that span; **level-0 days render a visible dim
      glyph** so the grid keeps its shape; add the Events API source caveat
- [x] `src/ui/score.ts` — streak section carries `> measured within the N-day event window above`
- [x] `src/ui/languages.ts` — label the column **% of repos**; fix `(1 repos)` → `(1 repo)`
- [x] `src/index.ts` — footer URL `gitpulse-cli` → `gitpulse`; read version from package.json
- [x] `src/types/index.ts` — `ContributionWindow` descriptor added to `UserProfile`

**Acceptance gate — PASSED 2026-08-14**
- [x] Rendered against 4 real profiles with no on-screen label contradicting its own number:
      `torvalds` (30d window / 119 events / 30 active / 30d streak), `sindresorhus`
      (200d / 119 / 15 / 9d), `br9704` (10d / 18 / 5 / 1d), and an account with an empty
      event feed (explicit empty state)
- [x] `--json` reflects the same corrected fields — `contributions.total` equals
      `window.eventCount`, `days[].length` equals `window.spanDays`
- [x] build exit 0 · 39/39 tests green (was 33; +6 for the new window contract)

### CONTRACT — `UserProfile.contributionWindow` v1
The shape other code consumes, recorded here because aethereum `declare_contract` was skipped:
```ts
interface ContributionWindow {
  from: string;            // ISO date of first day represented
  to: string;              // ISO date of last day represented
  spanDays: number;        // inclusive day count; 0 when the feed is empty
  eventCount: number;      // code events counted inside the window
  activeDays: number;      // days with >= 1 code event
  eventsTruncated: boolean;// feed hit the 300-event cap
}
```
Invariants renderers may rely on: `eventCount === sum(days[].count)`,
`activeDays === days.filter(d => d.count > 0).length`, `days.length === spanDays`.

**As-shipped delta**
- **The gate caught a bug the plan itself contained.** My first implementation widened the window to
  GitHub's nominal 90-day retention whenever the 300-event cap was not hit. Rendered against
  `torvalds` that produced a 90-day grid with 60 empty days — but his feed only reaches back 30 days,
  so those 60 days were fabricated inactivity. Exactly the class of lie this sprint exists to remove.
  The window is now bounded by the oldest event actually returned, of any type (a star 60 days ago
  still proves the feed reaches 60 days back, even though a star is not a contribution).
- Two further bugs surfaced only by rendering real profiles, both fixed:
  - `sindresorhus` collided the stats columns — `1.1K (200 original)■ Stars Earned:` — because the
    36-char pad went negative on wide values. Minimum 2-space gutter now enforced.
  - `Current Streak: 1 days`. Pluralised.
- Fixed a latent timezone bug in `src/ui/heatmap.ts`: dates are UTC midnight but the week-grouping
  read `getDay()`, which shifts the entire grid one column west of Greenwich. Now `getUTCDay()`.
- Section renamed "Contribution Heatmap" → **"Code Activity"**. "Contributions" is GitHub's term for
  a specific, different number (the green calendar), and reusing it for an event-feed count invited
  exactly the comparison the data cannot survive.
- Empty-feed accounts get an explicit empty state that distinguishes *no data* from *no activity*.

**Deferred**
- The emoji still in `renderStreak` (🔥🏆📅❄️) and the `▸`/emoji section icons are untouched here —
  they are Sprint 2's scope.
- `--minimal` and `--compare` still print the old streak framing without the window caveat. Sprint 2
  touches both surfaces; the caveat lands there rather than being half-applied now.

---

## Sprint 2 — SIGNAL visual pass

The output is the product, and it is currently not in Bruno's design system.
Inherits SIGNAL from `~/bruno-portfolio/CLAUDE.md`; no new palette, font, or motion language.

- [x] Strip **all** emoji from `src/ui/*` — section icons become label + hairline rules, data
      labels become monospace glyphs
- [x] Palette collapses to **amber** `#ffb000` (key data, accents), **green** (ahead, compare mode
      only), greyscale for everything else
- [x] `src/ui/header.ts` — rainbow gradient wordmark → single-weight amber; subtitle loses its bolt
- [x] `src/ui/stats.ts` — six-colour stat squares → one accent treatment
- [x] `src/ui/languages.ts` — linguist colours are decoration here, not data; bars go amber with a
      dim tail, the label carries the identity
- [x] `src/ui/heatmap.ts` — intensity ramp reconciled with the palette (see decision below)
- [x] Honour `NO_COLOR` and non-TTY across every renderer

**Acceptance gate — PASSED 2026-08-14**
- [x] Zero emoji in **rendered output**, verified across `--demo`, `--minimal`, `--compare` and
      `--json` by testing every codepoint for the Unicode `Emoji_Presentation` property → 0 in all
      four modes
- [x] No chalk colour outside the system: `grep -rn "chalk\."` returns **no hits outside
      `src/ui/theme.ts`**. Every hex in theme.ts is greyscale, an amber-hue luminance step, or the
      single green
- [x] `NO_COLOR=1` and piped output both emit **zero** ANSI escape sequences
- [x] build exit 0 · 39/39 tests green · lint unchanged at the 3 pre-existing errors (13 warnings,
      down from 14) — no new lint debt introduced

### DECISION — reconciling SIGNAL and MOTION on colour
The two binding documents appear to conflict:
- SIGNAL: *"Amber is THE ONE ACCENT. No colour beyond amber."*
- MOTION.md: *"monochrome + green for positive/live values only"*

Resolved by taking MOTION's most specific instruction as the narrow exception to SIGNAL's general
rule. MOTION names green exactly once with a concrete meaning — compare mode, *"One colour, one
meaning: ahead."* So **green means "this side is winning" and nothing else, anywhere in gitpulse.**
The activity heatmap, which is the other candidate for "live values", uses an **amber luminance
ramp** instead: same hue, five steps of brightness. That reads as a CRT phosphor readout, which is
the cassette-futurist instrument SIGNAL describes, and it keeps the one-accent rule intact.
Categorical series (the language strip) encode rank as amber luminance for the same reason — the
label carries identity, so hue does not have to.

**As-shipped delta**
- Introduced `src/ui/theme.ts` as the single source of colour and glyphs. This was not in the plan,
  but "no colour outside the system" is only enforceable if there is one place colour can come from.
  The gate is now a one-line grep instead of a judgement call.
- `renderSectionTitle` now emits **one** line — an amber label with a hairline rule running to the
  right margin — replacing a title line plus a separate full-width divider. Half the structural
  noise for the same structure.
- **Errors render amber, not red.** SIGNAL permits one accent, and amber is the warning colour on
  the instrument panel the system is modelled on.
- **The grade is no longer colour-coded.** It ran green-through-red, which rendered a value
  judgement about a real person in traffic-light colours. The number states itself now.
- Swapped the marker glyph `▪` (U+25AA) for `▌` (U+258C). Both render as text today, but U+25AA
  carries the Unicode `Extended_Pictographic` property and could be substituted by a colour emoji
  font; a block element cannot.
- Extended the Sprint 1 honesty work to the two surfaces Sprint 1 deferred: `--minimal` now carries
  the streak-window qualifier, and `--compare` warns when the two accounts' event windows differ in
  length, which makes their streaks not directly comparable.

**Deferred**
- `src/ui/score.ts` now prints `> methodology and weights: SCORING.md`. **That file does not exist
  until Sprint 6** — this is a live forward reference and Sprint 6 must not close without it.
- The ora spinner has SIGNAL colours but not yet MOTION's branded frames or the `repos 34/61`
  counter. That is Sprint 3's waiting-states scope.
- `src/utils/colors.ts` (GitHub linguist colours) is no longer used by any terminal renderer, but
  remains in use by `src/ui/export.ts` for the Three.js scene, where hue *is* the encoding. Kept.

---

## Sprint 3 — MOTION staging

`MOTION.md` is binding. gitpulse currently prints everything at once.

- [x] `src/utils/anim.ts` — `paint` / `reveal` / `after` scheduler
- [x] The documented sequence: wordmark instant → profile +120ms → stats count-up → language
      cascade → repos → heatmap column paint → commit patterns → streak → score meter, with the
      grade letter last after a beat
- [x] `--no-anim` flag; auto-off when `!process.stdout.isTTY`, `CI`, `NO_COLOR`, `--json`,
      `--minimal`, `--export`
- [x] Brand the ora spinner: `> scanning @username...` with MOTION's `⠋⠙⠸⠴⠦⠇` frames
- [x] Cache hit prints `> cached 13 minutes ago — use --no-cache for live` and halves all gaps

**Acceptance gate — PASSED 2026-08-14**
- [x] Full staged render **1.87s** (demo) and **2.27s** at the capped worst case, against a 2.5s
      budget · cache-hit **1.08s** measured, **1.14s** worst case, against a 1.2s budget
- [x] Piped / `CI=1` / `--json` output: **0.06s** (i.e. process startup only, zero staging), zero
      spinner frames, and **zero** ANSI under `NO_COLOR`. Zero cursor-control escapes leak when
      staging is off
- [x] Count-ups never shift column widths — asserted across 9 progress steps, including the
      six-digit star count MOTION.md names explicitly (`255.7K` is 6 chars, `25.6K` is 5)
- [x] Heatmap column paint at the 52-column ceiling: row count is invariant across all progress
      steps, and each frame is written as **one** `process.stdout.write` (rewind + body in a single
      syscall), which is the flicker mitigation. *Human visual confirmation in Terminal.app remains
      Bruno's to make — an agent cannot see flicker.*
- [x] `--no-anim` produces **byte-identical** final output to the animated path — verified for both
      `--demo` (8,851 bytes / 120 lines) and a live profile (14,412 bytes / 127 lines)

**As-shipped delta**
- **The byte-identity requirement is enforced structurally, not tested after the fact.** Every
  animated renderer takes `progress: number = 1`, and `progress === 1` returns exactly the string
  the static path returns. The animation is therefore incapable of drifting from the real output,
  because the last frame *is* the real output. Four unit tests assert that identity directly.
- Verifying the gate needed a small ANSI emulator: the animated stream contains cursor-rewind
  sequences, so raw bytes differ by construction. The verifier replays the stream through a
  minimal interpreter of the only two sequences gitpulse emits (`\x1b[{n}A`, `\x1b[0J`) and
  compares the resulting screen. Kept in the session scratchpad, not shipped.
- The heatmap's paint duration is **proportional to column count** (MOTION.md's 12ms/column) with a
  560ms ceiling, rather than a fixed duration. A first pass used a fixed 480ms and blew the total
  budget at 2.67s; timings were then trimmed to land at 2.27s worst case.
- `paint()` grew a `finalBeatMs` parameter so the score's 140ms beat happens *inside* the animation.
  Doing it as two separate calls printed the score block twice, because the second call had nothing
  to rewind over.
- Mid-animation frames are clamped to `progress ≤ 0.999`, which is what lets the grade letter be a
  genuine punchline — no intermediate frame can ever reach the reveal.
- Added `src/__tests__/anim.test.ts` (11 tests). Suite is 50, up from 39.

**Deferred**
- The `> repos 34/61` live counter from MOTION.md's fetching state is **not implemented**. It needs
  per-page progress callbacks threaded out of `fetchAllRepos`/`fetchEvents`, and the honest
  position is that the counter would be fiction anyway: the repo total is not known until the
  first page returns, and pagination here is at most 2 requests. The branded frames and the
  `> scanning @username` message are in. Revisit only if the fetch path ever gets slower.
- Terminal.app visual flicker confirmation at 52 columns — owner action, listed in Sprint 7.

---

## Sprint 4 — Test the product surface

33 tests cover scoring, formatting, cache. `src/api/github.ts` and every `src/ui/*` renderer — the
actual product — have zero coverage.

- [x] Fixture-based snapshot tests for every renderer, colour pinned off for stable output
- [x] `src/api/github.ts` against a mocked fetch: 200, 404, 403 primary, 403 secondary, 401, 429,
      500, pagination boundary, Events-API-flaky path, auth-header presence/absence
- [x] `src/ui/export.ts` snapshot test pinning the Three.js scene shape
- [x] Edge fixtures: zero repos, zero events, one language, 6-digit counts

**Acceptance gate — PASSED 2026-08-14**
- [x] Every one of the nine `src/ui/*` modules and `src/api/github.ts` has at least one test,
      verified by grepping each module's import path across `src/__tests__/`
- [x] Full suite green: **116 tests / 6 files**, up from 33 · 18 snapshots committed
- [x] Test run leaves the developer's real `~/.gitpulse/cache` **empty** — asserted after the fact
- [x] build exit 0 · lint unchanged at the 3 pre-existing errors

### CONTRACT — Three.js scene export v1
Pinned by snapshot in `src/__tests__/renderers.test.ts` and asserted structurally: the user node sits
at the origin, every language produces a node connected to the user, and **no connection may
reference a node id that does not exist**. This is the interface `github-3d-visualizer` consumes.

**As-shipped delta**
- **The Three.js export was not reproducible.** `generateThreeJSExport` stamped
  `metadata.generatedAt` from `new Date()`, so the same profile exported different bytes on every
  run — undiffable, uncacheable, and impossible to snapshot. It now takes the timestamp from
  `profile.fetchedAt`. Verified: two runs a second apart now hash identically.
- **`src/__tests__/cache.test.ts` was testing nothing.** It declared a literal object, recomputed
  `Date.now() - cachedAt > ttl` inline, and asserted that the comparison worked. It never imported
  `src/api/cache.ts`. Those two tests counted toward the README's "33 passing" badge and verified no
  product code whatsoever. Replaced with 11 tests against the real module covering round-trip,
  case-insensitivity, corrupt-file recovery, the 30-minute TTL on both sides, `clearCache` for one
  and for all, and the 50-profile eviction cap.
- **`src/api/cache.ts` now honours `GITPULSE_CACHE_DIR`**, resolved per call instead of baked into a
  module-level constant. This was forced by a real incident: the first attempt at cache tests stubbed
  `HOME`, the stub did not take effect, and the run wrote 50 fixtures into the developer's actual
  `~/.gitpulse/cache`. The artifacts were identified by pattern and removed, and the cache is
  30-minute TTL so nothing was lost — but a cache that cannot be redirected cannot be safely tested,
  and that is a product defect, not a test inconvenience. Documented in the README.
- Colour is pinned off globally in `src/__tests__/setup.ts` rather than per-test, so snapshots are
  readable plain text and cannot pass locally while failing in CI.

**Deferred**
- `src/ui/theme.ts` and `src/utils/colors.ts` have no *direct* tests. Both are exercised through
  every renderer snapshot, and neither contains branching logic — theme is constants plus chalk
  wrappers, colors is a lookup table. A direct test would assert that a constant equals itself.
- No end-to-end test drives `src/index.ts` as a subprocess. The MOTION byte-identity check does
  exactly this but lives in the session scratchpad rather than the suite, because it needs a forced
  TTY. Worth promoting to a CI step later; noted, not done.

---

## Sprint 5 — Repo hygiene + CI

- [x] `package.json` — added `repository`, `homepage`, `bugs`; `engines.node` → `>=20.0.0`; verified
      `files`/`bin`/`prepublishOnly`; confirmed **no postinstall/preinstall/install/prepare**
- [x] `.eslintrc.json` — disabled `no-control-regex` (the 3 errors were correct ANSI-stripping code;
      regexes untouched); cleared every warning
- [x] `.github/workflows/ci.yml` — install → lint → typecheck → build → test on Node 20/22/24
- [x] `.github/workflows/release.yml` — OIDC trusted publishing on tag, `id-token: write`,
      provenance automatic. **Authored but not runnable until Sprint 7**

**Acceptance gate — PASSED 2026-08-14**
- [x] `npm run lint` → **0 errors, 0 warnings** (was 3 errors, 14 warnings)
- [x] `tsc` build clean and `npm run typecheck` clean across src *and* tests
- [x] 121 tests green
- [x] Workflow YAML parses; both files structurally checked
- [x] **The packed tarball installs and runs.** `npm pack` → install into a clean directory →
      `./node_modules/.bin/gitpulse --demo` renders the full report, and `--version` reports 1.0.0
      from the installed `package.json`. This is the real proof that `npx gitpulse` will work

**As-shipped delta**
- **Test helpers were shipping inside the published package.** `tsconfig` excluded `**/*.test.ts`,
  but Sprint 4 added `src/__tests__/fixtures.ts` and `setup.ts`, which are not `.test.ts` — so they
  compiled into `dist/__tests__/` and appeared in the tarball. The build now excludes the whole
  test directory, and CI fails if `dist/__tests__` ever reappears.
- That exclusion would have silently stopped type-checking the tests, so added `tsconfig.test.json`
  and an `npm run typecheck` script that checks everything with `noEmit`. **It immediately found
  4 real type errors in the Sprint 4 tests** that vitest's transpile-only execution never sees.
  Both CI and the release workflow now run it.
- Deleted `centerText` from `src/utils/formatting.ts`: zero call sites anywhere in the product.
  Dead code, removed rather than tested, per the zero-bloat rule.
- Added 5 tests for `accountAge`, which was used on every profile block and had no coverage — it
  was one of the unused imports the lint warnings were pointing at. 121 tests now.
- CI does more than build-and-test, because the output is the product: it renders `--demo`, asserts
  the demo makes **zero network calls** (fetch stubbed to throw), and asserts the piped output
  contains no emoji and no ANSI. Those three Sprint 0–2 gates are now enforced on every push
  rather than being one-off checks.
- Release workflow pins the runner to Node 22.14.0 and upgrades to `npm@latest`, because trusted
  publishing needs npm ≥ 11.5.1 — newer than the npm bundled with any current Node. It also fails
  the build if the git tag does not match `package.json`'s version.

**Deferred**
- Source maps and `.d.ts.map` files ship in the tarball (54.4 kB packed / 248.3 kB unpacked, 79
  files). Harmless and useful for debugging, but strippable later if size ever matters.
- The release workflow is **unrunnable until the package exists on npm**. Not a defect — npm does
  not allow configuring a Trusted Publisher for a package that has never been published. Sprint 7
  carries the bootstrap.

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
- [ ] Confirm the heatmap column paint shows no flicker in Terminal.app at 52 columns (MOTION.md
      asks for a human visual check; an agent cannot see flicker)
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
