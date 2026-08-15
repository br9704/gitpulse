import chalk from 'chalk';

/**
 * SIGNAL — the inherited design system, monochrome.
 *
 * Source of truth: ~/bruno-portfolio/app/globals.css. Every value below is
 * lifted from that file's custom properties rather than invented here, so the
 * CLI and the site stay one system.
 *
 *   --desktop        #080808   the ground everything sits on
 *   --text-primary   #f5f5f5
 *   --text-secondary #b0b0b0
 *   --text-dim       #8a8a8a
 *   --steel          #2c2c2c
 *   --hairline       #1a1a1a
 *
 * There is no accent hue. The portfolio is black and white — near-black ground,
 * white type, greys for hierarchy — and this renders the same way. Emphasis is
 * carried by weight and by the `▌` marker, never by colour, which is how the
 * site does it too.
 *
 * This supersedes the earlier amber palette. SIGNAL as written said "Amber is
 * THE ONE ACCENT"; the site it describes no longer uses amber anywhere, so the
 * rule was documentation that had outlived the design. MOTION.md's "green for
 * positive/live values" goes with it — see AHEAD below.
 *
 * One inherited constraint worth keeping: `--text-dim` is #8a8a8a and not #666
 * because the portfolio's accessibility audit bumped it to clear AA 4.5:1 on
 * #080808. The old CLI dim (#55504a) did not clear that bar on black. Do not
 * darken these greys without re-checking contrast.
 */

// ── Core palette ────────────────────────────────────────────────────────────
export const PRIMARY = '#f5f5f5';   // --text-primary
export const SECONDARY = '#b0b0b0'; // --text-secondary
export const DIM = '#8a8a8a';       // --text-dim, AA 4.5:1 on #080808
export const HAIRLINE = '#2c2c2c';  // --steel, for structural rules
export const AHEAD = PRIMARY;       // "ahead" in compare mode — weight, not hue

// ── Semantic helpers ────────────────────────────────────────────────────────
export const primary = chalk.hex(PRIMARY);
export const secondary = chalk.hex(SECONDARY);
export const dim = chalk.hex(DIM);
export const hairline = chalk.hex(HAIRLINE);
export const ahead = chalk.hex(AHEAD).bold;

/**
 * Retained so the nine renderers that import it keep compiling. It is plain
 * white now; the name is kept because every call site means "the accent", and
 * renaming 36 of them would be churn for no rendered difference.
 */
export const amber = chalk.hex(PRIMARY);

/** A key figure the eye should land on. Weight does the work, not colour. */
export const value = (s: string) => primary.bold(s);
/** The name of a thing, not the thing itself. */
export const label = (s: string) => secondary(s);
/** Supporting detail, caveats, provenance. */
export const note = (s: string) => dim(s);

/**
 * Greyscale luminance ramp, darkest first.
 *
 * Used for the activity heatmap and the language summary strip — anywhere a
 * magnitude needs encoding. It runs from just above the ground to full white,
 * which is the same dithered light-to-dark language the portfolio's halftone
 * treatment uses, and the same one the `░▒▓█` glyphs already spoke.
 */
export const RAMP = ['#2c2c2c', '#4a4a4a', '#767676', '#b0b0b0', PRIMARY];

export const rampAt = (i: number) => chalk.hex(RAMP[Math.max(0, Math.min(RAMP.length - 1, i))]);

/**
 * Greyscale steps for categorical series (the language strip).
 *
 * Categorical data normally wants distinct hues. There are none here, so rank
 * is encoded as luminance and the label carries the identity — unchanged in
 * principle from the amber version, only the hue is gone.
 */
export const SERIES = ['#f5f5f5', '#c8c8c8', '#9b9b9b', '#6e6e6e', '#4a4a4a', '#2c2c2c'];

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

