import { History, Settings } from 'lucide-react';

export default function Header({ onOpenHistory, onOpenSettings, historyCount, loading, providerLabel }) {
  return (
    <header className="py-5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 ${loading ? 'animate-pulse' : ''}`}
          />
          <span className="font-mono text-text-3 text-[10px] tracking-[0.15em]">
            PROMPTFORGE v1.0{providerLabel ? <span className="text-accent ml-2">/ {providerLabel.split(' ')[0].toUpperCase()}</span> : null}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-text-2 hover:text-text-1 border border-border hover:border-text-3 rounded transition-all focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <History size={12} />
            HISTORY
            {historyCount > 0 && (
              <span className="ml-0.5 text-accent">{historyCount}</span>
            )}
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-text-2 hover:text-text-1 border border-border hover:border-text-3 rounded transition-all focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      <div>
        <h1 className="font-serif text-[44px] md:text-[54px] leading-none tracking-tight">
          Prompt<em className="text-accent not-italic italic">Forge</em>
        </h1>
        <p className="font-sans text-text-2 text-[14px] mt-2">
          Turn any tech topic into a category-aware image prompt — ready for Midjourney, DALL·E, or Flux.
        </p>
      </div>
    </header>
  );
}
