import {
  ArrowLeft,
  BookOpen,
  Check,
  ExternalLink,
  Plus,
} from 'lucide-react';
import type { Book } from '@ebook/core';
import { formatPercent } from '@ebook/core';
import { useLibrary } from '../lib/store';
import { isReadable } from '../lib/reader';

interface Props {
  book: Book;
  onBack: () => void;
  onRead: (book: Book) => void;
}

const SOURCE_LABEL: Record<Book['source'], string> = {
  gutenberg: 'Project Gutenberg',
  openlibrary: 'Open Library',
  openalex: 'OpenAlex',
};

export function BookDetail({ book, onBack, onRead }: Props) {
  const inLibrary = useLibrary((s) => Boolean(s.library[book.id]));
  const progress = useLibrary((s) => s.progress[book.id]);
  const addToLibrary = useLibrary((s) => s.addToLibrary);
  const removeFromLibrary = useLibrary((s) => s.removeFromLibrary);

  const readable = isReadable(book);
  const pct = progress?.percentage ?? 0;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm text-textMuted transition-colors hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="mx-auto w-48 shrink-0 sm:mx-0">
          <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-surface">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-textMuted">
                <BookOpen className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <span className="inline-block rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-textMuted">
            {SOURCE_LABEL[book.source]}
          </span>

          <h1 className="mt-3 text-2xl font-semibold leading-tight text-text">
            {book.title}
          </h1>
          {book.author && (
            <p className="mt-1 text-textMuted">{book.author}</p>
          )}

          {book.description && (
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-text/90">
              {book.description}
            </p>
          )}

          {book.subjects.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {book.subjects.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-surfaceHi px-2.5 py-0.5 text-xs text-textMuted"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {readable ? (
              <button
                onClick={() => onRead(book)}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 ease-out hover:bg-accentHi"
              >
                <BookOpen className="h-4 w-4" />
                {pct > 0 ? `Continue — ${formatPercent(pct)}` : 'Read'}
              </button>
            ) : (
              book.readOnlineUrl && (
                <a
                  href={book.readOnlineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text transition-all duration-150 ease-out hover:border-accent/50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read online
                </a>
              )
            )}

            <button
              onClick={() =>
                inLibrary ? removeFromLibrary(book.id) : addToLibrary(book)
              }
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-all duration-150 ease-out hover:border-accent/50 hover:bg-surfaceHi"
            >
              {inLibrary ? (
                <>
                  <Check className="h-4 w-4 text-accent" /> In library
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add to library
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
