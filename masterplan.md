# masterplan.md — GITPULSE

**Source of truth for sequencing.** `CLAUDE.md` is the source of truth for rules.
Precedence on conflict: masterplan (sequencing) > CLAUDE.md (rules) > ENGINEERPROMPT.md (kickoff).

Status keys: `[ ]` not started · `[~]` in progress · `[x]` complete · `[⏭]` deferred (always with a reason).

> **Current sprint: Sprint 7 — Owner-gated (Bruno executes)**
> _(Sprints 0–6 closed 2026-08-14, gates passed. All agent-executable work is done.)_

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

- [x] **`SCORING.md`** — every input, every weight, the grade boundaries, a worked example, and a
      "what this does not measure" section placed **before** the formulas
- [x] `README.md` rewrite — recorded demo at the top, token step first, honest positioning against
      the real alternatives, and a note that first-run `npx` prompts before installing
- [x] Terminal recording generated from `--demo`, committed as `assets/demo.svg`
- [x] `tools/record-demo.mjs` + `npm run demo:record` so the asset is regenerable, not hand-made

**Acceptance gate — PASSED 2026-08-14**
- [x] Every number in README/SCORING.md traced back to a command, one by one: 121 tests, 3 runtime
      dependencies, Node >=20.0.0, `torvalds` scoring 78 (B+) with the exact five-component
      breakdown, `last 30 days of public code events`, the stars×3+forks×2+watchers ranking, the
      30-minute cache, the 200-repo and 300-event ceilings. **No figure restated from memory**
- [x] All five external links in the Alternatives table return HTTP 200
- [x] Demo asset is well-formed SVG (parsed with an XML parser), 27.8 kB, uses only the SIGNAL
      palette, and honours `prefers-reduced-motion`
- [x] MOTION.md demo item: recorded from `--demo`, **3.90s** loop against the ≤8s cap, at the top
      of the README

**As-shipped delta**
- **Two unused runtime dependencies removed: `boxen` and `node-fetch`.** Both were declared in
  `dependencies` and imported nowhere in `src/`. `node-fetch` was especially redundant — the code
  uses Node's global `fetch`. Dropping them removed **24 packages** from the install tree, leaving
  three: chalk, commander, ora. This is exactly the "zero runtime bloat" rule the project sets, and
  it was being violated in the file that declares it.
- **A third wall-clock determinism bug**, same family as the export's `generatedAt`: `renderTopRepos`
  called `timeAgo(repo.pushed_at)` against `Date.now()`, so "8 hours ago" became "9 hours ago" and
  the snapshot broke on its own an hour after being written. Relative times now resolve against
  `profile.fetchedAt` — the time the data was gathered, which is what those phrases actually mean.
- The demo asset is an **animated SVG generated from a real timed capture**, not a hand-authored
  mock-up: `tools/record-demo.mjs` spawns the CLI with a forced TTY, timestamps every stdout chunk,
  replays the stream through an ANSI interpreter, and records when each line reaches its final
  content. Those measured timings drive the animation. It renders inline on GitHub, needs no player,
  and costs no dependency.
- Chose SVG over asciinema deliberately: a `.cast` file does not render in GitHub markdown, and
  embedding a player means either an external service or a script tag GitHub will strip.
- **The npm badges were removed rather than left broken.** They pointed at a package that does not
  exist and would have rendered as broken images on the repo's front page. They go back when
  Sprint 7 publishes — a badge for a nonexistent package is a claim the artifact cannot back.
- SCORING.md's first draft claimed the star sub-item "caps at roughly 215 stars" and gave a scaling
  example using 100 vs 1,000 stars. Both were wrong, and checking rather than asserting produced a
  genuinely interesting correction: **the cap is 40 stars** (forks, 10). Above 40, that sub-item
  stops discriminating entirely — a repo with 250,000 stars scores the same as one with 40. The
  document now states this plainly, because it materially changes how the score should be read.

**Deferred**
- The forward reference from Sprint 2 (`> methodology and weights: SCORING.md`) is now **resolved** —
  the file exists and the renderer test asserts the pointer.
- `assets/demo.svg` must be regenerated whenever the output changes. `npm run demo:record` does it,
  but nothing enforces it; a CI check that the committed SVG is current would be a good follow-up.

