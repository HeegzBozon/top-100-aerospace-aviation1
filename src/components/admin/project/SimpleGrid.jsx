import { Plus } from 'lucide-react';

const B = { surface: '#111c28', border: '#1e3a5a60' };

export default function SimpleGrid({ items, loading, onEdit, onCreate, levelConfig }) {
    const getStatusMeta = (status) =>
        levelConfig.statuses.find(s => s.value === status) || { label: status || '—', color: '#5d7a94' };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading && items.length === 0 && [1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: '#ffffff08' }} />
            ))}

            {!loading && items.length === 0 && (
                <div className="col-span-full rounded-xl p-8 text-center" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
                    <p className="text-sm" style={{ color: '#3d6080' }}>No {levelConfig.sub.toLowerCase()} yet.</p>
                    <button onClick={() => onCreate()} className="mt-2 text-xs font-medium" style={{ color: levelConfig.accent }}>
                        + Add {levelConfig.singular}
                    </button>
                </div>
            )}

            {items.map(item => {
                const statusMeta = getStatusMeta(item.status);
                return (
                    <button
                        key={item.id}
                        onClick={() => onEdit(item)}
                        className="text-left rounded-xl p-4 transition-all hover:scale-[1.01]"
                        style={{ background: B.surface, border: `1px solid ${B.border}` }}
                    >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-sm font-medium flex-1" style={{ color: '#d4e0ec' }}>
                                {item[levelConfig.labelKey]}
                            </span>
                            {item.status && (
                                <span className="text-[10px] px-2 py-0.5 rounded font-medium flex-shrink-0"
                                    style={{ background: `${statusMeta.color}18`, color: statusMeta.color }}>
                                    {statusMeta.label}
                                </span>
                            )}
                        </div>
                        {item.description && (
                            <p className="text-xs line-clamp-2" style={{ color: '#5d7a94' }}>{item.description}</p>
                        )}
                    </button>
                );
            })}
        </div>
    );
}