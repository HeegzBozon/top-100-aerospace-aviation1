import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Upload, FileText, X, Sparkles, Target, Layers } from 'lucide-react';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8', green: '#7ec8a8',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

const HORIZON_LABELS = { h1: 'Core (H1)', h2: 'Growth (H2)', h3: 'Future (H3)' };

export default function BusinessContextPanel({ state, setState }) {
    const [objectives, setObjectives] = useState([]);
    const [initiatives, setInitiatives] = useState([]);
    const [roadmapStats, setRoadmapStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showContext, setShowContext] = useState(true);

    const value = state.drafts?.business || '';
    const decks = state.drafts?.businessDecks || [];

    useEffect(() => {
        Promise.all([
            base44.entities.Objective.list('-updated_date', 50).catch(() => []),
            base44.entities.Initiative.list('-updated_date', 30).catch(() => []),
            base44.entities.RoadmapItem.list('-priority', 100).catch(() => []),
        ]).then(([objs, inits, items]) => {
            setObjectives(objs);
            setInitiatives(inits);
            const stats = {};
            items.forEach(i => { stats[i.status] = (stats[i.status] || 0) + 1; });
            setRoadmapStats(stats);
        }).finally(() => setLoading(false));
    }, []);

    const setDraft = (val) => setState(prev => ({ ...prev, drafts: { ...prev.drafts, business: val } }));

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setState(prev => ({ ...prev, drafts: { ...prev.drafts, businessDecks: [...(prev.drafts?.businessDecks || []), { name: file.name, url: file_url }] } }));
        } catch { } finally { setUploading(false); e.target.value = ''; }
    };

    const removeDeck = (idx) => setState(prev => ({ ...prev, drafts: { ...prev.drafts, businessDecks: (prev.drafts?.businessDecks || []).filter((_, i) => i !== idx) } }));

    const byHorizon = ['h1', 'h2', 'h3'].map(h => ({ h, label: HORIZON_LABELS[h], items: objectives.filter(o => o.horizon === h) })).filter(g => g.items.length);

    return (
        <div className="space-y-4">
            {/* Context Feed */}
            <div className="rounded-lg overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <button onClick={() => setShowContext(!showContext)} className="w-full flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: C.gold }}>
                        <Sparkles className="w-3.5 h-3.5" /> Planning Intelligence
                    </span>
                    <span className="text-[10px]" style={{ color: C.muted }}>{showContext ? 'Hide' : 'Show'}</span>
                </button>
                {showContext && (
                    <div className="px-4 pb-3 space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" style={{ color: C.muted }} /></div>
                        ) : (
                            <>
                                {byHorizon.map(g => (
                                    <div key={g.h}>
                                        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>{g.label}</span>
                                        <div className="space-y-1 mt-1">
                                            {g.items.map(o => (
                                                <div key={o.id} className="flex items-center gap-1.5 text-[11px]" style={{ color: C.muted }}>
                                                    <Target className="w-2.5 h-2.5 flex-shrink-0" style={{ color: C.gold }} />
                                                    <span style={{ color: C.text }}>{o.name}</span>
                                                    {o.theme && <span className="px-1 rounded text-[9px]" style={{ background: C.surface }}>{o.theme}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {initiatives.length > 0 && (
                                    <div>
                                        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>Active Initiatives ({initiatives.length})</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {initiatives.slice(0, 8).map(i => (
                                                <span key={i.id} className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: C.surface, color: C.muted }}>
                                                    <Layers className="w-2.5 h-2.5" /> {i.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {Object.keys(roadmapStats).length > 0 && (
                                    <div>
                                        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>Backlog Snapshot</span>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {Object.entries(roadmapStats).map(([status, count]) => (
                                                <span key={status} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.surface, color: C.muted }}>{status}: <b style={{ color: C.text }}>{count}</b></span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Draft */}
            <textarea
                value={value}
                onChange={e => setDraft(e.target.value)}
                placeholder="Draft the business context presentation: market situation, strategic drivers, key investments, competitive landscape..."
                className="w-full min-h-[240px] p-4 rounded-lg text-sm leading-relaxed resize-y focus:outline-none"
                style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }}
            />

            {/* Slide deck upload */}
            <div>
                <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>Slide Decks</span>
                <div className="space-y-1.5 mt-1.5">
                    {decks.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                            <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.gold }} />
                            <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs flex-1 truncate hover:underline" style={{ color: C.text }}>{d.name}</a>
                            <button onClick={() => removeDeck(i)} className="p-0.5 rounded hover:bg-white/5"><X className="w-3 h-3" style={{ color: C.muted }} /></button>
                        </div>
                    ))}
                    <label className="flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-colors border-dashed" style={{ background: 'transparent', border: `1px dashed ${C.border}` }}>
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: C.muted }} /> : <Upload className="w-4 h-4" style={{ color: C.muted }} />}
                        <span className="text-xs" style={{ color: C.muted }}>{uploading ? 'Uploading...' : 'Upload slide deck (PDF, PPTX)'}</span>
                        <input type="file" accept=".pdf,.pptx,.ppt,.key" onChange={handleUpload} className="hidden" disabled={uploading} />
                    </label>
                </div>
            </div>
        </div>
    );
}