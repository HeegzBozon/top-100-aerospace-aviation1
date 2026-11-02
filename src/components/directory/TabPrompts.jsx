import { useState } from 'react';
import { C } from '@/components/crm/crmConfig';
import DirectoryPrompt, { SaveKey } from './DirectoryPrompt';
import { GOALS } from './directoryConfig';

const FIELDS = [
  ['space_rd', 'Space R&D'], ['commercial_aviation', 'Commercial aviation'], ['defense', 'Defense'],
  ['manufacturing', 'Manufacturing'], ['operations', 'Operations'], ['engineering', 'Engineering'],
  ['policy', 'Policy'], ['entrepreneurship', 'Entrepreneurship'],
];

// Who: "Who are you, in six words?" — the six-word story on the profile.
export function WhoPrompt({ settings, save }) {
  const [text, setText] = useState('');
  const [skip, setSkip] = useState(false);
  if (!settings || settings.six_word_story || skip) return null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <DirectoryPrompt kicker="Before you meet the people" question="Who are you, in six words?" onSkip={() => setSkip(true)}>
      <div className="flex flex-wrap items-center gap-2">
        <input value={text} maxLength={60} onChange={(e) => setText(e.target.value)} placeholder="Engineer. Pilot. Building the next runway."
          className="min-w-0 flex-1 rounded border px-3 py-2" style={{ borderColor: C.border, color: C.navy }} />
        <span className="text-[10px]" style={{ color: words === 6 ? C.copper : C.muted }}>{words}/6</span>
        <SaveKey disabled={words < 1} onSave={() => save({ six_word_story: text.trim() })} />
      </div>
    </DirectoryPrompt>
  );
}

// Where: "Which field feels like yours?" — the profile's domain accent, from the approved set.
export function WherePrompt({ settings, save }) {
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  if (!settings || done) return null;
  const current = pick || settings.domain_accent;
  return (
    <DirectoryPrompt kicker="Find your corner of campus" question="Which field feels like yours?">
      <div className="flex flex-wrap gap-1.5">
        {FIELDS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setPick(k)} className="rounded-full px-3 py-1.5 text-[12px]"
            style={current === k ? { background: C.navy, color: C.cream } : { background: '#fff', color: C.navy, border: `1px solid ${C.border}` }}>{l}</button>
        ))}
      </div>
      <div className="mt-3"><SaveKey disabled={!pick} label="Set as my field" onSave={async () => { await save({ domain_accent: pick }); setDone(true); }} /></div>
    </DirectoryPrompt>
  );
}

// Why → profile: the goals drafted into "Who I'd like to meet", published only on approval.
export function MeetDraft({ settings, save, goals }) {
  const seed = GOALS.filter((g) => goals.includes(g.key)).map((g) => g.label.toLowerCase());
  const [text, setText] = useState(seed.length ? `I'm here to ${seed.join(', ')}. I'd like to meet people who share that.` : '');
  if (!settings || settings.who_id_like_to_meet || !seed.length) return null;
  return (
    <DirectoryPrompt kicker="Drafted from your answers" question="Add this to your profile as “Who I'd like to meet”?">
      <textarea value={text} maxLength={600} rows={3} onChange={(e) => setText(e.target.value)}
        className="w-full rounded border px-3 py-2" style={{ borderColor: C.border, color: C.navy }} />
      <p className="mb-2 mt-1 text-[10px]" style={{ color: C.muted }}>This shows on your public profile. Edit it first if you like.</p>
      <SaveKey disabled={!text.trim()} label="Publish to my profile" onSave={() => save({ who_id_like_to_meet: text.trim() })} />
    </DirectoryPrompt>
  );
}