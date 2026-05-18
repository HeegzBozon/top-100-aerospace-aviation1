import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Plus, X, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['All', 'Goals', 'Understand', 'Frame', 'Ideas', 'Evaluate', 'Decide', 'Discuss', 'Technique'];
const CATEGORY_COLORS = {
  Goals: '#6366f1', Understand: '#0ea5e9', Frame: '#f59e0b',
  Ideas: '#10b981', Evaluate: '#f97316', Decide: '#c9a87c',
  Discuss: '#d4a090', Technique: '#8b5cf6',
};

const DURATION_FILTERS = [
  { label: 'Any', min: 0, max: Infinity },
  { label: 'Under 30 min', min: 0, max: 29 },
  { label: '30–60 min', min: 30, max: 60 },
  { label: '60+ min', min: 61, max: Infinity },
];

function TacticCard({ tactic, onAdd, inSession }) {
  const [expanded, setExpanded] = useState(false);
  const color = CATEGORY_COLORS[tactic.category] || '#c9a87c';

  return (
    <motion.div layout className="rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-white/20"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: `${color}20`, color }}>
                {tactic.category}
              </span>
              <span className="text-white/40 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />{tactic.duration_min}–{tactic.duration_max} min
              </span>
            </div>
            <h3 className="text-white font-bold text-sm">{tactic.name}</h3>
          </div>
          {inSession && (
            <button onClick={() => onAdd(tactic)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#07111f] transition-all hover:opacity-90"
              style={{ background: '#c9a87c' }}>
              <Plus className="w-3 h-3" /> Add
            </button>
          )}
        </div>

        <p className="text-white/70 text-xs leading-relaxed mb-3">{tactic.description}</p>

        <button onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-[#c9a87c] hover:text-white transition-colors font-medium">
          How to facilitate
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-white/8 px-5 pb-5 pt-4">
            <ol className="space-y-2">
              {(tactic.how_to_facilitate || []).map((step, i) => (
                <li key={i} className="flex gap-3 text-xs text-white/65 leading-relaxed">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                    style={{ background: `${color}20`, color }}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CreateTacticModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', category: 'Goals', duration_min: 10, duration_max: 20, description: '', how_to_facilitate: ['', '', ''] });
  const [saving, setSaving] = useState(false);

  const updateStep = (i, val) => {
    const steps = [...form.how_to_facilitate];
    steps[i] = val;
    setForm(f => ({ ...f, how_to_facilitate: steps }));
  };

  const handleSave = async () => {
    setSaving(true);
    const tactic = await base44.entities.WorkshopTactic.create({
      ...form,
      how_to_facilitate: form.how_to_facilitate.filter(s => s.trim()),
      is_custom: true,
    });
    onCreated(tactic);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-2xl mx-4 rounded-3xl border border-[#c9a87c]/30 overflow-hidden"
        style={{ background: '#0d1f36', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
          <h3 className="text-white font-bold text-lg">Create Custom Tactic</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-7 py-6 space-y-4">
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Tactic Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm bg-white/5 focus:outline-none focus:border-[#c9a87c]/50 placeholder-white/30"
              placeholder="e.g. Aerospace Career Mapping" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-white/20 text-white text-sm bg-white/5 focus:outline-none">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c} style={{ background: '#0d1f36' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Min (min)</label>
              <input type="number" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: +e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-white/20 text-white text-sm bg-white/5 focus:outline-none" />
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Max (min)</label>
              <input type="number" value={form.duration_max} onChange={e => setForm(f => ({ ...f, duration_max: +e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-white/20 text-white text-sm bg-white/5 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm bg-white/5 focus:outline-none resize-none placeholder-white/30"
              placeholder="One bold sentence — what this tactic does and why." />
          </div>
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Facilitation Steps</label>
            {form.how_to_facilitate.map((step, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-[#c9a87c] text-xs font-bold w-5 shrink-0">{i + 1}.</span>
                <input value={step} onChange={e => updateStep(i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-white/20 text-white text-sm bg-white/5 focus:outline-none placeholder-white/30"
                  placeholder={`Step ${i + 1}`} />
              </div>
            ))}
            <button onClick={() => setForm(f => ({ ...f, how_to_facilitate: [...f.how_to_facilitate, ''] }))}
              className="text-[#c9a87c] text-xs font-medium hover:text-white transition-colors">+ Add step</button>
          </div>
        </div>
        <div className="px-7 py-5 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/20 text-white/60 text-sm hover:text-white transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#07111f] transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
            {saving ? 'Saving...' : 'Create Tactic'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TacticsLibrary({ currentSession }) {
  const [tactics, setTactics] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [durationFilter, setDurationFilter] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.WorkshopTactic.list('-created_date', 100)
      .then(data => { setTactics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tactics.filter(t => {
    const matchCat = category === 'All' || t.category === category;
    const df = DURATION_FILTERS[durationFilter];
    const matchDur = t.duration_min <= df.max && t.duration_max >= df.min;
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || (t.keywords || []).some(k => k.toLowerCase().includes(q)) || t.description.toLowerCase().includes(q);
    return matchCat && matchDur && matchSearch;
  });

  const handleAdd = (tactic) => {
    // Pass to parent — in a real flow this would add to the current agenda
    console.log('Add to agenda:', tactic.name);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {showCreate && <CreateTacticModal onClose={() => setShowCreate(false)} onCreated={t => setTactics(prev => [t, ...prev])} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Workshop Tactics Library
          </h2>
          <p className="text-white/50 text-sm mt-1">{tactics.length} tactics · {filtered.length} shown</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#07111f]"
          style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
          <Plus className="w-4 h-4" /> Create Custom
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or keyword..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#c9a87c]/50" />
        </div>
        <select value={durationFilter} onChange={e => setDurationFilter(+e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white text-sm focus:outline-none">
          {DURATION_FILTERS.map((f, i) => <option key={f.label} value={i} style={{ background: '#0d1f36' }}>{f.label}</option>)}
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              category === cat ? 'text-[#07111f]' : 'text-white/60 hover:text-white border border-white/10 hover:border-white/30'
            }`}
            style={category === cat ? { background: CATEGORY_COLORS[cat] || '#c9a87c' } : {}}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center text-white/40 py-20">Loading tactics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <TacticCard key={t.id} tactic={t} onAdd={handleAdd} inSession={!!currentSession} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center text-white/40 py-16">
              No tactics match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}