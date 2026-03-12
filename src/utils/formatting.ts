/**
 * Format a number with K/M suffixes for compact display
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/**
 * Format a date string to relative time (e.g., "3 months ago")
 */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Create a sparkline from an array of numbers
 */
export function sparkline(values: number[]): string {
  const chars = '▁▂▃▄▅▆▇█';
  if (values.length === 0) return '';
  
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  
  return values
    .map(v => {
      const idx = Math.round(((v - min) / range) * (chars.length - 1));
      return chars[idx];
    })
    .join('');
}

/**
 * Create a progress bar
 */
export function progressBar(value: number, max: number, width: number = 20): string {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Pad a string to a given width
 */
export function padRight(str: string, width: number): string {
  // Strip ANSI codes for length calculation
  const stripped = str.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, width - stripped.length);
  return str + ' '.repeat(pad);
}

/**
 * Truncate string to max length with ellipsis
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Get percentage string
 */
export function percent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

/**
 * Center text within a given width
 */
export function centerText(text: string, width: number): string {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((width - stripped.length) / 2));
  return ' '.repeat(pad) + text;
}

/**
 * Calculate account age in years
 */
export function accountAge(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const years = (now.getTime() - created.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 1) {
    const months = Math.floor(years * 12);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const y = Math.floor(years);
  return `${y} year${y !== 1 ? 's' : ''}`;
}
