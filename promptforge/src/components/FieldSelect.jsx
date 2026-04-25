import { ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';

export default function FieldSelect({ label, value, options, onChange, tooltip }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1 mb-1.5">
        <span className="font-mono text-text-3 text-[10px] tracking-[0.15em] uppercase">{label}</span>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              className="text-text-3 hover:text-text-2 transition-colors"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
            >
              <Info size={11} />
            </button>
            {showTip && (
              <div className="absolute left-0 bottom-full mb-1 w-52 bg-surface border border-border rounded px-2 py-1.5 text-text-2 text-[11px] font-sans leading-relaxed z-50 pointer-events-none shadow-lg">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent border border-border rounded px-3 py-2 pr-8 font-sans text-[13px] text-text-1 appearance-none cursor-pointer focus:outline-none focus:border-accent transition-colors"
          style={{ outline: 'none' }}
        >
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-surface text-text-1">{opt}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
      </div>
    </div>
  );
}
