import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Header from './components/Header.jsx';
import TechInput from './components/TechInput.jsx';
import PresetBar from './components/PresetBar.jsx';
import CustomizationGrid from './components/CustomizationGrid.jsx';
import ForgeLog from './components/ForgeLog.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import { buildMetaPrompt } from './lib/metaPrompt.js';
import { callLLM, getProvider } from './lib/llm.js';

const DEFAULT_FEATURES = {
  labels: true, mascot: false, comparison: false,
  realObject: true, numbers: false, cultural: true, questionHook: true,
};

function safeParseLocalStorage(key, fallback) {
  try {
    const val = JSON.parse(localStorage.getItem(key) || 'null');
    return val ?? fallback;
  } catch { return fallback; }
}

function safeSaveLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') return false;
    return false;
  }
}

export default function App() {
  // Provider / model
  const [provider, setProvider] = useState('anthropic');
  const [model, setModel] = useState('claude-sonnet-4-6');

  // Input state
  const [tech, setTech] = useState('');
  const [country, setCountry] = useState('India');
  const [ageGroup, setAgeGroup] = useState('Young Adults (18-24)');
  const [expertise, setExpertise] = useState('Curious beginner');
  const [visualStyle, setVisualStyle] = useState('Isometric 3D');
  const [mood, setMood] = useState('Energetic / scroll-stopping');
  const [aspect, setAspect] = useState('Square (1:1) — feed');
  const [imageGen, setImageGen] = useState('Midjourney v6');
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [extraNotes, setExtraNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [forgeLog, setForgeLog] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFirstRun, setShowFirstRun] = useState(false);
  const [activeTab, setActiveTab] = useState('main');

  // Persistent
  const [apiKey, setApiKey] = useState('');
  const [history, setHistory] = useState([]);
  const [presets, setPresets] = useState([]);
  const [hasShownCopyHint, setHasShownCopyHint] = useState(false);

  const resultRef = useRef(null);
  const forgeIntervalRef = useRef(null);
  const retryIntervalRef = useRef(null);
  const isForging = useRef(false);
  const forgeRef = useRef(null);

  // Load persisted data
  useEffect(() => {
    const savedProvider = localStorage.getItem('pf_provider') || 'anthropic';
    const savedModel = localStorage.getItem('pf_model') || getProvider(savedProvider).defaultModel;
    setProvider(savedProvider);
    setModel(savedModel);

    const key = sessionStorage.getItem(`pf_api_key_${savedProvider}`) || '';
    setApiKey(key);
    if (!key) setShowFirstRun(true);

    const hist = safeParseLocalStorage('pf_history', []);
    setHistory(Array.isArray(hist) ? hist : []);

    const prs = safeParseLocalStorage('pf_presets', []);
    setPresets(Array.isArray(prs) ? prs : []);

    setHasShownCopyHint(!!localStorage.getItem('pf_copy_hint_shown'));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        forgeRef.current?.();
      }
      if (e.key === 'Escape') {
        setShowSettings(false);
        setShowHistory(false);
        setShowFirstRun(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const startRetryCountdown = useCallback((seconds) => {
    clearInterval(retryIntervalRef.current);
    setRetryCountdown(seconds);
    retryIntervalRef.current = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) { clearInterval(retryIntervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Token estimate
  const estimatedTokens = useMemo(() => {
    if (!tech.trim()) return null;
    try {
      const prompt = buildMetaPrompt({ tech: tech.trim(), country, ageGroup, expertise, visualStyle, mood, aspect, imageGen, features, extraNotes });
      return Math.round(prompt.split(/\s+/).length * 1.3);
    } catch { return null; }
  }, [tech, country, ageGroup, expertise, visualStyle, mood, aspect, imageGen, features, extraNotes]);

  const handleSaveApiKey = useCallback((key) => {
    setApiKey(key);
    // sessionStorage keyed per-provider — saved by SettingsModal already
  }, []);

  const handleProviderChange = useCallback((pid) => {
    setProvider(pid);
    localStorage.setItem('pf_provider', pid);
    const key = sessionStorage.getItem(`pf_api_key_${pid}`) || '';
    setApiKey(key);
  }, []);

  const handleModelChange = useCallback((m) => {
    setModel(m);
    localStorage.setItem('pf_model', m);
  }, []);

  const handlePreset = useCallback((presetSettings) => {
    if (presetSettings.expertise !== undefined) setExpertise(presetSettings.expertise);
    if (presetSettings.visualStyle !== undefined) setVisualStyle(presetSettings.visualStyle);
    if (presetSettings.mood !== undefined) setMood(presetSettings.mood);
    if (presetSettings.features !== undefined) setFeatures(presetSettings.features);
  }, []);

  const handleSavePreset = useCallback((name) => {
    if (presets.length >= 10) return;
    const preset = {
      id: Date.now(), name,
      settings: { country, ageGroup, expertise, visualStyle, mood, aspect, imageGen, features, extraNotes },
    };
    const next = [...presets, preset];
    setPresets(next);
    safeSaveLocalStorage('pf_presets', next);
  }, [presets, country, ageGroup, expertise, visualStyle, mood, aspect, imageGen, features, extraNotes]);

  const handleDeletePreset = useCallback((id) => {
    setPresets(prev => {
      const next = prev.filter(p => p.id !== id);
      safeSaveLocalStorage('pf_presets', next);
      return next;
    });
  }, []);

  const handleApplyPreset = useCallback((preset) => {
    handlePreset(preset.settings);
  }, [handlePreset]);

  const handleRecallHistory = useCallback((entry) => {
    const { tech: t, inputs, result: r } = entry;
    setTech(t);
    if (inputs.country) setCountry(inputs.country);
    if (inputs.ageGroup) setAgeGroup(inputs.ageGroup);
    if (inputs.expertise) setExpertise(inputs.expertise);
    if (inputs.visualStyle) setVisualStyle(inputs.visualStyle);
    if (inputs.mood) setMood(inputs.mood);
    if (inputs.aspect) setAspect(inputs.aspect);
    if (inputs.imageGen) setImageGen(inputs.imageGen);
    if (inputs.features) setFeatures(inputs.features);
    if (inputs.extraNotes !== undefined) setExtraNotes(inputs.extraNotes);
    setResult(r);
    setError(null);
    setActiveTab('main');
    setShowHistory(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem('pf_history'); } catch {}
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch { return false; }
    }
  }, []);

  const buildCopyEverything = useCallback(() => {
    if (!result) return '';
    return [
      `PROMPTFORGE — ${tech.trim()}`,
      `Category: ${result.category || ''}`,
      '',
      'WHAT IT IS',
      result.tech_summary || '',
      '',
      'CORE CONCEPTS',
      ...(result.core_concepts || []).map((c, i) => `${String(i + 1).padStart(2, '0')}. ${c}`),
      '',
      'VISUAL METAPHOR',
      result.visual_metaphor?.primary || '',
      result.visual_metaphor?.why || '',
      '',
      'PRIMARY IMAGE PROMPT',
      result.image_prompt || '',
      '',
      'NEGATIVE PROMPT',
      result.negative_prompt || '',
      '',
      ...(result.alt_variations || []).flatMap((v, i) => [
        `ALT VARIATION ${i + 1}: ${v.angle || ''}`,
        v.prompt || '',
        '',
      ]),
      'ENGAGEMENT HOOKS',
      ...(result.engagement_hooks || []).map(h => `• ${h}`),
      '',
      'AUDIENCE ADAPTATIONS',
      ...(result.audience_adaptations || []).map(a => `• ${a}`),
      '',
      'INSTAGRAM CAPTION',
      result.suggested_caption || '',
    ].join('\n');
  }, [result, tech]);

  const handleForge = useCallback(async () => {
    if (isForging.current) return;

    const trimmedTech = tech.trim();
    if (!trimmedTech) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    const currentKey = sessionStorage.getItem(`pf_api_key_${provider}`) || apiKey;
    if (!currentKey) {
      setShowFirstRun(true);
      return;
    }

    isForging.current = true;
    setLoading(true);
    setError(null);
    setResult(null);
    setForgeLog([]);
    setActiveTab('main');

    const steps = [
      '> initializing forge...',
      `> analyzing "${trimmedTech}"...`,
      '> identifying tech category...',
      '> selecting visual metaphor...',
      `> adapting for ${country} / ${ageGroup}...`,
      `> composing prompt for ${imageGen}...`,
      '> finalizing variations...',
    ];

    let stepIdx = 0;
    clearInterval(forgeIntervalRef.current);
    forgeIntervalRef.current = setInterval(() => {
      if (stepIdx < steps.length) {
        const line = steps[stepIdx++];
        setForgeLog(prev => [...prev, line]);
      }
    }, 600);

    try {
      const prompt = buildMetaPrompt({ tech: trimmedTech, country, ageGroup, expertise, visualStyle, mood, aspect, imageGen, features, extraNotes });
      const text = await callLLM(provider, currentKey, model, prompt);

      clearInterval(forgeIntervalRef.current);

      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); }
          catch {
            const isCutOff = cleaned.length > 3000 && !cleaned.trimEnd().endsWith('}');
            setError({
              type: isCutOff ? 'cutoff' : 'json',
              message: isCutOff
                ? 'Response was cut off. Try a more specific tech topic or simpler settings.'
                : 'Model returned non-JSON. Try Forge again.',
              raw: cleaned,
            });
            return;
          }
        } else {
          const lower = text.toLowerCase();
          if (lower.includes("i can't help") || lower.includes('i cannot help')) {
            setError({ type: 'refusal', message: 'Model declined this topic. Try rephrasing.', raw: text });
          } else {
            const isCutOff = cleaned.length > 3000 && !cleaned.trimEnd().endsWith('}');
            setError({
              type: isCutOff ? 'cutoff' : 'json',
              message: isCutOff
                ? 'Response was cut off. Try a more specific topic or simpler settings.'
                : 'Model returned non-JSON. Try Forge again.',
              raw: text,
            });
          }
          return;
        }
      }

      setResult(parsed);

      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        tech: trimmedTech,
        inputs: { country, ageGroup, expertise, visualStyle, mood, aspect, imageGen, features, extraNotes },
        result: parsed,
      };

      setHistory(prev => {
        let next = [entry, ...prev].slice(0, 20);
        const ok = safeSaveLocalStorage('pf_history', next);
        if (!ok) {
          next = [entry, ...prev].slice(0, 10);
          safeSaveLocalStorage('pf_history', next);
        }
        return next;
      });

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    } catch (err) {
      clearInterval(forgeIntervalRef.current);
      const msg = err.message || '';

      if (msg.includes('401') || msg.includes('403')) {
        setError({ type: '401', message: 'API key rejected. Open settings to update.' });
      } else if (msg.includes('429')) {
        setError({ type: '429', message: 'Rate limited. Wait ~30s and try again.' });
        startRetryCountdown(30);
      } else if (msg.includes('529') || /API 5\d\d/.test(msg)) {
        setError({ type: '5xx', message: 'Provider is overloaded. Retry?' });
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed') || msg.includes('fetch')) {
        setError({ type: 'network', message: 'Check your connection. (CORS may block some providers from the browser.)' });
      } else {
        setError({ type: 'unknown', message: msg || 'Unknown error. Try again.' });
      }
    } finally {
      isForging.current = false;
      setLoading(false);
    }
  }, [tech, country, ageGroup, expertise, visualStyle, mood, aspect, imageGen, features, extraNotes, apiKey, provider, model, startRetryCountdown]);

  useEffect(() => { forgeRef.current = handleForge; }, [handleForge]);

  const handleMarkCopyHint = useCallback(() => {
    setHasShownCopyHint(true);
    localStorage.setItem('pf_copy_hint_shown', '1');
  }, []);

  // Provider display label for header
  const providerInfo = getProvider(provider);

  return (
    <div className="min-h-screen bg-bg text-text-1 font-sans relative">
      <div className="grain-overlay" aria-hidden="true" />

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pb-16 relative z-10">
        <Header
          onOpenHistory={() => setShowHistory(v => !v)}
          onOpenSettings={() => setShowSettings(true)}
          historyCount={history.length}
          loading={loading}
          providerLabel={providerInfo.name}
        />

        {showHistory && (
          <HistoryDrawer
            history={history}
            onRecall={handleRecallHistory}
            onClose={() => setShowHistory(false)}
          />
        )}

        <div className="h-px bg-border" />

        <main className="pt-10 pb-8">
          <TechInput
            tech={tech}
            onTechChange={setTech}
            onForge={handleForge}
            loading={loading}
            shake={shake}
            estimatedTokens={estimatedTokens}
          />

          <PresetBar onApplyPreset={handlePreset} />

          <CustomizationGrid
            country={country} onCountryChange={setCountry}
            ageGroup={ageGroup} onAgeGroupChange={setAgeGroup}
            expertise={expertise} onExpertiseChange={setExpertise}
            visualStyle={visualStyle} onVisualStyleChange={setVisualStyle}
            mood={mood} onMoodChange={setMood}
            aspect={aspect} onAspectChange={setAspect}
            imageGen={imageGen} onImageGenChange={setImageGen}
            features={features} onFeaturesChange={setFeatures}
            extraNotes={extraNotes} onExtraNotesChange={setExtraNotes}
          />

          {!loading && !result && !error && (
            <div className="mt-4 text-center py-6">
              <p className="font-mono text-text-3 text-[11px] tracking-[0.15em]">
                <span className="text-accent">{'>'}</span> awaiting input. type a tech topic above and press FORGE.
              </p>
            </div>
          )}

          {loading && <ForgeLog lines={forgeLog} />}

          {error && (
            <ErrorBanner
              error={error}
              retryCountdown={retryCountdown}
              onRetry={handleForge}
              onOpenSettings={() => setShowSettings(true)}
              onDismiss={() => setError(null)}
            />
          )}

          {result && (
            <div ref={resultRef}>
              <ResultPanel
                result={result}
                tech={tech.trim()}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onForgeAgain={handleForge}
                copyToClipboard={copyToClipboard}
                buildCopyEverything={buildCopyEverything}
                hasShownCopyHint={hasShownCopyHint}
                onMarkCopyHint={handleMarkCopyHint}
              />
            </div>
          )}
        </main>

        <footer className="border-t border-border pt-4 pb-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <span className="font-mono text-text-3 text-[10px] tracking-[0.1em]">
              POWERED BY {providerInfo.name.toUpperCase()} / BUILT FOR EDUCATORS
            </span>
            <span className="font-mono text-text-3 text-[10px] tracking-[0.1em]">
              PASTE PROMPT → MIDJOURNEY / DALL·E / FLUX → POST → REPEAT
            </span>
          </div>
        </footer>
      </div>

      {showSettings && (
        <SettingsModal
          provider={provider} onProviderChange={handleProviderChange}
          model={model} onModelChange={handleModelChange}
          apiKey={apiKey} onSaveApiKey={handleSaveApiKey}
          presets={presets}
          onDeletePreset={handleDeletePreset}
          onApplyPreset={handleApplyPreset}
          onSavePreset={handleSavePreset}
          onClearHistory={handleClearHistory}
          historyCount={history.length}
          onClose={() => setShowSettings(false)}
          firstRun={false}
        />
      )}

      {showFirstRun && !showSettings && (
        <SettingsModal
          provider={provider} onProviderChange={handleProviderChange}
          model={model} onModelChange={handleModelChange}
          apiKey={apiKey} onSaveApiKey={handleSaveApiKey}
          presets={presets}
          onDeletePreset={handleDeletePreset}
          onApplyPreset={handleApplyPreset}
          onSavePreset={handleSavePreset}
          onClearHistory={handleClearHistory}
          historyCount={history.length}
          onClose={() => setShowFirstRun(false)}
          firstRun={true}
        />
      )}
    </div>
  );
}
