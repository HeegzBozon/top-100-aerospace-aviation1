import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import StepPanel, { CleanState, AckBox } from './StepPanel';
import DuplicateGroupCard from './DuplicateGroupCard';
import { callPool } from './poolApi';

export default function DedupScanStep({ season, log, setLog }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [mergingIdx, setMergingIdx] = useState(null);

  useEffect(() => {
    setData(null); setError('');
    callPool('scan', { season_id: season.id }).then(setData).catch((e) => setError(e.message));
  }, [season.id]);

  useEffect(() => {
    if (data) setLog((l) => ({ ...l, open_duplicates: data.groups.length }));
  }, [data, setLog]);

  const merge = async (idx) => {
    const group = data.groups[idx];
    const names = group.members.map((m) => m.name).join(', ');
    if (!window.confirm(`Merge ${group.members.length} records (${names}) into the oldest master? Duplicates are retired, not deleted.`)) return;
    setMergingIdx(idx);
    try {
      await callPool('merge', { season_id: season.id, nominee_ids: group.members.map((m) => m.id) });
      setData((d) => ({ ...d, groups: d.groups.filter((_, i) => i !== idx) }));
      setLog((l) => ({ ...l, merges_performed: l.merges_performed + 1 }));
    } catch (e) { setError(e.message); }
    setMergingIdx(null);
  };

  return (
    <StepPanel
      title="Dedup Scan"
      lede="Read-only audit by canonical LinkedIn slug, then email. Nothing merges until you confirm a group. Prior-season records are never modified."
      loading={!data && !error}
      error={error}
    >
      {data && (
        <>
          <p className="text-sm text-editorial-navy/70 mb-4">
            {data.season_pool_size} live records in this season · {data.returning_count} returning honorees matched to prior seasons (kept as-is)
          </p>
          {data.groups.length === 0 ? (
            <CleanState icon={ShieldCheck} title="One person, one record" body="No duplicate records remain in this season's pool." />
          ) : (
            <div className="space-y-3">
              {data.groups.map((g, i) => (
                <DuplicateGroupCard key={g.members[0].id} group={g} merging={mergingIdx === i} onMerge={() => merge(i)} />
              ))}
              <AckBox
                checked={log.ack_duplicates}
                onChange={(v) => setLog((l) => ({ ...l, ack_duplicates: v }))}
                label={`I've reviewed the remaining ${data.groups.length} group(s) and accept activating with them unmerged.`}
              />
            </div>
          )}
        </>
      )}
    </StepPanel>
  );
}