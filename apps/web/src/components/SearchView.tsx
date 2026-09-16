import { useInfiniteQuery } from '@tanstack/react-query';
import { BookMarked, Loader2, SearchX } from 'lucide-react';
import type { Book } from '@ebook/core';
import { searchPage } from '../lib/search';
import { TileGrid } from './TileGrid';

interface Props {
  query: string;
  onOpen: (book: Book) => void;
}

export function SearchView({ query, onOpen }: Props) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['search', query],
    queryFn: ({ pageParam, signal }) => searchPage(query, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,
    enabled: query.length > 0,
  });

  if (!query) {
    return (
      <EmptyState
        icon={<BookMarked className="h-8 w-8" />}
        title="Find something to read"
        subtitle="Search 70,000+ free, public-domain books from Project Gutenberg and Open Library."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-textMuted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<SearchX className="h-8 w-8" />}
        title="Search failed"
        subtitle={(error as Error)?.message ?? 'Please try again.'}
      />
    );
  }

  const books = data?.pages.flatMap((p) => p.books) ?? [];

  if (books.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-8 w-8" />}
        title={`No results for "${query}"`}
        subtitle="Try a different title, author, or subject."
      />
    );
  }

  return (
    <div className="space-y-8">
      <TileGrid books={books} onOpen={onOpen} />

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-all duration-150 ease-out hover:border-accent/50 hover:bg-surfaceHi disabled:opacity-60"
          >
            {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="text-textMuted">{icon}</div>
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="max-w-md text-sm text-textMuted">{subtitle}</p>
    </div>
  );
}
