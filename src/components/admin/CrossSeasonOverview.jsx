import { Trophy, Inbox, ArrowRight } from 'lucide-react';

const B = {
    gold: '#c9a87c',
    sky: '#4a90b8',
    surface: '#111c28',
    border: '#1e3a5a60',
};

const STATUS_COLORS = {
    nominations_open: '#7ec8a8',
    voting_open: '#c9a87c',
    review: '#9d7ec8',
    rollover: '#7ec8c8',
    planning: '#8a9eb8',
    completed: '#5d7a94',
    archived: '#3d6080',
};

// Cross-season tracker: every season with nominee counts + intake pipeline summary
export default function CrossSeasonOverview({ seasons, nominees, intakeItems, onNavigate, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {[1, 2].map(i => (
                    <div key={i} className="rounded-xl p-5 h-48 animate-pulse" style={{ background: B.surface, border: `1px solid ${B.border}` }} />
                ))}
            </div>
        );
    }

    // Nominee counts per season
    const countsBySeason = {};
    const pendingBySeason = {};
    (nominees || []).forEach(n => {
        if (!n.season_id) return;
        countsBySeason[n.season_id] = (countsBySeason[n.season_id] || 0) + 1;
        if (n.status === 'pending') pendingBySeason[n.season_id] = (pendingBySeason[n.season_id] || 0) + 1;
    });
    const orphanCount = (nominees || []).filter(n => !n.season_id).length;

    // Intake pipeline stats
    const intake = intakeItems || [];
    const intakeNew = intake.filter(i => i.status === 'new').length;
    const intakeReviewing = intake.filter(i => i.status === 'reviewing').length;
    const intakeApproved = intake.filter(i => i.status === 'approved').length;
    const byTrack = (track) => intake.filter(i => i.nomination_type === track).length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

            {/* All Seasons */}
            <div className="rounded-xl p-5" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4" style={{ color: B.gold }} />
                    <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>All Seasons — Nominee Tracker</span>
                    <button
                        onClick={() => onNavigate('nominees')}
                        className="ml-auto flex items-center gap-1 text-xs"
                        style={{ color: '#3d6080' }}
                    >
                        Nominees <ArrowRight style={{ width: 12, height: 12 }} />
                    </button>
                </div>
                <div className="space-y-2">
                    {(seasons || []).map(s => (
                        <div key={s.id} className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0" style={{ borderColor: '#ffffff08' }}>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs truncate" style={{ color: '#c8d8e8' }}>{s.name}</p>
                                <p className="text-[10px] capitalize" style={{ color: STATUS_COLORS[s.status] || '#5d7a94' }}>
                                    {s.status?.replace(/_/g, ' ')}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold tabular-nums" style={{ color: B.gold }}>
                                    {(countsBySeason[s.id] || 0).toLocaleString()}
                                </p>
                                {pendingBySeason[s.id] > 0 && (
                                    <p className="text-[10px]" style={{ color: '#c9a87c' }}>{pendingBySeason[s.id]} pending</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {orphanCount > 0 && (
                        <div className="flex items-center justify-between pt-1.5 text-xs" style={{ color: '#c87e7e' }}>
                            <span>⚠ Nominees without a season</span>
                            <span className="font-bold tabular-nums">{orphanCount}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Nomination Intake Pipeline */}
            <div className="rounded-xl p-5" style={{ background: B.surface, border: `1px solid ${B.sky}30` }}>
                <div className="flex items-center gap-2 mb-4">
                    <Inbox className="w-4 h-4" style={{ color: B.sky }} />
                    <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>Nomination Intake Pipeline</span>
                    {intakeNew > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#c9a87c25', color: B.gold }}>
                            {intakeNew} new
                        </span>
                    )}
                    <button
                        onClick={() => onNavigate('nomination-intake')}
                        className="ml-auto flex items-center gap-1 text-xs"
                        style={{ color: '#3d6080' }}
                    >
                        Intake <ArrowRight style={{ width: 12, height: 12 }} />
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                        { label: 'New', value: intakeNew, color: B.sky },
                        { label: 'Reviewing', value: intakeReviewing, color: B.gold },
                        { label: 'Approved', value: intakeApproved, color: '#7ec8a8' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-lg p-3 text-center" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                            <div className="text-lg font-bold tabular-nums" style={{ color }}>{value}</div>
                            <div className="text-[10px] uppercase tracking-wider" style={{ color: '#5d7a94' }}>{label}</div>
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    {[
                        { label: 'TOP 100 Women', value: byTrack('women') },
                        { label: 'TOP 100 Men', value: byTrack('men') },
                        { label: 'TOP 100 Angels', value: byTrack('angels') },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                            <span style={{ color: '#5d7a94' }}>{label}</span>
                            <span className="font-semibold tabular-nums" style={{ color: '#c8d8e8' }}>{value}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between text-xs pt-1 border-t" style={{ borderColor: '#ffffff08' }}>
                        <span style={{ color: '#5d7a94' }}>Total intake submissions</span>
                        <span className="font-bold tabular-nums" style={{ color: B.gold }}>{intake.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}