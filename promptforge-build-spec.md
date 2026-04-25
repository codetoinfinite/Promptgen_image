# BUILD SPEC — "PromptForge": A Tech-Topic → Ultra-HDR Image-Prompt Generator

You are Claude Code. Build me a complete, production-ready single-page web application based on the specification below. Do NOT ask clarifying questions — every decision is made here. Build the entire thing in one go, ship a working app, and tell me how to run it at the end.

---

## 1. PROJECT GOAL (read carefully — this is the "why")

I run an Instagram tech-education page. I post ultra-HDR 4K AI-generated images that visually explain a single tech concept per post (Docker, Kubernetes, RAG, transformers, Redis, OAuth, JWT, Rust borrow checker, etc.). The images need to be visually stunning AND genuinely educational.

The hard problem: **the right image-prompt is wildly different depending on what kind of tech the topic is.** A prompt for Docker (containers, isolation, shipping metaphors) is fundamentally different from one for Python (readability, snake metaphor, friendly approachable feel) which is fundamentally different from one for a transformer model (neural galaxies, attention beams, token streams) which is fundamentally different from one for PostgreSQL (archival, library, elephant) which is fundamentally different from one for HTTP (postal courier, envelopes). A generic "circuit board with glowing lines" prompt is the slop I'm trying to escape.

I want a tool where I type a tech name, tweak audience + style settings, and get back a **category-aware, ultra-detailed image-generation prompt** ready to paste into Midjourney / DALL-E / Flux, plus an Instagram caption.

The intelligence comes from calling the **Anthropic API** from inside the app. The user's API key is the secret — the app should let me paste my Anthropic API key in a settings panel (stored only in memory for the session, NOT persisted) and use it for every request.

---

## 2. TECH STACK

- **Framework:** React 18 + Vite (single-page app, no SSR needed)
- **Styling:** Tailwind CSS (configured properly with a custom theme — see §6)
- **Icons:** `lucide-react`
- **HTTP:** native `fetch` to `https://api.anthropic.com/v1/messages`
- **Headers required for browser-side Anthropic API calls:** include `anthropic-version: 2023-06-01` AND `anthropic-dangerous-direct-browser-access: true` (this header is required to make browser CORS work with the Anthropic API)
- **State:** React hooks only (`useState`, `useEffect`, `useRef`). No Redux, no Zustand.
- **Storage:** `sessionStorage` for the API key (cleared on tab close); `localStorage` for generation history (last 20 items) and saved presets. NEVER persist the API key to localStorage.
- **No backend.** Single static SPA. Deployable to Vercel / Netlify / GitHub Pages as-is.
- **No router needed** — single page. Use modal overlays for settings/history.

Project structure:
```
promptforge/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css                 (tailwind directives + font imports)
    ├── lib/
    │   ├── metaPrompt.js         (the brain — buildMetaPrompt fn)
    │   ├── anthropic.js          (fetch wrapper)
    │   └── constants.js          (all dropdown options)
    └── components/
        ├── Header.jsx
        ├── TechInput.jsx
        ├── PresetBar.jsx
        ├── CustomizationGrid.jsx
        ├── FieldSelect.jsx
        ├── FeatureToggle.jsx
        ├── ForgeLog.jsx
        ├── ResultPanel.jsx
        ├── PromptCard.jsx
        ├── HistoryDrawer.jsx
        ├── SettingsModal.jsx
        └── ErrorBanner.jsx
```

---

## 3. CORE USER FLOW

1. User opens app → if no API key in `sessionStorage`, show a **first-run modal** asking for their Anthropic API key with a link to https://console.anthropic.com/settings/keys. Explain the key stays in their browser session and is never sent anywhere except to api.anthropic.com.
2. Main screen: a big tech-name input ("Docker", "RAG", "Kubernetes", etc.) plus a customization grid.
3. User optionally clicks a **Quick Preset** to auto-fill settings (Beginner-friendly / Pro deep-dive / Scroll-stopper).
4. User adjusts dropdowns + toggles, then clicks **FORGE**.
5. App shows a streaming "forge log" with stepwise terminal-style messages while waiting on the API.
6. Result renders in a structured panel with: detected category, plain-English summary, core concepts, the chosen visual metaphor (with reasoning), the **main image prompt** (copy button), 2 alternative angle variations (tabbed), a negative prompt, audience-adaptation notes, engagement-hook explanations, and a ready-to-post Instagram caption.
7. Generation auto-saves to history. User can recall any past generation from the history drawer.
8. User can save the current settings (style + audience + features, NOT the tech name) as a named **preset** for reuse.

