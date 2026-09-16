/** The legal, public-domain / open-access sources this app supports. */
export type BookSourceId = 'gutenberg' | 'openlibrary' | 'openalex';

/**
 * The normalized shape every source adapter must produce. UI code should only
 * ever see this — never a source-specific payload.
 */
export interface Book {
  /** Stable id, e.g. 'gutenberg:1342'. */
  id: string;
  source: BookSourceId;
  sourceId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  /** Direct EPUB URL when the source exposes one (Gutenberg does). */
  epubUrl: string | null;
  language: string | null;
  description: string | null;
  subjects: string[];
  /** External "read online" link for sources without a direct EPUB. */
  readOnlineUrl: string | null;
}

export interface SearchOptions {
  /** ISO 639-1 language filter, e.g. 'en'. */
  language?: string;
  page?: number;
  signal?: AbortSignal;
}

export interface SearchResult {
  books: Book[];
  hasMore: boolean;
  nextPage: number | null;
}

export interface BookSourceAdapter {
  readonly source: BookSourceId;
  readonly label: string;
  search(query: string, opts?: SearchOptions): Promise<SearchResult>;
  /** Returns a fetchable EPUB URL, or null if the source has none. */
  getDownloadUrl(book: Book): Promise<string | null>;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Annotation {
  id: string;
  bookId: string;
  /** EPUB CFI range for the highlighted excerpt. */
  cfi: string;
  text: string;
  note?: string;
  color: HighlightColor;
  createdAt: string;
}

export interface Progress {
  bookId: string;
  cfi: string | null;
  /** 0–100. Used as a fallback when a stored CFI is invalid. */
  percentage: number;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  bookId: string;
  openedAt: string;
  durationSeconds: number;
}
