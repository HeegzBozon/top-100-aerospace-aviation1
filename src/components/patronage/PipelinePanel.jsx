import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';
import DealRecord from './DealRecord';
import { DESK, FIT_LABEL, LIFECYCLE, P, SOURCES, day, stageLabel } from './patronConfig';

// The pipeline: every conversation, read by the stage it has reached. The stage rail is the
// spine of the surface — it says how many sit where, and which are stuck. A deal is opened
// from the list and worked in the record beside it.
const sourceLabel = (key) => SOURCES.find((source) => source.key === key)?.label || key || '—';

export default function PipelinePanel({ deals, slots, user, onChanged }) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const live = useMemo(() => deals.filter((deal) => !deal.is_test), [deals]);

  const counts = useMemo(() => {
    const map = {};
    live.forEach((deal) => {
      map[deal.stage] = (map[deal.stage] || 0) + 1;
    });
    return map;
  }, [live]);

  const visible = useMemo(
    () => (filter === 'all' ? live : live.filter((deal) => deal.stage === filter)),
    [live, filter],
  );

  const selected = live.find((deal) => deal.id === selectedId) || null;

  if (!live.length) {
    return (
      <div className={`${DESK.card} p-8 text-center`} style={{ borderColor: P.hair }}>
        <Inbox className="mx-auto h-5 w-5" style={{ color: P.copper }} />
        <h2 className="mt-4 font-heading text-xl" style={{ color: P.navy }}>
          No conversations yet
        </h2>
        <p className="mx-auto mt-2 max-w-[42ch] text-[11.5px] leading-relaxed" style={{ color: P.muted }}>
          A hand raised on the media kit lands here by itself, already in the CRM. Until then the desk is
          waiting, and the register on the last leaf lists what has to be decided before a slot can be sold.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-5">
      <div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em]"
            style={{
              background: filter === 'all' ? P.navy : 'white',
              color: filter === 'all' ? P.cream : P.muted,
              border: `1px solid ${filter === 'all' ? P.navy : P.hair}`,
            }}
          >
            All {live.length}
          </button>
          {LIFECYCLE.filter((stage) => counts[stage.key]).map((stage) => (
            <button
              key={stage.key}
              type="button"
              onClick={() => setFilter(stage.key)}
              className="rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em]"
              style={{
                background: filter === stage.key ? P.navy : 'white',
                color: filter === stage.key ? P.cream : P.muted,
                border: `1px solid ${filter === stage.key ? P.navy : P.hair}`,
              }}
            >
              {stage.label} {counts[stage.key]}
            </button>
          ))}
        </div>

        <ul className={`${DESK.card} divide-y`} style={{ borderColor: P.hair }}>
          {visible.map((deal) => {
            const active = deal.id === selectedId;
            const overdue = deal.next_action_due && new Date(deal.next_action_due) < new Date();
            return (
              <li key={deal.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(deal.id)}
                  className="w-full px-3.5 py-3 text-left"
                  style={{ background: active ? P.cream : 'white' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[12px] font-bold" style={{ color: P.navy }}>
                      {deal.organization_name}
                    </p>
                    <span
                      className="shrink-0 rounded-full px-1.5 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.12em]"
                      style={{ background: P.sand, color: P.navy }}
                    >
                      {stageLabel(deal.stage)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[10.5px]" style={{ color: P.muted }}>
                    {deal.contact_name} &middot; {FIT_LABEL(deal.fit_category)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.12em]">
                    <span style={{ color: P.faint }}>{sourceLabel(deal.source)}</span>
                    {deal.ghl_sync_state === 'failed' ? (
                      <span style={{ color: '#8e3a24' }}>CRM not synced</span>
                    ) : null}
                    {deal.next_action_due ? (
                      <span style={{ color: overdue ? '#8e3a24' : P.faint }}>
                        {overdue ? 'Overdue' : 'Due'} {day(deal.next_action_due)}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
          {!visible.length ? (
            <li className="px-3.5 py-6 text-[11px]" style={{ color: P.muted }}>
              Nothing at this stage.
            </li>
          ) : null}
        </ul>
      </div>

      <div>
        {selected ? (
          <DealRecord deal={selected} slots={slots} user={user} onChanged={onChanged} />
        ) : (
          <div className={`${DESK.card} flex min-h-[220px] items-center justify-center p-8 text-center`} style={{ borderColor: P.hair }}>
            <p className="max-w-[38ch] text-[11.5px] leading-relaxed" style={{ color: P.muted }}>
              Open a conversation to work it. Qualification, the gates, the agreement, the placement and the
              tracked link all live inside the record.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}