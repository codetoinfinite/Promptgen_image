import { Copy, Check, RefreshCw, Megaphone } from 'lucide-react';
import { useState } from 'react';
import PromptCard from './PromptCard.jsx';

function CategoryPill({ category }) {
  return (
    <span className="inline-block font-mono text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 border border-accent text-accent rounded-full">
      {category}
    </span>
  );
}

function CopyButton({ text, copyToClipboard }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok !== false) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border border-border text-text-2 hover:border-accent hover:text-accent transition-all rounded focus:outline-none focus:ring-1 focus:ring-accent"
    >
      {copied ? <><Check size={11} className="text-success" /><span className="text-success">COPIED</span></> : <><Copy size={11} /><span>COPY ALL</span></>}
    </button>
  );
}

export default function ResultPanel({ result, tech, activeTab, onTabChange, onForgeAgain, copyToClipboard, buildCopyEverything, hasShownCopyHint, onMarkCopyHint }) {
  const variations = result.alt_variations || [];
  const tabs = ['main', ...variations.map((_, i) => i)];

  const activePrompt = activeTab === 'main'
    ? result.image_prompt
    : variations[activeTab]?.prompt;

  const getTabLabel = (tab) => {
    if (tab === 'main') return 'MAIN PROMPT';
    const v = variations[tab];
    return v?.angle ? `ALT: ${v.angle.toUpperCase()}` : `ALT ${tab + 1}`;
  };

  return (
    <div className="mt-10 result-panel-enter">
      {/* Category banner */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="font-mono text-text-3 text-[10px] tracking-[0.15em]">OUTPUT /</span>
        {result.category && <CategoryPill category={result.category} />}
        <h2 className="font-serif text-[28px] text-text-1 flex-1">{tech}</h2>
        <CopyButton text={buildCopyEverything()} copyToClipboard={copyToClipboard} />
      </div>

      {/* What it is + Core concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {result.tech_summary && (
          <div className="border border-border rounded bg-surface p-4 md:p-5">
            <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-3">WHAT IT IS</div>
            <p className="font-serif text-[20px] md:text-[22px] text-text-1 leading-snug">{result.tech_summary}</p>
          </div>
        )}
        {result.core_concepts?.length > 0 && (
          <div className="border border-border rounded bg-surface p-4 md:p-5">
            <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-3">CORE CONCEPTS</div>
            <ol className="space-y-1.5">
              {result.core_concepts.map((c, i) => (
                <li key={i} className="flex gap-2.5 font-sans text-[13px] text-text-1">
                  <span className="font-mono text-[11px] text-accent flex-shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Visual metaphor */}
      {result.visual_metaphor && (
        <div className="border border-border rounded bg-surface p-4 md:p-5 mb-4">
          <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-3">VISUAL METAPHOR</div>
          {result.visual_metaphor.primary && (
            <p className="font-serif italic text-[28px] md:text-[32px] text-accent leading-snug mb-2">
              "{result.visual_metaphor.primary}"
            </p>
          )}
          {result.visual_metaphor.why && (
            <p className="font-sans text-[13px] text-text-2 leading-relaxed">{result.visual_metaphor.why}</p>
          )}
        </div>
      )}

      {/* Variation tabs */}
      <div className="mb-4">
        {tabs.length > 1 && (
          <div className="flex gap-0 border-b border-border mb-4">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-4 py-2.5 font-mono text-[10px] tracking-[0.1em] uppercase transition-all border-b-2 -mb-px focus:outline-none ${
                  activeTab === tab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-3 hover:text-text-2'
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        )}

        {activePrompt && (
          <PromptCard
            prompt={activePrompt}
            label={activeTab === 'main' ? 'PRIMARY IMAGE PROMPT' : `ALT PROMPT — ${variations[activeTab]?.angle?.toUpperCase() || ''}`}
            accentBorder={activeTab === 'main'}
            copyToClipboard={copyToClipboard}
            showCopyHint={!hasShownCopyHint && activeTab === 'main'}
            onMarkCopyHint={onMarkCopyHint}
          />
        )}

        {activeTab === 'main' && result.negative_prompt && (
          <div className="mt-3 border border-border rounded bg-surface p-4">
            <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-2">NEGATIVE PROMPT</div>
            <p className="font-mono text-[12px] text-text-2 leading-relaxed">{result.negative_prompt}</p>
          </div>
        )}
      </div>

      {/* Engagement hooks */}
      {result.engagement_hooks?.length > 0 && (
        <div className="mb-4">
          <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-3">ENGAGEMENT HOOKS</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.engagement_hooks.map((hook, i) => {
              const [element, ...rest] = hook.split(' — ');
              return (
                <div key={i} className="border border-border rounded bg-surface p-3 md:p-4">
                  <div className="font-mono text-[10px] tracking-[0.15em] text-accent mb-1">HOOK {String(i + 1).padStart(2, '0')}</div>
                  <p className="font-sans text-[12px] text-text-1 leading-snug">
                    <strong className="text-text-1 font-medium">{element}</strong>
                    {rest.length > 0 && <span className="text-text-2"> — {rest.join(' — ')}</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audience adaptations */}
      {result.audience_adaptations?.length > 0 && (
        <div className="border border-border rounded bg-surface p-4 mb-4">
          <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-3">AUDIENCE ADAPTATIONS</div>
          <ul className="space-y-1.5">
            {result.audience_adaptations.map((a, i) => (
              <li key={i} className="flex gap-2.5 font-sans text-[13px] text-text-1">
                <span className="text-accent flex-shrink-0">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instagram caption */}
      {result.suggested_caption && (
        <div className="border border-border rounded bg-surface p-4 md:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Megaphone size={12} className="text-text-3" />
              <span className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase">INSTAGRAM CAPTION</span>
            </div>
            <CopyButton text={result.suggested_caption} copyToClipboard={copyToClipboard} />
          </div>
          <pre className="font-sans text-[14px] text-text-1 leading-[1.7] whitespace-pre-wrap break-words">
            {result.suggested_caption}
          </pre>
        </div>
      )}

      {/* Forge Again */}
      <div className="flex justify-center">
        <button
          onClick={onForgeAgain}
          className="flex items-center gap-2 px-6 py-3 border border-border text-text-2 hover:border-accent hover:text-accent font-mono text-[11px] tracking-[0.15em] uppercase rounded transition-all focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <RefreshCw size={13} /> FORGE AGAIN
        </button>
      </div>
    </div>
  );
}
