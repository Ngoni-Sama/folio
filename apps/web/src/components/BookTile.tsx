import { BookOpen } from 'lucide-react';
import type { Book } from '@ebook/core';
import { formatPercent } from '@ebook/core';

interface Props {
  book: Book;
  progress?: number;
  onOpen: (book: Book) => void;
}

export function BookTile({ book, progress, onOpen }: Props) {
  return (
    <button
      onClick={() => onOpen(book)}
      className="group flex flex-col text-left transition-all duration-150 ease-out"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-150 ease-out group-hover:-translate-y-1 group-hover:border-accent/50">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-textMuted">
            <BookOpen className="h-6 w-6" />
            <span className="line-clamp-3 text-xs">{book.title}</span>
          </div>
        )}

        {typeof progress === 'number' && progress > 0 && (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-text backdrop-blur">
            {formatPercent(progress)}
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-tight text-text">
        {book.title}
      </h3>
      {book.author && (
        <p className="mt-0.5 line-clamp-1 text-xs text-textMuted">{book.author}</p>
      )}
    </button>
  );
}
