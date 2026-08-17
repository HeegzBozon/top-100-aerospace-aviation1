import { Link2Off, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { TRACEABILITY } from './levelConfig';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8', green: '#7ec8a8',
    copper: '#c87e9d', surface: '#111c28', border: '#1e3a5a60',
    text: '#334155', muted: '#64748b', dim: '#94a3b8',
};

/**
 * Computes orphan (unlinked) items for a given level.
 * Portfolio is top-level — never orphaned.
 */
export function getOrphans(items, level) {
    const trace = TRACEABILITY[level];
    if (!trace?.parentLinkField) return [];
    return items.filter(i => !i[trace.parentLinkField]);
}

export function getLinked(items, level) {
    const trace = TRACEABILITY[level];
    if (!trace?.parentLinkField) return items;
    return items.filter(i => !!i[trace.parentLinkField]);
}

export default function TraceabilityHealth({ items, level, onTriage }) {
    const orphans = getOrphans(items, level);
    const linked = getLinked(items, level);
    const total = items.length;
    const compliancePct = total > 0 ? Math.round((linked.length / total) * 100) : 100;

    const isClean = orphans.length === 0;
    const accent = isClean ? C.green : (orphans.length > total * 0.3 ? C.copper : C.gold);

    if (total === 0) return null;

    return (
        <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
            style={{ background: `${accent}10`, border: `1px solid ${accent}40` }}
        >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: accent }}>
                {isClean ? <ShieldCheck className="w-4 h-4 text-white" /> : <AlertTriangle className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: C.navy }}>Traceability Health</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: accent, color: 'white' }}>
                        {compliancePct}%
                    </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs" style={{ color: C.muted }}>
                        {linked.length} linked · {orphans.length} orphaned · {total} total
                    </span>
                    {!isClean && (
                        <span className="text-xs font-medium" style={{ color: accent }}>
                            {orphans.length} {level === 'solution' ? 'initiative(s)' : level === 'program' ? 'epic(s)' : 'stor(ies)'} need upstream alignment
                        </span>
                    )}
                </div>
            </div>
            {/* Compliance bar */}
            <div className="hidden sm:block w-24 h-2 rounded-full overflow-hidden flex-shrink-0" style={{ background: `${C.navy}15` }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${compliancePct}%`, background: accent }} />
            </div>
            {!isClean && onTriage && (
                <button
                    onClick={onTriage}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-md transition-colors hover:opacity-90 flex-shrink-0"
                    style={{ background: C.navy, color: 'white' }}
                >
                    <Link2Off className="w-3 h-3" />
                    Triage
                    <ArrowRight className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}