import { Bug, Sparkles, Wrench, Lightbulb, Calendar } from 'lucide-react';

const TYPE_META = {
    feature: { icon: Sparkles, color: '#c9a87c', label: 'Feature' },
    enhancement: { icon: Wrench, color: '#4a90b8', label: 'Enhancement' },
    bug: { icon: Bug, color: '#c87e9d', label: 'Bug' },
    feedback: { icon: Lightbulb, color: '#7ec8a8', label: 'Feedback' },
};

export default function RoadmapItemCard({ item, onClick }) {
    const meta = TYPE_META[item.type] || TYPE_META.feature;
    const TypeIcon = meta.icon;

    return (
        <button
            onClick={onClick}
            className="w-full text-left rounded-lg p-3 transition-all duration-150 group"
            style={{
                background: '#0d2035',
                border: '1px solid #1e3a5a40',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${meta.color}50`;
                e.currentTarget.style.boxShadow = `0 2px 12px ${meta.color}15`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1e3a5a40';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div className="flex items-start gap-2 mb-1.5">
                <TypeIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: meta.color }} />
                <span className="text-sm font-medium leading-snug" style={{ color: '#d4e0ec' }}>
                    {item.title}
                </span>
            </div>

            {item.description && (
                <p className="text-xs leading-snug mb-2 line-clamp-2" style={{ color: '#5d7a94' }}>
                    {item.description}
                </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide"
                    style={{ background: `${meta.color}18`, color: meta.color }}
                >
                    {meta.label}
                </span>

                {item.value_stream && (
                    <span className="text-[10px]" style={{ color: '#3d6080' }}>
                        {item.value_stream === 'operational' ? 'Ops' : 'Dev'}
                    </span>
                )}

                {item.target_date && (
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: '#3d6080' }}>
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(item.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                )}

                {item.upvotes > 0 && (
                    <span className="text-[10px] ml-auto" style={{ color: '#c9a87c' }}>
                        ▲ {item.upvotes}
                    </span>
                )}
            </div>
        </button>
    );
}