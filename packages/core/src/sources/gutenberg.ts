import type {
  Book,
  BookSourceAdapter,
  SearchOptions,
  SearchResult,
} from '../types';

/**
 * Project Gutenberg via its official OPDS search feed
 * (https://www.gutenberg.org/ebooks/search.opds/). 70,000+ public-domain books,
 * all with a direct EPUB.
 *
 * We query gutenberg.org directly rather than the third-party Gutendex API,
 * which has had long outages. gutenberg.org sends no CORS headers, so browsers
 * must pass a same-origin proxy as `baseUrl` (e.g. '/proxy/gutenberg');
 * native clients can use the default.
 *
 * The feed is parsed with plain string matching rather than DOMParser so this
 * module stays usable outside the browser (React Native).
 */
export const GUTENBERG_ORIGIN = 'https://www.gutenberg.org';

export interface GutenbergOptions {
  /** Where to send catalog requests. Defaults to gutenberg.org. */
  baseUrl?: string;
}

interface OpdsEntry {
  id: string;
  title: string;
  author: string | null;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n =
        code[1]?.toLowerCase() === 'x'
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isNaN(n) ? match : String.fromCodePoint(n);
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m?.[1] !== undefined ? decodeXml(m[1].trim()) : null;
}

/** Parse book entries out of an OPDS search feed. Exported for tests. */
export function parseOpdsFeed(xml: string): { entries: OpdsEntry[]; hasNext: boolean } {
  const entries: OpdsEntry[] = [];

  for (const [, body = ''] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    // Book entries have ids like https://www.gutenberg.org/ebooks/1342.opds;
    // navigation entries ("Sort by…", author pages) don't match and are skipped.
    const id = tag(body, 'id')?.match(/\/ebooks\/(\d+)\.opds$/)?.[1];
    const title = tag(body, 'title');
    if (!id || !title) continue;

    // <content> is the author line, or "1158 downloads" when there's no author.
    const content = tag(body, 'content');
    const author = content && !/^\d+ downloads?$/.test(content) ? content : null;

    entries.push({ id, title, author });
  }

  return { entries, hasNext: /<link[^>]*rel="next"/.test(xml) };
}

function normalize(e: OpdsEntry): Book {
  return {
    id: `gutenberg:${e.id}`,
    source: 'gutenberg',
    sourceId: e.id,
    title: e.title,
    author: e.author,
    coverUrl: `${GUTENBERG_ORIGIN}/cache/epub/${e.id}/pg${e.id}.cover.medium.jpg`,
    epubUrl: `${GUTENBERG_ORIGIN}/ebooks/${e.id}.epub.images`,
    language: null,
    description: null,
    subjects: [],
    readOnlineUrl: `${GUTENBERG_ORIGIN}/ebooks/${e.id}`,
  };
}

const PAGE_SIZE = 25;

export function createGutenbergAdapter(
  options: GutenbergOptions = {},
): BookSourceAdapter {
  const base = (options.baseUrl ?? GUTENBERG_ORIGIN).replace(/\/$/, '');

  return {
    source: 'gutenberg',
    label: 'Project Gutenberg',

    async search(query, opts: SearchOptions = {}): Promise<SearchResult> {
      if (!query) return { books: [], hasMore: false, nextPage: null };

      const page = opts.page ?? 1;
      // Gutenberg's search syntax filters language with an "l.<code>" term.
      const q = opts.language ? `${query} l.${opts.language}` : query;
      const params = new URLSearchParams({ query: q });
      if (page > 1) params.set('start_index', String((page - 1) * PAGE_SIZE + 1));

      const res = await fetch(`${base}/ebooks/search.opds/?${params}`, {
        signal: opts.signal,
      });
      if (!res.ok) throw new Error(`Gutenberg search failed: ${res.status}`);

      const { entries, hasNext } = parseOpdsFeed(await res.text());
      return {
        books: entries.map(normalize),
        hasMore: hasNext,
        nextPage: hasNext ? page + 1 : null,
      };
    },

    async getDownloadUrl(book: Book): Promise<string | null> {
      return book.epubUrl;
    },
  };
}

/** Default adapter talking to gutenberg.org directly (no CORS proxy). */
export const gutenberg = createGutenbergAdapter();
