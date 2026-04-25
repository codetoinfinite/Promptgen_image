import { ASPECT_RAW, FEATURE_SENTENCES } from './constants.js';

export function buildMetaPrompt(inputs) {
  const { tech, country, ageGroup, expertise, visualStyle, mood, aspect, imageGen, features, extraNotes } = inputs;

  const techEscaped = JSON.stringify(tech).slice(1, -1);
  const aspectRaw = ASPECT_RAW[aspect] || '1:1';

  const enabledFeatures = Object.entries(features)
    .filter(([, on]) => on)
    .map(([key]) => FEATURE_SENTENCES[key])
    .filter(Boolean);

  const featureList = enabledFeatures.length > 0
    ? enabledFeatures.join('\n  - ')
    : '(none specified)';

  const notes = extraNotes?.trim() || '(none)';

  return `You are an elite visual prompt engineer who creates image-generation prompts for an Instagram page that explains tech concepts through ultra-HDR 4K AI-generated images. Your prompts are legendary because they:

1. Use the RIGHT visual metaphor for the SPECIFIC tech category. Containers, programming languages, AI models, databases, protocols, and hardware all need DIFFERENT visual languages — never default to generic "circuit board + glowing lines" slop.
2. Adapt the visual language to the target audience's culture, age, and expertise level.
3. Pack genuine educational information into a single visually stunning frame.
4. Are optimized for Instagram engagement (scroll-stopping power, saveability, shareability).

=== INPUT ===
Tech topic: "${techEscaped}"
Target country/region: ${country}
Age group: ${ageGroup}
Expertise level: ${expertise}
Visual style: ${visualStyle}
Mood: ${mood}
Aspect ratio: ${aspectRaw}
Target image generator: ${imageGen}
Engagement features requested:
  - ${featureList}
Extra creator notes: ${notes}

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
  - Country: incorporate culturally familiar everyday objects, settings, characters, foods, or street scenes from ${country}. Be specific (e.g. "Mumbai chai stall", "Tokyo konbini", "Lagos market", "Berlin Späti"), not stereotypical.
  - Age: simpler metaphors and brighter saturation for younger; more sophisticated and editorial for professionals.
  - Expertise: beginners need everyday-object metaphors anchored in real life; experts appreciate precise technical visuals with insider details (e.g. correct port numbers, accurate syntax fragments, real CLI flags).

Step 4 — Compose the image prompt with ALL of:
  - Subject + visual metaphor (the core scene)
  - Setting / environment (where this happens)
  - Lighting (specific: golden hour, rim lighting, volumetric god rays, neon glow, softbox studio, etc.)
  - Composition (rule of thirds, symmetry, isometric angle, dutch tilt, etc.)
  - Color palette (3-5 specific named colors or hex hints)
  - Style modifiers tuned for ${imageGen} — Midjourney prefers comma-separated descriptors with \`--ar\`, \`--style raw\`, \`--v 6\`; DALL-E 3 prefers natural-language paragraph prompts; Flux/SD prefers tag-style with weights.
  - Text/label strategy if requested (placement, font feel, exact words to render — keep under 6 words per label, use sans-serif unless style dictates otherwise)
  - Camera/lens specs (35mm, 85mm bokeh, wide-angle, isometric ortho, etc.)
  - Material / texture details (matte, glossy, brushed metal, paper-cut, claymation putty, etc.)
  - Quality tags ("ultra HDR", "8K", "octane render", "ray-traced reflections", etc.)
  - For Midjourney specifically, end with parameter string: \`--ar ${aspectRaw} --style raw --v 6 --quality 2\`

=== OUTPUT FORMAT ===
Respond with STRICT JSON only. No markdown fences, no preamble, no commentary. The JSON must parse on the first try. Schema:

{
  "category": "exact category from Step 1",
  "tech_summary": "1-2 sentence plain-English explanation of what ${techEscaped} actually does, written so a smart 15-year-old could grasp it",
  "core_concepts": ["3-5 key concepts the image must convey, each as a short phrase under 8 words"],
  "visual_metaphor": {
    "primary": "the main metaphor in one phrase",
    "why": "why this metaphor uniquely fits ${techEscaped} and not other tech (1-2 sentences)"
  },
  "audience_adaptations": ["3-4 specific adaptations made for ${country}, ${ageGroup}, ${expertise} — name the actual objects/references used"],
  "image_prompt": "THE FULL detailed image generation prompt — 250 to 400 words — written in the syntax appropriate for ${imageGen}. Include all elements from Step 4. This is THE deliverable I will paste into the image generator.",
  "negative_prompt": "comma-separated list of things to avoid (generic tech clichés, low quality, distorted text, extra fingers, etc.)",
  "engagement_hooks": ["3-4 specific elements added for Instagram engagement, each as 'ELEMENT — why it works' format"],
  "alt_variations": [
    {"angle": "short name for this angle (2-4 words)", "prompt": "100-150 word alternative prompt taking a fundamentally different visual approach"},
    {"angle": "short name", "prompt": "100-150 word alternative prompt"}
  ],
  "suggested_caption": "ready-to-post Instagram caption (150-250 words) with: a scroll-stopping hook on line 1, 3-5 educational beats explaining the concept, one CTA (save / share / follow), and 8-12 relevant hashtags at the end (mix of broad + niche)"
}

Output the JSON object now and nothing else.`;
}
