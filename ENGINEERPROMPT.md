# Engineer Prompt — GITPULSE
# github.com/br9704/gitpulse · *"Terminal CLI that turns any GitHub profile into a report card."*

> **Setup:** clone the repo into this folder (`git clone https://github.com/br9704/gitpulse.git .`) and paste this as the opening message of a fresh Claude Code session there.
> Read `RESEARCH-CONTEXT.md` in this folder first — it contains a measured audit of the current state. There is no masterplan yet; you will write one.

---

## The headline: the code is finished — the first-run experience is not

**Run it the way the README tells you to and it fails:**
```
$ gitpulse torvalds
× Failed to fetch profile for torvalds
  ✖ Error: GitHub API rate limit exceeded. Resets at 8:00:44 AM.
```
Unauthenticated GitHub is 60 req/hr per IP and is often already exhausted. Only the `--token` flag is honoured — `GITHUB_TOKEN` in the environment is ignored. So a first-time user runs the documented command, gets an error, and concludes the tool is broken. **This is the single reason gitpulse feels unfinished, and it is a ~20-line fix.**

Rendered against a fixture profile, the actual output is genuinely good: ASCII wordmark, aligned two-column stats grid, proportional language bars, a real 7-row `░▒▓█` contribution heatmap, day/hour commit sparklines with a computed peak ("Peak: Wednesdays at 17:00 UTC"), ranked repo list. The product is there. **Nobody can see it.**

Fix in Sprint 0, before anything else: read `GITHUB_TOKEN`/`GH_TOKEN` from env · make the error message tell you exactly how to create a PAT and which scopes (none, for public data) · add a `--demo` flag that renders a fixture profile with zero setup (this doubles as your screenshot and asciinema source) · lead the README with the token step.

Two small real bugs found while rendering: the heatmap prints **"Last 90 days:"** but renders every day it's given, then reports a different active-day count — label and data disagree. And language lines read `82.0% (82 repos)`, which is ambiguous about whether the number is repos or percent of code.

Everything else below is verified by running it:

| Check | Result |
|---|---|
| `npm run build` (tsc strict) | **exit 0, zero errors** |
| `npm test` (vitest) | **33/33 passing**, 3 files, 1.1s |
| TODO / FIXME / stubs in `src/` | **zero** |
| Authorship | **Bruno Jaamaa** — the only one of the three repos genuinely human-authored |
| npm name `gitpulse` | **available** (registry 404) |
| Graceful failure | Rate-limit path tested — clean message + reset time |

2,010 LOC across 19 files. TypeScript strict, ESM, zero runtime bloat. A real 30-min TTL cache with 50-profile eviction. Every UI module implemented.

**This is the single fastest win in Bruno's entire portfolio.** It is one `npm publish` away from being a thing strangers can run. Everything in this prompt is downstream of that.

---

## Phase 1 — Verify and research

1. Clone, install, and independently confirm the audit above. Run the CLI against a real profile with a `GITHUB_TOKEN` set so you see full output, not the rate-limit path.
2. **Look hard at the output**, because the output *is* the product. This is a visual CLI whose entire value is what appears in the terminal. Is it genuinely beautiful? Bruno's design edge should be unmistakable here. Screenshot it.
3. Research current npm publishing requirements — they changed materially in 2025–26 and most guides are stale:
   - **Trusted publishing (OIDC)** from GitHub Actions is now the recommended path; classic tokens were permanently revoked Dec 2025
   - Requires npm ≥ 11.5.1, Node ≥ 22.14.0, `permissions: id-token: write`
   - **Provenance attestations** generate automatically on GH Actions for public repos — a visible badge on the npm page
   - **npm v12 turns lifecycle scripts OFF by default** — confirm nothing depends on postinstall, or `npx gitpulse` breaks for users
   - Confirm FIDO/passkey 2FA is on the account (owner action)
4. Research the competitive landscape briefly: what else renders GitHub profiles in a terminal? Position the README against it honestly.
5. Sanity-check the **"hire-ability score"** feature. A 0–100 score on a stranger's profile is the kind of thing that reads as either charming or presumptuous depending entirely on framing. Look at how it's computed and how it's labelled. If the methodology isn't defensible, either document it openly (a `SCORING.md` explaining every input and weight) or reframe it as something more honest. **A made-up score with no stated method is exactly the credibility problem to avoid.**

## Phase 2 — Questions (AskUserQuestion)

