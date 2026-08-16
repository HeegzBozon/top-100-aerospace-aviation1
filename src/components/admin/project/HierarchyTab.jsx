import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Building2, GitBranch, Layers, ListTodo, Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ObjectiveFormModal from './ObjectiveFormModal';
import InitiativeFormModal from './InitiativeFormModal';
import RoadmapItemFormModal from './RoadmapItemFormModal';
import StoryFormModal from './StoryFormModal';

const B = {
    navy: '#1e3a5a',
    gold: '#c9a87c',
    sky: '#4a90b8',
    green: '#7ec8a8',
    pink: '#c87e9d',
    surface: '#111c28',
    border: '#1e3a5a60',
    textMuted: '#5d7a94',
    textLight: '#c8d8e8',
};

const LEVELS = [
    { key: 'portfolio', label: 'Portfolio', sub: 'Strategic Themes', icon: Building2, accent: B.navy, entity: 'Objective', labelKey: 'name' },
    { key: 'solution', label: 'Solution Train', sub: 'Initiatives', icon: GitBranch, accent: B.sky, entity: 'Initiative', labelKey: 'name' },
    { key: 'program', label: 'ART', sub: 'Epics', icon: Layers, accent: B.gold, entity: 'RoadmapItem', labelKey: 'title' },
    { key: 'team', label: 'Team', sub: 'Stories', icon: ListTodo, accent: B.green, entity: 'Story', labelKey: 'title' },
];

