import { createAdapters, type Book } from '@ebook/core';
import { GUTENBERG_PROXY } from './reader';

// Gutenberg's catalog goes through the same-origin proxy (no CORS upstream).
const adapters = createAdapters({ gutenbergBaseUrl: GUTENBERG_PROXY });

export interface SearchPage {
  books: Book[];
  hasMore: boolean;
  nextPage: number | null;
}

/** A single slow source must not block results from the others. */
const PER_SOURCE_TIMEOUT_MS = 8000;

function timedSignal(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(PER_SOURCE_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function dedupeKey(b: Book): string {
  return `${b.title.trim().toLowerCase()}::${(b.author ?? '').trim().toLowerCase()}`;
}

/**
 * Fetch one page from every approved source in parallel, then merge + dedupe.
 * The readable copy (direct EPUB) wins on collisions.
 */
export async function searchPage(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<SearchPage> {
  const settled = await Promise.allSettled(
    adapters.map((a) => a.search(query, { page, signal: timedSignal(signal) })),
  );

  const merged = new Map<string, Book>();
  let hasMore = false;

  for (const result of settled) {
    if (result.status !== 'fulfilled') continue;
    hasMore = hasMore || result.value.hasMore;
    for (const book of result.value.books) {
      const key = dedupeKey(book);
      const existing = merged.get(key);
      if (!existing || (!existing.epubUrl && book.epubUrl)) {
        merged.set(key, book);
      }
    }
  }

  return {
    books: [...merged.values()],
    hasMore,
    nextPage: hasMore ? page + 1 : null,
  };
}
