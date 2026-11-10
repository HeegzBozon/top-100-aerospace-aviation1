import { Link } from 'react-router-dom';
import CredentialsSurface from './CredentialsSurface';
import DataRoomSurface from './DataRoomSurface';
import InterviewSurface from './InterviewSurface';
import AvailabilitySurface from './AvailabilitySurface';
import AccountSurface from './AccountSurface';

// The editor for whichever of the seven surfaces is open. Each one sits under its own
// checklist, so a line that is missing is written where it is counted — and the seven
// together are the profile page, not a page about it.
export default function RecordSurface({
  surfaceKey,
  account,
  nominee,
  settings,
  card,
  accent,
  onSaveDossier,
  onSaveSettings,
  onOpenStudio,
  onReload,
  tool,
}) {
  if (surfaceKey === 'credentials') {
    return (
      <CredentialsSurface account={account} nominee={nominee} settings={settings} card={card} />
    );
  }

  if (surfaceKey === 'dataroom') {
    return <DataRoomSurface account={account} />;
  }

  if (surfaceKey === 'interview') {
    return (
      <InterviewSurface
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
        <Link to="/inbox" className="pd-acct-link inline-flex">Open the Inbox</Link>
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