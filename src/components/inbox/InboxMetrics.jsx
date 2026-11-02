import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import useFunnelPrefs from './useFunnelPrefs';
import FunnelTile from './FunnelTile';
import FunnelCustomForm from './FunnelCustomForm';
import FunnelSwitcher from './FunnelSwitcher';
import { defaultFunnels, stagesOf } from './funnelPresets';
import useDirectoryIntel from '@/components/directory/useDirectoryIntel';
import WhyTab from '@/components/directory/WhyTab';

const WIDTH = ['w-full', 'w-[88%]', 'w-[76%]'];

// The dashboard drawn as a funnel. Edit shows or hides each metric and composes
// custom ones that add up any categories; a tile is a filter.
export default function InboxMetrics({ items, states, filter, onFilter }) {
  const { intel, save, signedIn, loading } = useDirectoryIntel();
  const [asking, setAsking] = useState(false);
  const fp = useFunnelPrefs();
  const funnels = [...defaultFunnels(intel), ...fp.prefs.named.map((f) => ({ ...f, named: true }))];
  const funnel = funnels.find((f) => f.key === fp.prefs.active) || funnels[0];
  const prefs = fp.tilesFor(funnel.key);
  const toggle = (k) => fp.toggle(funnel.key, k);
  const add = (t) => fp.add(funnel.key, t);
  const remove = (k) => fp.remove(funnel.key, k);
  const STAGES = stagesOf(funnel);
  const pickFunnel = (k) => fp.setActive(k);
  const untold = signedIn && !loading && !intel.stage && !intel.goals.length;
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
      {(untold || asking) ? (
        <div className="mb-2 w-full rounded border border-dashed border-editorial-copper p-3">
          <p className="mb-2 font-body text-xs text-editorial-navy">Tell us why you're here and your funnels will be shaped to it. Your answers are shared with the Directory.</p>
          <WhyTab intel={intel} save={save} signedIn={signedIn} onDone={() => setAsking(false)} />
        </div>
      ) : (
        <button onClick={() => setAsking(true)} className="mb-1 self-start font-body text-[10px] text-editorial-label underline">Funnels shaped by your answers in the Directory · change</button>
      )}
      <FunnelSwitcher funnels={funnels} active={funnel.key} onPick={pickFunnel} editing={editing}
        onAdd={(label) => fp.addFunnel({ label, stages: funnel.stages })} onRemove={fp.removeFunnel} />
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
        const stageFilter = `mix:${s.bundles.map((b) => b.key).join(',')}`;
        return (
          <div key={s.key} className={`${WIDTH[i]} rounded border border-editorial-copper/30 bg-editorial-sand/50 p-1`}>
            <button onClick={() => pick(stageFilter)}
              className={`mb-1 block w-full text-center text-[8.5px] font-bold uppercase tracking-[0.2em] ${filter === stageFilter ? 'text-editorial-copper' : 'text-editorial-label'}`}>
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