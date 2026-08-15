# MOTION.md — GITPULSE
# Animation spec for a terminal. Read with `CLAUDE.md`; binding.

> **Amendment 2026-08-15 — green is retired. This document is stale wherever it mentions colour.**
> Two lines below still specify green for positive/live values: the "Inherited language" line and
> the compare-mode rule "the *winning* side's value prints in green. One colour, one meaning:
> ahead." **The CLI now emits no hue at all.** "Ahead" is carried by weight and the `▌` marker
> instead, which preserves the "one meaning" intent while removing the colour. The reason is in
> Sprint E of `masterplan.md`: the portfolio this design inherits from retired its accent, so
> `~/bruno-portfolio/app/globals.css` is greyscale on `#080808` with no amber token, and
> `opengraph-image.tsx` records `ACCENT = '#f5f5f5' // BR95 grayscale (amber retired at D6)`.
> Everything else in this file — the sequence, the timings, the budgets, the waiting states, the
> acceptance gates — is unaffected and still binding. Left in place rather than rewritten, per the
> rule that binding documents get expanded, not replaced.

> A CLI animates with **timing, order, and restraint** — no easing curves, just when each line appears and what moves while you wait. gitpulse currently prints everything at once. Staged output is what turns a wall of text into a report *being generated*, and it's also what makes the asciinema demo watchable.

---

## Inherited language

Terminal loaders `[████████░░░] 72%` · typing cursor for prompts · `>` prefix for machine speech · monochrome + green for positive/live values only · box-drawing structure. **Respect `--json`, `--minimal`, piped output and `NO_COLOR`/`CI` env: all staging and spinners OFF when not a TTY** (`process.stdout.isTTY`) — a script consuming gitpulse must get plain instant output.

---

## The render sequence (full report)

Sections appear in reading order with deliberate pacing — total budget **≤2.5s of staging** after data arrives (network time is separate and covered by the fetch states):

```
t=0      ASCII wordmark            prints instantly, complete (never animate the logo)
t+120ms  Profile block             whole block at once
t+240ms  Statistics                the six stat VALUES count up 0→final over ~350ms,
                                   right-aligned so widths don't shift (pad first)
t+500ms  Languages                 each bar fills left→right over 280ms, one bar starting
                                   60ms after the previous — a cascade, top to bottom
t+900ms  Heatmap                   paints column by column, oldest week → newest,
                                   ~12ms/column — reads as "replaying the year"
t+1.5s   Commit patterns           day rows appear with 40ms stagger; hour sparkline
                                   draws left→right in one 300ms pass
t+1.9s   Top repos                 one repo block per 80ms
t+2.2s   Streak + score            streak prints, then the score meter fills to the
                                   grade over 400ms, percentage counting in sync.
                                   The grade letter is the LAST thing to appear —
                                   it is the punchline and gets a 150ms beat before it.
```

Implementation: a tiny `stage(fn, delay)` scheduler around the existing renderers — the renderers already return strings; staging is purely a print-order concern. `--no-anim` flag (and non-TTY auto-detect) prints everything instantly.

## Waiting states

- **Fetching:** keep ora, but brand it — frames cycle `⠋⠙⠸⠴⠦⠇` with the message `> scanning @username...`; on multi-request profiles append a live counter `> repos 34/61`. Counters, not vibes.
- **Cache hit:** print `> cached 4m ago — use --no-cache for live` in dim, instantly. A cache hit should feel *fast*, so no staging on the wordmark's beat — drop total staging to ~1.2s by halving all gaps.
- **The rate-limit error** (the first-run fix): errors print instantly, no animation ever. Speed is the apology.

## Compare mode

Render both columns' bars in the same cascade, and where the two values differ, the *winning* side's value prints in green. One colour, one meaning: ahead.

## `--demo` flag (from the Sprint 0 fix list)

The demo run uses the exact same staging with a bundled fixture — this *is* the asciinema recording, so the pacing above is also the marketing. Record at 80×32, default theme, and keep the total under 8 seconds including a 2s hold on the final frame.

## Acceptance

- [ ] Full staged render ≤2.5s after data; cache-hit ≤1.2s
- [ ] Piped / `--json` / `CI=1` output has zero staging, zero spinner frames, zero ANSI when `NO_COLOR`
- [ ] Count-ups never shift column widths (verified against a 6-digit star count)
- [ ] Heatmap column paint verified at 52 columns without flicker on a slow terminal (test in Terminal.app at default size)
- [ ] `--no-anim` produces byte-identical final output to the animated path
- [ ] asciinema demo recorded from `--demo`, ≤8s, embedded at the top of the README