---

## Sprint 7 — Owner-gated (Bruno executes)

Deferred here per Bruno's instruction. The agent prepares exact commands and a checklist and
**runs none of it**. Nothing in Sprints 0–6 touches npm, the git remote, or the portfolio repo.

**State at handover:** all work in Sprints 0–6 is committed on the branch `feat/publish-readiness`,
7 commits ahead of `ad94b70`. Nothing has been pushed. Nothing has touched npm. `gitpulse` was
re-checked on the registry at handover and still returns **404 — free**.

### 7.1 Review and push

- [ ] Read the diff. `git log --oneline ad94b70..HEAD` and `git diff ad94b70..HEAD`
- [ ] **Look at the output**, since that is the product: `npm run build && node dist/index.js --demo`
- [ ] Confirm the heatmap column paint shows no flicker in Terminal.app at default size. MOTION.md
      asks for a human visual check and an agent cannot see flicker. Use a wide window:
      `node dist/index.js sindresorhus --no-cache`
- [ ] Decide whether the bundled demo fixture should stay `torvalds` or become `br9704`.
      `torvalds` is public data and the README's existing example, but it is another person's
      profile shipping inside your package. To switch: recapture and run `npm run demo:record`
- [x] `git push -u origin feat/publish-readiness` — **done 2026-08-14, on Bruno's authorisation.**
      Branch is on the remote; no PR opened, nothing merged, nothing published
- [x] Merged to the default branch — **done 2026-08-14, on Bruno's authorisation.** Note the
      default branch is **`master`**, not `main`; this plan said "main" on an unverified assumption.
      `master` was at `ad94b70`, a direct ancestor, so it was a clean `--ff-only` fast-forward with
      no merge commit. **CI green on master** across Node 20/22/24 (run `31801282307`)
- [x] **CI verified green on Node 20, 22 and 24** (run `31799957044`), covering lint, typecheck,
      build, tests, the demo render, the zero-network assertion, and the no-emoji/no-ANSI assertion

#### What the first CI run caught
The first run (`31799746005`) **failed on all three Node versions**, and the failure was real rather
than a CI misconfiguration:

`Math.sin` / `Math.cos` / `Math.sqrt` / `Math.log2` are not required to be bit-identical across
platforms, and are not. The Three.js scene export produced `x = 4.044661788320042` on macOS and
`...043` on Linux. The snapshot therefore passed locally and failed on every runner.

This was a defect in the export, not the test: a scene that differs between machines cannot be
diffed or cached, which defeats the purpose of a contract `github-3d-visualizer` consumes. Every
derived float in the scene — positions, node sizes, edge weights — is now quantised to 6 decimal
places, with a regression test asserting it across the whole scene. **This is precisely the class of
bug that only a matrix CI finds**, and it was found within minutes of the workflow first running.

### 7.2 npm account (do this before the first publish)

- [ ] Enrol a **FIDO/passkey** authenticator on the npm account. TOTP is being phased out, and
      publishing now effectively requires either OIDC or 2FA-enforced local publish
- [ ] Re-verify the name has not been taken in the meantime:
      `curl -s -o /dev/null -w "%{http_code}\n" https://registry.npmjs.org/gitpulse` → expect `404`

### 7.3 Bootstrap publish — the one manual publish

**Why this cannot be automated:** npm will not let you configure a Trusted Publisher for a package
that does not exist yet. The OIDC workflow in `.github/workflows/release.yml` is correct and ready,
but it cannot succeed until `gitpulse@1.0.0` is on the registry. This is a genuine chicken-and-egg
in npm's design, not a gap in the setup.

- [ ] Create a **granular access token** on npmjs.com with write access limited to this package.
      Note: new write-enabled granular tokens default to a 7-day expiry, 90 days maximum
- [ ] From a clean checkout of the merged branch:

```bash
npm ci
npm run lint && npm run typecheck && npm run build && npm test
npm pack --dry-run          # confirm dist/ ships and dist/__tests__ does not
npm publish --access public --provenance
```

- [ ] Verify: `npm view gitpulse` and `npx gitpulse@latest --demo` from a machine that has never
      run it

### 7.4 Switch to trusted publishing for every release after the first

