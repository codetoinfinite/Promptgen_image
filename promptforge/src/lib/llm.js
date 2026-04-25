export const PROVIDERS = [
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    keyPlaceholder: 'sk-ant-api03-...',
    keyLink: 'https://console.anthropic.com/settings/keys',
    keyLinkLabel: 'console.anthropic.com',
    models: [
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 — recommended' },
      { id: 'claude-opus-4-7', label: 'Claude Opus 4.7 — most capable' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 — fastest' },
    ],
    defaultModel: 'claude-sonnet-4-6',
    testModel: 'claude-haiku-4-5-20251001',
    customModel: false,
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    keyPlaceholder: 'AIzaSy...',
    keyLink: 'https://aistudio.google.com/apikey',
    keyLinkLabel: 'aistudio.google.com',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash — recommended' },
      { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite — fastest/free' },
      { id: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' },
    ],
    defaultModel: 'gemini-2.0-flash',
    testModel: 'gemini-2.0-flash-lite',
    customModel: false,
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    keyPlaceholder: 'xai-...',
    keyLink: 'https://console.x.ai',
    keyLinkLabel: 'console.x.ai',
    models: [
      { id: 'grok-3', label: 'Grok 3 — recommended' },
      { id: 'grok-3-mini', label: 'Grok 3 Mini — fastest' },
      { id: 'grok-2', label: 'Grok 2' },
    ],
    defaultModel: 'grok-3',
    testModel: 'grok-3-mini',
    customModel: false,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (100+ models)',
    keyPlaceholder: 'sk-or-v1-...',
    keyLink: 'https://openrouter.ai/keys',
    keyLinkLabel: 'openrouter.ai',
    models: [
      { id: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (free)' },
      { id: 'openai/gpt-4o', label: 'GPT-4o' },
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
      { id: 'mistralai/mistral-large', label: 'Mistral Large' },
      { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1' },
    ],
    defaultModel: 'anthropic/claude-sonnet-4-6',
    testModel: 'google/gemini-2.0-flash-exp:free',
    customModel: true,
  },
];

export function getProvider(id) {
  return PROVIDERS.find(p => p.id === id) || PROVIDERS[0];
}

// ── Anthropic ──────────────────────────────────────────────────────────────
async function callAnthropic(apiKey, model, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content.map(b => (b.type === 'text' ? b.text : '')).join('').trim();
}

// ── Google Gemini ──────────────────────────────────────────────────────────
async function callGoogle(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text.trim();
}

// ── OpenAI-compatible (xAI, OpenRouter) ───────────────────────────────────
async function callOpenAICompat(endpoint, apiKey, model, prompt, extraHeaders = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from model');
  return text.trim();
}

// ── Public call ────────────────────────────────────────────────────────────
export async function callLLM(provider, apiKey, model, prompt) {
  switch (provider) {
    case 'anthropic':
      return callAnthropic(apiKey, model, prompt);
    case 'google':
      return callGoogle(apiKey, model, prompt);
    case 'xai':
      return callOpenAICompat('https://api.x.ai/v1/chat/completions', apiKey, model, prompt);
    case 'openrouter':
      return callOpenAICompat(
        'https://openrouter.ai/api/v1/chat/completions',
        apiKey,
        model,
        prompt,
        { 'HTTP-Referer': window.location.origin, 'X-Title': 'PromptForge' },
      );
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// ── Test connection ────────────────────────────────────────────────────────
export async function testLLM(provider, apiKey, model) {
  const info = getProvider(provider);
  const m = info.testModel || model;

  switch (provider) {
    case 'anthropic': {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: m, max_tokens: 5, messages: [{ role: 'user', content: 'Hi' }] }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      return true;
    }
    case 'google': {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 5 } }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      return true;
    }
    case 'xai': {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: m, max_tokens: 5, messages: [{ role: 'user', content: 'Hi' }] }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      return true;
    }
    case 'openrouter': {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'PromptForge',
        },
        body: JSON.stringify({ model: m, max_tokens: 5, messages: [{ role: 'user', content: 'Hi' }] }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      return true;
    }
    default:
      throw new Error('Unknown provider');
  }
}
