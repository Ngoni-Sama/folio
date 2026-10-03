import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type {
  Annotation,
  Book,
  HistoryEntry,
  Progress,
} from '@ebook/core';

/** Zustand persist storage backed by IndexedDB (idb-keyval). */
const idbStorage: StateStorage = {
  getItem: async (name) => (await idbGet(name)) ?? null,
  setItem: async (name, value) => {
    await idbSet(name, value);
  },
  removeItem: async (name) => {
    await idbDel(name);
  },
};

interface LibraryState {
  /** Saved books keyed by book id. */
  library: Record<string, Book>;
  /**
   * Metadata for every book ever opened, keyed by id — lets History show
   * books that were read but never explicitly added to the library.
   */
  books: Record<string, Book>;
  /** Reading progress keyed by book id. */
  progress: Record<string, Progress>;
  /** Annotations keyed by book id. */
  annotations: Record<string, Annotation[]>;
  /** Open events, newest first. */
  history: HistoryEntry[];

  addToLibrary: (book: Book) => void;
  removeFromLibrary: (bookId: string) => void;
  isInLibrary: (bookId: string) => boolean;

  setProgress: (bookId: string, cfi: string | null, percentage: number) => void;

  addAnnotation: (a: Annotation) => void;
  removeAnnotation: (bookId: string, id: string) => void;

  logOpen: (book: Book) => void;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set, getState) => ({
      library: {},
      books: {},
      progress: {},
      annotations: {},
      history: [],

      addToLibrary: (book) =>
        set((s) => ({ library: { ...s.library, [book.id]: book } })),

      removeFromLibrary: (bookId) =>
        set((s) => {
          const library = { ...s.library };
          delete library[bookId];
          return { library };
        }),

      isInLibrary: (bookId) => Boolean(getState().library[bookId]),

      setProgress: (bookId, cfi, percentage) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [bookId]: {
              bookId,
              cfi,
              percentage,
              updatedAt: new Date().toISOString(),
            },
          },
        })),

      addAnnotation: (a) =>
        set((s) => ({
          annotations: {
            ...s.annotations,
            [a.bookId]: [...(s.annotations[a.bookId] ?? []), a],
          },
        })),

      removeAnnotation: (bookId, id) =>
        set((s) => ({
          annotations: {
            ...s.annotations,
            [bookId]: (s.annotations[bookId] ?? []).filter((x) => x.id !== id),
          },
        })),

      logOpen: (book) =>
        set((s) => ({
          books: { ...s.books, [book.id]: book },
          history: [
            {
              id: crypto.randomUUID(),
              bookId: book.id,
              openedAt: new Date().toISOString(),
              durationSeconds: 0,
            },
            ...s.history,
          ].slice(0, 200),
        })),
    }),
    {
      name: 'folio-library',
      storage: createJSONStorage(() => idbStorage),
      version: 1,
    },
  ),
);