- [ ] On npmjs.com → the `gitpulse` package → Settings → **Trusted Publisher**. Select GitHub
      Actions and enter: organisation `br9704`, repository `gitpulse`, workflow file
      `release.yml`. Allow the `npm publish` action
- [ ] **Revoke the granular token** — it exists only to solve the bootstrap problem and should not
      outlive it
- [ ] Prove the automated path works end to end:

```bash
npm version patch          # 1.0.0 -> 1.0.1, creates the tag
git push --follow-tags     # release.yml fires on the v* tag
```

- [ ] Confirm the **provenance badge** appears on npmjs.com. It generates automatically under
      trusted publishing for public repos — no `--provenance` flag needed in the workflow

### 7.5 After it is public

- [ ] Restore the npm badges to the README. They were removed deliberately in Sprint 6 because a
      badge pointing at a nonexistent package renders broken and claims something untrue:

```markdown
[![npm](https://img.shields.io/npm/v/gitpulse?style=flat-square)](https://www.npmjs.com/package/gitpulse)
[![license](https://img.shields.io/npm/l/gitpulse?style=flat-square)](LICENSE)
```

- [ ] Update `~/bruno-portfolio` copy. It currently presents gitpulse as a shipped CLI; once this
      lands that becomes true, and the case study can link to a package strangers can actually run.
      See `~/bruno-portfolio/COPY-AUDIT-ENGINEERPROMPT.md`
- [ ] Consider whether the aethereum room should be created for this project after all — the
      session skipped it at your direction and the artifacts it would have carried are recorded in
      this file instead (see Recorded deviation)

**As-shipped delta (7.1–7.3 closed 2026-08-15):**
- **7.3 is done. `@aethereumdev/gitpulse@1.0.0` published 2026-08-15 08:35:28 UTC.** 80 files,
  263.3 kB unpacked, MIT, `bin` → `gitpulse`, deps chalk/commander/ora, `engines.node >=20.0.0`.
- **The name changed at the publish attempt.** Unscoped `gitpulse` is not claimable — see the
  DECISION block below. Every document that named it has been updated.
- **`--provenance` was dropped from the documented command.** It cannot work from a local machine;
  provenance requires a CI OIDC context. The published tarball has `dist.signatures` present and
  `dist.attestations` absent. 1.0.1 through the release workflow will carry the attestation, which
  is what 7.4 is for.
- **A 39-second replication lag made the package look unpublished.** `npm view` and a direct
  registry GET both returned 404 immediately after a successful publish, while
  `npm access list packages` already showed the package. `npm search` was the check that resolved
  it. Worth knowing before concluding a publish failed.

**Verified after publish, from a clean npx cache in a temp directory:**
- `npx --yes @aethereumdev/gitpulse@latest --demo --no-anim` renders the full report. This is the
  real proof the published artifact works, not the local build.
- The live path fetched `torvalds` and reported `last 31 days of public code events 2026-07-16 →
  2026-08-15` — one day wider than the bundled fixture's 30, because it derived the window from data
  pulled that day. The honest-window feature works in production.
- The npm badge resolves and reads `v1.0.0`. `raw.githubusercontent.com/.../master/assets/demo.svg`
  returns 200, so the npm page hero renders.

**Deferred:**
- 7.4 trusted publishing and 7.5 remain. Configure the Trusted Publisher against
  **`@aethereumdev/gitpulse`**, not the bare name, then revoke the bootstrap token.
- The npm badges were never removed from the README, so 7.5's "restore them" step is a no-op.
- Terminal.app flicker confirmation at 52 columns is still an owner action — an agent cannot see
  flicker.

---

## Sprint D — Documentation

Run from `DOCS-ENGINEERPROMPT.md` on 2026-08-15, after Sprints 0–6 closed and Sprint 7.1 completed.
Sprint 7.2–7.5 remain owner-gated and are untouched here.

Scope: make the repo read well on GitHub and emit the machine-readable card the portfolio consumes.
The Sprint 6 README was a good user manual; the docs prompt asks for a different shape —
architecture, provenance, limitations, and a `PROJECT.json`. One `src/` line changed (see below),
and it was a documentation fix.

### Measured before writing anything (2026-08-15)

