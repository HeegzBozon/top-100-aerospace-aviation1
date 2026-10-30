import { useState } from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { MODES, enabledModes } from './intentConfig';
import OpportunityPanel from './OpportunityPanel';

// The conversion spread of the deck. It renders only when a Fellow has opened a
// door, only the doors they opened, and it carries the whole of the pitch: what
// they want next, what they bring, and the one action a visitor is here to take.
// Nothing on this slide is ordered or weighted — it is the offer, stated plainly.
export default function OpportunitySlide({ nominee, settings, accent, onEnquire, onDossier }) {
  const modes = enabledModes(settings);
  const name = nominee?.name || 'this Fellow';
  const firstName = name.split(' ')[0];
  const [working, setWorking] = useState(false);

  if (!modes.length) return null;

  const downloadDossier = async () => {
    setWorking(true);
    try {
      await onDossier();
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.cream }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(120% 80% at 50% 0%, ${accent}14 0%, rgba(250,248,245,0) 62%)` }}
      />
      <div className="relative z-10 w-full max-w-4xl px-6 py-20 sm:py-24">
        <div className="flex items-center gap-3">
          <span className="h-px w-10" style={{ background: B.gold }} />
          <p className="text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: B.copper }}>
            The opportunity
          </p>
        </div>

        <h2
          className="mt-4 text-4xl leading-[1.02] sm:text-5xl"
          style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Work with {firstName}.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: B.muted }}>
          {modes.length > 1
            ? `${firstName} has opened two doors: a career conversation and a commercial engagement.`
            : modes[0] === 'hire'
              ? `${firstName} has opened a door to a career conversation.`
              : `${firstName} has opened a door to a commercial engagement.`}{' '}
          Every inquiry arrives privately. No address is ever published.
        </p>

        <div className={`mt-8 grid gap-4 ${modes.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-md'}`}>
          {enabledModes(settings).map((mode) => (
            <OpportunityPanel
              key={mode}
              mode={mode}
              settings={settings}
              onEnquire={onEnquire}
              onDossier={onDossier}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {settings?.dossier_enabled !== false && (
            <button
              type="button"
              onClick={downloadDossier}
              disabled={working}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ color: B.navy }}
            >
              {working ? 'Composing the dossier…' : 'Download the one-page dossier'}
            </button>
          )}
          <p className="text-[10px] leading-relaxed" style={{ color: B.muted }}>
            {modes.map((mode) => MODES[mode].label).join(' and ')} are published by the Fellow.
            They never affect how the institution measures or orders anyone.
          </p>
        </div>
      </div>
    </section>
  );
}