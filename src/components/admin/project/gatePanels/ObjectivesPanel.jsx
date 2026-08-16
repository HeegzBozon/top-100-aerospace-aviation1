import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Target, Plus, Check, X } from 'lucide-react';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', green: '#7ec8a8', copper: '#c87e9d',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

const TYPES = [
    { id: 'growth', label: 'Growth' },
    { id: 'retention', label: 'Retention' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'community', label: 'Community' },
];
const HORIZONS = [
    { id: 'h1', label: 'Core (H1)' },
    { id: 'h2', label: 'Growth (H2)' },
    { id: 'h3', label: 'Future (H3)' },
];

export default function ObjectivesPanel({ state, setState }) {
    const [objectives, setObjectives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', type: 'growth', horizon: 'h1', theme: '' });
    const reviewed = state.objectiveReviewed || {};

    const load = () => {
        setLoading(true);
        base44.entities.Objective.list('-updated_date', 100)
            .then(data => setObjectives(data.filter(o => o.status !== 'done')))
            .catch(() => setObjectives([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const toggle = (id) => setState(prev => ({ ...prev, objectiveReviewed: { ...prev.objectiveReviewed, [id]: !prev.objectiveReviewed?.[id] } }));

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        setCreating(true);
        try {
            await base44.entities.Objective.create({ ...form, status: 'funnel', progress: 0 });
            setForm({ name: '', description: '', type: 'growth', horizon: 'h1', theme: '' });
            setShowCreate(false);
            load();
        } catch { } finally { setCreating(false); }
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: C.gold }} /></div>;

    const reviewedCount = objectives.filter(o => reviewed[o.id]).length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
                <span style={{ color: C.muted }}>{objectives.length} incomplete objectives</span>
                <span className="font-bold" style={{ color: C.gold }}>{reviewedCount} reviewed</span>
            </div>

            {objectives.map(o => {
                const checked = reviewed[o.id];
                const pct = o.progress || 0;
                return (
                    <div key={o.id} className="rounded-lg p-3" style={{ background: checked ? `${C.green}10` : C.panel, border: `1px solid ${checked ? C.green : C.border}` }}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold" style={{ color: checked ? C.green : C.text }}>{o.name}</span>
                            <button onClick={() => toggle(o.id)} className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: checked ? C.green : C.navy, color: 'white' }}>
                                {checked ? '✓' : 'Review'}
                            </button>
                        </div>
                        {o.description && <p className="text-[11px] mb-2 line-clamp-2" style={{ color: C.muted }}>{o.description}</p>}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex-1 h-1 rounded-full overflow-hidden min-w-[60px]" style={{ background: '#ffffff10' }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.gold }} />
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: C.muted }}>{pct}%</span>
                            {o.horizon && <span className="text-[9px] px-1.5 py-0.5 rounded uppercase" style={{ background: C.surface, color: C.gold }}>{o.horizon}</span>}
                            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: C.surface, color: C.muted }}>{o.status}</span>
                        </div>
                    </div>
                );
            })}

            {/* Inline create */}
            {showCreate ? (
                <div className="rounded-lg p-3 space-y-2.5" style={{ background: C.surface, border: `1px solid ${C.gold}` }}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold" style={{ color: C.gold }}>New Objective</span>
                        <button onClick={() => setShowCreate(false)} className="p-0.5 rounded hover:bg-white/5"><X className="w-3.5 h-3.5" style={{ color: C.muted }} /></button>
                    </div>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Objective name..." className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }} />
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description..." rows={2} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }} />
                    <div className="flex gap-2">
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="flex-1 px-2 py-1.5 rounded-lg text-xs focus:outline-none" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }}>
                            {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                        <select value={form.horizon} onChange={e => setForm({ ...form, horizon: e.target.value })} className="flex-1 px-2 py-1.5 rounded-lg text-xs focus:outline-none" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }}>
                            {HORIZONS.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
                        </select>
                    </div>
                    <input value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} placeholder="Strategic theme (optional)..." className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }} />
                    <button onClick={handleCreate} disabled={!form.name.trim() || creating} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50" style={{ background: C.gold, color: C.surface }}>
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Create Objective
                    </button>
                </div>
            ) : (
                <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-colors border-dashed" style={{ border: `1px dashed ${C.border}`, color: C.muted }}>
                    <Plus className="w-3.5 h-3.5" /> Create New Objective
                </button>
            )}

            {!objectives.length && !showCreate && (
                <div className="flex flex-col items-center py-8" style={{ color: C.dim }}>
                    <Target className="w-8 h-8 mb-2" />
                    <span className="text-xs">No incomplete objectives — create one above</span>
                </div>
            )}
        </div>
    );
}