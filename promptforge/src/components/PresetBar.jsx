import { Smile, Code2, Zap } from 'lucide-react';
import { QUICK_PRESETS } from '../lib/constants.js';

const ICONS = { Smile, Code2, Zap };

export default function PresetBar({ onApplyPreset }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="font-mono text-text-3 text-[10px] tracking-[0.15em] flex-shrink-0">QUICK SET →</span>
      {QUICK_PRESETS.map(preset => {
        const Icon = ICONS[preset.icon];
        return (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset.settings)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded font-mono text-[11px] tracking-[0.08em] text-text-2 hover:border-accent hover:text-accent transition-all focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {Icon && <Icon size={11} />}
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
