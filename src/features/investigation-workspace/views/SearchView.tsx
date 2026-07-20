import { Link, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useInvestigationContext } from '../context/InvestigationContext';

export function SearchView() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const { bundle } = useInvestigationContext();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return bundle.views.searchIndex.filter(
      (entry) => entry.keywords.some((kw) => kw.includes(q)) || entry.label.toLowerCase().includes(q)
    );
  }, [bundle.views.searchIndex, query]);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-black text-text-primary">Search</h1>
      <p className="text-sm text-text-secondary">
        {query ? `${results.length} results for “${query}”` : 'Enter a query from the search bar'}
      </p>
      <div className="space-y-2">
        {results.map((entry) => (
          <Link
            key={entry.id}
            to={entry.route}
            className="flex justify-between rounded-lg border border-border bg-surface px-4 py-3 hover:border-border/60"
          >
            <span>{entry.label}</span>
            <span className="text-xs uppercase text-text-secondary">{entry.kind.replace('_', ' ')}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
