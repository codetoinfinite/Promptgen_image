import { useState } from 'react';
import { X, Eye, EyeOff, Trash2, Check, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { testLLM, PROVIDERS, getProvider } from '../lib/llm.js';

export default function SettingsModal({
  provider, onProviderChange,
  model, onModelChange,
  apiKey, onSaveApiKey,
  presets, onDeletePreset, onApplyPreset, onSavePreset,
  onClearHistory, historyCount,
  onClose, firstRun = false,
}) {
  const [tempProvider, setTempProvider] = useState(provider || 'anthropic');
  const [tempModel, setTempModel] = useState(model || '');
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [customModel, setCustomModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testCooldown, setTestCooldown] = useState(0);
  const [presetName, setPresetName] = useState('');
  const [savedPreset, setSavedPreset] = useState(false);

  const providerInfo = getProvider(tempProvider);
  const isCustomModel = providerInfo.customModel && tempModel === '__custom__';
  const effectiveModel = isCustomModel ? customModel : tempModel;

  const handleProviderSwitch = (pid) => {
    setTempProvider(pid);
    const info = getProvider(pid);
    setTempModel(info.defaultModel);
    setCustomModel('');
    setTestStatus(null);
    // Load saved key for this provider from sessionStorage
    const saved = sessionStorage.getItem(`pf_api_key_${pid}`) || '';
    setTempKey(saved);
  };

  const handleSave = () => {
    const trimmed = tempKey.trim();
    sessionStorage.setItem(`pf_api_key_${tempProvider}`, trimmed);
    onSaveApiKey(trimmed);
    onProviderChange(tempProvider);
    onModelChange(effectiveModel || providerInfo.defaultModel);
    if (firstRun && trimmed) onClose();
    else if (!firstRun) onClose();
  };

  const handleTest = async () => {
    if (!tempKey.trim() || testCooldown > 0) return;
    setTesting(true);
    setTestStatus(null);
    try {
      await testLLM(tempProvider, tempKey.trim(), effectiveModel || providerInfo.defaultModel);
      setTestStatus('success');
    } catch {
      setTestStatus('error');
    } finally {
      setTesting(false);
      setTestCooldown(30);
      const iv = setInterval(() => setTestCooldown(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }), 1000);
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim() || presets.length >= 10) return;
    onSavePreset(presetName.trim());
    setPresetName('');
    setSavedPreset(true);
    setTimeout(() => setSavedPreset(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(13,12,10,0.85)' }}
    >
      <div className="bg-surface border border-border rounded w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-serif text-[22px] text-text-1">
              {firstRun ? <>Welcome to <em className="text-accent italic">PromptForge</em></> : 'Settings'}
            </h2>
            {firstRun && (
              <p className="font-sans text-text-2 text-[12px] mt-0.5">
                Pick your AI provider and paste your API key.
              </p>
            )}
          </div>
          {!firstRun && (
            <button onClick={onClose} className="text-text-3 hover:text-text-1 transition-colors focus:outline-none">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="p-5 space-y-6">

          {/* Provider selector */}
          <div>
            <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-2">AI PROVIDER</div>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderSwitch(p.id)}
                  className={`text-left px-3 py-2.5 border rounded transition-all focus:outline-none focus:ring-1 focus:ring-accent ${
                    tempProvider === p.id
                      ? 'border-accent bg-accent/5 text-text-1'
                      : 'border-border text-text-2 hover:border-text-3'
                  }`}
                >
                  <div className={`font-mono text-[11px] tracking-[0.05em] ${tempProvider === p.id ? 'text-accent' : 'text-text-3'}`}>
                    {tempProvider === p.id ? '● ' : '○ '}
                    {p.id === 'anthropic' && 'ANTHROPIC'}
                    {p.id === 'google' && 'GOOGLE'}
                    {p.id === 'xai' && 'XAI'}
                    {p.id === 'openrouter' && 'OPENROUTER'}
                  </div>
                  <div className="font-sans text-[11px] text-text-2 mt-0.5">
                    {p.id === 'anthropic' && 'Claude'}
                    {p.id === 'google' && 'Gemini'}
                    {p.id === 'xai' && 'Grok'}
                    {p.id === 'openrouter' && '100+ models'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Model selector */}
          <div>
            <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-2">MODEL</div>
            {providerInfo.customModel ? (
              <div className="space-y-2">
                <div className="relative">
                  <select
                    value={tempModel}
                    onChange={e => setTempModel(e.target.value)}
                    className="w-full bg-bg border border-border rounded px-3 py-2.5 pr-8 font-sans text-[13px] text-text-1 appearance-none focus:outline-none focus:border-accent transition-colors"
                  >
                    {providerInfo.models.map(m => (
                      <option key={m.id} value={m.id} className="bg-surface">{m.label}</option>
                    ))}
                    <option value="__custom__" className="bg-surface">Custom model ID…</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                </div>
                {isCustomModel && (
                  <input
                    type="text"
                    value={customModel}
                    onChange={e => setCustomModel(e.target.value)}
                    placeholder="e.g. mistralai/mistral-7b-instruct"
                    className="w-full bg-bg border border-accent/50 rounded px-3 py-2 font-mono text-[12px] text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors"
                  />
                )}
              </div>
            ) : (
              <div className="relative">
                <select
                  value={tempModel}
                  onChange={e => setTempModel(e.target.value)}
                  className="w-full bg-bg border border-border rounded px-3 py-2.5 pr-8 font-sans text-[13px] text-text-1 appearance-none focus:outline-none focus:border-accent transition-colors"
                >
                  {providerInfo.models.map(m => (
                    <option key={m.id} value={m.id} className="bg-surface">{m.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
              </div>
            )}
          </div>

          {/* API key */}
          <div>
            <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-2">API KEY</div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                onPaste={e => {
                  e.preventDefault();
                  setTempKey(e.clipboardData.getData('text').trim());
                }}
                placeholder={providerInfo.keyPlaceholder}
                className="w-full bg-bg border border-border rounded px-3 py-2.5 pr-9 font-mono text-[13px] text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors"
                style={{ outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-2 transition-colors"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="font-sans text-[11px] text-text-3 mt-1.5 leading-relaxed">
              Session only — cleared on tab close, never touches localStorage.{' '}
              <a
                href={providerInfo.keyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Get key at {providerInfo.keyLinkLabel} →
              </a>
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleSave}
                disabled={!tempKey.trim()}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg font-mono text-[11px] tracking-[0.1em] uppercase rounded transition-all disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-accent"
              >
                SAVE & APPLY
              </button>
              <button
                onClick={handleTest}
                disabled={!tempKey.trim() || testing || testCooldown > 0}
                className="flex items-center gap-1.5 px-4 py-2 border border-border text-text-2 hover:border-accent hover:text-accent font-mono text-[11px] tracking-[0.1em] uppercase rounded transition-all disabled:opacity-40 focus:outline-none"
              >
                {testing && <Loader2 size={11} className="animate-spin" />}
                {testCooldown > 0 ? `WAIT ${testCooldown}s` : 'TEST'}
              </button>
              {testStatus === 'success' && (
                <span className="flex items-center gap-1 text-success font-mono text-[11px] self-center">
                  <Check size={12} /> VALID
                </span>
              )}
              {testStatus === 'error' && (
                <span className="flex items-center gap-1 text-error font-mono text-[11px] self-center">
                  <AlertCircle size={12} /> INVALID
                </span>
              )}
            </div>
          </div>

          {/* Custom presets (not first-run) */}
          {!firstRun && (
            <div>
              <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-2">
                CUSTOM PRESETS
                {presets.length > 0 && <span className="text-accent ml-1">({presets.length}/10)</span>}
              </div>
              {presets.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {presets.map(p => (
                    <div key={p.id} className="flex items-center justify-between border border-border rounded px-3 py-2">
                      <button
                        onClick={() => { onApplyPreset(p); onClose(); }}
                        className="font-sans text-[13px] text-text-1 hover:text-accent transition-colors text-left flex-1"
                      >
                        {p.name}
                      </button>
                      <button onClick={() => onDeletePreset(p.id)} className="text-text-3 hover:text-error transition-colors ml-2">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {presets.length < 10 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={e => setPresetName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSavePreset()}
                    placeholder="Preset name…"
                    className="flex-1 bg-bg border border-border rounded px-3 py-2 font-sans text-[13px] text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors"
                    style={{ outline: 'none' }}
                  />
                  <button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className="px-3 py-2 border border-border text-text-2 hover:border-accent hover:text-accent font-mono text-[11px] tracking-[0.1em] uppercase rounded transition-all disabled:opacity-40 focus:outline-none flex-shrink-0"
                  >
                    {savedPreset ? <Check size={12} className="text-success" /> : 'SAVE'}
                  </button>
                </div>
              )}
              <p className="font-sans text-[11px] text-text-3 mt-1.5">Saves style + audience settings, not the tech name.</p>
            </div>
          )}

          {/* Clear history (not first-run) */}
          {!firstRun && historyCount > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-2">HISTORY</div>
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-2 border border-border text-text-2 hover:border-error hover:text-error font-mono text-[11px] tracking-[0.1em] uppercase rounded transition-all focus:outline-none"
              >
                <Trash2 size={11} /> CLEAR {historyCount} ENTRIES
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
