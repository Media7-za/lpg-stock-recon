import { FileText } from 'lucide-react';
import type { ERPItem } from '../../types';

interface CSVPreviewProps {
  data: ERPItem[];
}

export default function CSVPreview({ data }: CSVPreviewProps) {
  const sampleRows = data.slice(0, 10);

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5" />
        <h3 className="text-lg font-semibold">CSV Preview</h3>
        <span className="text-text-secondary text-sm">
          ({data.length} total items, showing first 10)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Group</th>
              <th className="text-left p-2">Description</th>
              <th className="text-right p-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((item, idx) => (
              <tr key={idx} className="border-b border-border/50">
                <td className="p-2 font-mono">{item.sku}</td>
                <td className="p-2">{item.category}</td>
                <td className="p-2">{item.group}</td>
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-right">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

