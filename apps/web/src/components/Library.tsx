import { useMemo, useState } from 'react';
import { Library as LibraryIcon } from 'lucide-react';
import type { Book } from '@ebook/core';
import { useLibrary } from '../lib/store';
import { TileGrid } from './TileGrid';

type Filter = 'all' | 'reading' | 'finished' | 'unread';
type Sort = 'recent' | 'title' | 'author';

interface Props {
  onOpen: (book: Book) => void;
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading' },
  { id: 'finished', label: 'Finished' },
  { id: 'unread', label: 'Unread' },
];

export function Library({ onOpen }: Props) {
  const library = useLibrary((s) => s.library);
  const progress = useLibrary((s) => s.progress);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');

  const books = useMemo(() => {
    let list = Object.values(library);

    list = list.filter((b) => {
      const pct = progress[b.id]?.percentage ?? 0;
      if (filter === 'reading') return pct > 0 && pct < 95;
      if (filter === 'finished') return pct >= 95;
      if (filter === 'unread') return pct === 0;
      return true;
    });

    list.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'author')
        return (a.author ?? '').localeCompare(b.author ?? '');
      const ta = progress[a.id]?.updatedAt ?? '';
      const tb = progress[b.id]?.updatedAt ?? '';
      return tb.localeCompare(ta);
    });

    return list;
  }, [library, progress, filter, sort]);

  if (Object.keys(library).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <LibraryIcon className="h-8 w-8 text-textMuted" />
        <h2 className="text-lg font-semibold text-text">Your library is empty</h2>
        <p className="max-w-md text-sm text-textMuted">
          Add books from search to keep them here and track your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-accent text-white'
                  : 'text-textMuted hover:text-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-accent focus:outline-none"
        >
          <option value="recent">Recently read</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>
      </div>

      {books.length > 0 ? (
        <TileGrid books={books} onOpen={onOpen} />
      ) : (
        <p className="py-16 text-center text-sm text-textMuted">
          Nothing here for this filter.
        </p>
      )}
    </div>
  );
}