export default function HierarchyTab() {
    const [data, setData] = useState({ objectives: [], initiatives: [], epics: [], stories: [] });
    const [loading, setLoading] = useState(true);
    const [sel, setSel] = useState({ objective: null, initiative: null, epic: null });
    const [modal, setModal] = useState({ open: false, type: null, item: null, parentId: null });
    const { toast } = useToast();

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [objectives, initiatives, epics, stories] = await Promise.all([
                base44.entities.Objective.list('-created_date', 200),
                base44.entities.Initiative.list('-created_date', 200),
                base44.entities.RoadmapItem.list('-priority', 500),
                base44.entities.Story.list('-priority', 500),
            ]);
            setData({ objectives, initiatives, epics, stories });
        } catch (err) {
            console.error('Hierarchy load failed:', err);
            toast({ variant: 'destructive', title: 'Load failed', description: 'Could not load hierarchy data.' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const filteredInitiatives = sel.objective
        ? data.initiatives.filter(i => i.objective_id === sel.objective) : [];
    const filteredEpics = sel.initiative
        ? data.epics.filter(e => e.initiative_id === sel.initiative) : [];
    const filteredStories = sel.epic
        ? data.stories.filter(s => s.roadmap_item_id === sel.epic) : [];

    const selectObjective = (id) => setSel(p => ({ objective: p.objective === id ? null : id, initiative: null, epic: null }));
    const selectInitiative = (id) => setSel(p => ({ ...p, initiative: p.initiative === id ? null : id, epic: null }));
    const selectEpic = (id) => setSel(p => ({ ...p, epic: p.epic === id ? null : id }));

    const handleSave = async (type, formData) => {
        const level = LEVELS.find(l => l.key === type);
        if (!level) return;
        const label = formData[level.labelKey];
        try {
            if (modal.item) {
                await base44.entities[level.entity].update(modal.item.id, formData);
                toast({ title: 'Updated', description: `"${label}" saved.` });
            } else {
                await base44.entities[level.entity].create(formData);
                toast({ title: 'Created', description: `"${label}" added.` });
            }
            setModal({ open: false, type: null, item: null, parentId: null });
            await loadAll();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Save failed', description: err.message });
        }
    };

    const handleDelete = async (type, item) => {
        const level = LEVELS.find(l => l.key === type);
        if (!level) return;
        const label = item[level.labelKey];
        if (!confirm(`Delete "${label}"?`)) return;
        try {
            await base44.entities[level.entity].delete(item.id);
            toast({ title: 'Deleted', description: `"${label}" removed.` });
            setModal({ open: false, type: null, item: null, parentId: null });
            await loadAll();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Delete failed' });
        }
    };

    const closeModal = () => setModal({ open: false, type: null, item: null, parentId: null });

    const renderColumn = (levelIdx) => {
        const level = LEVELS[levelIdx];
        const Icon = level.icon;
        let items, selId, onSelect, onEdit, onCreate, canCreate;
        switch (levelIdx) {
            case 0:
                items = data.objectives; selId = sel.objective;
                onSelect = selectObjective;
                onEdit = (item) => setModal({ open: true, type: 'portfolio', item, parentId: null });
                onCreate = () => setModal({ open: true, type: 'portfolio', item: null, parentId: null });
                canCreate = true;
                break;
            case 1:
                items = filteredInitiatives; selId = sel.initiative;
                onSelect = selectInitiative;
                onEdit = (item) => setModal({ open: true, type: 'solution', item, parentId: sel.objective });
                onCreate = () => sel.objective && setModal({ open: true, type: 'solution', item: null, parentId: sel.objective });
                canCreate = !!sel.objective;
                break;
            case 2:
                items = filteredEpics; selId = sel.epic;
                onSelect = selectEpic;
                onEdit = (item) => setModal({ open: true, type: 'program', item, parentId: sel.initiative });
                onCreate = () => sel.initiative && setModal({ open: true, type: 'program', item: null, parentId: sel.initiative });
                canCreate = !!sel.initiative;
                break;
            case 3:
                items = filteredStories; selId = null;
                onSelect = () => {};
                onEdit = (item) => setModal({ open: true, type: 'team', item, parentId: sel.epic });
                onCreate = () => sel.epic && setModal({ open: true, type: 'team', item: null, parentId: sel.epic });
                canCreate = !!sel.epic;
                break;
        }

        return (
            <div key={level.key} className="rounded-xl overflow-hidden flex flex-col" style={{ background: B.surface, border: `1px solid ${B.border}`, minHeight: '420px' }}>
                <header className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: `${level.accent}25` }}>
                    <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: level.accent }} />
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: level.accent }}>{level.label}</span>
                            <p className="text-[10px]" style={{ color: B.textMuted }}>{level.sub}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: B.textMuted }}>{items.length}</span>
                        <button
                            onClick={onCreate}
                            disabled={!canCreate}
                            className="p-0.5 rounded transition-colors disabled:opacity-30"
                            style={{ color: B.textMuted }}
                            onMouseEnter={e => { if (canCreate) e.currentTarget.style.color = level.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.color = B.textMuted; }}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </header>
                <div className="flex-1 p-2 space-y-1.5 overflow-y-auto" style={{ maxHeight: '500px' }}>
                    {loading && items.length === 0 && (
                        <div className="h-16 rounded-lg animate-pulse" style={{ background: '#ffffff08' }} />
                    )}
                    {!loading && items.length === 0 && (
                        <p className="text-center text-xs py-6" style={{ color: '#2a4a60' }}>
                            {levelIdx === 0 ? 'No items' : 'Select a parent →'}
                        </p>
                    )}
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className="rounded-lg p-2.5 cursor-pointer transition-all group"
                            style={{
                                background: selId === item.id ? `${level.accent}15` : '#ffffff05',
                                border: selId === item.id ? `1px solid ${level.accent}` : '1px solid transparent',
                            }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate" style={{ color: selId === item.id ? level.accent : B.textLight }}>
                                        {item[level.labelKey]}
                                    </p>
                                    {item.description && (
                                        <p className="text-[10px] mt-0.5 truncate" style={{ color: B.textMuted }}>{item.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                    className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    style={{ color: B.textMuted }}
                                >
                                    <Pencil className="w-3 h-3" />
                                </button>
                            </div>
                            {item.status && (
                                <span className="text-[9px] mt-1 inline-block px-1.5 py-0.5 rounded" style={{ background: `${level.accent}15`, color: level.accent }}>
                                    {item.status}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <p className="text-sm mb-3" style={{ color: B.textMuted }}>
                Centralized backlog hierarchy — drill down from Strategic Themes to Team Stories. Click an item to reveal its children in the next column.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {LEVELS.map((_, i) => renderColumn(i))}
            </div>

            {modal.open && modal.type === 'portfolio' && (
                <ObjectiveFormModal
                    item={modal.item}
                    onClose={closeModal}
                    onSave={(f) => handleSave('portfolio', f)}
                    onDelete={modal.item ? () => handleDelete('portfolio', modal.item) : undefined}
                />
            )}
            {modal.open && modal.type === 'solution' && (
                <InitiativeFormModal
                    item={modal.item}
                    objectiveId={modal.parentId}
                    onClose={closeModal}
                    onSave={(f) => handleSave('solution', f)}
                    onDelete={modal.item ? () => handleDelete('solution', modal.item) : undefined}
                />
            )}
            {modal.open && modal.type === 'program' && (
                <RoadmapItemFormModal
                    item={modal.item}
                    defaultInitiativeId={modal.parentId}
                    onClose={closeModal}
                    onSave={(f) => handleSave('program', f)}
                    onDelete={modal.item ? () => handleDelete('program', modal.item) : undefined}
                />
            )}
            {modal.open && modal.type === 'team' && (
                <StoryFormModal
                    item={modal.item}
                    roadmapItemId={modal.parentId}
                    onClose={closeModal}
                    onSave={(f) => handleSave('team', f)}
                    onDelete={modal.item ? () => handleDelete('team', modal.item) : undefined}
                />
            )}
        </div>
    );
}