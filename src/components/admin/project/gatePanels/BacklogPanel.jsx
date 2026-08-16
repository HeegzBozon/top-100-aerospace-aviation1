import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, X, Loader2, ClipboardList } from 'lucide-react';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', green: '#7ec8a8', copper: '#c87e9d',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

export default function BacklogPanel({ state, setState }) {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const dorChecked = state.dor || {};

    useEffect(() => {
        base44.entities.Story.list('-updated_date', 200)
            .then(setStories)
            .catch(() => setStories([]))
            .finally(() => setLoading(false));
    }, []);

    const toggleDor = (id) => setState(prev => ({ ...prev, dor: { ...prev.dor, [id]: !prev.dor?.[id] } }));

    const readyCount = stories.filter(s => dorChecked[s.id]).length;

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: C.gold }} /></div>;
    if (!stories.length) return <EmptyState icon={ClipboardList} label="No stories in the backlog yet" />;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
                <span style={{ color: C.muted }}>{stories.length} candidate stories</span>
                <span className="font-bold" style={{ color: C.gold }}>{readyCount}/{stories.length} DoR-ready</span>
            </div>
            {stories.map(s => {
                const checked = dorChecked[s.id];
                const hasDesc = !!s.description?.trim();
                const hasPoints = !!s.story_points;
                return (
                    <div key={s.id} className="rounded-lg p-3 flex items-start gap-3" style={{ background: checked ? `${C.green}10` : C.panel, border: `1px solid ${checked ? C.green : C.border}` }}>
                        <button onClick={() => toggleDor(s.id)} className="mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center" style={{ background: checked ? C.green : 'transparent', border: `1px solid ${checked ? 'transparent' : C.border}` }}>
                            {checked && <Check className="w-3 h-3" style={{ color: C.surface }} />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold" style={{ color: checked ? C.green : C.text }}>{s.title}</span>
                            <div className="flex items-center gap-3 mt-1">
                                <DoRBadge ok={hasDesc} label="Desc" />
                                <DoRBadge ok={hasPoints} label={`${s.story_points || 0}pt`} />
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.surface, color: C.muted }}>{s.status}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function DoRBadge({ ok, label }) {
    return (
        <span className="text-[10px] flex items-center gap-0.5" style={{ color: ok ? C.green : C.copper }}>
            {ok ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} {label}
        </span>
    );
}

function EmptyState({ icon: Icon, label }) {
    return (
        <div className="flex flex-col items-center py-10" style={{ color: C.dim }}>
            <Icon className="w-8 h-8 mb-2" />
            <span className="text-xs">{label}</span>
        </div>
    );
}