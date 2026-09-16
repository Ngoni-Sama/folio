/** Reader-agnostic helpers for progress math and formatting. */

export function clampPercent(p: number): number {
  if (Number.isNaN(p)) return 0;
  return Math.max(0, Math.min(100, p));
}

export function formatPercent(p: number): string {
  return `${Math.round(clampPercent(p))}%`;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** "3 days ago", "just now" — used across history + library. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const seconds = Math.round((then - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (abs >= unitSeconds) {
      return rtf.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return 'just now';
}
