import { Wand2, Loader2 } from 'lucide-react';

export default function TechInput({ tech, onTechChange, onForge, loading, shake, estimatedTokens }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onForge();
    }
  };

  const handleFocus = (e) => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] tracking-[0.15em] mb-2">
        <span className="text-accent">01</span>
        <span className="text-text-3"> — TECH TOPIC</span>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={tech}
            onChange={e => onTechChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Docker, Kubernetes, RAG, Rust, JWT…"
            className={`w-full bg-transparent border rounded px-4 py-3 font-serif text-[26px] md:text-[32px] text-text-1 placeholder:text-text-3 focus:outline-none transition-all ${
              shake ? 'border-error shake-input' : 'border-border focus:border-accent'
            }`}
            style={{ outline: 'none' }}
            disabled={loading}
          />
        </div>

        <button
          onClick={onForge}
          disabled={loading || !tech.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-bg font-mono text-[12px] tracking-[0.15em] uppercase rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg flex-shrink-0"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /><span>FORGING</span></>
          ) : (
            <><Wand2 size={14} /><span>FORGE</span></>
          )}
        </button>
      </div>

      {estimatedTokens && (
        <p className="font-mono text-[10px] text-text-3 mt-2 tracking-[0.05em]">
          ~{estimatedTokens.toLocaleString()} input tokens estimated
        </p>
      )}
    </div>
  );
}
