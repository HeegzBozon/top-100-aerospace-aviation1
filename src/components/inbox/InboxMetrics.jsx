import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { STAGES } from './inboxFunnel';
import useFunnelPrefs from './useFunnelPrefs';
import FunnelTile from './FunnelTile';
import FunnelCustomForm from './FunnelCustomForm';

const WIDTH = ['w-full', 'w-[88%]', 'w-[76%]'];

// The dashboard drawn as a funnel. Edit shows or hides each metric and composes
// custom ones that add up any categories; a tile is a filter.
export default function InboxMetrics({ items, states, filter, onFilter }) {
  const { prefs, toggle, add, remove } = useFunnelPrefs();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const now = Date.now();
  const read = (keys) => {
    const mine = items.filter((i) => keys.includes(i.bundle));
    const done = mine.filter((i) => states[i.key]?.done).length;
    const waiting = mine.filter((i) => !states[i.key]?.done && i.person
      && !(states[i.key]?.snoozed_until && new Date(states[i.key].snoozed_until).getTime() > now)).length;
    const open = mine.filter((i) => !states[i.key]?.done);
    return { open: open.length, waiting, done, received: open.filter((i) => i.dir === 'in').length, sent: open.filter((i) => i.dir === 'out').length };
  };
  const pick = (f) => onFilter(filter === f ? 'all' : f);

  return (
    <div className="mb-3 flex flex-col items-center gap-1 md:mb-4">
      <div className="mb-1 flex w-full justify-end gap-1.5">
        {editing && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 rounded border border-editorial-copper px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-editorial-copper">
            <Plus className="h-3 w-3" /> Custom
          </button>
        )}
        <button onClick={() => { setEditing(!editing); setAdding(false); }}
          className={`flex items-center gap-1 rounded px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.14em] ${editing ? 'bg-editorial-copper text-editorial-cream' : 'border border-editorial-navy/20 text-editorial-navy'}`}>
          <Pencil className="h-3 w-3" /> {editing ? 'Done' : 'Edit'}
        </button>
      </div>
      {adding && <FunnelCustomForm onCancel={() => setAdding(false)} onAdd={(t) => { add(t); setAdding(false); }} />}
      {STAGES.map((s, i) => {
        const tiles = [
          ...s.bundles.map((b) => ({ key: b.key, label: b.label, bundles: [b.key], filter: b.key })),
          ...prefs.custom.filter((c) => c.stage === s.key).map((c) => ({ ...c, custom: true, filter: `mix:${c.bundles.join(',')}` })),
        ].filter((t) => editing || !prefs.hidden.includes(t.key));
        if (!tiles.length) return null;
        return (
          <div key={s.key} className={`${WIDTH[i]} rounded border border-editorial-copper/30 bg-editorial-sand/50 p-1`}>
            <button onClick={() => pick(s.key)}
              className={`mb-1 block w-full text-center text-[8.5px] font-bold uppercase tracking-[0.2em] ${filter === s.key ? 'text-editorial-copper' : 'text-editorial-label'}`}>
              {s.label}
            </button>
            <div className="flex flex-wrap gap-1">
              {tiles.map((t) => (
                <FunnelTile key={t.key} label={t.label} m={read(t.bundles)} on={filter === t.filter}
                  hidden={prefs.hidden.includes(t.key)} editing={editing} custom={t.custom}
                  onClick={() => pick(t.filter)} onToggle={() => toggle(t.key)} onRemove={() => remove(t.key)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}