import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { CustomNumpad } from './CustomNumpad';

interface CounterControlProps {
    label: string;
    brandCode?: string;
    value: number;
    onChange: (newValue: number) => void;
    className?: string;
}

export function CounterControl({ label, brandCode, value, onChange, className }: CounterControlProps) {
    const handleDecrement = () => {
        if (value > 0) onChange(value - 1);
    };

    const handleIncrement = () => {
        onChange(value + 1);
    };

    const [isNumpadOpen, setIsNumpadOpen] = useState(false);

    return (
        <div className={clsx("flex items-center justify-between py-4 border-b border-gray-100 last:border-0", className)}>
            <div className="flex items-center space-x-3">
                {brandCode && (
                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold w-10 h-10 rounded-md uppercase tracking-wider">
                        {brandCode}
                    </span>
                )}
                <span className="text-gray-900 font-semibold text-lg">{label}</span>
            </div>

            <div className="flex items-center bg-gray-50 rounded-lg p-1">
                <button
                    onClick={handleDecrement}
                    disabled={value <= 0}
                    className="w-12 h-12 flex items-center justify-center rounded-md bg-white text-gray-700 shadow-sm border border-gray-200 active:bg-gray-100 disabled:opacity-50 disabled:active:bg-white flex-shrink-0"
                >
                    <Minus className="w-6 h-6" />
                </button>

                <button
                    onClick={() => setIsNumpadOpen(true)}
                    className="w-20 h-12 text-center font-bold text-xl text-gray-900 bg-transparent border-none focus:outline-none focus:bg-gray-100 rounded-md px-1 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                    {value}
                </button>

                <button
                    onClick={handleIncrement}
                    className="w-12 h-12 flex items-center justify-center rounded-md bg-green-500 text-white shadow-sm hover:bg-green-600 active:bg-green-700 transition flex-shrink-0"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <CustomNumpad
                isOpen={isNumpadOpen}
                onClose={() => setIsNumpadOpen(false)}
                value={value}
                onChange={(val) => onChange(val)}
                title={`${brandCode || ''} ${label}`.trim()}
            />
        </div>
    );
}
