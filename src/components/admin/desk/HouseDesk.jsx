import { useState } from 'react';
import DeskMasthead from './DeskMasthead';
import DeskTabs from './DeskTabs';
import LedgerPanel from '@/components/admin/timecard/TimecardDesk';
import InvoicesPanel from '@/components/admin/invoicing/InvoicingDesk';
import SchedulePanel from '@/components/admin/timecard/SchedulePanel';
import MeetingBook from './MeetingBook';
import BenefitsTease from './BenefitsTease';

const TABS = [
  { key: 'ledger', label: 'Hours' },
  { key: 'rota', label: 'Rota' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'meetings', label: 'Meetings' },
  { key: 'benefits', label: 'Benefits', soon: true },
];

// One desk for the house's own paperwork. Hours and bills used to be two rooms with two
// mastheads and two sets of tiles; they are one ledger read from two sides, so they are
// one desk with one set of keys.
export default function HouseDesk({ initialTab = 'ledger' }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="space-y-4">
      <DeskMasthead
        kicker="House Desk"
        title="Hours, Bills & the Diary"
        blurb="The chores of running the house, kept as one ledger: what was worked, what is owed, who is on the rota, and who is expected in the room."
      />

      <DeskTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'ledger' && <LedgerPanel />}
      {tab === 'rota' && <SchedulePanel />}
      {tab === 'invoices' && <InvoicesPanel />}
      {tab === 'meetings' && <MeetingBook />}
      {tab === 'benefits' && <BenefitsTease />}
    </div>
  );
}