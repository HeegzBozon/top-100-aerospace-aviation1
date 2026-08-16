import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Cpu, Bug, Wrench, AlertCircle } from 'lucide-react';

const C = {
    navy: '#1e3a5a', gold: '#c9a87c', sky: '#4a90b8', green: '#7ec8a8', copper: '#c87e9d',
    surface: '#0d1620', panel: '#111c28', border: '#1e3a5a60',
    text: '#c8d8e8', muted: '#5d7a94', dim: '#3d6080',
};

const TECH_TYPES = ['backend', 'devops'];
const DEBT_ITEM_TYPES = ['bug', 'enhancement'];

export default function ArchitecturePanel({ state, setState }) {
    const [stories, setStories] = useState([]);
    const [roadmapItems, setRoadmapItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFeed, setShowFeed] = useState(true);

    const value = state.drafts?.architecture || '';

    useEffect(() => {
        Promise.all([
            base44.entities.Story.list('-updated_date', 200).catch(() => []),
            base44.entities.RoadmapItem.list('-priority', 200).catch(() => []),
        ]).then(([allStories, allItems]) => {
            setStories(allStories.filter(s => TECH_TYPES.includes(s.type)));
            setRoadmapItems(allItems.filter(i => DEBT_ITEM_TYPES.includes(i.type)));
        }).finally(() => setLoading(false));
    }, []);

    const setDraft = (val) => setState(prev => ({ ...prev, drafts: { ...prev.drafts, architecture: val } }));

    return (
        <div className="space-y-4">
            {/* Tech Debt Inventory */}
            <div className="rounded-lg overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                <button onClick={() => setShowFeed(!showFeed)} className="w-full flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: C.gold }}>
                        <Cpu className="w-3.5 h-3.5" /> Tech Debt Inventory
                    </span>
                    <span className="text-[10px]" style={{ color: C.muted }}>{showFeed ? 'Hide' : `${stories.length + roadmapItems.length} items`}</span>
                </button>
                {showFeed && (
                    <div className="px-4 pb-3 space-y-3 max-h-[280px] overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" style={{ color: C.muted }} /></div>
                        ) : (
                            <>
                                {roadmapItems.length > 0 && (
                                    <div>
                                        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>Epics & Enhancements</span>
                                        <div className="space-y-1 mt-1">
                                            {roadmapItems.map(i => (
                                                <div key={i.id} className="flex items-center gap-2 text-[11px] p-1.5 rounded" style={{ background: C.surface }}>
                                                    {i.type === 'bug' ? <Bug className="w-2.5 h-2.5 flex-shrink-0" style={{ color: C.copper }} /> : <Wrench className="w-2.5 h-2.5 flex-shrink-0" style={{ color: C.sky }} />}
                                                    <span className="flex-1 truncate" style={{ color: C.text }}>{i.title}</span>
                                                    <span className="text-[9px] px-1 rounded" style={{ background: C.panel, color: C.muted }}>{i.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {stories.length > 0 && (
                                    <div>
                                        <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.dim }}>Backend / DevOps Stories</span>
                                        <div className="space-y-1 mt-1">
                                            {stories.map(s => (
                                                <div key={s.id} className="flex items-center gap-2 text-[11px] p-1.5 rounded" style={{ background: C.surface }}>
                                                    <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" style={{ color: s.status === 'blocked' ? C.copper : C.gold }} />
                                                    <span className="flex-1 truncate" style={{ color: C.text }}>{s.title}</span>
                                                    <span className="text-[9px] px-1 rounded" style={{ background: C.panel, color: C.muted }}>{s.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {roadmapItems.length === 0 && stories.length === 0 && (
                                    <p className="text-[11px] text-center py-3" style={{ color: C.dim }}>No tech debt items tagged in the backlog</p>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Review notes */}
            <textarea
                value={value}
                onChange={e => setDraft(e.target.value)}
                placeholder="Document architecture state, tech debt inventory, upgrade recommendations, dependency risks..."
                className="w-full min-h-[200px] p-4 rounded-lg text-sm leading-relaxed resize-y focus:outline-none"
                style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }}
            />
        </div>
    );
}