---

## 4. THE BRAIN — META-PROMPT (the most important part)

This is the prompt sent to Claude. The whole product hinges on this being excellent. Use Claude `claude-sonnet-4-20250514` with `max_tokens: 4000`.

The function `buildMetaPrompt(inputs)` in `src/lib/metaPrompt.js` returns the string below, with the placeholders filled in from the user's inputs. **Use this exact text.** Do not paraphrase or shorten it.

```
You are an elite visual prompt engineer who creates image-generation prompts for an Instagram page that explains tech concepts through ultra-HDR 4K AI-generated images. Your prompts are legendary because they:

1. Use the RIGHT visual metaphor for the SPECIFIC tech category. Containers, programming languages, AI models, databases, protocols, and hardware all need DIFFERENT visual languages — never default to generic "circuit board + glowing lines" slop.
2. Adapt the visual language to the target audience's culture, age, and expertise level.
3. Pack genuine educational information into a single visually stunning frame.
4. Are optimized for Instagram engagement (scroll-stopping power, saveability, shareability).

=== INPUT ===
Tech topic: "{tech}"
Target country/region: {country}
Age group: {ageGroup}
Expertise level: {expertise}
Visual style: {visualStyle}
Mood: {mood}
Aspect ratio: {aspect}
Target image generator: {imageGen}
Engagement features requested:
  - {featureList}
Extra creator notes: {extraNotes}

=== PROCESS ===
Step 1 — Identify what KIND of tech this is. Pick the most specific category from:
  Programming Language | Framework/Library | Container/Orchestration | Database | Cloud Service | AI/ML Concept | Protocol/Spec | Hardware | Security/Crypto | DevOps/Tooling | Operating System | Networking | Data/Analytics | Web Standard | Methodology | Design Pattern | Algorithm/Data-Structure

Step 2 — Choose the BEST visual metaphor for THIS specific tech (NOT a generic tech metaphor). Examples of category-specific thinking:
  - Docker → shipping containers on a freight ship, isolated cargo, harbor at golden hour
  - Kubernetes → harbor master / orchestra conductor managing fleets of container ships
  - Python → readable handwritten manuscript, friendly snake guiding through clear paths
  - Rust → fortress / armored workshop with safety inspectors checking every passage
  - C++ → high-precision Swiss watchmaker's workshop with manual gears
  - Redis → high-speed pneumatic tube delivery system inside a vault
  - PostgreSQL → meticulous library archivist, elephant emblem, indexed scrolls
  - LLMs / Transformers → vast neural galaxy with token streams as light particles, attention beams
  - RAG → librarian fetching exact pages from infinite shelves to answer a guest
  - Git → branching tree of parallel timelines / time-travel multiverse
  - HTTP → postal courier system with clearly addressed envelopes
  - GPU → massive parallel kitchen with thousands of chefs vs CPU's one master chef
  - JWT → tamper-evident wax-sealed scrolls passed between guards
  - OAuth → valet handing a temporary parking ticket without giving over the actual car keys
  - Kubernetes Pods → schools of synchronized fish
  - Microservices → independent food trucks in a market square vs one giant restaurant
  - Cache → bedside notepad for stuff you'd otherwise have to fetch from the basement
  - Compiler → simultaneous interpreter at the UN translating in real time
  - DNS → giant city phonebook
  - Blockchain → village ledger that everyone copies and verifies
  - Recursion → russian nesting dolls / mirrors facing mirrors
  - Linked List → train cars connected by couplers
  - Hash Map → coat-check counter with numbered tickets

If the tech is something else, INVENT an equally specific, equally non-generic metaphor that captures its actual mechanism — not just "tech glow."

Step 3 — Adapt to audience:
  - Country: incorporate culturally familiar everyday objects, settings, characters, foods, or street scenes from {country}. Be specific (e.g. "Mumbai chai stall", "Tokyo konbini", "Lagos market", "Berlin Späti"), not stereotypical.
  - Age: simpler metaphors and brighter saturation for younger; more sophisticated and editorial for professionals.
  - Expertise: beginners need everyday-object metaphors anchored in real life; experts appreciate precise technical visuals with insider details (e.g. correct port numbers, accurate syntax fragments, real CLI flags).

Step 4 — Compose the image prompt with ALL of:
  - Subject + visual metaphor (the core scene)
  - Setting / environment (where this happens)
  - Lighting (specific: golden hour, rim lighting, volumetric god rays, neon glow, softbox studio, etc.)
  - Composition (rule of thirds, symmetry, isometric angle, dutch tilt, etc.)
  - Color palette (3-5 specific named colors or hex hints)
  - Style modifiers tuned for {imageGen} — Midjourney prefers comma-separated descriptors with `--ar`, `--style raw`, `--v 6`; DALL-E 3 prefers natural-language paragraph prompts; Flux/SD prefers tag-style with weights.
  - Text/label strategy if requested (placement, font feel, exact words to render — keep under 6 words per label, use sans-serif unless style dictates otherwise)
  - Camera/lens specs (35mm, 85mm bokeh, wide-angle, isometric ortho, etc.)
  - Material / texture details (matte, glossy, brushed metal, paper-cut, claymation putty, etc.)
  - Quality tags ("ultra HDR", "8K", "octane render", "ray-traced reflections", etc.)
  - For Midjourney specifically, end with parameter string: `--ar [matching aspect] --style raw --v 6 --quality 2`

=== OUTPUT FORMAT ===
Respond with STRICT JSON only. No markdown fences, no preamble, no commentary. The JSON must parse on the first try. Schema:

{
  "category": "exact category from Step 1",
  "tech_summary": "1-2 sentence plain-English explanation of what {tech} actually does, written so a smart 15-year-old could grasp it",
  "core_concepts": ["3-5 key concepts the image must convey, each as a short phrase under 8 words"],
  "visual_metaphor": {
    "primary": "the main metaphor in one phrase",
    "why": "why this metaphor uniquely fits {tech} and not other tech (1-2 sentences)"
  },
  "audience_adaptations": ["3-4 specific adaptations made for {country}, {ageGroup}, {expertise} — name the actual objects/references used"],
  "image_prompt": "THE FULL detailed image generation prompt — 250 to 400 words — written in the syntax appropriate for {imageGen}. Include all elements from Step 4. This is THE deliverable I will paste into the image generator.",
  "negative_prompt": "comma-separated list of things to avoid (generic tech clichés, low quality, distorted text, extra fingers, etc.)",
  "engagement_hooks": ["3-4 specific elements added for Instagram engagement, each as 'ELEMENT — why it works' format"],
  "alt_variations": [
    {"angle": "short name for this angle (2-4 words)", "prompt": "100-150 word alternative prompt taking a fundamentally different visual approach"},
    {"angle": "short name", "prompt": "100-150 word alternative prompt"}
  ],
  "suggested_caption": "ready-to-post Instagram caption (150-250 words) with: a scroll-stopping hook on line 1, 3-5 educational beats explaining the concept, one CTA (save / share / follow), and 8-12 relevant hashtags at the end (mix of broad + niche)"
}

Output the JSON object now and nothing else.
```

