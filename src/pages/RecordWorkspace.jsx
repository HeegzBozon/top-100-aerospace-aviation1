import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { RECORD_SURFACES } from '@/components/record/recordMenu';
import useRecordChecklist from '@/components/record/useRecordChecklist';
import RecordChecklist from '@/components/record/RecordChecklist';
import BusinessCardPanel from '@/components/record/BusinessCardPanel';

// The Fellow's record as a working checklist: six surfaces, each one the lines it
// needs and a way to add them. The record is the only thing measured here — nothing
// on this page is weighted, ordered or compared with anyone else.
export default function RecordWorkspace() {
  const { user, isLoadingAuth } = useAuth();
  const [params, setParams] = useSearchParams();
  const record = useRecordChecklist();

  const surfaceKey = params.get('surface') || 'view';
  const surface = useMemo(
    () => record.surfaces.find((entry) => entry.key === surfaceKey) || record.surfaces[0],
    [record.surfaces, surfaceKey],
  );

  const onSave = (editor, value) => {
    const patch = { [editor.field]: value };
    if (editor.save === 'card') return record.saveCard(patch);
    if (editor.save === 'settings') return record.saveSettings(patch);
    return record.saveDossier(editor.field, value);
  };

  if (isLoadingAuth || record.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: B.cream }}>
        <Loader2 className="h-9 w-9 animate-spin" style={{ color: B.copper }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: B.cream }}>
        <p className="pd-label">Your record</p>
        <h1 className="max-w-md font-heading text-3xl leading-tight" style={{ color: B.navy }}>
          The record opens once you are signed in.
        </h1>
        <button
          type="button"
          onClick={() => base44.auth.redirectToLogin('/record')}
          className="pd-acct-link"
        >
          Sign in
        </button>
      </div>
    );
  }

  const overall = record.overall;
  const publicId = record.nominee?.id;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: B.cream, color: B.navy }}>
      <header className="px-6 pt-9 lg:px-16 lg:pt-12">
        <p className="pd-label">Your record</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-heading text-[34px] leading-none lg:text-[42px]">
            {(record.account?.full_name || user.full_name || 'Your name').split(' ')[0]}&rsquo;s record
          </h1>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="font-heading text-[30px] leading-none tabular-nums">{overall.percent}%</p>
              <p className="mt-1.5 font-body text-[10px] uppercase tracking-[0.18em] text-editorial-navy/60 tabular-nums">
                {overall.done} of {overall.total} lines in place
              </p>
            </div>
            {publicId && (
              <Link to={`/profiles/${publicId}`} className="pd-acct-link !py-2.5">
                View public record
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
        <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-editorial-navy/10">
          <span
            className="block h-full rounded-full bg-editorial-copper transition-[width] duration-700"
            style={{ width: `${overall.percent}%` }}
          />
        </div>
      </header>

      <div className="mt-8 grid gap-8 px-6 pb-28 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-14 lg:px-16">
        <nav
          aria-label="Record sections"
          className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {record.surfaces.map((entry) => {
            const Icon = entry.icon;
            const active = entry.key === surface?.key;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setParams({ surface: entry.key }, { replace: true })}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2.5 rounded-[8px] border px-3 py-2.5 text-left transition-colors lg:w-full lg:shrink ${
                  active
                    ? 'border-editorial-copper bg-editorial-copper/10'
                    : 'border-transparent hover:border-editorial-navy/15 hover:bg-white/60'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-editorial-copper' : 'text-editorial-navy/50'}`}
                  strokeWidth={1.8}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-[12.5px] font-medium text-editorial-navy">
                    {entry.label}
                  </span>
                  <span className="mt-1 hidden h-[2px] w-full overflow-hidden rounded-full bg-editorial-navy/10 lg:block">
                    <span
                      className="block h-full rounded-full bg-editorial-copper"
                      style={{ width: `${entry.percent}%` }}
                    />
                  </span>
                </span>
                <span className="font-body text-[10px] tabular-nums text-editorial-navy/50">
                  {entry.done}/{entry.total}
                </span>
              </button>
            );
          })}
        </nav>

        <main className="min-w-0">
          {surface?.key === 'card' && (
            <BusinessCardPanel
              account={record.account}
              card={record.card}
              nominee={record.nominee}
              onChange={record.saveCard}
            />
          )}

          {surface && <RecordChecklist surface={surface} onSave={onSave} />}

          {surface?.key === 'account' && (
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link to="/Profile" className="pd-acct-link !py-2.5">
                Edit your record
              </Link>
              <Link to="/Profile?settings=presentation" className="pd-acct-link !py-2.5">
                Presentation settings
              </Link>
            </div>
          )}

          <p className="mt-8 max-w-lg font-body text-[11.5px] leading-relaxed text-editorial-navy/55">
            The count is your own record and nothing else. It is never read by
            discovery, ordering, influence tier or measurement — a line filled in here
            never moves your standing.
          </p>
        </main>
      </div>
    </div>
  );
}