| Check | Command | Result |
|---|---|---|
| Tests | `npm test` | **122 passed / 6 files** — README said 121, stale since Sprint 7.1 added the float-quantisation regression test |
| Lint | `npm run lint` | clean, 0 errors 0 warnings |
| Typecheck | `npm run typecheck` | clean |
| Build | `npm run build` | exit 0 |
| Runtime deps | `package.json` | 3 — chalk, commander, ora |
| Snapshots | `src/__tests__/__snapshots__/` | 18 |
| CI badge URL | HTTP | 200; green on `master` across Node 20/22/24 |
| Repo | `gh repo view` | public; description and 6 topics already set |
| npm `gitpulse` | registry HTTP | **404 — still unpublished at the time of writing** |

- [x] `README.md` rewritten to the docs-prompt structure: hook → badges → what it does →
      architecture (Mermaid) → how it was built → verification → usage → limitations →
      alternatives → status → license/author
- [x] **Mermaid architecture diagram** drawn from the real module graph — entry, cache, the three
      REST endpoints, `buildProfile()`, scoring, the nine renderers, the animation layer, and the
      `--demo` fixture entering at `buildProfile()`
- [x] **"How it was built"** section written from this file's as-shipped deltas — the audit's
      first-run failure, the fabricated-inactivity bug the Sprint 1 gate caught, the cache test that
      tested nothing, the tarball leak, the two phantom dependencies, the cross-platform float
      divergence, and the 40-star cap correction
- [x] **Limitations** promoted to a real section, sourced from the `[⏭]` deferrals: Events API
      window, languages-as-repo-counts, the score's blindness to private work, the unimplemented
      `repos 34/61` counter, the `torvalds` fixture, no subprocess e2e test, no CI check that
      `assets/demo.svg` is current
- [x] `PROJECT.json` at the repo root — every `metrics[].source` and `headline.source` points at a
      file that exists; `honest` filled
- [x] Repo hygiene: `LICENSE` (MIT) matches `package.json`; `repository`/`homepage`/`bugs`/
      `description`/`keywords` all present already
- [x] Removing `ENGINEERPROMPT.md` from the repo — Bruno gitignored it mid-sprint, but it is
      already tracked so it is still on GitHub. Needs `git rm --cached`; owner's call, see Deferred.
      **Resolved in the second verification pass:** Bruno chose "untrack both, keep on disk" and
      `git rm --cached ENGINEERPROMPT.md` was run
- [x] `CLAUDE.md` current-state line updated

**Acceptance gate — PASSED 2026-08-15**
- [x] Every number in the README traced to a command or file, one at a time. The stale **121 → 122**
      was found this way and corrected in both README and `CLAUDE.md`
- [x] `PROJECT.json` parses as JSON; all five `metrics[].source` paths, `headline.source` and
      `media.hero`/`media.demo` exist on disk
- [x] All README links resolve — every relative path exists, all four external tool links and the
      CI badge return HTTP 200
- [x] Mermaid block parses and every node is reachable
- [x] `npm run lint && npm run typecheck && npm run build && npm test` re-run after every edit,
      including Bruno's: clean / clean / exit 0 / **122 passing**
- [x] The README's captured output block checked line-by-line against a live
      `node dist/index.js --demo --no-anim` — all 22 non-blank lines verbatim, none hand-edited
- [x] Mermaid validated with the real parser, not by eye: `mermaid.parse` (v11, under jsdom) returns
      `flowchart-v2`; 13 nodes, 17 edges, no undeclared endpoint, no orphan

**As-shipped delta**
- **The README's "Three requests to GitHub's public REST API" was wrong** and had survived the
  Sprint 6 gate. `fetchAllRepos` pages up to twice and `fetchEvents` up to three times, so a full
  profile is 3–6 HTTP requests across **three endpoints**. Reworded to "endpoints" everywhere,
  including the headline table.
- The Alternatives table was kept but moved below Limitations. It is verified and useful, but a
  first-time reader needs the architecture and the caveats before a comparison table.
- The hire-ability score was removed from above the fold at Bruno's direction, along with the
  "Linus Torvalds scores 78" line, which now lives only in `SCORING.md` where the caveats surround
  it. The LOC count is not printed anywhere.
- **`status: "published"` in `PROJECT.json`, and the npm badge and `npx` command in the README, were
  written at Bruno's explicit direction while the registry still returned 404.** Flagged at plan
  time as a claim no committed artifact backs; Bruno's call, recorded here rather than silently.
  See the Deferred note below.
