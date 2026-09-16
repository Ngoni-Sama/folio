import type { Annotation, HighlightColor } from '../types';

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#F5D90A',
  green: '#3FB950',
  blue: '#4D6BFE',
  pink: '#F778BA',
};

/** Export a book's annotations as Markdown, sorted by document location (CFI). */
export function annotationsToMarkdown(
  bookTitle: string,
  annotations: Annotation[],
): string {
  const sorted = [...annotations].sort((a, b) => a.cfi.localeCompare(b.cfi));
  const lines = [`# Notes — ${bookTitle}`, ''];

  for (const a of sorted) {
    lines.push(`> ${a.text.trim()}`);
    if (a.note) lines.push('', a.note.trim());
    lines.push('', `*(${a.color} · ${new Date(a.createdAt).toLocaleString()})*`, '', '---', '');
  }

  return lines.join('\n');
}
