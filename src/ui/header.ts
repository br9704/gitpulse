import { amber, dim, hairline, note, GLYPH, WIDTH } from './theme.js';

const LOGO = `
 ██████╗ ██╗████████╗██████╗ ██╗   ██╗██╗     ███████╗███████╗
██╔════╝ ██║╚══██╔══╝██╔══██╗██║   ██║██║     ██╔════╝██╔════╝
██║  ███╗██║   ██║   ██████╔╝██║   ██║██║     ███████╗█████╗
██║   ██║██║   ██║   ██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝
╚██████╔╝██║   ██║   ██║     ╚██████╔╝███████╗███████║███████╗
 ╚═════╝ ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝`;

export function renderHeader(): string {
  // The wordmark prints in one weight. It used to cycle six hues down its six
  // rows, which is the single loudest thing on screen in a system whose whole
  // premise is restraint.
  const wordmark = amber(LOGO.trim());
  const subtitle = note(`  ${GLYPH.prompt} developer profile report card`);

  return `\n${wordmark}\n${subtitle}\n`;
}

export function renderDivider(width: number = WIDTH): string {
  return hairline(GLYPH.rule.repeat(width));
}

/**
 * A section header, in the instrument voice: an amber label with a hairline rule
 * running to the right margin.
 *
 * This replaces a title line plus a separate full-width divider, and the emoji
 * icon that used to prefix it. One line now does the work of two and carries no
 * decoration.
 */
export function renderSectionTitle(title: string): string {
  const text = title.toUpperCase();
  const ruleLength = Math.max(0, WIDTH - text.length - 3);
  return '\n' + amber.bold(text) + ' ' + hairline(GLYPH.rule.repeat(ruleLength));
}

/** A provenance or caveat line, always prefixed so it reads as machine speech. */
export function renderNote(text: string): string {
  return dim(`  ${GLYPH.prompt} ${text}`);
}
