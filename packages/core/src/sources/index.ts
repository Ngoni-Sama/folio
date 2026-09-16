import type { Book, BookSourceAdapter, SearchOptions } from '../types';
import { gutenberg } from './gutenberg';
import { openLibrary } from './openlibrary';

export { gutenberg, openLibrary };

export const adapters: BookSourceAdapter[] = [gutenberg, openLibrary];

const adapterBySource = new Map(adapters.map((a) => [a.source, a]));

export function getAdapter(source: Book['source']): BookSourceAdapter | undefined {
  return adapterBySource.get(source);
}

function dedupeKey(b: Book): string {
  return `${b.title.trim().toLowerCase()}::${(b.author ?? '').trim().toLowerCase()}`;
}

/**
 * Query every approved source in parallel, normalize, and dedupe by
 * title+author. When two sources return the same work, the readable one
 * (direct EPUB) wins so "Read" always works when possible.
 */
export async function searchAll(
  query: string,
  opts?: SearchOptions,
): Promise<Book[]> {
  const settled = await Promise.allSettled(
    adapters.map((a) => a.search(query, opts)),
  );

  const merged = new Map<string, Book>();
  for (const result of settled) {
    if (result.status !== 'fulfilled') continue;
    for (const book of result.value.books) {
      const key = dedupeKey(book);
      const existing = merged.get(key);
      if (!existing || (!existing.epubUrl && book.epubUrl)) {
        merged.set(key, book);
      }
    }
  }

  return [...merged.values()];
}
