import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2, ArrowUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { TRACEABILITY } from './levelConfig';
import { getOrphans } from './TraceabilityHealth';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8', green: '#7ec8a8',
    copper: '#c87e9d', text: '#334155', muted: '#64748b', dim: '#94a3b8',
    rowBg: '#f8fafc', rowBorder: '#e2e8f0',
};

export default function OrphanTriage({ items, level, levelConfig, onEdit, onOpenDetail }) {
    const trace = TRACEABILITY[level];
    const orphans = getOrphans(items, level);
    const [linkingId, setLinkingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [linking, setLinking] = useState(false);

    const labelKey = levelConfig.labelKey;
    const parentLabelKey = trace?.parentLabelKey;
    const parentEntity = trace?.parentEntity;

    const handleSearch = useCallback(async (query) => {
        setSearchQuery(query);
        if (!parentEntity || query.length < 2) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const all = await base44.entities[parentEntity].list('-updated_date', 200);
            const lower = query.toLowerCase();
            const filtered = all.filter(i => {
                const label = i[parentLabelKey] || i.title || i.name || '';
                return label.toLowerCase().includes(lower);
            }).slice(0, 8);
            setSearchResults(filtered);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setSearching(false);
        }
    }, [parentEntity, parentLabelKey]);

    const handleLink = async (orphan, parent) => {
        setLinking(true);
        try {
            await base44.entities[levelConfig.entity].update(orphan.id, {
                [trace.parentLinkField]: parent.id,
            });
            // Log activity on the child (now-linked) item
            await base44.entities.PlanningActivity.create({
                item_entity: levelConfig.entity,
                item_id: orphan.id,
                activity_type: 'parent_linked',
                content: `Linked upstream: ${parent[parentLabelKey] || parent.title || parent.name || ''}`,
                child_entity: parentEntity,
                child_id: parent.id,
                child_title: parent[parentLabelKey] || parent.title || parent.name || '',
            });
            // Mirror to parent feed
            await base44.entities.PlanningActivity.create({
                item_entity: parentEntity,
                item_id: parent.id,
                activity_type: 'child_created',
                child_entity: levelConfig.entity,
                child_id: orphan.id,
                child_title: orphan[labelKey] || orphan.title || orphan.name || '',
            });
            setLinkingId(null);
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            console.error('Link failed:', err);
        } finally {
            setLinking(false);
        }
    };

    if (!trace?.parentLinkField) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-10 h-10 mb-3" style={{ color: C.green }} />
                <p className="text-sm font-medium" style={{ color: C.navy }}>
                    {levelConfig.label} is the top of the hierarchy — no upstream linking required.
                </p>
            </div>
        );
    }

    if (orphans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-10 h-10 mb-3" style={{ color: C.green }} />
                <p className="text-sm font-semibold" style={{ color: C.navy }}>All items linked</p>
                <p className="text-xs mt-1" style={{ color: C.dim }}>
                    Every {levelConfig.singular.toLowerCase()} has an upstream parent. Traceability is healthy.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3 px-1">
                <AlertTriangle className="w-4 h-4" style={{ color: C.gold }} />
                <span className="text-sm font-semibold" style={{ color: C.navy }}>
                    {orphans.length} Orphaned {levelConfig.label}
                </span>
                <span className="text-xs" style={{ color: C.dim }}>
                    — link each to a {trace.parentLevel} parent to enforce traceability
                </span>
            </div>

            <div className="space-y-2">
                {orphans.map(orphan => {
                    const isLinking = linkingId === orphan.id;
                    return (
                        <div key={orphan.id} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.rowBorder}`, background: C.rowBg }}>
                            <div className="flex items-center gap-2 px-3 py-2.5">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: C.copper }}>
                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-sm font-medium truncate flex-1" style={{ color: C.text }}>
                                    {orphan[labelKey] || orphan.title || orphan.name || '—'}
                                </span>
                                <button
                                    onClick={() => onOpenDetail?.(orphan)}
                                    className="text-xs px-2 py-1 rounded hover:opacity-80"
                                    style={{ background: `${C.navy}10`, color: C.navy }}
                                >
                                    Detail
                                </button>
                                <button
                                    onClick={() => { setLinkingId(isLinking ? null : orphan.id); setSearchQuery(''); setSearchResults([]); }}
                                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md transition-colors hover:opacity-90"
                                    style={{ background: isLinking ? C.sky : `${C.sky}20`, color: isLinking ? 'white' : C.sky }}
                                >
                                    <Link2 className="w-3 h-3" /> {isLinking ? 'Cancel' : 'Link'}
                                </button>
                            </div>
                            {isLinking && (
                                <div className="px-3 pb-3 space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUp className="w-3 h-3 flex-shrink-0" style={{ color: C.sky }} />
                                        <input
                                            autoFocus
                                            value={searchQuery}
                                            onChange={e => handleSearch(e.target.value)}
                                            placeholder={`Search ${parentEntity}s to link...`}
                                            className="flex-1 h-8 text-sm px-2.5 rounded border"
                                            style={{ background: 'white', borderColor: C.rowBorder, color: C.text }}
                                        />
                                    </div>
                                    {searching && (
                                        <div className="flex justify-center py-1"><Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: C.muted }} /></div>
                                    )}
                                    {searchResults.length > 0 && (
                                        <div className="max-h-36 overflow-y-auto space-y-1">
                                            {searchResults.map(r => (
                                                <button
                                                    key={r.id}
                                                    disabled={linking}
                                                    onClick={() => handleLink(orphan, r)}
                                                    className="w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors hover:opacity-80 disabled:opacity-50"
                                                    style={{ background: 'white', border: `1px solid ${C.rowBorder}`, color: C.text }}
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <Link2 className="w-3 h-3 flex-shrink-0" style={{ color: C.sky }} />
                                                        {r[parentLabelKey] || r.title || r.name || '—'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                                        <p className="text-xs px-1" style={{ color: C.dim }}>No {parentEntity}s found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}