**Implementation note:** the `{featureList}` placeholder is built by mapping each enabled feature toggle to a sentence:
- `labels` → "Embed clear text labels inside the image (max 5-6 words per label, sans-serif, well-placed)"
- `mascot` → "Include a friendly tech mascot or character that personifies the concept"
- `comparison` → "Show a before/after, with/without, or this-vs-that visual comparison"
- `realObject` → "Anchor the abstract concept to a tangible real-world object analogy"
- `numbers` → "Include 1-3 striking statistics or numbers as visual data points"
- `cultural` → "Weave in subtle visual references familiar to the target country/region"
- `questionHook` → "Include an attention-grabbing question or hook as overlay text (e.g., 'What is X?')"

Join enabled ones with `\n  - `. If none enabled, use `(none specified)`.

---

## 5. INPUTS & CUSTOMIZATIONS — exact options

Place all of these in `src/lib/constants.js` as exported arrays.

**Tech topic:** free-text input. No validation beyond non-empty. Trim whitespace.

**Country / Region** (default: `India`):
```
Global, India, United States, United Kingdom, Germany, Japan, Brazil, Nigeria,
Mexico, France, Indonesia, Vietnam, South Korea, Egypt, Turkey, Philippines,
Pakistan, Bangladesh, Canada, Australia, Spain, Italy, Netherlands, Sweden,
South Africa, Kenya, Argentina, Thailand, Malaysia, Singapore, UAE, Saudi Arabia
```

