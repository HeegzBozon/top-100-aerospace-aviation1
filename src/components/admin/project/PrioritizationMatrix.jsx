import { Plus, MessageCircleQuestion } from 'lucide-react';

const B = { surface: '#111c28', border: '#1e3a5a60' };

const QUADRANTS = [
    {
        key: 'opportunities',
        title: 'Opportunities',
        sub: 'Quick wins to pursue',
        costHigh: true,
        sizeSmall: true,
        accent: '#7ec8a8',
    },
    {
        key: 'radar',
        title: 'Keep on the Radar',
        sub: 'Major projects to plan',
        costHigh: true,
        sizeSmall: false,
        accent: '#4a90b8',
    },
    {
        key: 'consider_later',
        title: 'Consider Later',
        sub: 'Low-effort fill-ins',
        costHigh: false,
        sizeSmall: true,
        accent: '#c9a87c',
    },
    {
        key: 'do_not_consider',
        title: 'Do Not Consider',
        sub: 'Thankless tasks to avoid',
        costHigh: false,
        sizeSmall: false,
        accent: '#c87e9d',
    },
];

function getWsjfData(item) {
    const bv = Number(item.business_value) || 0;
    const tc = Number(item.time_criticality) || 0;
    const rr = Number(item.risk_reduction) || 0;
    const size = Number(item.job_size) || 0;
    const costOfDelay = bv + tc + rr;
    const hasScores = size > 0 && (bv > 0 || tc > 0 || rr > 0);
    return { costOfDelay, jobSize: size, hasScores, wsjf: size > 0 ? costOfDelay / size : 0 };
}

function getQuadrantKey(item) {
    const { costOfDelay, jobSize, hasScores } = getWsjfData(item);
    if (!hasScores) return 'staging';
    const costHigh = costOfDelay >= 15;
    const sizeSmall = jobSize <= 5;
    const q = QUADRANTS.find(qd => qd.costHigh === costHigh && qd.sizeSmall === sizeSmall);
    return q ? q.key : 'staging';
}

function MatrixCard({ item, labelKey, wsjf, onClick }) {
    return (
        <div
            onClick={onClick}
            className="rounded-lg p-3 cursor-pointer transition-all"
            style={{ background: '#ffffff05', border: '1px solid #1e3a5a30' }}
        >
            <p className="text-xs font-medium mb-0.5" style={{ color: '#d4e0ec' }}>
                {item[labelKey]}
            </p>
            {wsjf.hasScores && (
                <p className="text-[10px] mb-0.5" style={{ color: '#c9a87c' }}>
                    WSJF {wsjf.wsjf.toFixed(1)} · CoD {wsjf.costOfDelay} · Size {wsjf.jobSize}
                </p>
            )}
            {item.description && (
                <p className="text-[10px] truncate" style={{ color: '#5d7a94' }}>
                    {item.description}
                </p>
            )}
        </div>
    );
}

export default function PrioritizationMatrix({ items, loading, onEdit, onCreate, labelKey = 'title' }) {
    const stagingItems = items.filter(i => getQuadrantKey(i) === 'staging');
    const quadrantItems = (key) => items.filter(i => getQuadrantKey(i) === key);

    return (
        <div>
            {/* Staging Section — unscored items */}
            <div
                className="rounded-xl mb-4 overflow-hidden"
                style={{ background: B.surface, border: `1px solid ${B.border}` }}
            >
                <div
                    className="flex items-center justify-between px-4 py-3 border-b gap-3"
                    style={{ borderColor: B.border }}
                >
                    <div className="flex items-center gap-2">
                        <MessageCircleQuestion className="w-4 h-4 flex-shrink-0" style={{ color: '#c9a87c' }} />
                        <div>
                            <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>
                                Issues Under Discussion
                            </span>
                            <p className="text-xs" style={{ color: '#5d7a94' }}>
                                Add WSJF scores to auto-place these into the matrix.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onCreate('backlog')}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                        style={{ background: '#1e3a5a', color: 'white' }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </button>
                </div>

                <div className="flex gap-2 p-3 overflow-x-auto min-h-[90px]">
                    {loading && stagingItems.length === 0 && (
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-52 h-20 rounded-lg animate-pulse flex-shrink-0" style={{ background: '#ffffff08' }} />
                            ))}
                        </div>
                    )}

                    {stagingItems.map((item) => (
                        <div key={item.id} className="flex-shrink-0 w-52">
                            <MatrixCard item={item} labelKey={labelKey} wsjf={getWsjfData(item)} onClick={() => onEdit(item)} />
                        </div>
                    ))}

                    {!loading && stagingItems.length === 0 && (
                        <p className="text-xs py-4 px-2" style={{ color: '#3d6080' }}>
                            All items have WSJF scores and are placed in the matrix below.
                        </p>
                    )}
                </div>
            </div>

            {/* Matrix */}
            <div className="flex">
                {/* Y-axis */}
                <div className="flex flex-col items-center justify-between py-3 pr-1" style={{ width: '28px' }}>
                    <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>High</span>
                    <span
                        className="text-[10px] font-bold text-center"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#5d7a94' }}
                    >
                        Cost of Delay
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>Low</span>
                </div>

                {/* 2x2 Grid + X-axis */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2">
                        {QUADRANTS.map(q => {
                            const qItems = quadrantItems(q.key);
                            return (
                                <div
                                    key={q.key}
                                    className="rounded-xl p-3 min-h-[200px] flex flex-col"
                                    style={{
                                        background: `${q.accent}05`,
                                        border: `1px solid ${q.accent}25`,
                                        backgroundImage: `linear-gradient(rgba(30,58,90,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,90,0.03) 1px, transparent 1px)`,
                                        backgroundSize: '20px 20px',
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span
                                                className="text-xs font-bold uppercase tracking-wider"
                                                style={{ color: q.accent }}
                                            >
                                                {q.title}
                                            </span>
                                            <p className="text-[10px]" style={{ color: '#5d7a94' }}>{q.sub}</p>
                                        </div>
                                        <span className="text-xs" style={{ color: '#3d6080' }}>{qItems.length}</span>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        {qItems.map((item) => (
                                            <div key={item.id}>
                                                <MatrixCard item={item} labelKey={labelKey} wsjf={getWsjfData(item)} onClick={() => onEdit(item)} />
                                            </div>
                                        ))}

                                        {!loading && qItems.length === 0 && (
                                            <p className="text-[10px] text-center py-4" style={{ color: '#2a4a60' }}>
                                                No items
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* X-axis */}
                    <div className="flex justify-between items-center mt-2 px-1">
                        <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>Small</span>
                        <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>Job Size</span>
                        <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>Large</span>
                    </div>
                </div>
            </div>
        </div>
    );
}