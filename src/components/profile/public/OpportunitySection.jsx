import { useState } from 'react';
import ProfileSection from './ProfileSection';
import OpportunityPanel from '@/components/profile/intent/OpportunityPanel';
import { enabledModes, MODES } from '@/components/profile/intent/intentConfig';

// Availability holds the third layer of the record: the doors the Fellow has
// opened, and nothing else. Only the doors they opened render, every inquiry
// arrives privately, and none of it is ever read by discovery or measurement.
export default function OpportunitySection({ index, nominee, settings, onEnquire, onDossier }) {
  const modes = enabledModes(settings);
  const [working, setWorking] = useState(false);
  if (!modes.length) return null;

  const firstName = (nominee?.name || 'this Fellow').split(' ')[0];

  const downloadDossier = async () => {
    setWorking(true);
    try {
      await onDossier();
    } finally {
      setWorking(false);
    }
  };

  return (
    <ProfileSection
      index={index}
      label="Availability"
      title={`Work with ${firstName}.`}
      note={
        modes.length > 1
          ? `${firstName} has opened two doors: a career conversation and a commercial engagement. Every inquiry arrives privately; no address is published.`
          : `${firstName} has opened one door. Every inquiry arrives privately; no address is published.`
      }
    >
      <div className={`grid gap-4 ${modes.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-md'}`}>
        {modes.map((mode) => (
          <OpportunityPanel
            key={mode}
            mode={mode}
            settings={settings}
            onEnquire={onEnquire}
            onDossier={onDossier}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-editorial-copper/20 pt-4">
        {settings?.dossier_enabled !== false ? (
          <button
            type="button"
            onClick={downloadDossier}
            disabled={working}
            className="font-body text-[10.5px] font-bold uppercase tracking-[0.16em] text-editorial-navy underline decoration-editorial-copper decoration-1 underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-40"
          >
            {working ? 'Composing the dossier…' : 'Download the one-page dossier'}
          </button>
        ) : (
          <span />
        )}
        <p className="max-w-sm font-body text-[10px] leading-relaxed text-editorial-navy/50">
          {modes.map((mode) => MODES[mode].label).join(' and ')} are published by the Fellow and never affect how the
          institution measures or orders anyone.
        </p>
      </div>
    </ProfileSection>
  );
}