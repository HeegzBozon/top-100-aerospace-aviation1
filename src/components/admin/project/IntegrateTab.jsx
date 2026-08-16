import { useState, useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Bug, Sparkles, Wrench, Lightbulb, ArrowUpDown } from 'lucide-react';

const B = { navy: '#1e3a5a', gold: '#c9a87c', surface: '#111c28', border: '#1e3a5a60' };

const TYPE_META = {
    feature: { icon: Sparkles, color: '#c9a87c', label: 'Feature' },
    enhancement: { icon: Wrench, color: '#4a90b8', label: 'Enhancement' },
    bug: { icon: Bug, color: '#c87e9d', label: 'Bug' },
    feedback: { icon: Lightbulb, color: '#7ec8a8', label: 'Feedback' },
};

const STATUS_META = {
    backlog: { label: 'Backlog', color: '#5d7a94' },
    next_up: { label: 'Next Up', color: '#c9a87c' },
    in_progress: { label: 'In Progress', color: '#4a90b8' },
    done: { label: 'Done', color: '#7ec8a8' },
};

const SORT_OPTIONS = [
    { value: 'priority', label: 'Priority' },
    { value: 'target_date', label: 'Target Date' },
    { value: 'title', label: 'Title' },
    { value: 'created_date', label: 'Newest' },
];

export default function IntegrateTab({ items, loading, onEdit, onCreate }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [streamFilter, setStreamFilter] = useState('all');
    const [sortBy, setSortBy] = useState('priority');

    const filtered = useMemo(() => {
        let result = [...items];

        if (statusFilter !== 'all') result = result.filter(i => (i.status || 'backlog') === statusFilter);
        if (typeFilter !== 'all') result = result.filter(i => (i.type || 'feature') === typeFilter);
        if (streamFilter !== 'all') result = result.filter(i => (i.value_stream || 'operational') === streamFilter);

        result.sort((a, b) => {
            if (sortBy === 'priority') return (b.priority || 0) - (a.priority || 0);
            if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
            if (sortBy === 'target_date') {
                if (!a.target_date) return 1;
                if (!b.target_date) return -1;
                return new Date(a.target_date) - new Date(b.target_date);
            }
            if (sortBy === 'created_date') return new Date(b.created_date || 0) - new Date(a.created_date || 0);
            return 0;
        });

        return result;
    }, [items, statusFilter, typeFilter, streamFilter, sortBy]);

    return (
        <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.entries(STATUS_META).map(([v, m]) => <SelectItem key={v} value={v}>{m.label}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(TYPE_META).map(([v, m]) => <SelectItem key={v} value={v}>{m.label}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={streamFilter} onValueChange={setStreamFilter}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Stream" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Streams</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="developmental">Developmental</SelectItem>
                    </SelectContent>
                </Select>

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

            {/* List */}
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
                            const typeMeta = TYPE_META[item.type] || TYPE_META.feature;
                            const TypeIcon = typeMeta.icon;
                            const statusMeta = STATUS_META[item.status] || STATUS_META.backlog;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onEdit(item)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                                >
                                    <TypeIcon className="w-4 h-4 flex-shrink-0" style={{ color: typeMeta.color }} />

                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium truncate block" style={{ color: '#d4e0ec' }}>
                                            {item.title}
                                        </span>
                                        {item.description && (
                                            <span className="text-xs truncate block" style={{ color: '#5d7a94' }}>
                                                {item.description}
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded font-medium flex-shrink-0"
                                        style={{ background: `${statusMeta.color}18`, color: statusMeta.color }}
                                    >
                                        {statusMeta.label}
                                    </span>

                                    {item.value_stream && (
                                        <span className="text-[10px] flex-shrink-0" style={{ color: '#3d6080' }}>
                                            {item.value_stream === 'operational' ? 'Ops' : 'Dev'}
                                        </span>
                                    )}

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

            <p className="text-xs mt-2" style={{ color: '#3d6080' }}>
                {filtered.length} of {items.length} items
            </p>
        </div>
    );
}