import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactReader } from 'react-reader';
import type { Rendition, Contents } from 'epubjs';
import {
  ArrowLeft,
  Highlighter,
  Minus,
  NotebookText,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Annotation, Book, HighlightColor } from '@ebook/core';
import {
  HIGHLIGHT_COLORS,
  annotationsToMarkdown,
  clampPercent,
} from '@ebook/core';
import { readerThemes, type ReaderThemeName } from '@ebook/ui/tokens';
import { useLibrary } from '../lib/store';
import { readerUrlFor } from '../lib/reader';

interface Props {
  book: Book;
  onBack: () => void;
}

const PROGRESS_DEBOUNCE_MS = 2000;

export function Reader({ book, onBack }: Props) {
  const url = readerUrlFor(book);

  const savedProgress = useLibrary((s) => s.progress[book.id]);
  const annotations = useLibrary((s) => s.annotations[book.id] ?? []);
  const setProgress = useLibrary((s) => s.setProgress);
  const addAnnotation = useLibrary((s) => s.addAnnotation);
  const removeAnnotation = useLibrary((s) => s.removeAnnotation);
  const logOpen = useLibrary((s) => s.logOpen);

  const [location, setLocation] = useState<string | number>(
    savedProgress?.cfi ?? 0,
  );
  const [theme, setTheme] = useState<ReaderThemeName>('dark');
  const [fontSize, setFontSize] = useState(100);
  const [notesOpen, setNotesOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState<HighlightColor>('yellow');

  const renditionRef = useRef<Rendition | null>(null);
  const locationsReady = useRef(false);
  const progressTimer = useRef<ReturnType<typeof setTimeout>>();

  // Log a history entry once per open.
  useEffect(() => {
    logOpen(book.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  const applyTheme = useCallback((r: Rendition, name: ReaderThemeName) => {
    const t = readerThemes[name];
    r.themes.override('color', t.text);
    r.themes.override('background', t.bg);
  }, []);

  const applyExistingHighlights = useCallback(
    (r: Rendition, list: Annotation[]) => {
      for (const a of list) {
        try {
          r.annotations.add(
            'highlight',
            a.cfi,
            {},
            undefined,
            'hl',
            {
              fill: HIGHLIGHT_COLORS[a.color],
              'fill-opacity': '0.3',
              'mix-blend-mode': 'multiply',
            },
          );
        } catch {
          /* invalid CFI (different edition) — skip */
        }
      }
    },
    [],
  );

  const handleGetRendition = useCallback(
    (rendition: Rendition) => {
      renditionRef.current = rendition;
      applyTheme(rendition, theme);
      rendition.themes.fontSize(`${fontSize}%`);

      rendition.book.ready
        .then(() => rendition.book.locations.generate(1600))
        .then(() => {
          locationsReady.current = true;
        })
        .catch(() => {
          /* locations are best-effort */
        });

      applyExistingHighlights(rendition, annotations);

      rendition.on('selected', (cfiRange: string, contents: Contents) => {
        const text = contents.window.getSelection()?.toString().trim() ?? '';
        if (!text) return;

        addAnnotation({
          id: crypto.randomUUID(),
          bookId: book.id,
          cfi: cfiRange,
          text,
          color: pendingColor,
          createdAt: new Date().toISOString(),
        });

        try {
          rendition.annotations.add('highlight', cfiRange, {}, undefined, 'hl', {
            fill: HIGHLIGHT_COLORS[pendingColor],
            'fill-opacity': '0.3',
            'mix-blend-mode': 'multiply',
          });
        } catch {
          /* ignore */
        }
        contents.window.getSelection()?.removeAllRanges();
      });
    },
    // pendingColor/theme/fontSize are read via refs on the live rendition below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [book.id],
  );

  const handleLocationChanged = useCallback(
    (loc: string) => {
      setLocation(loc);
      const r = renditionRef.current;
      let pct = savedProgress?.percentage ?? 0;
      if (r && locationsReady.current) {
        try {
          pct = clampPercent(r.book.locations.percentageFromCfi(loc) * 100);
        } catch {
          /* keep previous percentage */
        }
      }

      clearTimeout(progressTimer.current);
      progressTimer.current = setTimeout(() => {
        setProgress(book.id, loc, pct);
      }, PROGRESS_DEBOUNCE_MS);
    },
    [book.id, savedProgress?.percentage, setProgress],
  );

  // Persist immediately when leaving the reader.
  useEffect(() => {
    return () => clearTimeout(progressTimer.current);
  }, []);

  // Re-apply theme / font size live.
  useEffect(() => {
    const r = renditionRef.current;
    if (r) applyTheme(r, theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    renditionRef.current?.themes.fontSize(`${fontSize}%`);
  }, [fontSize]);

  if (!url) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-textMuted">This book can’t be opened in the reader.</p>
        <button onClick={onBack} className="text-accent hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      {/* Top chrome */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-textMuted transition-colors hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" /> Library
        </button>
        <span className="mx-2 line-clamp-1 flex-1 text-center text-sm text-text">
          {book.title}
        </span>

        {/* Highlight color picker */}
        <div className="flex items-center gap-1">
          <Highlighter className="h-4 w-4 text-textMuted" />
          {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((c) => (
            <button
              key={c}
              aria-label={`Highlight ${c}`}
              onClick={() => setPendingColor(c)}
              className={`h-4 w-4 rounded-full border transition-transform ${
                pendingColor === c
                  ? 'scale-110 border-white'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: HIGHLIGHT_COLORS[c] }}
            />
          ))}
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize((n) => Math.max(70, n - 10))}
            className="rounded p-1 text-textMuted hover:text-text"
            aria-label="Decrease font size"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setFontSize((n) => Math.min(160, n + 10))}
            className="rounded p-1 text-textMuted hover:text-text"
            aria-label="Increase font size"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Theme */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ReaderThemeName)}
          className="rounded-full border border-border bg-surface px-2 py-1 text-xs text-text focus:outline-none"
          aria-label="Reading theme"
        >
          <option value="dark">Dark</option>
          <option value="sepia">Sepia</option>
          <option value="light">Light</option>
        </select>

        <button
          onClick={() => setNotesOpen((v) => !v)}
          className={`rounded p-1.5 transition-colors ${
            notesOpen ? 'text-accent' : 'text-textMuted hover:text-text'
          }`}
          aria-label="Notes"
        >
          <NotebookText className="h-4 w-4" />
        </button>
      </header>

      <div className="relative flex-1">
        <ReactReader
          url={url}
          location={location}
          locationChanged={handleLocationChanged}
          getRendition={handleGetRendition}
          epubInitOptions={{ openAs: 'epub' }}
          epubOptions={{ allowScriptedContent: false }}
        />

        {notesOpen && (
          <NotesDrawer
            book={book}
            annotations={annotations}
            onRemove={(id) => removeAnnotation(book.id, id)}
            onClose={() => setNotesOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function NotesDrawer({
  book,
  annotations,
  onRemove,
  onClose,
}: {
  book: Book;
  annotations: Annotation[];
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const exportMarkdown = () => {
    const md = annotationsToMarkdown(book.title, annotations);
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${book.title.replace(/[^\w]+/g, '-').toLowerCase()}-notes.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <aside className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text">
          Notes ({annotations.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportMarkdown}
            disabled={annotations.length === 0}
            className="text-xs text-accent hover:underline disabled:opacity-40"
          >
            Export .md
          </button>
          <button
            onClick={onClose}
            className="text-textMuted hover:text-text"
            aria-label="Close notes"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {annotations.length === 0 ? (
          <p className="pt-8 text-center text-sm text-textMuted">
            Select text while reading to add a highlight.
          </p>
        ) : (
          annotations.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-bg p-3"
              style={{ borderLeft: `3px solid ${HIGHLIGHT_COLORS[a.color]}` }}
            >
              <p className="text-sm text-text/90">“{a.text}”</p>
              {a.note && (
                <p className="mt-2 text-xs text-textMuted">{a.note}</p>
              )}
              <button
                onClick={() => onRemove(a.id)}
                className="mt-2 flex items-center gap-1 text-xs text-textMuted hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
