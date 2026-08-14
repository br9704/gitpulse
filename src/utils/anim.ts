/**
 * Staging for a terminal.
 *
 * MOTION.md: "A CLI animates with timing, order, and restraint — no easing
 * curves, just when each line appears and what moves while you wait."
 *
 * The load-bearing constraint is MOTION.md's acceptance criterion that
 * `--no-anim` produce byte-identical final output to the animated path. That is
 * enforced structurally rather than by inspection: every animated renderer takes
 * a `progress` argument in [0,1], and `progress === 1` returns exactly the string
 * the static path returns. The animation is therefore incapable of drifting from
 * the real output — the last frame IS the real output.
 */

/** Total staging budget after data arrives, per MOTION.md. */
export const TOTAL_BUDGET_MS = 2500;

/** Cache hits halve every gap, so a cache hit feels fast. */
export const CACHE_HIT_SCALE = 0.5;

export interface AnimationContext {
  enabled: boolean;
  /** Multiplier applied to every delay. 0.5 on a cache hit. */
  scale: number;
}

/**
 * Staging is off unless we are painting to a real terminal a human is watching.
 *
 * A script consuming gitpulse must get plain, instant output — so anything that
 * signals "not an interactive human" turns the whole thing off.
 */
export function resolveAnimation(opts: {
  noAnim?: boolean;
  json?: boolean;
  minimal?: boolean;
  export?: boolean;
  cacheHit?: boolean;
}): AnimationContext {
  const enabled =
    !opts.noAnim &&
    !opts.json &&
    !opts.minimal &&
    !opts.export &&
    Boolean(process.stdout.isTTY) &&
    !process.env.CI &&
    !process.env.NO_COLOR;

  return { enabled, scale: opts.cacheHit ? CACHE_HIT_SCALE : 1 };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Move the cursor up `n` lines and clear from there down. */
function rewind(n: number): string {
  return n > 0 ? `\x1b[${n}A\x1b[0J` : '\x1b[0J';
}

/**
 * Paint a block that changes content between frames (count-ups, filling bars).
 *
 * Each frame rewinds over the previous one, so the terminal ends holding exactly
 * the final frame. `render(1)` is always the last thing written.
 */
export async function paint(
  ctx: AnimationContext,
  render: (progress: number) => string,
  durationMs: number,
  frameMs: number = 40,
  /** A pause held on the last pre-final frame, before the final frame lands. */
  finalBeatMs: number = 0,
): Promise<void> {
  const final = render(1);

  if (!ctx.enabled || durationMs <= 0) {
    process.stdout.write(final + '\n');
    return;
  }

  const duration = durationMs * ctx.scale;
  const frames = Math.max(1, Math.round(duration / frameMs));
  let previousLines = 0;

  for (let i = 1; i <= frames; i++) {
    const isFinal = i === frames;
    // Never let a mid-animation frame reach progress 1 — the final frame is the
    // only one allowed to reveal a "punchline" element such as the grade letter.
    const text = isFinal ? final : render(Math.min(0.999, i / frames));

    if (isFinal && finalBeatMs > 0) await sleep(finalBeatMs * ctx.scale);

    process.stdout.write(rewind(previousLines) + text + '\n');
    previousLines = text.split('\n').length;
    if (!isFinal) await sleep(frameMs);
  }
}

/**
 * Reveal a static block one line at a time. Purely additive — no rewinding, so
 * the bytes written are the bytes of the finished block plus the pauses.
 */
export async function reveal(
  ctx: AnimationContext,
  text: string,
  perLineMs: number,
): Promise<void> {
  if (!ctx.enabled || perLineMs <= 0) {
    process.stdout.write(text + '\n');
    return;
  }

  const lines = text.split('\n');
  for (const line of lines) {
    process.stdout.write(line + '\n');
    await sleep(perLineMs * ctx.scale);
  }
}

/** Print a finished block after a beat. */
export async function after(ctx: AnimationContext, delayMs: number, text: string): Promise<void> {
  if (ctx.enabled && delayMs > 0) await sleep(delayMs * ctx.scale);
  process.stdout.write(text + '\n');
}

/**
 * Interpolate a counter toward its final value.
 *
 * Returned padded to the final string's width so a count-up can never change a
 * column's width mid-animation — MOTION.md calls this out explicitly, and a
 * six-digit star count is the case that breaks naive implementations.
 */
export function countUp(finalValue: number, progress: number, format: (n: number) => string): string {
  const finalText = format(finalValue);
  if (progress >= 1) return finalText;
  return format(Math.round(finalValue * progress)).padStart(finalText.length);
}
