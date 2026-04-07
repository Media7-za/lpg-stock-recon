import { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { parseMovementTxt } from '../../lib/movementParser';
import { parseCSV } from '../../lib/csvParser';
import { useERPSnapshots, useMovementData } from '../../hooks/useDatabase';
import type { ERPItem, MovementItem } from '../../types';
import CSVPreview from './CSVPreview';

export default function CSVUpload({ allowTxt = false, title = "Upload ERP Data" }: { allowTxt?: boolean, title?: string }) {
  const { addSnapshot } = useERPSnapshots();
  const { addMovement } = useMovementData();
  const [dragActive, setDragActive] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsedData, setParsedData] = useState<ERPItem[] | null>(null);
  const [parsedMovement, setParsedMovement] = useState<MovementItem[] | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [exportTime, setExportTime] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (allowTxt && !file.name.endsWith('.txt')) {
      setError('Please upload a TXT file (e.g. CURRENT.TXT)');
      return;
    } else if (!allowTxt && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please upload a CSV or TXT file');
      return;
    }

    setExportTime(new Date(file.lastModified));
    const text = await file.text();
    setCsvText(text);
    processCSV(text);
  };

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    if (text.trim()) {
      processCSV(text);
    }
  };

  const processCSV = (text: string) => {
    setError(null);

    if (allowTxt) {
      const result = parseMovementTxt(text);
      if (result.success && result.data) {
        setParsedMovement(result.data);
      } else {
        setError(result.error || 'Failed to parse TXT');
        setParsedMovement(null);
      }
    } else {
      const result = parseCSV(text);
      if (result.success && result.data) {
        setParsedData(result.data);
      } else {
        setError(result.error || 'Failed to parse CSV');
        setParsedData(null);
      }
    }
  };

  const handleSave = async () => {
    if (!parsedData && !parsedMovement) return;

    try {
      if (allowTxt && parsedMovement) {
        await addMovement({
          period: exportTime.toISOString().split('T')[0],
          movements: parsedMovement
        });
      } else if (!allowTxt && parsedData) {
        await addSnapshot({
          timestamp: new Date(),
          exportTime,
          snapshotType: 'PM', // Default to PM for now, ideally user selects this
          data: parsedData,
        });
      }

      alert('Successfully Saved Database Snapshot!');
      // Typically we'd navigate back or clear
      setParsedData(null);
      setParsedMovement(null);
      setCsvText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <div className="bg-surface rounded-lg border border-border p-6 mb-6">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-border hover:border-blue-500/50'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">Drag & Drop {allowTxt ? 'TXT' : 'CSV or TXT'} File Here</p>
          <p className="text-text-secondary mb-4">or</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 font-bold text-white rounded-lg transition-colors"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={allowTxt ? ".txt" : ".csv,.txt"}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Or paste CSV data:</label>
          <textarea
            value={csvText}
            onChange={handlePaste}
            placeholder="Paste CSV data here..."
            className="w-full h-32 bg-surface-elevated border border-border rounded-lg p-3 font-mono text-sm"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Export Time:</label>
          <input
            type="datetime-local"
            value={exportTime.toISOString().slice(0, 16)}
            onChange={(e) => setExportTime(new Date(e.target.value))}
            className="bg-surface-elevated border border-border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-2">
          <X className="w-5 h-5 text-red-500" />
          <span className="text-red-500">{error}</span>
        </div>
      )}

      {(parsedData || parsedMovement) && (
        <>
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-500 font-medium">
              Successfully parsed {(parsedData || parsedMovement)?.length} rows
            </span>
          </div>

          {!allowTxt && parsedData && <CSVPreview data={parsedData} />}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-bold transition-colors shadow-sm"
            >
              Save to Database
            </button>

            <button
              onClick={() => {
                setParsedData(null);
                setParsedMovement(null);
                setCsvText('');
                setError(null);
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold border border-gray-300 rounded-lg transition-colors"
            >
              Clear
            </button>

          </div>
        </>
      )}
    </div>
  );
}

