import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertTriangle, Plus } from 'lucide-react';
import { ROAM_CATEGORIES } from '../planningWizardConfig';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', green: '#7ec8a8', copper: '#c87e9d',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

export default function RiskPanel({ state, setState }) {
    const [blockers, setBlockers] = useState([]);
    const [loading, setLoading] = useState(true);
    const roamMap = state.roamMap || {};

    useEffect(() => {
        base44.entities.Blocker.list('-updated_date', 100)
            .then(setBlockers)
            .catch(() => setBlockers([]))
            .finally(() => setLoading(false));
    }, []);

    const setRoam = (id, cat) => setState(prev => ({ ...prev, roamMap: { ...prev.roamMap, [id]: prev.roamMap?.[id] === cat ? null : cat } }));

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: C.gold }} /></div>;
    if (!blockers.length) return <div className="flex flex-col items-center py-10" style={{ color: C.dim }}><AlertTriangle className="w-8 h-8 mb-2" /><span className="text-xs">No risks seeded yet</span></div>;

    const classified = blockers.filter(b => roamMap[b.id]).length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
                <span style={{ color: C.muted }}>{blockers.length} risks identified</span>
                <span className="font-bold" style={{ color: C.gold }}>{classified} ROAM'd</span>
            </div>
            {blockers.map(b => {
                const cat = roamMap[b.id];
                const catObj = ROAM_CATEGORIES.find(c => c.id === cat);
                return (
                    <div key={b.id} className="rounded-lg p-3" style={{ background: C.panel, border: `1px solid ${catObj ? catObj.accent : C.border}` }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-sm font-semibold" style={{ color: C.text }}>{b.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: b.severity === 'critical' ? C.copper : b.severity === 'high' ? '#c87e9d60' : C.surface, color: b.severity === 'critical' ? 'white' : C.muted }}>{b.severity}</span>
                        </div>
                        {b.desc && <p className="text-[11px] mb-2 line-clamp-2" style={{ color: C.muted }}>{b.desc}</p>}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] uppercase tracking-wider font-bold mr-1" style={{ color: C.dim }}>ROAM:</span>
                            {ROAM_CATEGORIES.map(c => {
                                const active = cat === c.id;
                                return (
                                    <button key={c.id} onClick={() => setRoam(b.id, c.id)} className="text-[10px] px-2 py-0.5 rounded-full font-bold transition-all" style={{ background: active ? c.accent : 'transparent', border: `1px solid ${active ? c.accent : C.border}`, color: active ? 'white' : C.muted }}>
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}