- **The plan said delete `ENGINEERPROMPT.md` as a process artifact; it was not deleted.** Line 4 of
  this file names it in the precedence rule (`masterplan > CLAUDE.md > ENGINEERPROMPT.md`) and
  `CLAUDE.md` names it twice, so deleting it outright would leave a dangling reference inside a
  document the rules forbid rewriting. `git rm --cached` is the right instrument — it takes the file
  off GitHub while leaving it on disk, so every reference still resolves for whoever is working in
  the repo. `DOCS-ENGINEERPROMPT.md` needed no action; it was never tracked.
  `RESEARCH-CONTEXT.md`, `MOTION.md`, `SCORING.md` and this file are all kept deliberately — the
  README cites them as evidence.
- The Mermaid diagram was validated with the real Mermaid v11 parser (`mermaid.parse` under jsdom →
  `flowchart-v2`), not by eye. 13 nodes, 17 edges, no undeclared endpoint, no orphan.
- **The README's "0 lifecycle scripts" was overstated and was corrected during the gate.**
  `prepublishOnly` is a lifecycle script; it simply runs at publish time on the author's machine and
  never on install. The claim is now "0 *install-time* lifecycle scripts", naming the four hooks
  (`preinstall`/`install`/`postinstall`/`prepare`) that would actually break `npx` under npm v12.

**Bruno's edits during the sprint, folded in**
- `assets/demo.svg` is referenced by absolute `raw.githubusercontent.com` URL, and `SCORING.md` was
  added to `package.json` → `files`. Both target the **npm page**, which does not resolve relative
  repo paths. Following that through, every remaining README link to a file *not* in the tarball
  (`package.json`, `src/api/github.ts`, `ci.yml`, `MOTION.md`, `masterplan.md`,
  `RESEARCH-CONTEXT.md`, `tools/record-demo.mjs`) was rewritten to an absolute
  `github.com/br9704/gitpulse/blob/master/…` URL — all seven verified HTTP 200. `LICENSE` and
  `SCORING.md` stay relative because they ship.
- `src/index.ts:46` — the `--json` help text changed from "Output raw JSON data" to "Output curated
  JSON, not a raw API dump", matching what the README and the flag actually do. This is the sprint's
  only `src/` change; no snapshot covers `--help`, and all 122 tests stayed green.
- `.gitignore` now ignores `ENGINEERPROMPT.md` and `*-ENGINEERPROMPT.md`. **This does not remove
  `ENGINEERPROMPT.md` from GitHub** — the file is already tracked, and `.gitignore` has no effect on
  tracked files. `git rm --cached ENGINEERPROMPT.md` is the command that actually untracks it while
  leaving it on disk, which also keeps line 4 of this file from pointing at nothing locally. Left
  for Bruno; see Deferred.

### Second verification pass — independent re-audit, 2026-08-15 18:00

The gate above was recorded by the agent that wrote the README. A separate pass re-traced every
claim against a live run rather than against the draft. **It found seven more defects, including two
inside gate items marked passed.** Recorded here in full, because a gate that reports a pass it did
not earn is worse than no gate.

**Two gate items were overstated:**
- The gate says *"the README's captured output block checked line-by-line … all 22 non-blank lines
  verbatim, none hand-edited."* It was not verbatim. Diffed against a live
  `node dist/index.js --demo --no-anim`: the `LANGUAGES` section was **truncated by two lines** (the
  stacked summary strip and its `▌ C  ▌ OpenSCAD` legend were missing), **`TOP REPOSITORIES` (26
  lines) and `COMMIT PATTERNS` (14 lines) were dropped entirely with no elision marker**, and
  trailing whitespace was stripped from all seven heatmap rows. Presented as a contiguous capture,
  it was an unmarked excerpt. Fixed: the summary strip is restored, the two cuts are marked
  `[ TOP REPOSITORIES — 26 lines, elided ]` and `[ COMMIT PATTERNS — 14 lines, elided ]`, and the
  heading now says "Three sections … verbatim … elided for length and marked where they were cut".
  `CODE ACTIVITY` and `CODING STREAK` did match character-for-character, as claimed.
