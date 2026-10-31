import ProfileDossier from '@/components/profile/dossier/ProfileDossier';
import PortfolioPanel from '@/components/profile/dossier/PortfolioPanel';

// The Data Room: the words the Fellow gives, edited where they are read, then the
// documents kept on the account. Everything here is written into the same record the
// checklist above counts — nothing is duplicated, and nothing here is measured.
export default function DataRoomSurface({
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