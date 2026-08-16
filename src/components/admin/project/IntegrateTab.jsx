import { useState, useMemo } from 'react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

const B = { surface: '#111c28', border: '#1e3a5a60' };

const TYPE_META = {
    feature: { color: '#c9a87c', label: 'Feature' },
    enhancement: { color: '#4a90b8', label: 'Enhancement' },
    bug: { color: '#c87e9d', label: 'Bug' },
    feedback: { color: '#7ec8a8', label: 'Feedback' },
};

const SORT_OPTIONS = [
    { value: 'priority', label: 'Priority' },
    { value: 'target_date', label: 'Target Date' },
    { value: 'title', label: 'Title' },
    { value: 'created_date', label: 'Newest' },
];

export default function IntegrateTab({ items, loading, onEdit, onCreate, levelConfig }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('priority');

    const statuses = levelConfig.statuses;
    const hasTypeFilter = levelConfig.hasTypeFilter;
    const labelKey = levelConfig.labelKey;

    const filtered = useMemo(() => {
        let result = [...items];
        if (statusFilter !== 'all') result = result.filter(i => (i.status || statuses[0]?.value) === statusFilter);
        if (hasTypeFilter && typeFilter !== 'all') result = result.filter(i => (i.type || 'feature') === typeFilter);

        result.sort((a, b) => {
            if (sortBy === 'priority') return (b.priority || 0) - (a.priority || 0);
            if (sortBy === 'title') return (a[labelKey] || '').localeCompare(b[labelKey] || '');
            if (sortBy === 'target_date') {
                if (!a.target_date) return 1;
                if (!b.target_date) return -1;
                return new Date(a.target_date) - new Date(b.target_date);
            }
            if (sortBy === 'created_date') return new Date(b.created_date || 0) - new Date(a.created_date || 0);
            return 0;
        });
        return result;
    }, [items, statusFilter, typeFilter, sortBy, statuses, hasTypeFilter, labelKey]);

    const getStatusMeta = (status) => statuses.find(s => s.value === status) || { label: status || '—', color: '#5d7a94' };

    return (
        <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                </Select>

                {hasTypeFilter && (
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {Object.entries(TYPE_META).map(([v, m]) => <SelectItem key={v} value={v}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}

                <div className="ml-auto flex items-center gap-1.5">
                    <ArrowUpDown className="w-3 h-3" style={{ color: '#5d7a94' }} />
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
                {loading ? (
                    <div className="p-4 space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: '#ffffff08' }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm" style={{ color: '#3d6080' }}>No items match your filters.</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: B.border }}>
                        {filtered.map(item => {
                            const statusMeta = getStatusMeta(item.status);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onEdit(item)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                                >
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusMeta.color }} />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium truncate block" style={{ color: '#d4e0ec' }}>
                                            {item[labelKey]}
                                        </span>
                                        {item.description && (
                                            <span className="text-xs truncate block" style={{ color: '#5d7a94' }}>
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded font-medium flex-shrink-0"
                                        style={{ background: `${statusMeta.color}18`, color: statusMeta.color }}>
                                        {statusMeta.label}
                                    </span>
                                    {item.target_date && (
                                        <span className="text-[10px] flex-shrink-0 w-16 text-right" style={{ color: '#3d6080' }}>
                                            {new Date(item.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                    {item.priority > 0 && (
                                        <span className="text-[10px] flex-shrink-0 w-6 text-right" style={{ color: '#3d6080' }}>
                                            P{item.priority}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            <p className="text-xs mt-2" style={{ color: '#3d6080' }}>{filtered.length} of {items.length} items</p>
        </div>
    );
}