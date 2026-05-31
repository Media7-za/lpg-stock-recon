import { CustodyLine } from '../types/debtorWorkspace';

interface CustodyPositionCardProps {
  totalCustodyExposure: number;
  lines: CustodyLine[];
}

function formatZAR(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `R-${formatted}` : `R${formatted}`;
}

export function CustodyPositionCard({ totalCustodyExposure, lines }: CustodyPositionCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Custody Position</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[11px] font-black uppercase tracking-wider text-text-secondary pb-2">SKU</th>
              <th className="text-left text-[11px] font-black uppercase tracking-wider text-text-secondary pb-2">Type</th>
              <th className="text-right text-[11px] font-black uppercase tracking-wider text-text-secondary pb-2">Net Qty</th>
              <th className="text-right text-[11px] font-black uppercase tracking-wider text-text-secondary pb-2">Deposit Rate</th>
              <th className="text-right text-[11px] font-black uppercase tracking-wider text-text-secondary pb-2">Exposure</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.sku} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-mono text-xs text-text-secondary">{line.sku}</td>
                <td className="py-2.5 text-text-primary">{line.label}</td>
                <td className={`py-2.5 text-right font-mono font-bold ${line.qty < 0 ? 'text-amber-400' : 'text-text-primary'}`}>
                  {line.qty}
                </td>
                <td className="py-2.5 text-right font-mono text-text-secondary">
                  {formatZAR(line.depositRate)}
                </td>
                <td className={`py-2.5 text-right font-mono font-bold ${line.exposure < 0 ? 'text-amber-400' : 'text-text-primary'}`}>
                  {formatZAR(line.exposure)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border">
              <td colSpan={4} className="pt-3 text-sm font-black text-text-secondary uppercase tracking-wider">
                Total Custody Exposure
              </td>
              <td className={`pt-3 text-right font-mono font-black text-base ${totalCustodyExposure < 0 ? 'text-amber-400' : 'text-text-primary'}`}>
                {formatZAR(totalCustodyExposure)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
