import { useRef, useState } from 'react';
import { Camera, Loader2, ScanLine, X } from 'lucide-react';
import clsx from 'clsx';
import { uploadReceiptImage, extractReceipt } from '../../lib/receiptExtractionService';
import { ReceiptExtraction } from '../../types';

interface Props {
  onExtracted: (extraction: ReceiptExtraction) => void;
}

export default function ReceiptUpload({ onExtracted }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<'uploading' | 'extracting' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setError(null);
  };

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      setStage('uploading');
      const imageUrl = await uploadReceiptImage(file);

      setStage('extracting');
      const extraction = await extractReceipt(imageUrl);

      onExtracted(extraction);
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('[ReceiptUpload] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract receipt');
    } finally {
      setProcessing(false);
      setStage(null);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-blue-500" />
          Scan Delivery Note / Returns Slip
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Upload a photo. A vision model reads it, then you review and confirm before it counts.
        </p>
      </div>

      <div
        onClick={() => !processing && fileInputRef.current?.click()}
        className={clsx(
          'relative h-56 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all overflow-hidden',
          processing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-blue-400 hover:bg-gray-50',
          previewUrl ? 'border-blue-500' : 'border-border'
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
        />

        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Receipt preview" className="absolute inset-0 w-full h-full object-contain bg-black/5" />
            {!processing && (
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-text-secondary">
              <Camera className="w-7 h-7" />
            </div>
            <div className="text-center">
              <p className="font-bold text-text-primary">Click to take or choose a photo</p>
              <p className="text-xs text-text-secondary mt-1">JPG or PNG</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleExtract}
        disabled={!file || processing}
        className={clsx(
          'w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all',
          !file || processing
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
        )}
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{stage === 'uploading' ? 'Uploading...' : 'Reading document...'}</span>
          </>
        ) : (
          <span>Extract Data</span>
        )}
      </button>
    </div>
  );
}
