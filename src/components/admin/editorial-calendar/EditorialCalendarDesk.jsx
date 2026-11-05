import { useMemo, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import DeskMasthead from '@/components/admin/desk/DeskMasthead';
import DeskTabs from '@/components/admin/desk/DeskTabs';
import IssueTimeline from './IssueTimeline';
import IssueWorkspace from './IssueWorkspace';
import StandardPanel from './StandardPanel';
import useEditorialCalendar from './useEditorialCalendar';

const TABS = [
  { key: 'calendar', label: 'Calendar' },
  { key: 'standard', label: 'The standard' },
];

// THE EDITORIAL CALENDAR — the authoritative home for what the house intends to publish.
//
// One record per issue: its date, its type, its length, who owns the next step, and the
// three desks it is handed to. The desks keep their own work. Magazine Studio keeps its
// pages, the Mail Room keeps its letter and its send, the Funnel Desk keeps its campaign,
// and each of them reports its own state back here rather than a copy of it being kept.
export default function EditorialCalendarDesk({ initialTab = 'calendar' }) {
  const [tab, setTab] = useState(initialTab);
  const [year, setYear] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const calendar = useEditorialCalendar();

  const issues = useMemo(() => {
    const rows = calendar.issues || [];
    return year === 'all' ? rows : rows.filter((issue) => String(issue.year) === year);
  }, [calendar.issues, year]);

  const years = useMemo(() => {
    const set = new Set((calendar.issues || []).map((issue) => issue.year).filter(Boolean));
    return [...set].sort();
  }, [calendar.issues]);

  const selected = (calendar.issues || []).find((issue) => issue.id === selectedId) || null;

  const nextIssue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (calendar.issues || []).find((issue) => issue.issue_date >= today) || null;
  }, [calendar.issues]);

  const act = async (key, fn, successMessage) => {
    setBusy(key);
    setNotice('');
    const outcome = await fn();
    setBusy('');
    if (!outcome.ok) {
      setNotice(outcome.message);
      return outcome;
    }
    if (successMessage) setNotice(successMessage);
    return outcome;
  };

  const stageDesk = (issueId, desk) =>
    act(`stage-${desk}`, () => calendar.stageDesk(issueId, desk)).then((outcome) => {
      if (outcome.ok && !selectedId) setSelectedId(issueId);
    });

  const renderCalendar = () => {
    if (calendar.state === 'loading' && !calendar.issues.length) {
      return (
        <div className="desk-plate flex items-center justify-center gap-2 py-16">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#c9a87c' }} />
          <p className="text-[11px]" style={{ color: '#7d94aa' }}>
            Reading the calendar
          </p>
        </div>
      );
    }

    if (calendar.state === 'error') {
      return (
        <div className="desk-plate p-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" style={{ color: '#e08a8a' }} />
            <div>
              <p className="text-[12px]" style={{ color: '#f5efe4' }}>
                The calendar could not be read
              </p>
              <p className="mt-1 text-[10.5px]" style={{ color: '#7d94aa' }}>
                {calendar.error}
              </p>
              <button type="button" onClick={calendar.reload} className="desk-key mt-3">
                <RefreshCw className="h-3 w-3" />
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!calendar.seeded) {
      return (
        <div className="desk-plate px-6 py-10 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
            The grid is not filed yet
          </p>
          <p className="mx-auto mt-2 max-w-md font-heading text-xl leading-snug" style={{ color: '#f5efe4' }}>
            Thirty issues, No. 42 to No. 71
          </p>
          <p className="mx-auto mt-2 max-w-md text-[11px] leading-5" style={{ color: '#7d94aa' }}>
            Filing the playbook grid puts every issue on the calendar with its date, its type and the length
            the guide sets for it, and files the editorial style guide as version 1. Filing twice changes
            nothing.
          </p>
          <button
            type="button"
            disabled={busy === 'seed'}
            onClick={() => act('seed', calendar.seed, 'The grid is filed.')}
            className="desk-key desk-key-primary mx-auto mt-4 disabled:opacity-50"
          >
            {busy === 'seed' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            File the playbook grid
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Next to land',
              value: nextIssue ? `No. ${nextIssue.issue_no}` : '—',
              note: nextIssue ? `${nextIssue.issue_name} · ${nextIssue.issue_date}` : 'Nothing ahead',
            },
            {
              label: 'Staged at a desk',
              value: String((calendar.issues || []).filter((issue) => issue.stagedCount > 0).length),
              note: 'Issues with work open somewhere',
            },
            {
              label: 'Standard in force',
              value: calendar.standard ? `v${calendar.standard.version}` : '—',
              note: calendar.standard ? calendar.standard.title : 'No standard filed',
            },
          ].map((stat) => (
            <div key={stat.label} className="desk-plate px-4 py-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: '#5f7488' }}>
                {stat.label}
              </p>
              <p className="mt-1 font-heading text-xl leading-none" style={{ color: '#f5efe4' }}>
                {stat.value}
              </p>
              <p className="mt-1 truncate text-[9.5px]" style={{ color: '#7d94aa' }}>
                {stat.note}
              </p>
            </div>
          ))}
        </div>

        {notice ? (
          <div className="rounded px-3 py-2" style={{ background: 'rgba(201,168,124,0.10)', boxShadow: 'inset 0 0 0 1px rgba(201,168,124,0.3)' }}>
            <p className="text-[10.5px]" style={{ color: '#e8d7bd' }}>
              {notice}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-1.5">
          {['all', ...years].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setYear(String(option))}
              className="rounded px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]"
              style={
                String(option) === year
                  ? { background: '#8f5c2c', color: '#fdf8f0' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#8fa6ba' }
              }
            >
              {option === 'all' ? 'All issues' : option}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
          <div className="desk-plate p-3 md:p-4">
            <IssueTimeline
              issues={issues}
              selectedId={selectedId}
              onSelect={(issue) => setSelectedId(issue.id)}
            />
          </div>
          <div className="lg:sticky lg:top-4 lg:self-start">
            {selected ? (
              <IssueWorkspace
                issue={selected}
                campaign={(calendar.campaigns || []).find((c) => c.id === selected.campaign_id)}
                busy={Boolean(busy)}
                onSave={(id, patch) => act('save-issue', () => calendar.saveIssue(id, patch), 'The plan is saved.')}
                onStage={stageDesk}
                onDraft={(id) => act('draft', () => calendar.draftLetter(id), 'The letter is drafted to the standard.')}
                onSaveCampaign={(payload) => act('campaign', () => calendar.saveCampaign(payload), 'The campaign is saved.')}
              />
            ) : (
              <div className="desk-plate p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
                  The issue
                </p>
                <p className="mt-2 text-[11px] leading-5" style={{ color: '#7d94aa' }}>
                  Choose an issue on the calendar to read its plan, its next step, and the three desks it is
                  handed to.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <DeskMasthead
        kicker="Editorial Calendar"
        title="What the house publishes next"
        blurb="Every issue on one grid: its date, its type, its length, who owns the next step, and the three desks it is handed to. The desks keep their work. This is where the work is read as one issue."
      >
        <span
          className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: 'rgba(201,168,124,0.14)', color: '#c9a87c' }}
        >
          {(calendar.issues || []).length} on the grid
        </span>
      </DeskMasthead>

      <DeskTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'calendar' && renderCalendar()}

      {tab === 'standard' && (
        <StandardPanel
          standard={calendar.standard}
          busy={busy === 'standard'}
          onSave={(patch) => act('standard', () => calendar.saveStandard(patch), 'A new version is in force.')}
        />
      )}
    </div>
  );
}