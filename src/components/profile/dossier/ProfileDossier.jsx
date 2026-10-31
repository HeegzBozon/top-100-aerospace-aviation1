import { PenLine } from 'lucide-react';
import ProfileResume from '@/components/profile/essentials/ProfileResume';
import IntentStudioPanel from '@/components/profile/intent/IntentStudioPanel';
import DossierFields from './DossierFields';
import FlightographyBlock from './FlightographyBlock';

// The Dossier: everything the Fellow says about themselves, in one column, edited
// where it is read. The four lines first, the record underneath, the verified
// Flightography beneath that, and the cover story last.
export default function ProfileDossier({
  user,
  nominee,
  settings,
  accent,
  saving,
  saveError,
  onSaveField,
  onSaveSettings,
  onOpenStudio,
}) {
  return (
    <section className="pd-sec pd-rise" style={{ animationDelay: '0.3s' }}>
      <div className="mb-7 flex items-center justify-between gap-4">
        <h2 className="pd-label">Dossier</h2>
        <button
          type="button"
          onClick={onOpenStudio}
          className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-[0.16em] text-editorial-copper transition-opacity hover:opacity-70"
        >
          <PenLine className="h-3 w-3" /> Open the Studio
        </button>
      </div>

      <DossierFields user={user} nominee={nominee} settings={settings} onSave={onSaveField} />

      <div className="mt-14">
        <ProfileResume nominee={nominee} bare />
      </div>

      <div className="mt-14">
        <h3 className="pd-label mb-5">Flightography</h3>
        <FlightographyBlock nominee={nominee} user={user} accent={accent} />
      </div>

      <div className="mt-14">
        <IntentStudioPanel
          part="pitch"
          settings={settings}
          accent={accent}
          onSave={onSaveSettings}
          saving={saving}
          error={saveError}
        />
      </div>
    </section>
  );
}