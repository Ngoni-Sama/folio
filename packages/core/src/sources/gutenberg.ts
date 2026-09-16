import type {
  Book,
  BookSourceAdapter,
  SearchOptions,
  SearchResult,
} from '../types';

/**
 * Project Gutenberg via the Gutendex API (https://gutendex.com/).
 * 70,000+ public-domain books, most with a direct EPUB URL.
 */
const BASE = 'https://gutendex.com/books';

interface GutendexAuthor {
  name: string;
}

interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  subjects: string[];
  languages: string[];
  formats: Record<string, string>;
}

interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

function pickCover(formats: Record<string, string>): string | null {
  return formats['image/jpeg'] ?? null;
}

function pickEpub(formats: Record<string, string>): string | null {
  const key = Object.keys(formats).find((k) =>
    k.startsWith('application/epub+zip'),
  );
  return key ? (formats[key] ?? null) : null;
}

function normalize(b: GutendexBook): Book {
  return {
    id: `gutenberg:${b.id}`,
    source: 'gutenberg',
    sourceId: String(b.id),
    title: b.title,
    author: b.authors[0]?.name ?? null,
    coverUrl: pickCover(b.formats),
    epubUrl: pickEpub(b.formats),
    language: b.languages[0] ?? null,
    description: null,
    subjects: b.subjects.slice(0, 6),
    readOnlineUrl: `https://www.gutenberg.org/ebooks/${b.id}`,
  };
}

export const gutenberg: BookSourceAdapter = {
  source: 'gutenberg',
  label: 'Project Gutenberg',

  async search(query, opts: SearchOptions = {}): Promise<SearchResult> {
    const url = new URL(BASE);
    if (query) url.searchParams.set('search', query);
    if (opts.language) url.searchParams.set('languages', opts.language);
    if (opts.page && opts.page > 1) {
      url.searchParams.set('page', String(opts.page));
    }

    const res = await fetch(url, { signal: opts.signal });
    if (!res.ok) throw new Error(`Gutenberg search failed: ${res.status}`);
    const data = (await res.json()) as GutendexResponse;

    return {
      books: data.results.map(normalize),
      hasMore: Boolean(data.next),
      nextPage: data.next ? (opts.page ?? 1) + 1 : null,
    };
  },

  async getDownloadUrl(book: Book): Promise<string | null> {
    return book.epubUrl;
  },
};
