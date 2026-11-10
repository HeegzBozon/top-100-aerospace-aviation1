import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { B, accentValue } from '@/components/fellow-home/fellowHomeConfig';
import useRecordChecklist from '@/components/record/useRecordChecklist';
import RecordChecklist from '@/components/record/RecordChecklist';
import RecordSurface from '@/components/record/surfaces/RecordSurface';
import SurfaceBlockRail from '@/components/record/SurfaceBlockRail';
import { editorBlock, surfaceBlocks } from '@/components/record/recordSurfaceBlocks';

// The Fellow's own profile as a working checklist: six surfaces, each one the lines it
// needs and a way to add them. The profile is the only thing measured here — nothing
// on this page is weighted, ordered or compared with anyone else.
export default function RecordWorkspace() {
  const { user, isLoadingAuth } = useAuth();
  const [params, setParams] = useSearchParams();
  const record = useRecordChecklist();

  // A deep link that names a tool opens the surface the tool stands on.
  const tool =
    params.get('studio') === 'open'
      ? 'studio'
      : params.get('settings') === 'presentation'
        ? 'presentation'
        : null;
  const surfaceKey = params.get('surface') || (tool ? 'account' : 'interview');
  const surface = useMemo(
    () => record.surfaces.find((entry) => entry.key === surfaceKey) || record.surfaces[0],
    [record.surfaces, surfaceKey],
  );

  // A long surface is read one block at a time, and it always opens on its lines.
  const blocks = useMemo(() => surfaceBlocks(surface?.key), [surface?.key]);
  const [block, setBlock] = useState('lines');
  useEffect(() => setBlock('lines'), [surface?.key]);
  const activeKey = blocks ? (blocks.find((entry) => entry.key === block) || blocks[0]).key : null;

  // Acquisition attribution: a Fellow arriving from another publication's call to
  // action stamps the referrer once, and never overwrites one already held.
  useEffect(() => {
    const ref = params.get('ref');
    if (!user?.email || !ref || user.signup_referrer) return;
    base44.auth.updateMe({ signup_referrer: ref }).catch(() => {});
  }, [user?.email, user?.signup_referrer, params]);

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
        <p className="pd-label">Your Profile</p>
        <h1 className="max-w-md font-heading text-3xl leading-tight" style={{ color: B.navy }}>
          Your profile opens once you are signed in.
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
  const accent = accentValue(record.settings?.domain_accent);
  const fullName = (record.account?.full_name || user.full_name || '').trim();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: B.cream, color: B.navy }}>
      <header className="px-6 pt-9 lg:px-16 lg:pt-12">
        <p className="pd-label">Your Profile</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-heading text-[34px] leading-none lg:text-[42px]">
            {fullName || 'Your Profile'}
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
                See the public profile
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
          aria-label="Profile sections"
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
          {/* Cut into blocks, with the rail at the head of them, so the far end of a long
              surface is one press away rather than a scroll. */}
          {surface && blocks && (
            <SurfaceBlockRail
              surface={surface}
              blocks={blocks}
              active={activeKey}
              onSelect={setBlock}
            />
          )}

          {surface && (!blocks || activeKey === 'lines') && (
            <div
              role={blocks ? 'tabpanel' : undefined}
              aria-labelledby={blocks ? `record-tab-${surface.key}-lines` : undefined}
            >
              <RecordChecklist
                surface={surface}
                onSave={onSave}
                onOpenEditor={blocks ? () => setBlock(editorBlock(surface.key)?.key) : undefined}
              />
            </div>
          )}

          {/* The editor for the surface: the six together are the profile page, and every
              line is written where it is counted. */}
          {surface && (!blocks || activeKey !== 'lines') && (
            <div
              id={`record-editor-${surface.key}`}
              role={blocks ? 'tabpanel' : undefined}
              aria-labelledby={blocks ? `record-tab-${surface.key}-${activeKey}` : undefined}
            >
              <RecordSurface
                surfaceKey={surface.key}
                account={record.account || user}
                nominee={record.nominee}
                settings={record.settings}
                card={record.card}
                accent={accent}
                onSaveCard={record.saveCard}
                onSaveDossier={record.saveDossier}
                onSaveSettings={record.saveSettings}
                onOpenStudio={() => setParams({ surface: 'account', studio: 'open' }, { replace: true })}
                onReload={record.reload}
                tool={tool}
                block={activeKey}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}