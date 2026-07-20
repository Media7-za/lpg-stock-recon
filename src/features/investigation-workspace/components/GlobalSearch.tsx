import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { KnowledgeBundle, SearchIndexEntry } from '../types/knowledgeBundle';
import { investigationBasePath } from '../domains/allocation/routePrefix';

const GROUP_ORDER = ['invoice', 'relationship', 'case', 'payment', 'credit_note', 'doctrine', 'stat_batch'];

function groupResults(entries: SearchIndexEntry[]) {
  const groups = new Map<string, SearchIndexEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.kind) ?? [];
    list.push(entry);
    groups.set(entry.kind, list);
  }
  return GROUP_ORDER.filter((kind) => groups.has(kind)).map((kind) => ({
    kind,
    entries: groups.get(kind) ?? [],
  }));
}

export function GlobalSearch({ bundle }: { bundle: KnowledgeBundle }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const base = investigationBasePath(bundle.debtorCode);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return bundle.views.searchIndex
      .filter((entry) => entry.keywords.some((kw) => kw.includes(q)) || entry.label.toLowerCase().includes(q))
      .slice(0, 24);
  }, [bundle.views.searchIndex, query]);

  const grouped = groupResults(results);

  return (
    <div className="relative flex-1 max-w-xl">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) {
            navigate(results[0].route);
            setQuery('');
          }
        }}
        placeholder="Search invoices, payments, relationships, cases…"
        className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-sky-500/50"
      />
      {query.trim() && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-surface-elevated shadow-xl">
          {grouped.length === 0 ? (
            <p className="p-3 text-sm text-text-secondary">No matches for “{query.trim()}”</p>
          ) : (
            grouped.map(({ kind, entries }) => (
              <div key={kind} className="border-b border-border last:border-b-0">
                <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-text-secondary">
                  {kind.replace('_', ' ')}
                </p>
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      navigate(entry.route);
                      setQuery('');
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-surface"
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() => navigate(`${base}/search?q=${encodeURIComponent(query.trim())}`)}
            className="w-full px-3 py-2 text-left text-xs text-sky-400 hover:bg-surface"
          >
            View all search results
          </button>
        </div>
      )}
    </div>
  );
}
