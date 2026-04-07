import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { ZoneCount, CountEntry } from '../../types';

interface ReviewSummaryProps {
    sessionType: 'AM' | 'PM';
    zones: ZoneCount[];
    totalCounted: number;
    onBack: () => void;
    onSubmit: () => void;
}

export function ReviewSummary({ sessionType, zones, totalCounted, onBack, onSubmit }: ReviewSummaryProps) {
    // Aggregate totals by category, size, and brand for a clean summary
    const aggregatedCounts = zones.reduce((acc, zone) => {
        zone.entries.forEach(entry => {
            if (entry.quantity > 0) {
                const key = `${entry.category}-${entry.size}-${entry.brand}`;
                if (!acc[key]) {
                    acc[key] = { ...entry };
                } else {
                    acc[key].quantity += entry.quantity;
                }
            }
        });
        return acc;
    }, {} as Record<string, CountEntry>);

    const hasCounts = Object.keys(aggregatedCounts).length > 0;

    // Separate into Fulls and Empties for distinct visual groups
    const fulls = Object.values(aggregatedCounts).filter(e => e.category === 'fulls');
    const empties = Object.values(aggregatedCounts).filter(e => e.category === 'empties');

    const SummaryList = ({ title, items }: { title: string, items: CountEntry[] }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">{title}</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No items counted.</div>
                ) : (
                    items.map(item => (
                        <div key={`${item.size}-${item.brand}`} className="p-4 flex justify-between items-center bg-white">
                            <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold w-10 h-10 rounded-md uppercase tracking-wider">
                                    {item.brand.slice(0, 3)}
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-900">{item.brand}</p>
                                    <p className="text-sm text-gray-500">{item.size}</p>
                                </div>
                            </div>
                            <div className="text-xl font-black text-gray-900">
                                {item.quantity}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-4 flex items-center justify-center relative">
                <button onClick={onBack} className="absolute left-4 p-2 -ml-2 text-gray-400 hover:text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Review Your Count</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto w-full">

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Session</p>
                        <p className="text-2xl font-black text-gray-900">{sessionType} Count</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Items</p>
                        <p className="text-3xl font-black text-green-500">{totalCounted}</p>
                    </div>
                </div>

                {!hasCounts && (
                    <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            <strong>Warning:</strong> You are about to submit a completely empty session with zero cylinders counted.
                        </p>
                    </div>
                )}

                {hasCounts && (
                    <>
                        <SummaryList title="Full Cylinders" items={fulls} />
                        <SummaryList title="Empty Shells" items={empties} />
                    </>
                )}

            </div>

            {/* Sticky Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex space-x-3">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold text-lg rounded-xl transition"
                >
                    Edit Count
                </button>
                <button
                    onClick={onSubmit}
                    className="flex-[2] py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-lg rounded-xl shadow-sm transition"
                >
                    Confirm & Submit
                </button>
            </div>
        </div>
    );
}
