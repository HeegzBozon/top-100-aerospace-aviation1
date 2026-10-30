import BusinessCardPanel from '@/components/record/BusinessCardPanel';
import InquiryDeskPanel from '@/components/profile/intent/InquiryDeskPanel';
import ViewSurface from './ViewSurface';
import DataRoomSurface from './DataRoomSurface';
import AvailabilitySurface from './AvailabilitySurface';
import AccountSurface from './AccountSurface';

// The editor for whichever of the six surfaces is open. Each one sits under its own
// checklist, so a line that is missing is written where it is counted — and the six
// together are the profile page, not a page about it.
export default function RecordSurface({
  surfaceKey,
  account,
  nominee,
  settings,
  card,
  accent,
  onSaveCard,
  onSaveDossier,
  onSaveSettings,
  onOpenStudio,
  onReload,
  tool,
}) {
  if (surfaceKey === 'card') {
    return (
      <div className="mt-8">
        <BusinessCardPanel
          account={account}
          card={card}
          nominee={nominee}
          onChange={onSaveCard}
        />
      </div>
    );
  }

  if (surfaceKey === 'view') {
    return <ViewSurface account={account} nominee={nominee} settings={settings} />;
  }

  if (surfaceKey === 'dataroom') {
    return (
      <DataRoomSurface
        account={account}
        nominee={nominee}
        settings={settings}
        accent={accent}
        onSaveDossier={onSaveDossier}
        onSaveSettings={onSaveSettings}
        onOpenStudio={onOpenStudio}
        onReload={onReload}
      />
    );
  }

  if (surfaceKey === 'availability') {
    return (
      <AvailabilitySurface settings={settings} accent={accent} onSaveSettings={onSaveSettings} />
    );
  }

  if (surfaceKey === 'inbox') {
    return (
      <div className="mt-8">
        <InquiryDeskPanel user={account} accent={accent} />
      </div>
    );
  }

  if (surfaceKey === 'account') {
    return (
      <AccountSurface
        account={account}
        nominee={nominee}
        settings={settings}
        accent={accent}
        onReload={onReload}
        tool={tool}
      />
    );
  }

  return null;
}