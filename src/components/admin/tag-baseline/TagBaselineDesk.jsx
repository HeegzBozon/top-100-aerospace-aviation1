import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eraser, FileCheck2, Loader2, RefreshCw, Sparkles, Square, Tag } from 'lucide-react';
import TagBaselinePreview from './TagBaselinePreview';

// The baseline tagging desk.
//
// The directory is read by four facets — Field, Role, Impact, Region — and most records
// were filed with one of them: a place, and nothing else. This desk reads profiles against
// all four and drafts the words their record supports. Pressing File writes them; a facet
// the record cannot support stays empty, because a word invented to fill it would be a
// claim about a person.
//
// Reading is one AI call per profile, so the field can be walked in two ways: batch by
// batch for review, or in one sweep that files as it goes. A sweep stops on command and
// picks up where it left off, because the reading is told by the data, not by a cursor.
//
// Vocabulary only: no ordering, measurement, ranking or scoring reads these rows.
const BATCH = 6;

const FACETS = [
  { key: 'field', label: 'Field' },
  { key: 'role', label: 'Role' },
  { key: 'impact', label: 'Impact' },
  { key: 'region', label: 'Region' },
];

export default function TagBaselineDesk() {
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [proposals, setProposals] = useState([]);
  const [filed, setFiled] = useState(null);
  const stopRef = useRef(false);

  const call = useCallback(async (payload) => {
    const response = await base44.functions.invoke('seedNomineeTagBaseline', payload);
    return response.data || {};
  }, []);

  const loadPool = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPool(await call({ action: 'pool' }));
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'The directory could not be read.');
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  // Whoever is furthest from a complete reading is read first.
  const queue = useMemo(() => {
    const drafted = new Set(proposals.map((entry) => entry.nominee_id));
    return (pool?.nominees || []).filter((nominee) => nominee.missing > 0 && !drafted.has(nominee.id));
  }, [pool, proposals]);

  const pending = proposals.reduce(
    (total, entry) => total + entry.tags.filter((tag) => tag.keep !== false).length,
    0
  );

  const readNext = async () => {
    if (queue.length === 0) return;
    setBusy('read');
    try {
      const data = await call({
        action: 'propose',
        nominee_ids: queue.slice(0, BATCH).map((nominee) => nominee.id),
        vocabulary: pool?.vocabulary || [],
      });
      const drafted = data.proposals || [];
      setProposals((previous) => [...previous, ...drafted]);
      if (drafted.length === 0) toast.error('The reading came back empty. Try again.');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'The profiles could not be read.');
    } finally {
      setBusy('');
    }
  };

  const toggleTag = (nomineeId, index) => {
    setProposals((previous) =>
      previous.map((entry) =>
        entry.nominee_id === nomineeId
          ? {
              ...entry,
              tags: entry.tags.map((tag, position) =>
                position === index ? { ...tag, keep: tag.keep === false } : tag
              ),
            }
          : entry
      )
    );
  };

  const dismiss = (nomineeId) => {
    setProposals((previous) => previous.filter((entry) => entry.nominee_id !== nomineeId));
  };

  const file = async () => {
    const payload = proposals
      .map((entry) => ({
        nominee_id: entry.nominee_id,
        tags: entry.tags.filter((tag) => tag.keep !== false),
      }))
      .filter((entry) => entry.tags.length > 0);

    if (payload.length === 0) {
      toast.error('Nothing is marked to file.');
      return;
    }

    setBusy('file');
    try {
      const data = await call({ action: 'write', proposals: payload });
      setFiled(data);
      setProposals([]);
      toast.success(`${data.added} words filed across ${data.profiles} profiles.`);
      await loadPool();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'The words could not be filed.');
    } finally {
      setBusy('');
    }
  };

  // The whole field, read and filed batch by batch, showing the running tally as it goes.
  const sweep = async () => {
    stopRef.current = false;
    setBusy('sweep');
    const handled = new Set(proposals.map((entry) => entry.nominee_id));
    const order = (pool?.nominees || []).filter((nominee) => nominee.missing > 0).map((nominee) => nominee.id);
    const tally = { added: 0, removed: 0, skipped: 0, profiles: 0 };
    setProposals([]);

    try {
      let index = 0;
      while (!stopRef.current && index < order.length) {
        const batch = [];
        while (batch.length < BATCH && index < order.length) {
          const id = order[index];
          index += 1;
          if (!handled.has(id)) batch.push(id);
        }
        if (batch.length === 0) break;

        const drafted = await call({
          action: 'propose',
          nominee_ids: batch,
          vocabulary: pool?.vocabulary || [],
        });
        batch.forEach((id) => handled.add(id));

        const wanted = (drafted.proposals || [])
          .map((entry) => ({ nominee_id: entry.nominee_id, tags: entry.tags }))
          .filter((entry) => entry.tags.length > 0);

        if (wanted.length > 0) {
          const result = await call({ action: 'write', proposals: wanted });
          tally.added += result.added || 0;
          tally.removed += result.removed || 0;
          tally.skipped += result.skipped || 0;
          tally.profiles += result.profiles || 0;
          setFiled({ ...tally });
        }
      }
      if (stopRef.current) toast(`Stopped. ${tally.added} words filed.`);
      else toast.success(`Field read. ${tally.added} words filed across ${tally.profiles} profiles.`);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'The sweep stopped early. Nothing filed is lost.');
    } finally {
      setBusy('');
      await loadPool();
    }
  };

  const consolidate = async () => {
    setBusy('dedupe');
    try {
      const data = await call({ action: 'dedupe' });
      setFiled({ ...data, added: 0, skipped: 0 });
      toast.success(`${data.removed} repeated rows consolidated.`);
      await loadPool();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'The repeated rows could not be consolidated.');
    } finally {
      setBusy('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Reading the directory’s vocabulary…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 py-16 text-center">
        <p className="font-body text-sm text-[var(--text)]">{error}</p>
        <Button variant="outline" size="sm" onClick={loadPool}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  const total = pool?.total || 0;
  const complete = total - (pool?.uncovered || 0);
  const sweeping = busy === 'sweep';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-heading text-xl text-[var(--text)]">
            <Tag className="h-4 w-4 text-[#b87333]" />
            Directory Tags
          </h2>
          <p className="mt-1 max-w-2xl font-body text-[12px] leading-relaxed text-[var(--muted)]">
            Every profile is read against the four facets the directory is browsed by. A word
            the record states is filed as stated; one it only implies is filed as read off the
            record. A facet the record cannot support is left empty on purpose.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={consolidate} disabled={!!busy}>
            {busy === 'dedupe' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Eraser className="mr-1.5 h-3.5 w-3.5" />}
            Consolidate repeats
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={readNext}
            disabled={!!busy || queue.length === 0}
          >
            {busy === 'read' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
            Read next {Math.min(BATCH, queue.length) || ''}
          </Button>
          <Button size="sm" onClick={file} disabled={!!busy || pending === 0} className="bg-[#b87333] text-[#faf8f5] hover:bg-[#b87333]/90">
            {busy === 'file' ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />}
            File {pending} {pending === 1 ? 'word' : 'words'}
          </Button>
        </div>
      </div>

      {/* The state of the reading: how much of the directory carries a word in each facet. */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {[
          { label: 'Profiles', value: total, note: `${complete} fully read` },
          { label: 'No words', value: pool?.bare || 0, note: 'carry nothing yet' },
          ...FACETS.map((facet) => ({
            label: facet.label,
            value: pool?.coverage?.[facet.key] || 0,
            note: total ? `${Math.round(((pool?.coverage?.[facet.key] || 0) / total) * 100)}% of the field` : '',
          })),
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            <p className="font-body text-[8.5px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{stat.label}</p>
            <p className="mt-1 font-heading text-lg leading-none text-[var(--text)]">{stat.value}</p>
            <p className="mt-1 font-body text-[9px] leading-none text-[var(--muted)]">{stat.note}</p>
          </div>
        ))}
      </div>

      {/* Walking the field: one AI credit per profile, filed as each batch is read. */}
      {queue.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5">
          <p className="font-body text-[11px] text-[var(--muted)]">
            {sweeping
              ? `Reading the field — ${filed?.profiles || 0} profiles filed, ${filed?.added || 0} words.`
              : `${queue.length} profiles are short of a facet. A sweep reads and files them without stopping; it uses one AI credit per profile.`}
          </p>
          {sweeping ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                stopRef.current = true;
              }}
            >
              <Square className="mr-1.5 h-3 w-3" />
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={sweep} disabled={!!busy} className="bg-[#1e3a5a] text-[#faf8f5] hover:bg-[#1e3a5a]/90">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Read &amp; file the field
            </Button>
          )}
        </div>
      )}

      {filed && (filed.added > 0 || filed.removed > 0 || filed.skipped > 0) && (
        <div className="rounded-lg border border-[#b87333]/35 bg-[#b87333]/5 px-3 py-2.5">
          <p className="font-body text-[11px] text-[var(--text)]">
            {filed.added > 0 && `${filed.added} words filed · `}
            {filed.skipped > 0 && `${filed.skipped} already carried · `}
            {filed.removed > 0 && `${filed.removed} repeated rows consolidated · `}
            {filed.profiles} profiles touched
          </p>
        </div>
      )}

      <div>
        <div className="flex items-end justify-between border-b border-[var(--border)] pb-1.5">
          <h3 className="font-body text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            Awaiting your reading
          </h3>
          <span className="font-body text-[9.5px] text-[var(--muted)]">
            {queue.length} profiles still short of a facet
          </span>
        </div>

        {proposals.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-body text-[12px] text-[var(--muted)]">
              {queue.length === 0
                ? 'Every profile in the directory carries a word in all four facets. Nothing is left to read.'
                : 'Nothing drafted yet. Press Read to take the next profiles’ words, then file them.'}
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
            {proposals.map((proposal) => (
              <TagBaselinePreview
                key={proposal.nominee_id}
                proposal={proposal}
                onToggle={(index) => toggleTag(proposal.nominee_id, index)}
                onDismiss={() => dismiss(proposal.nominee_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}