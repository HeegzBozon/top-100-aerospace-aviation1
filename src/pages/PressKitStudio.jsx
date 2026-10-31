import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import usePressKit from '@/components/press-kit/usePressKit';
import useMediaRoom from '@/components/press-kit/useMediaRoom';
import { buildMediaAssets } from '@/components/press-kit/mediaRoomAssets';
import { buildSourceLines } from '@/components/press-kit/studioDrafts';
import KitComposer from '@/components/press-kit/KitComposer';
import KitSharePanel from '@/components/press-kit/KitSharePanel';
import PressKitSheet from '@/components/press-kit/PressKitSheet';
import MediaRoomGrid from '@/components/press-kit/MediaRoomGrid';
import ShareCopyStudio from '@/components/press-kit/ShareCopyStudio';
import EditorialCalendarPanel from '@/components/press-kit/EditorialCalendarPanel';
import { downloadKitPdf } from '@/components/press-kit/kitPdf';

const TABS = [
  { key: 'room', label: 'Media room' },
  { key: 'kit', label: 'The kit' },
  { key: 'copy', label: 'Share copy' },
  { key: 'calendar', label: 'Calendar' },
];

// The Press Kit is a Fellow's own room for their record: the addresses they already hold,
// the dossier the press reads, the words they send with it, and a plan for the season. All
// of it is drawn from what they have already submitted, all of it is theirs to rewrite, and
// none of it is posted on their behalf.
export default function PressKitStudio() {
  const kit = usePressKit();
  const { user } = useAuth();
  const room = useMediaRoom(user?.email || '');
  const [tab, setTab] = useState('room');
  const [mode, setMode] = useState('edit');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const shareUrl = kit.row?.share_code ? `${window.location.origin}/press-kit/${kit.row.share_code}` : '';
  const published = kit.row?.status === 'published';

  const assets = useMemo(
    () => buildMediaAssets({ nomineeId: kit.draft?.nominee_id, kitRow: kit.row, episode: room.episode }),
    [kit.draft?.nominee_id, kit.row, room.episode],
  );

  const sources = useMemo(
    () => (kit.draft ? buildSourceLines(kit.draft, room.episode) : []),
    [kit.draft, room.episode],
  );

  const persist = async (patch) => {
    setError('');
    setBusy('studio');
    try {
      kit.setDraft({ ...kit.draft, ...patch });
      await kit.save(patch);
    } catch {
      setError('That did not save. Try again in a moment.');
    } finally {
      setBusy('');
    }
  };

  const togglePublic = (asset) => {
    if (!asset?.ready || !asset.url) return;
    const list = Array.isArray(kit.draft?.media_room_public) ? kit.draft.media_room_public : [];
    const listed = list.some((row) => row.key === asset.key);
    persist({
      media_room_public: listed
        ? list.filter((row) => row.key !== asset.key)
        : [...list, { key: asset.key, label: asset.label, url: asset.url }],
    });
  };

  const run = async (kind) => {
    setError('');
    setBusy(kind);
    try {
      if (kind === 'pdf') {
        await downloadKitPdf(kit.draft, shareUrl);
      } else if (kind === 'save') {
        await kit.save();
      } else {
        if (!kit.draft.full_name.trim()) {
          setError('A kit needs a name before it can be published.');
          return;
        }
        await kit.publish();
        setMode('preview');
      }
    } catch {
      setError('That did not go through. Try again in a moment.');
    } finally {
      setBusy('');
    }
  };

  const header = (
    <>
      <Link
        to="/app-store"
        className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em]"
        style={{ color: B.muted }}
      >
        <ArrowLeft className="h-3 w-3" />
        App Store
      </Link>
      <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: B.copper }}>
        Press Kit
      </p>
      <h1 className="mt-2 font-heading text-[2rem] leading-[1.05] md:text-[2.75rem]" style={{ color: B.navy }}>
        Your record, set for the press.
      </h1>
      <p className="mt-3 max-w-xl text-[13px] leading-relaxed" style={{ color: B.muted }}>
        One room for everything about your record that is worth handing on: the dossier,
        the card, the badge, the words that travel with them, and a plan for the season.
        Everything is drawn from what you have already submitted, and nothing is added or
        posted on your behalf.
      </p>
    </>
  );

  if (kit.state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: B.cream }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: B.copper }} />
      </div>
    );
  }

  if (kit.state === 'signed-out') {
    return (
      <div className="min-h-screen" style={{ background: B.cream }}>
        <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-8 md:py-14">
          {header}
          <div className="mt-7 rounded-xl p-6" style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}>
            <h2 className="font-heading text-xl" style={{ color: B.navy }}>
              The room opens once you are signed in.
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
              It is assembled from your own record, so it needs the record it belongs to.
            </p>
            <button
              type="button"
              onClick={() => base44.auth.redirectToLogin('/press-kit')}
              className="mt-5 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ background: B.navy, color: B.cream }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (kit.state === 'failed' || !kit.draft) {
    return (
      <div className="min-h-screen" style={{ background: B.cream }}>
        <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-8 md:py-14">
          {header}
          <div className="mt-7 rounded-xl p-6" style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}>
            <h2 className="font-heading text-xl" style={{ color: B.navy }}>
              Your room could not be opened.
            </h2>
            <p className="mt-2 text-[12.5px]" style={{ color: B.muted }}>
              The record did not answer. Nothing has been changed.
            </p>
            <button
              type="button"
              onClick={kit.retry}
              className="mt-5 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ background: B.navy, color: B.cream }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
        {header}

        <div className="-mx-4 mt-6 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {TABS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setTab(entry.key)}
              aria-pressed={tab === entry.key}
              className="shrink-0 rounded-full px-3.5 py-2 text-[8.5px] font-bold uppercase tracking-[0.18em]"
              style={
                tab === entry.key
                  ? { background: B.navy, color: B.cream }
                  : { background: 'rgba(30,58,90,0.06)', color: B.muted, border: `1px solid ${B.border}` }
              }
            >
              {entry.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="mt-3 text-[11px]" style={{ color: '#a33' }}>
            {error}
          </p>
        ) : null}

        <div className="mt-4">
          <section className={tab === 'room' ? '' : 'hidden'}>
            <MediaRoomGrid
              assets={assets}
              kit={kit.draft}
              onToggle={togglePublic}
              busy={busy === 'studio'}
              loading={room.loading}
              failed={room.failed}
            />
          </section>

          <section className={tab === 'kit' ? '' : 'hidden'}>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.18em]"
                style={
                  published
                    ? { background: 'rgba(30,58,90,0.08)', color: B.navy, border: `1px solid ${B.border}` }
                    : { background: 'rgba(184,115,51,0.10)', color: B.copper, border: '1px solid rgba(184,115,51,0.24)' }
                }
              >
                {published ? 'Published' : 'Draft'}
              </span>
              <button
                type="button"
                onClick={() => run('save')}
                disabled={!!busy}
                className="rounded-full px-3.5 py-2 text-[8.5px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
                style={{ background: 'rgba(30,58,90,0.06)', color: B.navy, border: `1px solid ${B.border}` }}
              >
                {busy === 'save' ? 'Saving' : 'Save draft'}
              </button>
              <button
                type="button"
                onClick={() => run('pdf')}
                disabled={!!busy}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[8.5px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
                style={{ background: 'rgba(30,58,90,0.06)', color: B.navy, border: `1px solid ${B.border}` }}
              >
                <Download className="h-3 w-3" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => run('publish')}
                disabled={!!busy}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[8.5px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
                style={{ background: B.copper, color: B.cream }}
              >
                <Send className="h-3 w-3" />
                {published ? 'Republish' : 'Publish'}
              </button>
            </div>

            {published && shareUrl ? (
              <div className="mt-4">
                <KitSharePanel url={shareUrl} />
              </div>
            ) : null}

            <div className="mt-4 flex rounded-full p-1 lg:hidden" style={{ background: 'rgba(30,58,90,0.06)' }}>
              {['edit', 'preview'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className="flex-1 rounded-full py-2 text-[8.5px] font-bold uppercase tracking-[0.18em]"
                  style={mode === option ? { background: B.navy, color: B.cream } : { color: B.muted }}
                >
                  {option === 'edit' ? 'Compose' : 'Preview'}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <section
                className={`rounded-xl p-4 md:p-5 ${mode === 'edit' ? '' : 'hidden lg:block'}`}
                style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}
              >
                <KitComposer draft={kit.draft} onChange={kit.setDraft} />
              </section>

              <aside className={`lg:sticky lg:top-4 ${mode === 'preview' ? '' : 'hidden lg:block'}`}>
                <PressKitSheet kit={kit.draft} shareUrl={shareUrl} />
                <p className="mt-2 px-1 text-[10px] leading-relaxed" style={{ color: B.muted }}>
                  This is exactly what the page and the PDF print.
                </p>
              </aside>
            </div>
          </section>

          <section className={tab === 'copy' ? '' : 'hidden'}>
            <div className="rounded-xl p-4 md:p-5" style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}>
              <ShareCopyStudio
                sources={sources}
                drafts={kit.draft.share_drafts}
                onChange={(next) => persist({ share_drafts: next })}
              />
            </div>
          </section>

          <section className={tab === 'calendar' ? '' : 'hidden'}>
            <div className="rounded-xl p-4 md:p-5" style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}>
              <EditorialCalendarPanel
                sources={sources}
                assets={assets.filter((asset) => asset.ready && !asset.tool).map(({ key, label }) => ({ key, label }))}
                slots={kit.draft.editorial_calendar}
                onChange={(next) => persist({ editorial_calendar: next })}
              />
            </div>
          </section>
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
}