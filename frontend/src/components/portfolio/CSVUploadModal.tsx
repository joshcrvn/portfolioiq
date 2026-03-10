import { useState, useRef, useCallback } from 'react';
import { X, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { usePortfolioStore } from '../../store/portfolioStore';
import { parseTrading212CSV } from '../../utils/csvParser';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'preview' | 'done';

export function CSVUploadModal({ isOpen, onClose }: CSVUploadModalProps) {
  const addHolding = usePortfolioStore((s) => s.addHolding);
  const existingHoldings = usePortfolioStore((s) => s.holdings);

  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ReturnType<typeof parseTrading212CSV> | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setParseResult(null);
    setFileName('');
    setIsDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const existingTickers = existingHoldings.map((h) => h.ticker);
      const result = parseTrading212CSV(text, existingTickers);
      setParseResult(result);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [existingHoldings]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleImport = () => {
    if (!parseResult) return;
    parseResult.imported.forEach((h) => addHolding(h));
    setStep('done');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-lg rounded-xl fade-in"
        style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #30363D' }}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} color="#00D4FF" />
            <h2 className="font-semibold text-base" style={{ color: '#E6EDF3' }}>
              Import from CSV
            </h2>
          </div>
          <button onClick={handleClose} style={{ color: '#8B949E' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: '#8B949E' }}>
                Upload a <strong style={{ color: '#E6EDF3' }}>Trading 212</strong> portfolio
                export CSV. Columns required: <code className="font-mono text-xs px-1 rounded"
                  style={{ backgroundColor: '#0F1117', color: '#00D4FF' }}>Ticker</code>,{' '}
                <code className="font-mono text-xs px-1 rounded"
                  style={{ backgroundColor: '#0F1117', color: '#00D4FF' }}>Shares</code>,{' '}
                <code className="font-mono text-xs px-1 rounded"
                  style={{ backgroundColor: '#0F1117', color: '#00D4FF' }}>Average price</code>,{' '}
                <code className="font-mono text-xs px-1 rounded"
                  style={{ backgroundColor: '#0F1117', color: '#00D4FF' }}>Currency</code>.
              </p>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${isDragging ? '#00FF94' : '#30363D'}`,
                  backgroundColor: isDragging ? 'rgba(0,255,148,0.04)' : '#0F1117',
                }}
              >
                <Upload size={28} color={isDragging ? '#00FF94' : '#8B949E'} />
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: '#E6EDF3' }}>
                    Drop your CSV here
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#8B949E' }}>
                    or click to browse
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {step === 'preview' && parseResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs" style={{ color: '#8B949E' }}>
                <FileText size={12} />
                <span className="font-mono truncate">{fileName}</span>
              </div>

              {/* Summary badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge color="#00FF94" label={`${parseResult.imported.length} to import`} />
                {parseResult.skipped > 0 && (
                  <Badge color="#8B949E" label={`${parseResult.skipped} skipped`} />
                )}
                {parseResult.duplicates.length > 0 && (
                  <Badge color="#F59E0B" label={`${parseResult.duplicates.length} duplicate${parseResult.duplicates.length !== 1 ? 's' : ''}`} />
                )}
                {parseResult.errors.length > 0 && (
                  <Badge color="#FF4D4D" label={`${parseResult.errors.length} error${parseResult.errors.length !== 1 ? 's' : ''}`} />
                )}
              </div>

              {/* Holdings to import */}
              {parseResult.imported.length > 0 && (
                <div className="rounded-lg overflow-hidden"
                  style={{ border: '1px solid #30363D' }}>
                  <div className="px-3 py-2 text-xs font-medium"
                    style={{ backgroundColor: '#0F1117', color: '#8B949E', borderBottom: '1px solid #30363D' }}>
                    HOLDINGS TO IMPORT
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {parseResult.imported.map((h) => (
                      <div key={h.id}
                        className="flex items-center justify-between px-3 py-2"
                        style={{ borderBottom: '1px solid #1E2430' }}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
                            {h.ticker}
                          </span>
                          <span className="text-xs truncate" style={{ color: '#8B949E', maxWidth: '160px' }}>
                            {h.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs" style={{ color: '#E6EDF3' }}>
                          {h.shares} @ {h.currency} {h.avgBuyPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="rounded-lg p-3 space-y-1"
                  style={{ backgroundColor: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)' }}>
                  {parseResult.errors.map((err, i) => (
                    <p key={i} className="text-xs flex items-start gap-1.5" style={{ color: '#FF4D4D' }}>
                      <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Duplicates */}
              {parseResult.duplicates.length > 0 && (
                <p className="text-xs" style={{ color: '#8B949E' }}>
                  Already in portfolio (skipped):{' '}
                  <span className="font-mono" style={{ color: '#F59E0B' }}>
                    {parseResult.duplicates.join(', ')}
                  </span>
                </p>
              )}

              {parseResult.imported.length === 0 ? (
                <div className="flex gap-2 pt-1">
                  <button onClick={reset}
                    className="flex-1 py-2 rounded-lg text-sm"
                    style={{ backgroundColor: '#0F1117', color: '#8B949E', border: '1px solid #30363D' }}>
                    Try another file
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button onClick={reset}
                    className="py-2 px-4 rounded-lg text-sm"
                    style={{ backgroundColor: '#0F1117', color: '#8B949E', border: '1px solid #30363D' }}>
                    Back
                  </button>
                  <button onClick={handleImport}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #00FF94, #00D4FF)', color: '#0F1117' }}>
                    Import {parseResult.imported.length} holding{parseResult.imported.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 'done' && parseResult && (
            <div className="flex flex-col items-center py-6 gap-4">
              <CheckCircle size={40} color="#00FF94" />
              <div className="text-center">
                <p className="font-semibold" style={{ color: '#E6EDF3' }}>
                  {parseResult.imported.length} holding{parseResult.imported.length !== 1 ? 's' : ''} imported
                </p>
                <p className="text-sm mt-1" style={{ color: '#8B949E' }}>
                  Your portfolio has been updated.
                </p>
              </div>
              <button onClick={handleClose}
                className="px-6 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #00FF94, #00D4FF)', color: '#0F1117' }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}
