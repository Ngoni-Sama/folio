import { Clock, Library as LibraryIcon } from 'lucide-react';
import { SearchBar } from './SearchBar';

interface Props {
  query: string;
  onSearch: (q: string) => void;
  onLogo: () => void;
  onLibrary: () => void;
  onHistory: () => void;
  active: 'library' | 'history' | null;
}

export function Nav({
  query,
  onSearch,
  onLogo,
  onLibrary,
  onHistory,
  active,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <button
          onClick={onLogo}
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-text"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-sm text-white">
            F
          </span>
          <span className="hidden sm:inline">Folio</span>
        </button>

        <div className="mx-auto w-full max-w-md">
          <SearchBar initial={query} onSubmit={onSearch} />
        </div>

        <nav className="flex shrink-0 items-center gap-1">
          <IconButton
            label="Library"
            active={active === 'library'}
            onClick={onLibrary}
          >
            <LibraryIcon className="h-5 w-5" />
          </IconButton>
          <IconButton
            label="History"
            active={active === 'history'}
            onClick={onHistory}
          >
            <Clock className="h-5 w-5" />
          </IconButton>
        </nav>
      </div>
    </header>
  );
}

function IconButton({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`rounded-full p-2 transition-colors ${
        active ? 'bg-surfaceHi text-accent' : 'text-textMuted hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}
