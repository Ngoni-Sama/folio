import { BookOpen, Clock } from 'lucide-react';
import type { Book } from '@ebook/core';
import { formatPercent, relativeTime } from '@ebook/core';
import { useLibrary } from '../lib/store';

interface Props {
  onOpen: (book: Book) => void;
}

export function History({ onOpen }: Props) {
  const history = useLibrary((s) => s.history);
  const library = useLibrary((s) => s.library);
  const books = useLibrary((s) => s.books);
  const progress = useLibrary((s) => s.progress);

  // Entries logged before book metadata was cached have nothing to show.
  const entries = history.flatMap((entry) => {
    const book = library[entry.bookId] ?? books[entry.bookId];
    return book ? [{ entry, book }] : [];
  });

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Clock className="h-8 w-8 text-textMuted" />
        <h2 className="text-lg font-semibold text-text">No reading history yet</h2>
        <p className="max-w-md text-sm text-textMuted">
          Books you open will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
      {entries.map(({ entry, book }) => {
        const pct = progress[entry.bookId]?.percentage ?? 0;
        return (
          <li key={entry.id}>
            <button
              onClick={() => onOpen(book)}
              className="flex w-full items-center gap-4 bg-surface px-4 py-3 text-left transition-colors hover:bg-surfaceHi"
            >
              <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-bg">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-textMuted">
                    <BookOpen className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-text">
                  {book.title}
                </p>
                {book.author && (
                  <p className="line-clamp-1 text-xs text-textMuted">
                    {book.author}
                  </p>
                )}
                <p className="mt-1 text-xs text-textMuted">
                  {formatPercent(pct)} · {relativeTime(entry.openedAt)}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
