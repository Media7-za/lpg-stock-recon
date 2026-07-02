export function MissingFieldsBanner({ missingFields }: { missingFields: string[] }) {
  if (missingFields.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
      <p className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1">Missing before a price can be recommended</p>
      <p className="text-sm text-text-primary">{missingFields.join(', ')}</p>
    </div>
  );
}
