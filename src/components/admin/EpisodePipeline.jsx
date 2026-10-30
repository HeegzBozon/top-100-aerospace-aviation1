import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Mic, RefreshCw } from 'lucide-react';
import {
  EPISODE_TRACK,
  EPISODE_ASIDE,
  stageLabel,
  stageNote,
  nextStages,
  trackIndex,
  episodeLabel,
  episodeSettingLabel,
} from '@/components/episode/episodeStages';
import EpisodeStatusTrack from '@/components/episode/EpisodeStatusTrack';

const INK = '#1E3A5A';
const COPPER = '#B87333';
const GOLD = '#C9A87C';

const FILTERS = [
  { key: 'open', label: 'In the pipeline' },
  { key: 'published', label: 'Published' },
  { key: 'declined', label: 'Not proceeding' },
  { key: 'all', label: 'All' },
];

const fmtDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const Row = ({ label, value }) =>
  value ? (
    <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-[var(--border)] py-2">
      <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="font-body text-[13px] leading-relaxed text-[var(--text)]">{value}</p>
    </div>
  ) : null;

// The editorial desk for episodes.
//
// An intake arrives the moment a Fellow opens their episode; from here the desk
// reads it against the documentary record, asks for what is missing, holds a date,
// and moves the episode along the pipeline. Nothing on this surface is purchasable
// and nothing here feeds discovery or measurement.
export default function EpisodePipeline() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.entities.EpisodeIntake.list({ sort: '-created_date', limit: 200 });
      const items = res?.items || (Array.isArray(res) ? res : []);
      setRows(items);
      setSelected((current) => (current ? items.find((r) => r.id === current.id) || null : null));
    } catch (e) {
      setError(e?.message || 'Episodes could not be read.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setNote('');
    setScheduledFor(selected?.scheduled_for ? selected.scheduled_for.slice(0, 10) : '');
  }, [selected?.id, selected?.scheduled_for]);

  const visible = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'open') {
      return rows.filter((r) => r.status !== 'published' && r.status !== 'declined');
    }
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const move = async (status) => {
    if (!selected || busy) return;
    setBusy(true);
    setError('');
    try {
      const at = new Date().toISOString();
      const patch = {
        status,
        status_history: [
          ...(selected.status_history || []),
          { status, at, note: note.trim() || stageLabel(status) },
        ],
        ...(note.trim() ? { reviewer_note: note.trim() } : {}),
        ...(scheduledFor ? { scheduled_for: new Date(`${scheduledFor}T12:00:00`).toISOString() } : {}),
      };
      await base44.entities.EpisodeIntake.update(selected.id, patch);
      setNote('');
      await load();
    } catch (e) {
      setError(e?.message || 'That change could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">Episodes</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Every Fellow&rsquo;s documentary record is the foundation of an episode. This is where an
            intake becomes a scheduled conversation.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = f.key === 'all'
            ? rows.length
            : f.key === 'open'
              ? rows.filter((r) => r.status !== 'published' && r.status !== 'declined').length
              : rows.filter((r) => r.status === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={active}
              className="rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors"
              style={{
                borderColor: active ? COPPER : 'var(--border)',
                background: active ? COPPER : 'transparent',
                color: active ? '#FAF8F5' : 'var(--muted)',
              }}
            >
              {f.label} · {count}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--muted)]" />
              <span className="text-[12.5px] text-[var(--muted)]">Reading the pipeline…</span>
            </div>
          ) : visible.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Mic className="mx-auto h-6 w-6" style={{ color: GOLD }} strokeWidth={1.6} />
              <p className="mt-4 font-heading text-[17px] text-[var(--text)]">Nothing in this stage.</p>
              <p className="mx-auto mt-2 max-w-[16rem] text-[12px] leading-relaxed text-[var(--muted)]">
                An episode appears here the moment a Fellow opens their intake from their own record.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {visible.map((row) => {
                const active = selected?.id === row.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      aria-current={active ? 'true' : undefined}
                      className="w-full px-4 py-3 text-left transition-colors hover:bg-[var(--secondary)]"
                      style={active ? { background: 'rgba(184,115,51,0.08)' } : undefined}
                    >
                      <p
                        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: active ? COPPER : 'var(--muted)' }}
                      >
                        {stageLabel(row.status)}
                      </p>
                      <p className="mt-1 truncate font-heading text-[15px] text-[var(--text)]">
                        {row.headline || row.profile_name || 'Untitled episode'}
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] text-[var(--muted)]">
                        {row.profile_name || row.fellow_email} · {fmtDate(row.created_date)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          {!selected ? (
            <div className="py-16 text-center">
              <p className="font-heading text-[18px] text-[var(--text)]">Select an episode.</p>
              <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-[var(--muted)]">
                The intake, the pipeline, and the moves available to the desk all sit here once an
                episode is chosen.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {stageLabel(selected.status)} · opened {fmtDate(selected.submitted_at || selected.created_date)}
                </p>
                <h3 className="mt-1.5 font-heading text-[24px] leading-tight text-[var(--text)]">
                  {selected.headline || 'Untitled episode'}
                </h3>
                <p className="mt-1 text-[12.5px] text-[var(--muted)]">{selected.profile_name || selected.fellow_email}</p>
              </div>

              <EpisodeStatusTrack status={selected.status} />
              <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{stageNote(selected.status)}</p>

              <div>
                <Row label="About" value={selected.angle} />
                <Row label="Subjects" value={(selected.topics || []).join(' · ')} />
                <Row label="Format" value={episodeLabel(selected.format)} />
                <Row label="Recording" value={episodeSettingLabel(selected.interview_setting)} />
                <Row label="Location" value={selected.location} />
                <Row label="Available" value={selected.availability_window} />
                <Row label="Production notes" value={selected.technical_notes} />
                <Row label="Write to" value={selected.contact_email} />
                <Row label="Publish consent" value={selected.consent_to_publish ? 'Given' : 'Not given'} />
                <Row label="Scheduled" value={fmtDate(selected.scheduled_for)} />
                <Row label="Published" value={selected.published_url} />
              </div>

              {selected.reviewer_note && (
                <div
                  className="px-4 py-3"
                  style={{ background: 'rgba(184,115,51,0.08)', borderLeft: `2px solid ${COPPER}` }}
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: COPPER }}>
                    Note to the Fellow
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text)]">{selected.reviewer_note}</p>
                </div>
              )}

              {nextStages(selected.status).length > 0 && (
                <div className="space-y-3 border-t border-[var(--border)] pt-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Note to the Fellow (optional)
                      </span>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="What the desk needs, or what happens next."
                        className="mt-1.5 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[13px] text-[var(--text)]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Recording date
                      </span>
                      <input
                        type="date"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[13px] text-[var(--text)]"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Move the episode
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {nextStages(selected.status).map((stage) => (
                        <button
                          key={stage.key}
                          type="button"
                          disabled={busy}
                          onClick={() => move(stage.key)}
                          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text)] transition-colors hover:border-[#B87333] disabled:opacity-40"
                        >
                          {stage.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => move('changes_requested')}
                        className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors disabled:opacity-40"
                        style={{ border: `1px solid ${COPPER}`, color: COPPER }}
                      >
                        {EPISODE_ASIDE.changes_requested.label}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => move('declined')}
                        className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--text)] disabled:opacity-40"
                      >
                        {EPISODE_ASIDE.declined.label}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(selected.status_history || []).length > 0 && (
                <div className="border-t border-[var(--border)] pt-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    Pipeline history
                  </p>
                  <ol className="mt-2 space-y-1.5">
                    {[...(selected.status_history || [])].reverse().map((entry, i) => (
                      <li key={i} className="flex flex-wrap items-baseline gap-2 text-[11.5px] text-[var(--muted)]">
                        <span className="font-semibold" style={{ color: INK }}>
                          {stageLabel(entry.status)}
                        </span>
                        <span>{fmtDate(entry.at)}</span>
                        {entry.note && <span className="min-w-0 flex-1 truncate">{entry.note}</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <p className="border-t border-[var(--border)] pt-4 text-[10.5px] leading-relaxed text-[var(--muted)]">
                Stage {trackIndex(selected.status) < 0 ? '—' : trackIndex(selected.status) + 1} of{' '}
                {EPISODE_TRACK.length} on the track. An episode never feeds discovery, ranking, or
                measurement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}