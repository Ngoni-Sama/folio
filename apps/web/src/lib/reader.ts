import type { Book } from '@ebook/core';

const PROXY = import.meta.env.VITE_EPUB_PROXY ?? '/proxy/gutenberg';

/**
 * Returns a same-origin URL the reader can fetch without hitting CORS, or null
 * if the book has no in-app-readable EPUB. Gutenberg EPUBs are served through
 * the /proxy/gutenberg rewrite (Vite dev proxy + vercel.json in prod).
 */
export function readerUrlFor(book: Book): string | null {
  if (book.source === 'gutenberg') {
    return `${PROXY}/ebooks/${book.sourceId}.epub.images`;
  }
  return book.epubUrl; // other sources: only if a direct EPUB exists
}

export function isReadable(book: Book): boolean {
  return readerUrlFor(book) !== null;
}
