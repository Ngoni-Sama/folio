import type { Book } from '@ebook/core';

/**
 * Same-origin path that forwards to www.gutenberg.org (which sends no CORS
 * headers). Served by the Vite dev proxy locally and by the Cloudflare Pages
 * Function in functions/proxy/gutenberg in production.
 */
export const GUTENBERG_PROXY =
  import.meta.env.VITE_EPUB_PROXY ?? '/proxy/gutenberg';

/**
 * Returns a same-origin URL the reader can fetch without hitting CORS, or null
 * if the book has no in-app-readable EPUB.
 */
export function readerUrlFor(book: Book): string | null {
  if (book.source === 'gutenberg') {
    return `${GUTENBERG_PROXY}/ebooks/${book.sourceId}.epub.images`;
  }
  return book.epubUrl; // other sources: only if a direct EPUB exists
}

export function isReadable(book: Book): boolean {
  return readerUrlFor(book) !== null;
}