**Age group** (default: `Young Adults (18-24)`):
```
Kids (8-12), Teens (13-17), Young Adults (18-24), Adults (25-40), Professionals (40+)
```

**Expertise level** (default: `Curious beginner`):
```
Curious beginner, Some exposure, Practitioner, Expert / specialist
```

**Visual style** (default: `Isometric 3D`):
```
Isometric 3D, Cinematic photoreal, Editorial illustration, Cyberpunk neon,
Minimalist flat, Studio Ghibli vibe, Comic book / bold ink, Blueprint technical,
Surreal dreamy, Claymation 3D, Pixel art retro, Paper-cut diorama, Vaporwave,
Risograph print, Brutalist 3D
```

**Mood** (default: `Energetic / scroll-stopping`):
```
Energetic / scroll-stopping, Calm / educational, Mysterious / intriguing,
Premium / luxurious, Playful / fun, Dramatic / cinematic
```

**Aspect ratio** (default: `Square (1:1) — feed`):
```
Square (1:1) — feed, Portrait (4:5) — feed, Story (9:16), Landscape (16:9), Reels cover (9:16)
```
When sending to API, also pass the raw ratio (`1:1`, `4:5`, `9:16`, `16:9`) for the Midjourney `--ar` flag.

**Target image generator** (default: `Midjourney v6`):
```
Midjourney v6, DALL-E 3, Flux / Stable Diffusion, Generic (any model), Imagen 3
```

**Engagement features** (multi-select toggles, default-on shown with ✓):
- ✓ Text labels in image
- ☐ Mascot / character
- ✓ Real-world object analogy
- ☐ Comparison (this vs that)
- ☐ Numbers / stats
- ✓ Cultural references
- ✓ Question / hook overlay

**Extra creator notes:** optional free-text input, e.g. "make it look like a Mumbai street scene", "include a chai cup".

**Quick presets** (one-click apply):
- **Beginner-friendly:** expertise=Curious beginner, style=Editorial illustration, mood=Playful / fun, features={labels, realObject, mascot, questionHook}
- **Pro deep-dive:** expertise=Practitioner, style=Blueprint technical, mood=Dramatic / cinematic, features={labels, numbers, comparison}
- **Scroll-stopper:** style=Cinematic photoreal, mood=Energetic / scroll-stopping, features={questionHook, labels, cultural, realObject}

User can also save the current settings as a custom named preset (stored in localStorage, max 10).

---

## 6. UI / UX DESIGN SPECIFICATION

**Aesthetic direction:** "Design studio terminal" — warm dark editorial UI. Think a luxury design tool that quietly nods at hacker terminals. NOT generic SaaS purple-gradient. NOT cyberpunk green-on-black. Refined, intentional, dense when it needs to be.

**Color palette (CSS variables in `index.css`):**
```css
:root {
  --bg: #0d0c0a;          /* near-black warm */
  --surface: #181612;     /* card / panel */
  --border: #2a2620;      /* subtle dividers */
  --text-1: #e8e4d8;      /* primary, warm off-white */
  --text-2: #8a8478;      /* secondary */
  --text-3: #5a564c;      /* tertiary / labels */
  --accent: #d97e3a;      /* warm amber / persimmon */
  --accent-hover: #e8924f;
  --accent-muted: #6b4521;
  --error: #c4583a;
  --success: #7a9968;
}
```
Configure these as Tailwind theme extensions so I can use `bg-bg`, `text-accent`, `border-border`, etc.

