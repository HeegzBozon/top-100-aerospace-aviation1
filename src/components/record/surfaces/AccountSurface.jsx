import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ProfileAccountRow from '@/components/profile/essentials/ProfileAccountRow';
import ProfileWizard from '@/components/profile/wizard/ProfileWizard';
import PresentationSettings from '@/components/profile-deck/PresentationSettings';

// Account: the choices the machine keeps — the Studio that writes the record whole,
// the presentation settings the public deck opens at, and the copy of everything the
// platform holds. Each opens where it stands; none of them is a door to another page.
export default function AccountSurface({ account, nominee, settings, accent, onReload, tool }) {
  const [wizard, setWizard] = useState(null);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // A deep link opens the tool it names — the Studio from a "write yours" call to
  // action, the presentation from the deck's own share.
  useEffect(() => {
    if (tool === 'studio') setWizard([]);
    if (tool === 'presentation') setPresentationOpen(true);
  }, [tool]);

  // Slide order and pace are expression, written straight onto the settings row the
  // record already carries — never a new row per change.
  const savePresentation = async (patch) => {
    if (settings?.id) {
      await base44.entities.FellowProfileSettings.update(settings.id, patch);
    } else {
      await base44.entities.FellowProfileSettings.create({
        fellow_email: account?.email,
        fellow_id: nominee?.id,
        domain_accent: settings?.domain_accent,
        ...patch,
      });
    }
    onReload?.();
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportUserData');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user_data_${account?.email?.replace('@', '_at_') || 'export'}_${
        new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="mt-6">
        <ProfileAccountRow
          onOpenStudio={() => setWizard([])}
          onOpenPresentation={() => setPresentationOpen(true)}
          onExport={exportData}
          exporting={exporting}
        />
      </div>

      {wizard && (
        <ProfileWizard
          user={account}
          nominee={nominee}
          openWith={wizard}
          onClose={() => setWizard(null)}
          onSaved={onReload}
        />
      )}

      {presentationOpen && (
        <PresentationSettings
          settings={settings}
          accent={accent}
          onChange={savePresentation}
          onClose={() => setPresentationOpen(false)}
        />
      )}
    </>
  );
}