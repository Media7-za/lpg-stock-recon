import { MobileProforma } from '../types/pricingDesk';

function formatZAR(value: number): string {
  return `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function MobileProformaPreview({ proforma }: { proforma: MobileProforma }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 max-w-sm">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3">Mobile Proforma Preview</h3>
      <div className="bg-white text-black rounded-lg p-4 font-sans text-sm">
        <p className="font-black">{proforma.customer}</p>
        {proforma.contact && <p className="text-xs text-gray-600">{proforma.contact}</p>}
        <p className="text-xs text-gray-600 mb-3">R{proforma.pricePerKg}/kg</p>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-1 pr-2">Qty</th>
              <th className="py-1 pr-2">Description</th>
              <th className="py-1 pr-2 text-right">Unit Price</th>
              <th className="py-1 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {proforma.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1 pr-2">{item.qty}</td>
                <td className="py-1 pr-2">{item.description}</td>
                <td className="py-1 pr-2 text-right">{formatZAR(item.unitPrice)}</td>
                <td className="py-1 text-right">{formatZAR(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 pt-3 border-t-2 border-gray-800 flex items-center justify-between">
          <span className="font-black">Total Payable</span>
          <span className="font-black text-lg">{formatZAR(proforma.totalPayable)}</span>
        </div>
      </div>
    </div>
  );
}
