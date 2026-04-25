# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**PromptForge** — a React 18 + Vite SPA that turns a tech topic name into a category-aware, ultra-detailed image-generation prompt for Midjourney / DALL-E / Flux, plus an Instagram caption. The full product spec lives in `promptforge-build-spec.md`. Read it before touching anything.

The app lives entirely in the browser — no backend, no SSR. It calls the Anthropic API directly from the browser using the user's own API key (held in `sessionStorage` only, never `localStorage`).

## Commands

All commands run from inside `promptforge/` (the built app directory):

```bash
npm install        # install deps
npm run dev        # dev server (Vite, hot-reload)
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

## Project Structure (once built)

```
promptforge/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   ├── metaPrompt.js    ← the brain; buildMetaPrompt(inputs) → prompt string
    │   ├── anthropic.js     ← callClaude(apiKey, prompt) fetch wrapper
    │   └── constants.js     ← all dropdown option arrays
    └── components/          ← pure UI components, no API logic
```

## Architecture

**Data flow:** `App.jsx` owns all state. User inputs flow into `buildMetaPrompt()` → `callClaude()` → raw text → JSON parse → result state → result components.

**API key lifecycle:** stored in `sessionStorage` on save; read back on every `callClaude()` call. Never written to `localStorage`. The key is only ever sent to `https://api.anthropic.com`.

**The meta-prompt** (`metaPrompt.js`) is the core product differentiator — it forces Claude to pick a category-specific visual metaphor (containers → shipping harbor, not circuit board). Do not paraphrase or shorten it; the exact text is in `promptforge-build-spec.md §4`.

**Model:** `claude-sonnet-4-20250514`, `max_tokens: 4000`. Response must be strict JSON — App.jsx strips markdown fences and falls back to regex extraction on parse failure.

**Required browser CORS header:** `anthropic-dangerous-direct-browser-access: true` — must be present on every fetch or the browser will block the request.

**Storage split:**
- `sessionStorage` → API key only
- `localStorage` → generation history (last 20) + named presets (max 10)

## Styling

Custom Tailwind theme with CSS vars (`--bg`, `--surface`, `--accent` #d97e3a, etc.). Three fonts loaded via Google Fonts `<link>`:
- `Instrument Serif` — display headlines
- `Inter Tight` — body/UI
- `JetBrains Mono` — labels, prompts, mono text

All-caps mono labels use `letter-spacing: 0.15em`. Accent color = warm amber `#d97e3a`.

## Key Constraints

- No backend, no router, no Redux/Zustand — hooks only
- API key must **never** touch `localStorage`
- JSON parse failures must be handled gracefully (regex fallback, then error banner with raw output)
- All 20 edge cases in `promptforge-build-spec.md §8` must be handled
- Mobile layout (375px) must be fully usable
