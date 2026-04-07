import { useEffect } from 'react';
import { Delete, Check } from 'lucide-react';

interface CustomNumpadProps {
    isOpen: boolean;
    onClose: () => void;
    value: number;
    onChange: (newValue: number) => void;
    title: string;
}

export function CustomNumpad({ isOpen, onClose, value, onChange, title }: CustomNumpadProps) {
    // Prevent scrolling on body when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleKeyPress = (num: number) => {
        // If value is 0, typing 5 makes it 5, not 05.
        const newValue = value === 0 ? num : parseInt(`${value}${num}`, 10);
        onChange(newValue);
    };

    const handleBackspace = () => {
        if (value < 10) {
            onChange(0);
        } else {
            onChange(parseInt(value.toString().slice(0, -1), 10));
        }
    };

    const handleClear = () => {
        onChange(0);
    };

    const handleQuickAdd = (amount: number) => {
        onChange(value + amount);
    };

    const NumberButton = ({ num }: { num: number }) => (
        <button
            onClick={() => handleKeyPress(num)}
            className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 font-bold text-3xl h-16 rounded-2xl flex items-center justify-center transition-colors shadow-sm"
        >
            {num}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div className="relative bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-200">

                {/* Drag Handle (Visual only) */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header Display */}
                <div className="px-6 py-4 flex justify-between items-end border-b border-gray-100">
                    <div className="flex-1 pr-4">
                        <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-1">
                            Stock Entry
                        </p>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {title}
                        </h2>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-5xl font-black text-green-500 tracking-tight">
                            {value}
                        </span>
                    </div>
                </div>

                {/* Quick Add Row */}
                <div className="px-5 pt-5 pb-2 grid grid-cols-3 gap-3">
                    {[10, 50, 100].map(amount => (
                        <button
                            key={amount}
                            onClick={() => handleQuickAdd(amount)}
                            className="bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 font-black text-lg py-3 rounded-xl transition-colors border border-green-100"
                        >
                            +{amount}
                        </button>
                    ))}
                </div>

                {/* Numpad Grid */}
                <div className="px-5 pb-2 grid grid-cols-3 gap-3">
                    <NumberButton num={1} />
                    <NumberButton num={2} />
                    <NumberButton num={3} />
                    <NumberButton num={4} />
                    <NumberButton num={5} />
                    <NumberButton num={6} />
                    <NumberButton num={7} />
                    <NumberButton num={8} />
                    <NumberButton num={9} />

                    <button
                        onClick={handleClear}
                        className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold text-xl h-16 rounded-2xl flex items-center justify-center transition-colors"
                    >
                        Clear
                    </button>

                    <NumberButton num={0} />

                    <button
                        onClick={handleBackspace}
                        className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 h-16 rounded-2xl flex items-center justify-center transition-colors shadow-sm"
                    >
                        <Delete className="w-8 h-8" />
                    </button>
                </div>

                {/* Action area */}
                <div className="p-5 pt-2 pb-safe">
                    <button
                        onClick={onClose}
                        className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-black text-2xl h-16 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
                    >
                        <span>DONE</span>
                        <Check className="w-7 h-7 stroke-[3]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