**Typography (Google Fonts):**
- **Display headlines:** `Instrument Serif` (italic for emphasis on the accent word)
- **Body / UI:** `Inter Tight` (300, 400, 500, 600, 700)
- **Mono / labels / technical:** `JetBrains Mono` (300, 400, 500, 600)

Load via `<link>` in `index.html`. All-caps mono labels with letter-spacing `0.15em` for the editorial feel.

**Layout:**
- Max width 1100px, centered, generous padding.
- Subtle SVG grain overlay across whole viewport at `opacity: 0.04` — fixed position, pointer-events none.
- Top bar: tiny pulsing dot + version string in mono on the left, history button on the right, settings (gear) icon next to history.
- H1: 54px Instrument Serif, with one italic word in the accent color. Tagline below in `text-2` at 14px.
- Hard divider line below header (1px `--border`).

**Tech input section:**
- Mono label "01 — TECH TOPIC" with the "01" in accent color.
- Big input: 32px Instrument Serif, transparent background, 1px border, focus state changes border to accent. Pressing Enter triggers Forge.
- "FORGE" button to the right: solid accent background, dark text, mono uppercase, with `Wand2` icon. Disabled state: 30% opacity. Loading state: spinner + "FORGING".

**Preset bar:** small mono "QUICK SET →" label, then 3 outlined chips with icons.

**Customization grid:** 3-column grid on desktop, single column on mobile. Each column is a 1px-bordered panel with mono accent-colored header (icon + label). Inside: dropdowns and toggles. Use the FieldSelect and FeatureToggle subcomponents.

**FieldSelect:** custom-styled native `<select>` with chevron icon, mono uppercase label above, `Inter Tight` 13px value, transparent background, `--border` border, focus = accent border.

**FeatureToggle:** custom checkbox using a 14px square div that fills with accent color + black checkmark when active. Label text becomes `text-1` when active, `text-2` when inactive.

**Forge log (during loading):** stepwise terminal-style messages appearing every ~600ms with `>` prefix and a blinking cursor block at the end. Steps: `> initializing forge...` → `> analyzing "{tech}"...` → `> identifying tech category...` → `> selecting visual metaphor...` → `> adapting for {country} / {ageGroup}...` → `> composing prompt for {imageGen}...` → `> finalizing variations...`.

**Result panel:** smooth scroll into view on success. Layout:
1. **Category banner:** mono "OUTPUT /" label + outlined accent-colored category pill + 28px Instrument Serif tech name + "COPY EVERYTHING" button on the right.
2. **2-column grid:** left = "WHAT IT IS" (22px Instrument Serif summary), right = "CORE CONCEPTS" (numbered list 01, 02, 03 with concepts).
3. **Visual metaphor panel:** bordered surface card. Big italic Instrument Serif quote in accent color (32px). Reasoning below in `text-2`.
4. **Variation tabs:** "MAIN PROMPT" + "ALT: {angle}" tabs. Active = accent border + accent text.
5. **Primary prompt card:** the hero element. Border in accent color, 11px mono label "PRIMARY IMAGE PROMPT" with image icon, copy button. Body: `JetBrains Mono` 13px, line-height 1.7, whitespace pre-wrap, `text-1` color.
6. **Negative prompt card:** smaller, regular border, only shown for main variation.
7. **Engagement hooks grid:** 2-column on desktop. Each hook in a bordered cell with "HOOK 0X" mono label.
8. **Audience adaptations:** simple bulleted list, accent-colored bullets.
9. **Caption card:** bordered surface, megaphone icon, "INSTAGRAM CAPTION" label, copy button. Body: 14px Inter Tight, line-height 1.7, whitespace pre-wrap.
10. **"FORGE AGAIN" button:** outlined, centered, `RefreshCw` icon. Re-runs same inputs to get a fresh variation.

**History drawer:** slides down below header. Each entry: timestamp in mono (text-3), tech name in 20px Instrument Serif, category pill in accent. Click recalls the saved result and inputs.