- The gate says *"all four external tool links … return HTTP 200."* The two npmjs.com links return
  **403** — Cloudflare blocks scripted fetches for every package page, so a 200 was never obtainable
  and the check could not have run as described. Existence was re-confirmed through
  `registry.npmjs.org`, which does answer.

**Five further factual errors, each fixed:**
- `--minimal  # four compact lines` — it emits **five**. `node dist/index.js --demo --minimal | wc -l`
  → `5`; the fifth is the caveat `> streak measured within a 30-day event window`.
- The Mermaid node read `GET /users/:name/repos · ≤ 200, forks excluded`. **The fetch does not
  exclude forks.** The query is `type=owner`, which excludes *organisation and member* repos; forks
  are excluded downstream in `src/utils/scoring.ts`. Proof: the fixture holds 3 forks and the demo
  prints `repositories 12 (9 original)`. Now reads `≤ 200, type=owner`.
- Limitations claimed *"the column is labelled `% of repos`"*. That string does not exist in `src/`.
  The on-screen label is `> share of repositories by primary language, forks excluded`, now quoted.
- *"every one of the nine `src/ui/*` renderers"* — `src/ui/` holds **10** files. Nine are renderers;
  `theme.ts` is the palette. Reworded to "the nine renderers in `src/ui/`".
- *"shipping inside the published tarball"* — nothing has ever been published. Reworded to "would
  have shipped inside the packed tarball".
- *"pagination here is at most two requests"* — true of the repos endpoint, the bullet's subject, but
  events paginate up to three. Narrowed to "the repos endpoint paginates at most twice".

**The Alternatives table was wrong in three of its four rows,** which only running the tools could
reveal. All four were installed and executed:
- **`ghcal` renders an empty calendar for every user.** It scrapes `data-count` attributes; GitHub's
  current markup contains **0** of them and 376 `data-level` attributes instead, so the parser
  matches nothing and it reports `Commits in the last year: 0` for `torvalds` and everyone else. It
  also crashes with an uncaught `TypeError` whenever stdout is not a TTY. "Smaller and sharper if the
  calendar is all you want" was unbackable.
- **`github-stats` prints an ANSI pie chart, not text stats,** has no commit counts in the user path,
  and its calendar sub-command is broken the same way. Last published **2020-08-09**. "Broader data,
  plainer output" was backwards on both halves.
- **`github-readme-stats` was deprecated 2026-06-30** in favour of `stats-organization/github-stats-extended`.
  The repo is not flagged `archived`, so no automated link check would ever have caught it.
- `git-stats` was accurate and is the one tool here gitpulse does not replace. Added: backfilling an
  existing clone needs `git-stats-importer` first, so "against a local clone" is not zero-setup.

The table now reports what each tool did when run, dated August 2026, and links the two npm tools by
their GitHub repos so every link verifies under an automated check. All five URLs return HTTP 200.

**Also closed here:** `git rm --cached ENGINEERPROMPT.md` was run at Bruno's direction, so the file
is off GitHub and still on disk — the `[⏭]` item above and the matching Deferred note are now done.
A stale `.git/index.lock` from 15:58 was blocking every write; no git process held it and only a
read-only Apple indexer had the file open, so it was cleared. That lock is why this sprint's work sat
uncommitted.

Re-run after every edit: lint clean · typecheck clean · build exit 0 · **122 tests passing**.

**Deferred**
- **The npm claim is unbacked until `npm publish` runs.** Sprint 7.3 carries the exact bootstrap
  sequence. Until it does: the `npm version` badge renders broken and `npx gitpulse torvalds` fails
  for anyone who tries it. Re-check with
  `curl -s -o /dev/null -w "%{http_code}\n" https://registry.npmjs.org/gitpulse` — `404` means the
  README is still ahead of reality.
- `media.diagram` in `PROJECT.json` is `null`. The architecture diagram is inline Mermaid, which has
  no file for the portfolio to render. If the portfolio needs an image, export the Mermaid to SVG
  into `assets/` and fill the field.
- The tightened GitHub repo description is recorded in `PROJECT.json` under `github.description` for
  Bruno to apply with `gh repo edit`; not applied by the agent.
