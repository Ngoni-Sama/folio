/**
 * DeepSeek-inspired design tokens.
 * Dark-mode-first, minimal, tile-driven. Shared by web (Tailwind) and, later,
 * mobile (NativeWind). Keep this file framework-agnostic — plain values only.
 */
export const colors = {
  bg: '#0A0A0A', // near-black page background
  surface: '#141414', // tile background
  surfaceHi: '#1C1C1C', // hover / elevated
  border: '#262626',
  text: '#EDEDED',
  textMuted: '#8A8A8A',
  accent: '#4D6BFE', // DeepSeek-style electric blue
  accentHi: '#6B84FF',
} as const;

/** Reading-view themes offered by the reader chrome. */
export const readerThemes = {
  dark: { bg: '#0A0A0A', text: '#EDEDED' },
  sepia: { bg: '#F4ECD8', text: '#5B4636' },
  light: { bg: '#FFFFFF', text: '#1A1A1A' },
} as const;

export type ReaderThemeName = keyof typeof readerThemes;

export const radii = {
  tile: '1rem', // rounded-2xl
  pill: '9999px',
} as const;

export const motion = {
  fast: '150ms',
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;
