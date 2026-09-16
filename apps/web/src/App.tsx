import type { Book } from '@ebook/core';
import { useUi } from './lib/ui-store';
import { isReadable } from './lib/reader';
import { Nav } from './components/Nav';
import { SearchView } from './components/SearchView';
import { BookDetail } from './components/BookDetail';
import { Library } from './components/Library';
import { History } from './components/History';
import { Reader } from './components/Reader';

export default function App() {
  const {
    view,
    query,
    activeBook,
    setQuery,
    goSearch,
    openDetail,
    openReader,
    goLibrary,
    goHistory,
  } = useUi();

  const handleSearch = (q: string) => {
    setQuery(q);
    goSearch();
  };

  // From a tile: readable books jump straight into the reader, others open detail.
  const handleOpen = (book: Book) => {
    if (isReadable(book)) openReader(book);
    else openDetail(book);
  };

  if (view === 'reader' && activeBook) {
    return <Reader book={activeBook} onBack={goLibrary} />;
  }

  return (
    <div className="min-h-full">
      <Nav
        query={query}
        onSearch={handleSearch}
        onLogo={goSearch}
        onLibrary={goLibrary}
        onHistory={goHistory}
        active={view === 'library' ? 'library' : view === 'history' ? 'history' : null}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {view === 'search' && (
          <SearchView query={query} onOpen={openDetail} />
        )}
        {view === 'detail' && activeBook && (
          <BookDetail
            book={activeBook}
            onBack={goSearch}
            onRead={openReader}
          />
        )}
        {view === 'library' && <Library onOpen={handleOpen} />}
        {view === 'history' && <History onOpen={handleOpen} />}
      </main>
    </div>
  );
}
