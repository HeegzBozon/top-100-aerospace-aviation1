import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Target, Plus } from 'lucide-react';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', green: '#7ec8a8',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

export default function ObjectivesPanel({ state, setState }) {
    const [objectives, setObjectives] = useState([]);
    const [loading, setLoading] = useState(true);
    const reviewed = state.objectiveReviewed || {};

    useEffect(() => {
        base44.entities.Objective.list('-updated_date', 100)
            .then(setObjectives)
            .catch(() => setObjectives([]))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id) => setState(prev => ({ ...prev, objectiveReviewed: { ...prev.objectiveReviewed, [id]: !prev.objectiveReviewed?.[id] } }));

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: C.gold }} /></div>;
    if (!objectives.length) return <div className="flex flex-col items-center py-10" style={{ color: C.dim }}><Target className="w-8 h-8 mb-2" /><span className="text-xs">No objectives drafted yet</span><a href="/Admin" className="mt-2 text-[11px] flex items-center gap-1" style={{ color: C.gold }}><Plus className="w-3 h-3" /> Create in Seasonal Planning</a></div>;

    const reviewedCount = objectives.filter(o => reviewed[o.id]).length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
                <span style={{ color: C.muted }}>{objectives.length} objectives</span>
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
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#ffffff10' }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.gold }} />
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: C.muted }}>{pct}%</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.surface, color: C.muted }}>{o.status}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}