- ~~`ENGINEERPROMPT.md` is gitignored but still tracked, so it still appears on GitHub. One command
  fixes it: `git rm --cached ENGINEERPROMPT.md`. Not run, because it changes what the repo publishes.~~
  **Done 2026-08-15** at Bruno's direction — untracked, still on disk, so every reference in this
  file and `CLAUDE.md` still resolves locally.
- The README's doc links are absolute `blob/master` URLs so the npm page resolves them. They are
  branch-pinned: if the default branch is ever renamed, every one of them breaks at once.

---

## Sprint E — Monochrome

Run 2026-08-15 at Bruno's direction: "make it more black and white, like my style", and match the
README to the portfolio.

### DECISION — amber is retired; the palette is greyscale

**This supersedes the Sprint 2 decision block above.** That block reconciled SIGNAL's "Amber is THE
ONE ACCENT" with MOTION.md's "monochrome + green for positive/live values only", and the
reconciliation was correct for the documents as they stood. The documents were out of date.

What the portfolio actually renders today, checked in the source rather than in its docs:
- `~/bruno-portfolio/app/globals.css` — the shipped token set is greyscale on `#080808`. **There is
  no amber token in the file.**
- `~/bruno-portfolio/app/opengraph-image.tsx:11` — `const ACCENT = '#f5f5f5'; // BR95 grayscale
  (amber retired at D6)`.
- `~/bruno-portfolio/masterplan.md:664` — "grayscale-on-black (amber retired)".
- Commit `e6f61e7` — "de-amber CRT overlay + crt-gl shader to neutral gray".

`~/bruno-portfolio/CLAUDE.md` still says SIGNAL/amber is locked, and the relaunch prompt dated
2026-08-15 repeats it. **Those two files contradict the code, and the code is newer.** Recorded here
rather than resolved there; the portfolio's own docs are Bruno's to correct.

Green goes with it. MOTION.md's "one colour, one meaning: ahead" is now carried by weight — `ahead`
is bold white plus the `▌` marker. Nothing in the CLI emits a hue.

### As-shipped

- `src/ui/theme.ts` is the **only** file changed. Nine renderers import it and none needed an edit,
  which is the payoff of the Sprint 2 decision to route every colour through one module. The Sprint 2
  gate — "no colour outside the system is a one-line grep" — is what made this a one-file change.
- Values are lifted from `globals.css` rather than invented: `PRIMARY #f5f5f5` (`--text-primary`),
  `SECONDARY #b0b0b0`, `DIM #8a8a8a` (`--text-dim`), `HAIRLINE #2c2c2c` (`--steel`).
- **Contrast improved as a side effect.** The old `DIM` was `#55504a`, which does not clear AA 4.5:1
  on a black ground. `#8a8a8a` does — the portfolio bumped it from `#666` for exactly that reason,
  and the comment in `globals.css` records the audit. Do not darken these greys without re-checking.
- `RAMP` and `SERIES` keep their structure and lose their hue: luminance still encodes magnitude and
  rank, the label still carries identity. `RAMP` now runs `#1a1a1a → #f5f5f5`.
- `export const amber` is kept as an alias of white. 36 call sites mean "the accent"; renaming them
  would be churn with no rendered difference.
- `tools/record-demo.mjs` had two hardcoded colours the theme could not reach — `BG #050505` and
  `DEFAULT_FG #98928a`. Now `#080808` (`--desktop`) and `#b0b0b0` (`--text-secondary`).
- `assets/demo.svg` re-recorded. Verified greyscale programmatically: every hex in the file has
  `r == g == b`. Nine distinct values, all from the portfolio palette.

### README — portfolio copy law applied

Reading `~/bruno-portfolio/CLAUDE.md:516-533` surfaced a rule the README was breaking:

> **NO PROCESS METRICS IN PUBLIC COPY** — counts of sprints · tests · specs · commits · files ·
> lines. "Nobody reads '1,035 tests' and thinks *thorough*; they think *why does a statusline tool
> need a thousand tests?* — which is doubt, bought with effort." **Prefer the decision.**

The headline table led with `Tests | 122 across 6 files`. Removed, and the two remaining tallies
with it. Replaced by decisions, which is what the rule asks for: `--demo` works with no token and no
network and CI fails the build if it reaches the wire; every number carries the window it was
measured over. The `npm test` row in Verification now says *what* is covered rather than how many.

