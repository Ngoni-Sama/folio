import { create } from 'zustand';
import type { Book } from '@ebook/core';

export type View = 'search' | 'detail' | 'reader' | 'library' | 'history';

interface UiState {
  view: View;
  query: string;
  activeBook: Book | null;

  setQuery: (q: string) => void;
  goSearch: () => void;
  openDetail: (book: Book) => void;
  openReader: (book: Book) => void;
  goLibrary: () => void;
  goHistory: () => void;
}

export const useUi = create<UiState>((set) => ({
  view: 'search',
  query: '',
  activeBook: null,

  setQuery: (q) => set({ query: q }),
  goSearch: () => set({ view: 'search' }),
  openDetail: (book) => set({ view: 'detail', activeBook: book }),
  openReader: (book) => set({ view: 'reader', activeBook: book }),
  goLibrary: () => set({ view: 'library' }),
  goHistory: () => set({ view: 'history' }),
}));
