import { X } from 'lucide-react';

function formatTimestamp(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return iso; }
}

export default function HistoryDrawer({ history, onRecall, onClose }) {
  if (history.length === 0) {
    return (
      <div className="border border-border rounded bg-surface p-6 mb-4 text-center">
        <p className="font-mono text-text-3 text-[11px] tracking-[0.1em]">NO HISTORY YET</p>
        <button onClick={onClose} className="mt-3 font-mono text-[10px] text-text-3 hover:text-text-2 tracking-[0.1em] uppercase transition-colors">CLOSE</button>
      </div>
    );
  }

  return (
    <div className="border border-border rounded bg-surface mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase">GENERATION HISTORY</span>
        <button onClick={onClose} className="text-text-3 hover:text-text-1 transition-colors focus:outline-none">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-border">
        {history.map(entry => (
          <button
            key={entry.id}
            onClick={() => onRecall(entry)}
            className="w-full text-left px-4 py-3 hover:bg-bg transition-colors focus:outline-none focus:bg-bg group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-text-3 tracking-[0.05em] mb-1">
                  {formatTimestamp(entry.timestamp)}
                </p>
                <p className="font-serif text-[20px] text-text-1 truncate group-hover:text-accent transition-colors">
                  {entry.tech}
                </p>
                {entry.result?.category && (
                  <span className="inline-block font-mono text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border border-accent/40 text-accent/70 rounded-full mt-1">
                    {entry.result.category}
                  </span>
                )}
              </div>
              <span className="font-mono text-[10px] text-text-3 group-hover:text-accent transition-colors mt-1 flex-shrink-0">
                RECALL →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
