import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Calendar } from 'lucide-react';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', green: '#7ec8a8', copper: '#c87e9d',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

export default function CapacityPanel({ state, setState }) {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const confirmed = state.capacityConfirmed || {};

    useEffect(() => {
        base44.entities.Sprint.list('-start_date', 50)
            .then(setSprints)
            .catch(() => setSprints([]))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id) => setState(prev => ({ ...prev, capacityConfirmed: { ...prev.capacityConfirmed, [id]: !prev.capacityConfirmed?.[id] } }));

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: C.gold }} /></div>;
    if (!sprints.length) return <div className="flex flex-col items-center py-10" style={{ color: C.dim }}><Calendar className="w-8 h-8 mb-2" /><span className="text-xs">No sprints defined yet</span></div>;

    const totalCap = sprints.reduce((s, sp) => s + (sp.capacity_points || 0), 0);
    const totalAlloc = sprints.reduce((s, sp) => s + (sp.allocated_points || 0), 0);

    return (
        <div className="space-y-3">
            <div className="rounded-lg p-3 flex items-center justify-between" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <span className="text-xs" style={{ color: C.muted }}>Total Capacity</span>
                <span className="text-sm font-bold" style={{ color: C.gold }}>{totalAlloc}/{totalCap} pts</span>
            </div>
            {sprints.map(sp => {
                const cap = sp.capacity_points || 0;
                const alloc = sp.allocated_points || 0;
                const pct = cap ? Math.min(100, (alloc / cap) * 100) : 0;
                const over = alloc > cap;
                const confirmed = state.capacityConfirmed?.[sp.id];
                return (
                    <div key={sp.id} className="rounded-lg p-3" style={{ background: confirmed ? `${C.green}10` : C.panel, border: `1px solid ${confirmed ? C.green : C.border}` }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{ color: C.text }}>{sp.name}</span>
                            <button onClick={() => toggle(sp.id)} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: confirmed ? C.green : C.navy, color: 'white' }}>
                                {confirmed ? '✓ Confirmed' : 'Confirm'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] mb-1.5" style={{ color: C.muted }}>
                            <span>{sp.start_date} → {sp.end_date}</span>
                            <span className="px-1.5 py-0.5 rounded" style={{ background: C.surface }}>{sp.status}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ffffff10' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? C.copper : C.green }} />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px]" style={{ color: C.muted }}>{alloc} allocated</span>
                            <span className="text-[10px] font-bold" style={{ color: over ? C.copper : C.green }}>{cap} capacity</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}