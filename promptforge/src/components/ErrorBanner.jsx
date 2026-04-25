import { AlertTriangle, X, RefreshCw, Settings } from 'lucide-react';
import { useState } from 'react';

export default function ErrorBanner({ error, retryCountdown, onRetry, onOpenSettings, onDismiss }) {
  const [showRaw, setShowRaw] = useState(false);

  const canRetry = ['5xx', 'network', 'unknown', 'json', 'cutoff', 'refusal'].includes(error.type);
  const is429 = error.type === '429';
  const is401 = error.type === '401';

  return (
    <div className="mt-6 border border-error/40 bg-error/5 rounded p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="text-error flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[13px] text-text-1">{error.message}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {is401 && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 border border-accent text-accent hover:bg-accent hover:text-bg transition-all rounded"
              >
                <Settings size={11} /> OPEN SETTINGS
              </button>
            )}

            {is429 && (
              <button
                onClick={onRetry}
                disabled={retryCountdown > 0}
                className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 border border-accent text-accent hover:bg-accent hover:text-bg transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={11} />
                {retryCountdown > 0 ? `RETRY IN ${retryCountdown}s` : 'RETRY NOW'}
              </button>
            )}

            {canRetry && !is429 && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 border border-accent text-accent hover:bg-accent hover:text-bg transition-all rounded"
              >
                <RefreshCw size={11} /> RETRY
              </button>
            )}

            {error.raw && (
              <button
                onClick={() => setShowRaw(v => !v)}
                className="font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 border border-border text-text-2 hover:border-text-2 transition-all rounded"
              >
                {showRaw ? 'HIDE RAW' : 'SHOW RAW'}
              </button>
            )}
          </div>

          {showRaw && error.raw && (
            <details open className="mt-3">
              <summary className="font-mono text-[10px] text-text-3 tracking-[0.15em] cursor-pointer mb-2">RAW RESPONSE</summary>
              <pre className="text-[11px] font-mono text-text-2 bg-bg border border-border rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                {error.raw}
              </pre>
            </details>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-text-3 hover:text-text-1 transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
