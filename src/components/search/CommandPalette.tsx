import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface SearchDocument {
  id: string;
  title: string;
  href: string;
  section: string;
  kind: string;
  summary?: string;
  tags: string[];
}

function openPalette() {
  window.dispatchEvent(new CustomEvent("open-command-palette"));
}

function closePalette(setOpen: (open: boolean) => void, setQuery: (value: string) => void) {
  setOpen(false);
  setQuery("");
}

export default function CommandPalette({ baseUrl = "" }: { baseUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [docs, setDocs] = useState<SearchDocument[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (key === "escape") {
        closePalette(setOpen, setQuery);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    const indexUrl = baseUrl ? `${baseUrl}/search-index.json` : "/search-index.json";
    fetch(indexUrl)
      .then((response) => response.json())
      .then((payload) => {
        const documents = (payload.documents ?? []).map((doc: SearchDocument) => ({
          ...doc,
          href: doc.href.startsWith("http") ? doc.href : `${baseUrl}${doc.href}`,
        }));
        setDocs(documents);
      })
      .catch(() => setDocs([]));
  }, [baseUrl]);

  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        includeScore: true,
        threshold: 0.38,
        keys: [
          { name: "title", weight: 0.6 },
          { name: "summary", weight: 0.2 },
          { name: "tags", weight: 0.15 },
          { name: "kind", weight: 0.05 },
        ],
      }),
    [docs]
  );

  const results = useMemo(() => {
    const source = query.trim().length > 0 ? fuse.search(query).map((item) => item.item) : docs;
    return source.slice(0, 14);
  }, [query, fuse, docs]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const onNav = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, Math.max(0, results.length - 1)));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === "Enter") {
        const active = results[activeIndex];
        if (active?.href) {
          window.location.href = active.href;
        }
      }
    };
    window.addEventListener("keydown", onNav);
    return () => window.removeEventListener("keydown", onNav);
  }, [open, results, activeIndex]);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-base-200)]/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] px-2.5 h-8 pt-[3px] text-sm font-mono text-[var(--color-neutral-content)] hover:text-[var(--color-base-content)] hover:bg-[var(--color-base-200)] transition-colors"
        aria-label="Open command search"
      >
        <i className="ri-search-line text-sm" />
        <span className="hidden sm:inline">Search</span>
        <span className="inline-flex items-center gap-0.5">
          <kbd className="rounded border border-[var(--color-base-300)] bg-[var(--color-base-200)] px-1.5 py-0.5 text-[9px] leading-none text-[var(--color-base-content)]">
            <span className="hidden md:inline">⌘</span>
            <span className="md:hidden">Ctrl</span>
          </kbd>
          <kbd className="rounded border border-[var(--color-base-300)] bg-[var(--color-base-200)] px-1.5 py-0.5 text-[9px] leading-none text-[var(--color-base-content)]">
            K
          </kbd>
        </span>
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close command search"
            onMouseDown={() => closePalette(setOpen, setQuery)}
          />

          <div
            className="relative mx-auto mt-[12vh] w-[92vw] max-w-2xl rounded-2xl border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-2xl overflow-hidden"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[var(--color-base-300)] px-4 py-3">
              <i className="ri-search-line text-[var(--color-neutral-content)]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages, projects, updates..."
                className="w-full bg-transparent outline-none text-[var(--color-base-content)] placeholder:text-[var(--color-neutral-content)]"
              />
              <span className="text-xs text-[var(--color-neutral-content)]">ESC</span>
            </div>

            <div className="max-h-[56vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <div className="px-3 py-8 text-sm text-[var(--color-neutral-content)]">
                  No matches found.
                </div>
              )}

              {results.map((result, index) => (
                <a
                  key={`${result.id}-${result.href}`}
                  href={result.href}
                  className={`block rounded-lg px-3 py-2 transition-colors ${
                    index === activeIndex
                      ? "bg-[var(--color-base-200)]"
                      : "hover:bg-[var(--color-base-200)]/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-[var(--color-base-content)] truncate">
                      {result.title}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-neutral-content)]">
                      {result.kind}
                    </span>
                  </div>
                  {result.summary && (
                    <p className="mt-1 text-xs text-[var(--color-neutral-content)] line-clamp-2">
                      {result.summary}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
