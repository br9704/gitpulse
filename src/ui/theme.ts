import chalk from 'chalk';

/**
 * SIGNAL — the inherited design system.
 *
 * Source of truth: ~/bruno-portfolio/CLAUDE.md, "Redesign Design Decisions
 * (2026-07 · SIGNAL)". A warm-black precision instrument: Ryoji Ikeda
 * data-minimalism crossed with cassette-futurist hardware.
 *
 * Two rules govern colour here, and they come from two documents that have to be
 * read together:
 *
 *   SIGNAL     "Amber is THE ONE ACCENT. No colour beyond amber."
 *   MOTION.md  "monochrome + green for positive/live values only"
 *
 * Reconciled: amber carries every accent — section labels, key values, the
 * score, the activity ramp. Green is reserved for exactly one meaning, the one
 * MOTION.md names explicitly for compare mode: "One colour, one meaning: ahead."
 * A green glyph anywhere in gitpulse means "this side is winning" and nothing
 * else. Everything not amber and not green is greyscale.
 *
 * Ramps are luminance steps within the amber hue, not new colours — that is how
 * intensity gets encoded without breaking the one-accent rule.
 */

// ── Core palette ────────────────────────────────────────────────────────────
export const AMBER = '#ffb000';   // phosphor — the one accent
export const PRIMARY = '#f0ece4'; // warm white
export const SECONDARY = '#98928a';
export const DIM = '#55504a';
export const HAIRLINE = '#2c2925'; // steel, for structural rules
export const AHEAD = '#39d353';    // green — "ahead", compare mode only

// ── Semantic helpers ────────────────────────────────────────────────────────
export const amber = chalk.hex(AMBER);
export const primary = chalk.hex(PRIMARY);
export const secondary = chalk.hex(SECONDARY);
export const dim = chalk.hex(DIM);
export const hairline = chalk.hex(HAIRLINE);
export const ahead = chalk.hex(AHEAD);

/** A key figure the eye should land on. */
export const value = (s: string) => amber.bold(s);
/** The name of a thing, not the thing itself. */
export const label = (s: string) => secondary(s);
/** Supporting detail, caveats, provenance. */
export const note = (s: string) => dim(s);

/**
 * Amber luminance ramp, darkest first.
 *
 * Used for the activity heatmap and the language summary strip — anywhere a
 * magnitude needs encoding. Same hue throughout, so it reads as one instrument
 * rather than as a set of unrelated colours.
 */
export const RAMP = ['#3a3733', '#6b4d00', '#997000', '#cc9100', AMBER];

export const rampAt = (i: number) => chalk.hex(RAMP[Math.max(0, Math.min(RAMP.length - 1, i))]);

/**
 * Distinguishable amber steps for categorical series (the language strip).
 *
 * Categorical data normally wants distinct hues; SIGNAL does not allow them, so
 * rank is encoded as luminance instead and the label carries the identity.
 */
export const SERIES = ['#ffb000', '#d99400', '#b37a00', '#8c6000', '#664600', '#4a3400'];

export const seriesAt = (i: number) => chalk.hex(SERIES[i % SERIES.length]);

/** Total width of the report's structural rules. */
export const WIDTH = 64;

/**
 * Box-drawing and monospace glyphs, in place of the emoji this CLI used to
 * print. SIGNAL forbids emoji outright — they render inconsistently across
 * terminals and read as decoration rather than instrumentation.
 */
export const GLYPH = {
  rule: '─',
  bullet: '·',
  marker: '▌',
  prompt: '>',
  star: '★',
  fork: '⑂',
  updated: '↻',
  divider: '│',
  arrow: '→',
} as const;

/**
 * Every glyph above is text-presentation by default — none carry the Unicode
 * Emoji_Presentation property, so no terminal substitutes a colour emoji font.
 * `▌` is a block element rather than `▪`, and `★`/`⑂`/`↻` are geometric shapes
 * and arrows. The Sprint 2 gate asserts this against rendered output.
 */

