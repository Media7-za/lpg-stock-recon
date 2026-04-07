import { CounterControl } from './CounterControl';
import type { ZoneCount, CylinderSize, CountCategory } from '../../types';
import { Edit2 } from 'lucide-react';

interface ZoneCardProps {
    zone: ZoneCount;
    category: CountCategory;
    size: CylinderSize;
    onUpdateCount: (zoneId: string, brand: string, newValue: number) => void;
    onEditZoneName: (zoneId: string) => void;
}

export function ZoneCard({ zone, category, size, onUpdateCount, onEditZoneName }: ZoneCardProps) {
    // Filter entries to only show the ones relevant to the current active tab (Size & Category)
    const entries = zone.entries.filter((entry) => entry.category === category && entry.size === size);

    // Calculate Running Total for this specific zone (all entries)
    const runningTotal = zone.entries.reduce((sum, entry) => sum + entry.quantity, 0);

    // Determine status badge
    const isCountStarted = runningTotal > 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            {/* Zone Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div>
                    <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
                        <button
                            onClick={() => onEditZoneName(zone.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition"
                            aria-label="Edit Zone Name"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {runningTotal} total
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isCountStarted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                            {isCountStarted ? 'Count in progress' : 'Not counted yet'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Counters */}
            <div className="space-y-1">
                {entries.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm italic">No brands configured for this size.</p>
                ) : (
                    entries.map((entry) => (
                        <CounterControl
                            key={entry.brand}
                            label={`${entry.brand} ${size} ${category === 'fulls' ? 'Fulls' : 'Empties'}`}
                            brandCode={entry.brand.substring(0, 3).toUpperCase()}
                            value={entry.quantity}
                            onChange={(newQuantity) => onUpdateCount(zone.id, entry.brand, newQuantity)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
