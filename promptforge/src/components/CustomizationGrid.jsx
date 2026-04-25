import FieldSelect from './FieldSelect.jsx';
import FeatureToggle from './FeatureToggle.jsx';
import { COUNTRIES, AGE_GROUPS, EXPERTISE_LEVELS, VISUAL_STYLES, MOODS, ASPECT_RATIOS, IMAGE_GENS, FEATURES } from '../lib/constants.js';

function PanelHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
      <span className="text-accent text-[11px]">{icon}</span>
      <span className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase">{label}</span>
    </div>
  );
}

export default function CustomizationGrid({
  country, onCountryChange,
  ageGroup, onAgeGroupChange,
  expertise, onExpertiseChange,
  visualStyle, onVisualStyleChange,
  mood, onMoodChange,
  aspect, onAspectChange,
  imageGen, onImageGenChange,
  features, onFeaturesChange,
  extraNotes, onExtraNotesChange,
}) {
  const toggleFeature = (key, val) => {
    onFeaturesChange(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Column 1: Audience */}
      <div className="border border-border rounded bg-surface overflow-hidden">
        <PanelHeader icon="◎" label="02 — AUDIENCE" />
        <div className="p-4">
          <FieldSelect label="Country / Region" value={country} options={COUNTRIES} onChange={onCountryChange} />
          <FieldSelect label="Age Group" value={ageGroup} options={AGE_GROUPS} onChange={onAgeGroupChange} />
          <FieldSelect label="Expertise Level" value={expertise} options={EXPERTISE_LEVELS} onChange={onExpertiseChange} />
        </div>
      </div>

      {/* Column 2: Visual Style */}
      <div className="border border-border rounded bg-surface overflow-hidden">
        <PanelHeader icon="◈" label="03 — VISUAL" />
        <div className="p-4">
          <FieldSelect label="Visual Style" value={visualStyle} options={VISUAL_STYLES} onChange={onVisualStyleChange} />
          <FieldSelect label="Mood" value={mood} options={MOODS} onChange={onMoodChange} />
          <FieldSelect label="Aspect Ratio" value={aspect} options={ASPECT_RATIOS} onChange={onAspectChange} />
          <FieldSelect label="Image Generator" value={imageGen} options={IMAGE_GENS} onChange={onImageGenChange} />
        </div>
      </div>

      {/* Column 3: Features + Notes */}
      <div className="border border-border rounded bg-surface overflow-hidden">
        <PanelHeader icon="◇" label="04 — FEATURES" />
        <div className="p-4">
          <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-2">Engagement</div>
          {FEATURES.map(f => (
            <FeatureToggle
              key={f.key}
              label={f.label}
              checked={features[f.key]}
              onChange={val => toggleFeature(f.key, val)}
              tooltip={f.tooltip}
            />
          ))}
          <div className="mt-4">
            <div className="font-mono text-[10px] tracking-[0.15em] text-text-3 uppercase mb-1.5">Extra Notes</div>
            <textarea
              value={extraNotes}
              onChange={e => onExtraNotesChange(e.target.value)}
              placeholder="e.g. Mumbai street scene, include chai cup…"
              rows={3}
              className="w-full bg-transparent border border-border rounded px-3 py-2 font-sans text-[12px] text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors resize-none"
              style={{ outline: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