**Settings modal:** centered overlay with backdrop blur. Contains:
- Anthropic API key input (password type, with show/hide toggle).
- Note: "Stored only for this browser tab. Cleared on close. Sent only to api.anthropic.com."
- Test connection button → makes a 1-token test call and shows ✓ or error.
- Custom presets list with delete buttons.
- Clear history button.

**Empty state (no result yet):** subtle mono message below the customization grid: `> awaiting input. type a tech topic above and press FORGE.`

**Footer:** tiny mono row: `POWERED BY CLAUDE / BUILT FOR EDUCATORS` on left, `PASTE PROMPT → MIDJOURNEY / DALL-E / FLUX → POST → REPEAT` on right.

**Mobile (<768px):**
- Header H1 drops to 36px.
- Customization grid becomes single column.
- Forge button stacks below input.
- Result 2-column grid becomes single column.
- History becomes full-screen sheet.

**Animations:**
- Loading dot in header: `animate-pulse`.
- Forge log lines: fade-in stagger.
- Result panel: fade + 8px slide-up on appear (200ms).
- Hover states on all interactive elements: 150ms transitions on border/color.
- Copy confirmation: button text swaps to "COPIED" with check icon for 1.8s.
- No janky bouncing or excessive motion. Restraint.

---

## 7. ANTHROPIC API INTEGRATION

In `src/lib/anthropic.js`:

```js
export async function callClaude(apiKey, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content.map(b => b.type === "text" ? b.text : "").join("").trim();
}
```

In `App.jsx`, after getting the text response:
```js
const cleaned = text
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/```\s*$/i, "")
  .trim();
const parsed = JSON.parse(cleaned);
```

If JSON.parse throws, fall back to extracting the first `{...}` block via regex `/\{[\s\S]*\}/` and re-parse. If that fails, show the error banner with the raw response visible in a collapsible details element.

---

## 8. EDGE CASES (handle all of these)

1. **No API key set** → settings modal opens automatically on first Forge attempt. Don't lose the user's typed inputs.
2. **Empty tech name** → button disabled, input border subtly shakes (CSS keyframes) on attempted submit.
3. **API 401 (bad key)** → error banner: "API key rejected. Open settings to update." with a button that opens the settings modal.
4. **API 429 (rate limit)** → error banner: "Rate limited by Anthropic. Wait ~30s and try again." Auto-retry button with 30s countdown.
5. **API 529 / 5xx** → "Anthropic is overloaded. Retry?" with retry button.
6. **Network failure** → "Check your connection." with retry.
7. **Malformed JSON in response** → try the regex fallback. If still bad, show banner: "Claude returned non-JSON. Try Forge again." + collapsible raw output.
8. **Very obscure / made-up tech** ("blorbothing v9") → the meta-prompt instructs Claude to invent a metaphor anyway. Don't add client-side validation that blocks unknown topics.
9. **Sensitive / unsafe topic** → if Claude refuses (response includes phrases like "I can't help" or has no JSON), show the response as-is and offer to refine the topic.
10. **Tech name with quotes / special chars** → properly escape when interpolating into the meta-prompt; use template literals carefully or `JSON.stringify(tech).slice(1, -1)`.
11. **Rapid repeated clicks on Forge** → button disabled while `loading === true`. Also debounce by 300ms.
12. **Long response (>4000 tokens cut off)** → if JSON parse fails AND the response ends mid-string, show banner: "Response was cut off. Try a more specific tech topic or simpler settings."
13. **Tab closed mid-generation** → no special handling needed; sessionStorage holds the API key, the in-flight request just dies.
14. **localStorage quota exceeded** → wrap history saves in try/catch; on QuotaExceededError, drop oldest history entries until it fits.
15. **History entry corruption** → wrap JSON.parse of stored history in try/catch; on failure, reset history to `[]` and continue.
16. **User pastes API key with whitespace** → trim before storing.
17. **Mobile keyboard covers Forge button** → ensure input scrolls into view on focus.
18. **Copy to clipboard fails (older browsers / non-HTTPS)** → fallback to a `document.execCommand('copy')` on a hidden textarea; if THAT fails, select the text in a modal so the user can copy manually.
19. **alt_variations array missing or empty** → only show "MAIN PROMPT" tab.
20. **Any field in the result JSON missing** → render gracefully with `?.` chaining and skip that section, don't crash.

---

## 9. POLISH DETAILS (do not skip these)

- **Keyboard shortcuts:** Cmd/Ctrl+Enter triggers Forge from anywhere. Esc closes modals/drawers.
- **Focus rings:** custom 1px accent outline-offset:2 on all focusable elements. Never use the browser default ugly blue.
- **Reduced motion:** respect `prefers-reduced-motion` — disable the forge log stagger and result fade-in.
- **Selection color:** `::selection` background = accent, color = bg.
- **Scrollbar:** thin, matching theme (`scrollbar-width: thin; scrollbar-color: #2a2620 #0d0c0a;`).
- **Tooltips:** hover tooltips on info icons next to less-obvious settings (e.g. "Cultural references" → "Includes country-specific objects, settings, food, or street scenes for visual familiarity.").
- **Word counts:** show "{n} words" under the main prompt card.
- **Token estimate:** show estimated input tokens before Forge (rough: words × 1.3).
- **Onboarding hint:** first time the result renders, show a small one-time tooltip near the COPY button: "Tap to copy → paste into Midjourney / DALL-E / Flux."
- **404 / unknown route:** N/A, single page.
- **Favicon + page title:** title = "PromptForge — Tech to Image". Favicon: a small SVG of a flame in accent color (inline data URI is fine).

