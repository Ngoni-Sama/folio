import type { Book } from '@ebook/core';
import { useLibrary } from '../lib/store';
import { BookTile } from './BookTile';

interface Props {
  books: Book[];
  onOpen: (book: Book) => void;
}

export function TileGrid({ books, onOpen }: Props) {
  const progress = useLibrary((s) => s.progress);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
      {books.map((book) => (
        <BookTile
          key={book.id}
          book={book}
          progress={progress[book.id]?.percentage}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
