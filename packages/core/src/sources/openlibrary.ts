import type {
  Book,
  BookSourceAdapter,
  SearchOptions,
  SearchResult,
} from '../types';

/**
 * Open Library search (https://openlibrary.org/developers/api).
 * Great for discovery + covers. Most results have no direct EPUB, so they open
 * via an external "read online" link rather than the in-app reader.
 */
const BASE = 'https://openlibrary.org/search.json';
const PAGE_SIZE = 24;

interface OpenLibraryDoc {
  key: string; // e.g. '/works/OL45804W'
  title: string;
  author_name?: string[];
  cover_i?: number;
  language?: string[];
  ebook_access?: 'no_ebook' | 'unclassified' | 'printdisabled' | 'borrowable' | 'public';
  first_sentence?: string[];
}

interface OpenLibraryResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryDoc[];
}

function coverUrl(coverId: number | undefined): string | null {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
}

function normalize(d: OpenLibraryDoc): Book {
  const readable =
    d.ebook_access === 'public' || d.ebook_access === 'borrowable';
  return {
    id: `openlibrary:${d.key.replace(/^\/works\//, '')}`,
    source: 'openlibrary',
    sourceId: d.key,
    title: d.title,
    author: d.author_name?.[0] ?? null,
    coverUrl: coverUrl(d.cover_i),
    epubUrl: null,
    language: d.language?.[0] ?? null,
    description: d.first_sentence?.[0] ?? null,
    subjects: [],
    readOnlineUrl: readable ? `https://openlibrary.org${d.key}` : null,
  };
}

export const openLibrary: BookSourceAdapter = {
  source: 'openlibrary',
  label: 'Open Library',

  async search(query, opts: SearchOptions = {}): Promise<SearchResult> {
    if (!query) return { books: [], hasMore: false, nextPage: null };

    const page = opts.page ?? 1;
    const url = new URL(BASE);
    url.searchParams.set('q', query);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set(
      'fields',
      'key,title,author_name,cover_i,language,ebook_access,first_sentence',
    );
    if (opts.language) url.searchParams.set('language', opts.language);

    const res = await fetch(url, { signal: opts.signal });
    if (!res.ok) throw new Error(`Open Library search failed: ${res.status}`);
    const data = (await res.json()) as OpenLibraryResponse;

    const seen = data.start + data.docs.length;
    return {
      books: data.docs.map(normalize),
      hasMore: seen < data.numFound,
      nextPage: seen < data.numFound ? page + 1 : null,
    };
  },

  async getDownloadUrl(): Promise<string | null> {
    // Open Library does not expose a direct, CORS-friendly EPUB for the reader.
    return null;
  },
};