---

## 10. ACCEPTANCE CRITERIA

The build is done when ALL of these are true:

- [ ] `npm install && npm run dev` starts the app on localhost.
- [ ] First-run modal asks for API key, key is stored in sessionStorage only.
- [ ] I can type "Docker", click FORGE, and within ~10s see a fully-populated result panel with a category like "Container/Orchestration", a shipping-container metaphor (NOT a generic circuit board), and a 250-400 word prompt I can paste into Midjourney.
- [ ] Switching tech to "Python" produces a totally different metaphor (something like a friendly snake / readable manuscript), proving category-awareness works.
- [ ] Switching country to "Japan" with mood "Calm / educational" visibly changes the audience adaptations and the prompt's setting.
- [ ] All 3 quick presets apply settings instantly.
- [ ] All 3 copy buttons (prompt / caption / copy everything) actually copy to clipboard, with visual confirmation.
- [ ] Variation tabs switch the displayed prompt without re-fetching.
- [ ] History drawer shows past generations and recall works.
- [ ] Custom preset save + apply works, persists across page reload.
- [ ] All listed edge cases (§8) are handled — at minimum, manually test missing API key, bad API key, empty tech, and malformed JSON (you can simulate the last by returning non-JSON in a mock).
- [ ] Mobile layout (375px wide) is fully usable: nothing overflows, Forge button reachable.
- [ ] No console errors or warnings.
- [ ] Lighthouse perf score ≥ 90.
- [ ] No `localStorage` use for the API key. Verify with DevTools.

---

## 11. WHAT I DO NOT WANT

- Generic Material UI / shadcn-default look. The whole point is bespoke editorial vibe.
- Purple gradients on white. Anywhere.
- Inter or Roboto as the primary display font.
- Backend / server / serverless functions. SPA only.
- Authentication beyond the API key.
- Image generation built into the tool. The output is the *prompt*, not the image. (You may add an "Open in Midjourney" link to https://www.midjourney.com/imagine if it cleanly accepts a URL param, but don't fake-generate images.)
- Telemetry / analytics. Zero tracking.
- A loading skeleton instead of the terminal forge-log. The forge-log IS the loading state and it's a feature.

---

## 12. DELIVERABLES & RUN INSTRUCTIONS

When done, output:
1. A summary of what was built and any decisions you made beyond this spec.
2. Tree of created files.
3. Exact commands to run: `cd promptforge && npm install && npm run dev`.
4. A test checklist matching §10 with each item marked ✓ after you've verified it.
5. A note on where I paste my Anthropic API key on first run.

Build the entire app now, top to bottom, in a single pass. Treat any ambiguity as a chance to make a tasteful, intentional design choice — don't ask me, just decide.