- Publish under `gitpulse` (available) or scoped `@br9704/gitpulse`? Unscoped is better for `npx`.
- Is the hire-ability score staying? If so, document it or soften it — this is the one design decision that could undercut an otherwise clean tool.
- Does the Three.js `--export` feature still earn its place, or is it scope that dilutes a sharp CLI? (It's also the natural bridge to the 3D GitHub Visualizer — possibly worth keeping *because* of that.)
- Is a `GITHUB_TOKEN` documented as required-for-real-use? Unauthenticated is 60 req/hr and users will hit it immediately.

## Phase 3 — Plan mode → write `masterplan.md`

There is no masterplan. Create one, structured as sprints with acceptance gates, following the shape used across Bruno's other projects (status keys `[ ]`/`[~]`/`[x]`/`[⏭]`, a Current-sprint pointer, As-shipped delta + Deferred per sprint). Suggested spine — expand each substantially in plan mode:

- **Sprint 0 — Publish readiness.** Add `repository`, `homepage`, `bugs` to package.json (the npm page currently would have no source link). Fix the 3 lint errors — all the same false positive, `no-control-regex` firing on ANSI-stripping regexes in `src/utils/formatting.ts` and `src/ui/stats.ts`; disable that rule rather than mangle correct code. Verify `files`/`bin`/`engines`/`prepublishOnly`.
- **Sprint 1 — CI + release automation.** GH Actions: install → lint → build → test on Node 20/22/24. Separate release workflow with OIDC trusted publishing + provenance on tag.
- **Sprint 2 — Publish v1.0.** The README badges currently point at a package that doesn't exist and render broken until this lands.
- **Sprint 3 — The demo.** A ~15s asciinema recording or GIF at the top of the README. **This is the highest-conversion single addition to the repo** — a visual CLI documented only with a static ASCII code block is underselling itself badly.
- **Sprint 4 — Test the product surface.** Current 33 tests cover scoring, formatting, cache. Untested: `src/api/github.ts` and every `src/ui/*` renderer — i.e. the output, i.e. the product. Add fixture-based snapshot tests of rendered output.
- **Sprint 5 — Docs + scoring transparency.** `SCORING.md` if the score survives. Token setup documented prominently.
- **Sprint 6 — Distribution.** Portfolio case study unlocked, real screenshot, launch note.

## Phase 4 — Build

Work the masterplan in order. Use **aethereum sync** (`share_intent` per sprint, `declare_contract` for the report-card data shape, `record_decision` on the scoring question, `ask_human` before publishing, `record_verification` at gates). Mark tasks live.

## The bar

`npx gitpulse torvalds` works from any machine, the README opens with a recording of it running, the npm page shows a provenance badge, and the scoring methodology is either documented or gone. Small, sharp, finished, public.

---

## Design language — DO NOT invent one, and do not ask Bruno to design

Bruno has a locked design system. Any UI you build or fix **inherits it**. Never ask him to make a design decision you can answer by reading this; never introduce a new palette, font, or motion language.

**Source of truth:** `~/bruno-portfolio/CLAUDE.md` → "Redesign Design Decisions (2026-07 · SIGNAL)". Read it before touching any visual surface.

**The system — "SIGNAL": a warm-black precision instrument.** Ryoji Ikeda data-minimalism × cassette-futurist hardware × subtle broadcast-CRT texture. It should *operate* like a beautiful old machine — directory listings, keyboard nav, instrument readouts — while staying clean and fast.

```
--bg:             #050505   warm black
--surface:        #0b0a09
--text-primary:   #f0ece4   warm white
--text-secondary: #98928a
--text-dim:       #55504a
--amber:          #ffb000   THE ONE ACCENT (phosphor)
--steel:          #2c2925   visible border
--hairline:       #1b1916   structural rules
```

**Rules, non-negotiable:**
- **Amber is used sparingly** — cursor, status dots, CTAs, focus brackets, key data. Everything else is grayscale on hairline steel.
- **No light theme.** No gradients. No shadows. No colour beyond amber.
- **Border-radius max 2px.** Effectively square.
- **Monospace for data, labels, readouts, ASCII.** Terminal/instrument voice throughout: `</section>` labels, `>` prompt prefixes, `[button →]` brackets, box-drawing `┌─┐│└┘`, loading bars `[████░░░] 72%`.
- **Motion:** ease-out or linear only. No bounce, no spring, nothing over 600ms. Scroll reveals are fade + 16px rise, 400ms, 60ms stagger.
- **No emoji in UI.** If the current code uses emoji as controls, replace them with monospace glyphs or labelled brackets.
- **A11y is a hard rule:** nothing flashes more than 3×/s, `prefers-reduced-motion` means static everything, body text is always real DOM.

If a surface currently looks unstyled or default-browser, that is a bug against this system — fix it by applying the system, not by inventing something new.

---

## MOTION.md is binding

This folder now contains `MOTION.md` — the full animation specification for this project (sequences, timings, per-surface rules, acceptance gates). Read it in Phase 1 alongside the other docs. Its acceptance checklist merges into the relevant sprint gates in the masterplan during Phase 3. Motion here is product behaviour, not polish — the spec is authored; do not invent a different animation language and do not ask Bruno to design one.

---

## Decisions locked (Aug 2026)

- **The hire-ability score STAYS and gets documented.** Bruno's call. `SCORING.md` is now a required deliverable, not an option: every input, every weight, the grade boundaries, and a short "what this does and doesn't measure" section. The score becomes a feature you can defend in an interview instead of a liability.
- Publish target unchanged: `gitpulse` unscoped if still free at publish time; OIDC trusted publishing + provenance.
