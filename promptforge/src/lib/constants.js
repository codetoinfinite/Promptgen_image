export const COUNTRIES = [
  'Global', 'India', 'United States', 'United Kingdom', 'Germany', 'Japan',
  'Brazil', 'Nigeria', 'Mexico', 'France', 'Indonesia', 'Vietnam', 'South Korea',
  'Egypt', 'Turkey', 'Philippines', 'Pakistan', 'Bangladesh', 'Canada', 'Australia',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'South Africa', 'Kenya', 'Argentina',
  'Thailand', 'Malaysia', 'Singapore', 'UAE', 'Saudi Arabia',
];

export const AGE_GROUPS = [
  'Kids (8-12)', 'Teens (13-17)', 'Young Adults (18-24)', 'Adults (25-40)', 'Professionals (40+)',
];

export const EXPERTISE_LEVELS = [
  'Curious beginner', 'Some exposure', 'Practitioner', 'Expert / specialist',
];

export const VISUAL_STYLES = [
  'Isometric 3D', 'Cinematic photoreal', 'Editorial illustration', 'Cyberpunk neon',
  'Minimalist flat', 'Studio Ghibli vibe', 'Comic book / bold ink', 'Blueprint technical',
  'Surreal dreamy', 'Claymation 3D', 'Pixel art retro', 'Paper-cut diorama',
  'Vaporwave', 'Risograph print', 'Brutalist 3D',
];

export const MOODS = [
  'Energetic / scroll-stopping', 'Calm / educational', 'Mysterious / intriguing',
  'Premium / luxurious', 'Playful / fun', 'Dramatic / cinematic',
];

export const ASPECT_RATIOS = [
  'Square (1:1) — feed', 'Portrait (4:5) — feed', 'Story (9:16)',
  'Landscape (16:9)', 'Reels cover (9:16)',
];

export const ASPECT_RAW = {
  'Square (1:1) — feed': '1:1',
  'Portrait (4:5) — feed': '4:5',
  'Story (9:16)': '9:16',
  'Landscape (16:9)': '16:9',
  'Reels cover (9:16)': '9:16',
};

export const IMAGE_GENS = [
  'Midjourney v6', 'DALL-E 3', 'Flux / Stable Diffusion', 'Generic (any model)', 'Imagen 3',
];

export const FEATURES = [
  { key: 'labels', label: 'Text labels in image', defaultOn: true, tooltip: 'Embeds clear text labels directly inside the generated image.' },
  { key: 'mascot', label: 'Mascot / character', defaultOn: false, tooltip: 'Adds a friendly character or mascot that personifies the concept.' },
  { key: 'realObject', label: 'Real-world object analogy', defaultOn: true, tooltip: 'Anchors the abstract concept to a tangible everyday object.' },
  { key: 'comparison', label: 'Comparison (this vs that)', defaultOn: false, tooltip: 'Shows a before/after or side-by-side comparison visual.' },
  { key: 'numbers', label: 'Numbers / stats', defaultOn: false, tooltip: 'Includes striking statistics or numbers as visual data points.' },
  { key: 'cultural', label: 'Cultural references', defaultOn: true, tooltip: 'Includes country-specific objects, settings, food, or street scenes for visual familiarity.' },
  { key: 'questionHook', label: 'Question / hook overlay', defaultOn: true, tooltip: 'Adds an attention-grabbing question as overlay text (e.g., "What is X?").' },
];

export const FEATURE_SENTENCES = {
  labels: 'Embed clear text labels inside the image (max 5-6 words per label, sans-serif, well-placed)',
  mascot: 'Include a friendly tech mascot or character that personifies the concept',
  comparison: 'Show a before/after, with/without, or this-vs-that visual comparison',
  realObject: 'Anchor the abstract concept to a tangible real-world object analogy',
  numbers: 'Include 1-3 striking statistics or numbers as visual data points',
  cultural: 'Weave in subtle visual references familiar to the target country/region',
  questionHook: "Include an attention-grabbing question or hook as overlay text (e.g., 'What is X?')",
};

export const QUICK_PRESETS = [
  {
    id: 'beginner',
    label: 'Beginner-friendly',
    icon: 'Smile',
    settings: {
      expertise: 'Curious beginner',
      visualStyle: 'Editorial illustration',
      mood: 'Playful / fun',
      features: { labels: true, mascot: true, comparison: false, realObject: true, numbers: false, cultural: false, questionHook: true },
    },
  },
  {
    id: 'pro',
    label: 'Pro deep-dive',
    icon: 'Code2',
    settings: {
      expertise: 'Practitioner',
      visualStyle: 'Blueprint technical',
      mood: 'Dramatic / cinematic',
      features: { labels: true, mascot: false, comparison: true, realObject: false, numbers: true, cultural: false, questionHook: false },
    },
  },
  {
    id: 'scroll',
    label: 'Scroll-stopper',
    icon: 'Zap',
    settings: {
      visualStyle: 'Cinematic photoreal',
      mood: 'Energetic / scroll-stopping',
      features: { labels: true, mascot: false, comparison: false, realObject: true, numbers: false, cultural: true, questionHook: true },
    },
  },
];
