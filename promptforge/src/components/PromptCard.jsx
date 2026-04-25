import { useState, useEffect } from 'react';
import { Copy, Check, Image } from 'lucide-react';

export default function PromptCard({ prompt, label = 'PRIMARY IMAGE PROMPT', accentBorder = true, copyToClipboard, showCopyHint, onMarkCopyHint }) {
  const [copied, setCopied] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const wordCount = prompt ? prompt.split(/\s+/).filter(Boolean).length : 0;

  useEffect(() => {
    if (showCopyHint && !copied) {
      const t = setTimeout(() => setShowHint(true), 600);
      return () => clearTimeout(t);
    }
  }, [showCopyHint, copied]);

  const handleCopy = async () => {
    setShowHint(false);
    const ok = await copyToClipboard(prompt);
    if (ok !== false) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      if (showCopyHint && onMarkCopyHint) onMarkCopyHint();
    }
  };

  return (
    <div className={`border rounded bg-surface relative ${accentBorder ? 'border-accent' : 'border-border'}`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${accentBorder ? 'border-accent/30' : 'border-border'}`}>
        <div className="flex items-center gap-2">
          <Image size={11} className="text-text-3" />
          <span className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text-3">{wordCount} words</span>
          <div className="relative">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-text-2 hover:text-accent transition-colors focus:outline-none focus:ring-1 focus:ring-accent rounded"
            >
              {copied ? (
                <><Check size={11} className="text-success" /><span className="text-success">COPIED</span></>
              ) : (
                <><Copy size={11} /><span>COPY</span></>
              )}
            </button>
            {showHint && !copied && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-surface border border-accent/40 rounded px-2.5 py-2 text-[11px] font-sans text-text-2 z-50 shadow-lg pointer-events-none">
                <span className="text-accent font-medium">Tap to copy</span> → paste into Midjourney / DALL·E / Flux.
              </div>
            )}
          </div>
        </div>
      </div>
      <pre className="font-mono text-[13px] text-text-1 leading-[1.7] whitespace-pre-wrap break-words p-4 md:p-5">
        {prompt}
      </pre>
    </div>
  );
}
