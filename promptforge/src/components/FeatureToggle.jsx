import { Check, Info } from 'lucide-react';
import { useState } from 'react';

export default function FeatureToggle({ label, checked, onChange, tooltip }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-3.5 h-3.5 rounded-[2px] border flex-shrink-0 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg ${
          checked ? 'bg-accent border-accent' : 'bg-transparent border-border group-hover:border-text-3'
        }`}
      >
        {checked && <Check size={9} className="text-bg" strokeWidth={3} />}
      </button>
      <span
        className={`font-sans text-[12px] transition-colors duration-150 flex-1 select-none ${
          checked ? 'text-text-1' : 'text-text-2'
        }`}
        onClick={() => onChange(!checked)}
      >
        {label}
      </span>
      {tooltip && (
        <div className="relative">
          <button
            type="button"
            className="text-text-3 hover:text-text-2 transition-colors"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onClick={e => e.preventDefault()}
          >
            <Info size={11} />
          </button>
          {showTip && (
            <div className="absolute right-0 bottom-full mb-1 w-52 bg-surface border border-border rounded px-2 py-1.5 text-text-2 text-[11px] font-sans leading-relaxed z-50 pointer-events-none shadow-lg">
              {tooltip}
            </div>
          )}
        </div>
      )}
    </label>
  );
}