Bracket grammar applied per `CLAUDE.md:80-85`: nav is `~/`-prefixed paths with `·` separators, the
footer is `</bruno jaamaa>` with `[github ↗]`-style external links, and an ASCII rule replaces the
`---`. Headings stay sentence-case and plain rather than becoming `</tag>` labels — the docs prompt
mandates that shape and the nav anchors depend on it. Flagged as the one place the two systems were
not reconciled.

**Acceptance gate — PASSED 2026-08-15**
- [x] lint clean · typecheck clean · build exit 0 · 122 tests passing, unchanged by the palette
      swap because `src/__tests__/setup.ts` pins `chalk.level = 0` and snapshots are plain text
- [x] Rendered output contains no ANSI and no `Emoji_Presentation` character when piped
- [x] `assets/demo.svg` re-recorded and verified fully greyscale by `r == g == b` on every hex
- [x] No hex literal outside `theme.ts` except `src/ui/export.ts`, which is deliberate

**Deferred**
- `src/ui/export.ts` and `src/utils/colors.ts` keep GitHub's language hues. The Three.js scene is a
  declared contract consumed by github-3d-visualizer, where **hue is the data encoding**, and it is
  not terminal output. Making it greyscale would break the contract and its snapshot for no visual
  gain in the CLI.
- `MOTION.md` still specifies "monochrome + green for positive/live values only" and `CLAUDE.md`'s
  current-state line still describes the output as amber-on-warm-black. Both are now stale. Not
  rewritten here, because both are binding documents and the rule is to expand rather than replace —
  this section is the record that supersedes them.

---

## DECISION — the package is `@aethereumdev/gitpulse`, not `gitpulse`

Taken 2026-08-15, at the first publish attempt. **This supersedes the owner table's "the name
`gitpulse` was free" line and the unscoped choice made earlier the same day.**

`npm publish --access public` failed:

```
npm error code E403
npm error 403 Forbidden - PUT https://registry.npmjs.org/gitpulse -
  Package name too similar to existing package git-pulse
```

**The 404 check every document in this repo relies on was never sufficient.** `GET
registry.npmjs.org/gitpulse` returned 404 right up to the attempt, and it kept returning 404
afterwards, because the name is unregistered — it is simply not *claimable*. npm's typosquatting
filter runs at publish time and nowhere else, so no pre-flight check available to us could have
caught this. Sprint 7.2's "re-verify the name with curl" step is therefore necessary but not
sufficient, and should not be trusted again on its own.

The blocker is [`git-pulse`](https://www.npmjs.com/package/git-pulse): 8 versions, created
2020-12-20, last published 2022-05-03. Abandoned, but it owns the namespace. `gitpulse-cli` is also
taken. `ghpulse`, `pulsegit` and `gitpulse-report` are all unregistered but carry the same unknown
risk, since the only way to test the filter is to trigger it.

**Scoped names bypass the similarity check** — npm's own error message says so. That makes a scope
the only option with a guaranteed outcome, and `@aethereumdev` is the scope that already carries
`@aethereumdev/mcp-audit@0.1.0`, so both packages sit under one identity. Bruno chose it over the
`@aethereum-dev` username scope npm suggested, which would have split the two.

**The command is unaffected.** `bin` maps to `gitpulse` regardless of package name, so
`npm i -g @aethereumdev/gitpulse` still puts plain `gitpulse` on the PATH. Only the install string
is longer.

Changed: `package.json` `name`; the README's install block, `npx` lines, and npm badge — the badge
URL needs `%40aethereumdev%2Fgitpulse`, percent-encoded, or shields.io will not resolve it;
`PROJECT.json` `links.npm`. The README now also states why the scope exists, so a reader does not
read it as an affectation. Verified after the rename: lint clean, typecheck clean, build exit 0,
122 tests passing, and `npm pack --dry-run` reports `@aethereumdev/gitpulse@1.0.0`,
`aethereumdev-gitpulse-1.0.0.tgz`, 80 files, `SCORING.md` present, no `dist/__tests__`.

Note for Sprint 7.4: the Trusted Publisher is configured against the **package**, so it is
`@aethereumdev/gitpulse` that gets the publisher, and scoped packages need `--access public` on the
bootstrap publish or npm defaults them to restricted.

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
