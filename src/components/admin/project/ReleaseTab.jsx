import { Rocket, CheckCircle2, AlertTriangle, Clock, Calendar } from 'lucide-react';

const B = { navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8', surface: '#111c28', border: '#1e3a5a60' };

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <div
            className="rounded-xl p-4"
            style={{ background: B.surface, border: `1px solid ${B.border}` }}
        >
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" style={{ color: accent }} />
                <span className="text-xs uppercase tracking-wider" style={{ color: '#5d7a94' }}>{label}</span>
            </div>
            <span className="text-2xl font-black" style={{ color: accent }}>{value}</span>
        </div>
    );
}

export default function ReleaseTab({ items, loading, onEdit }) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: '#ffffff08' }} />
                ))}
            </div>
        );
    }

    const done = items.filter(i => i.status === 'done');
    const inProgress = items.filter(i => i.status === 'in_progress');
    const backlog = items.filter(i => (i.status || 'backlog') === 'backlog');
    const nextUp = items.filter(i => i.status === 'next_up');
    const total = items.length;
    const completionPct = total > 0 ? Math.round((done.length / total) * 100) : 0;

    const now = new Date();
    const fourteenDays = new Date(now.getTime() + 14 * 86400000);

    const approaching = items
        .filter(i => i.target_date && i.status !== 'done' && new Date(i.target_date) <= fourteenDays && new Date(i.target_date) >= now)
        .sort((a, b) => new Date(a.target_date) - new Date(b.target_date));

    const overdue = items
        .filter(i => i.target_date && i.status !== 'done' && new Date(i.target_date) < now)
        .sort((a, b) => new Date(a.target_date) - new Date(b.target_date));

    const readyForRelease = done.filter(i => i.target_date).sort((a, b) => new Date(b.target_date) - new Date(a.target_date));

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={Rocket} label="Total Items" value={total} accent="#c9a87c" />
                <StatCard icon={CheckCircle2} label="Done" value={done.length} accent="#7ec8a8" />
                <StatCard icon={Clock} label="In Progress" value={inProgress.length} accent="#4a90b8" />
                <StatCard icon={AlertTriangle} label="Overdue" value={overdue.length} accent="#c87e9d" />
            </div>

            {/* Progress bar */}
            <div className="rounded-xl p-5" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>Release Readiness</span>
                    <span className="text-sm font-bold" style={{ color: completionPct === 100 ? '#7ec8a8' : '#c9a87c' }}>{completionPct}%</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden" style={{ background: '#ffffff0a' }}>
                    {total > 0 && (
                        <>
                            <div style={{ width: `${(done.length / total) * 100}%`, background: '#7ec8a8' }} />
                            <div style={{ width: `${(inProgress.length / total) * 100}%`, background: '#4a90b8' }} />
                            <div style={{ width: `${(nextUp.length / total) * 100}%`, background: '#c9a87c' }} />
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[10px]" style={{ color: '#7ec8a8' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: '#7ec8a8' }} /> Done ({done.length})
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px]" style={{ color: '#4a90b8' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: '#4a90b8' }} /> In Progress ({inProgress.length})
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px]" style={{ color: '#c9a87c' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: '#c9a87c' }} /> Next Up ({nextUp.length})
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px]" style={{ color: '#5d7a94' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: '#5d7a94' }} /> Backlog ({backlog.length})
                    </span>
                </div>
            </div>

            {/* Overdue */}
            {overdue.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: B.surface, border: '1px solid #c87e9d30' }}>
                    <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#c87e9d30' }}>
                        <AlertTriangle className="w-4 h-4" style={{ color: '#c87e9d' }} />
                        <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>At Risk — Overdue</span>
                        <span className="text-xs ml-auto" style={{ color: '#c87e9d' }}>{overdue.length}</span>
                    </div>
                    <div className="divide-y" style={{ borderColor: B.border }}>
                        {overdue.map(item => (
                            <button key={item.id} onClick={() => onEdit(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors">
                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#c87e9d' }} />
                                <span className="text-sm flex-1 truncate" style={{ color: '#d4e0ec' }}>{item.title}</span>
                                <span className="text-[10px] flex-shrink-0" style={{ color: '#c87e9d' }}>
                                    {new Date(item.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Approaching Deadlines */}
            {approaching.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
                    <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: `${B.gold}25` }}>
                        <Clock className="w-4 h-4" style={{ color: B.gold }} />
                        <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>Approaching Deadlines (14 days)</span>
                        <span className="text-xs ml-auto" style={{ color: B.gold }}>{approaching.length}</span>
                    </div>
                    <div className="divide-y" style={{ borderColor: B.border }}>
                        {approaching.map(item => (
                            <button key={item.id} onClick={() => onEdit(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors">
                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: B.gold }} />
                                <span className="text-sm flex-1 truncate" style={{ color: '#d4e0ec' }}>{item.title}</span>
                                <span className="text-[10px] flex-shrink-0" style={{ color: B.gold }}>
                                    {new Date(item.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Ready for Release */}
            {readyForRelease.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: B.surface, border: '1px solid #7ec8a830' }}>
                    <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#7ec8a830' }}>
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#7ec8a8' }} />
                        <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>Ready for Release</span>
                        <span className="text-xs ml-auto" style={{ color: '#7ec8a8' }}>{readyForRelease.length}</span>
                    </div>
                    <div className="divide-y" style={{ borderColor: B.border }}>
                        {readyForRelease.map(item => (
                            <button key={item.id} onClick={() => onEdit(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7ec8a8' }} />
                                <span className="text-sm flex-1 truncate" style={{ color: '#d4e0ec' }}>{item.title}</span>
                                <span className="text-[10px] flex-shrink-0" style={{ color: '#7ec8a8' }}>
                                    {new Date(item.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {total === 0 && (
                <div className="rounded-xl p-8 text-center" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
                    <Rocket className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: B.gold }} />
                    <p className="text-sm" style={{ color: '#3d6080' }}>No items yet. Add roadmap items to track release readiness.</p>
                </div>
            )}
        </div>
    );
}