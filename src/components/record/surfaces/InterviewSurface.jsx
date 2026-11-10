import ProfileDossier from '@/components/profile/dossier/ProfileDossier';
import PortfolioPanel from '@/components/profile/dossier/PortfolioPanel';

// The Interview: the profile itself. It opens on the words the Fellow gives and the
// documents kept behind them, each edited where it is read — the public reading is the
// record's own page, so it is not printed a second time here.
//
// Everything here is written into the same profile the checklist above counts: nothing is
// duplicated, and nothing here is measured.
export default function InterviewSurface({
  account,
  nominee,
  settings,
  accent,
  onSaveDossier,
  onSaveSettings,
  onOpenStudio,
  onReload,
}) {
  return (
    <div className="mt-8">
      <ProfileDossier
        user={account}
        nominee={nominee}
        settings={settings}
        accent={accent}
        saving={false}
        saveError=""
        onSaveField={onSaveDossier}
        onSaveSettings={onSaveSettings}
        onOpenStudio={onOpenStudio}
      />

      <section className="pd-sec">
        <h2 className="pd-label mb-6">Portfolio</h2>
        <PortfolioPanel user={account} accent={accent} onUserUpdate={onReload} />
      </section>
    </div>
  );
}