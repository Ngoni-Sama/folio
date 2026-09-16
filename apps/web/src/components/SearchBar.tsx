import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

interface Props {
  initial?: string;
  onSubmit: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ initial = '', onSubmit, autoFocus }: Props) {
  const [value, setValue] = useState(initial);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q) onSubmit(q);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 transition-all duration-150 ease-out focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
        <Search className="h-4 w-4 shrink-0 text-textMuted" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={autoFocus}
          placeholder="Search books…"
          className="w-full bg-transparent text-sm text-text placeholder:text-textMuted focus:outline-none"
          aria-label="Search books"
        />
      </div>
    </form>
  );
}
