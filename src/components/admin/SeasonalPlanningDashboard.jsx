import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, RefreshCw, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ExploreTab from './project/ExploreTab';
import IntegrateTab from './project/IntegrateTab';
import IterateTab from './project/IterateTab';
import ReleaseTab from './project/ReleaseTab';
import RoadmapItemFormModal from './project/RoadmapItemFormModal';
import ObjectiveFormModal from './project/ObjectiveFormModal';
import InitiativeFormModal from './project/InitiativeFormModal';
import StoryFormModal from './project/StoryFormModal';
import PlanningWizard from './project/PlanningWizard';
import { LEVEL_CONFIGS, LEVEL_ORDER } from './project/levelConfig';

const B = {
    navy: '#1e3a5a',
    gold: '#c9a87c',
    sky: '#4a90b8',
    green: '#7ec8a8',
    surface: '#111c28',
    border: '#1e3a5a60',
};

export default function SeasonalPlanningDashboard() {
    const [level, setLevel] = useState('program');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('explore');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [defaultStatus, setDefaultStatus] = useState(null);
    const [wizardOpen, setWizardOpen] = useState(false);
    const { toast } = useToast();

    const levelConfig = LEVEL_CONFIGS[level];
    const entityName = levelConfig.entity;

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await base44.entities[entityName].list('-priority', 500);
            const normalized = data.map(i => ({ ...i, title: i.title || i.name || '' }));
            setItems(normalized);
        } catch (err) {
            console.error('Failed to load items:', err);
            toast({ variant: 'destructive', title: 'Load failed', description: `Could not fetch ${levelConfig.sub.toLowerCase()}.` });
        } finally {
            setLoading(false);
        }
    }, [entityName, levelConfig, toast]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleSave = async (formData) => {
        try {
            if (editingItem) {
                await base44.entities[entityName].update(editingItem.id, formData);
                toast({ title: 'Updated', description: `"${formData.title || formData.name}" saved.` });
            } else {
                await base44.entities[entityName].create(formData);
                toast({ title: 'Created', description: `"${formData.title || formData.name}" added.` });
            }
            setModalOpen(false);
            setEditingItem(null);
            await loadItems();
        } catch (err) {
            toast({ variant: 'destructive', title: 'Save failed', description: err.message });
        }
    };

    const handleDelete = async (item) => {
        const label = item[levelConfig.labelKey] || item.title;
        if (!confirm(`Delete "${label}"?`)) return;
        try {
            await base44.entities[entityName].delete(item.id);
            setItems(prev => prev.filter(i => i.id !== item.id));
            setModalOpen(false);
            setEditingItem(null);
            toast({ title: 'Deleted', description: `"${label}" removed.` });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Delete failed' });
        }
    };

    const handleUpdateItem = async (id, data) => {
        const oldItem = items.find(i => i.id === id);
        if (!oldItem) return;
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
        try {
            await base44.entities[entityName].update(id, data);
        } catch (err) {
            setItems(prev => prev.map(i => i.id === id ? oldItem : i));
            toast({ variant: 'destructive', title: 'Update failed', description: 'Reverting change.' });
        }
    };

    const handleBulkUpdate = async (updates) => {
        if (!updates.length) return;
        const oldItems = items.map(i => ({ ...i }));
        setItems(prev => prev.map(i => {
            const update = updates.find(u => u.id === i.id);
            return update ? { ...i, ...update } : i;
        }));
        try {
            await base44.entities[entityName].bulkUpdate(updates);
        } catch (err) {
            setItems(oldItems);
            toast({ variant: 'destructive', title: 'Reorder failed', description: 'Reverting order.' });
        }
    };

    const openCreate = (status = null) => {
        setEditingItem(null);
        setDefaultStatus(status);
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setDefaultStatus(null);
        setModalOpen(true);
    };

    const renderFormModal = () => {
        if (!modalOpen) return null;
        const commonProps = {
            item: editingItem,
            onClose: () => { setModalOpen(false); setEditingItem(null); },
            onSave: handleSave,
            onDelete: editingItem ? () => handleDelete(editingItem) : undefined,
        };
        switch (level) {
            case 'portfolio':
                return <ObjectiveFormModal {...commonProps} defaultStatus={defaultStatus} />;
            case 'solution':
                return <InitiativeFormModal {...commonProps} defaultStatus={defaultStatus} />;
            case 'program':
                return <RoadmapItemFormModal {...commonProps} defaultStatus={defaultStatus || 'backlog'} defaultInitiativeId={editingItem?.initiative_id} />;
            case 'team':
                return <StoryFormModal {...commonProps} defaultStatus={defaultStatus} roadmapItemId={editingItem?.roadmap_item_id} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: B.navy }}>Seasonal Planning</h1>
                    <p className="text-sm" style={{ color: '#5d7a94' }}>
                        {levelConfig.label} — {levelConfig.sub}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadItems} disabled={loading}>
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => openCreate(null)} style={{ background: B.navy, color: 'white' }}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        New {levelConfig.singular}
                    </Button>
                    <Button size="sm" onClick={() => setWizardOpen(true)} style={{ background: B.gold, color: B.surface }}>
                        <Rocket className="w-3.5 h-3.5 mr-1.5" />
                        Start Planning
                    </Button>
                </div>
            </div>

            {/* SAFe Level Switcher */}
            <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: `1px solid ${B.border}` }}>
                {LEVEL_ORDER.map(key => {
                    const cfg = LEVEL_CONFIGS[key];
                    const Icon = cfg.icon;
                    const active = level === key;
                    return (
                        <button
                            key={key}
                            onClick={() => { setLevel(key); setActiveTab('explore'); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors flex-1 justify-center"
                            style={{
                                background: active ? cfg.accent : 'transparent',
                                color: active ? 'white' : '#5d7a94',
                            }}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{cfg.label}</span>
                        </button>
                    );
                })}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="explore">Explore</TabsTrigger>
                    <TabsTrigger value="integrate">Integrate</TabsTrigger>
                    <TabsTrigger value="iterate">Iterate</TabsTrigger>
                    <TabsTrigger value="release">Release</TabsTrigger>
                </TabsList>

                <TabsContent value="explore" className="mt-4">
                    <ExploreTab
                        items={items}
                        loading={loading}
                        onEdit={openEdit}
                        onCreate={openCreate}
                        onBulkUpdate={handleBulkUpdate}
                        onUpdateItem={handleUpdateItem}
                        levelConfig={levelConfig}
                    />
                </TabsContent>

                <TabsContent value="integrate" className="mt-4">
                    <IntegrateTab
                        items={items}
                        loading={loading}
                        onEdit={openEdit}
                        onCreate={() => openCreate(null)}
                        levelConfig={levelConfig}
                    />
                </TabsContent>

                <TabsContent value="iterate" className="mt-4">
                    <IterateTab
                        items={items}
                        loading={loading}
                        onEdit={openEdit}
                        onCreate={(status) => openCreate(status)}
                        onUpdateItem={handleUpdateItem}
                        levelConfig={levelConfig}
                    />
                </TabsContent>

                <TabsContent value="release" className="mt-4">
                    <ReleaseTab
                        items={items}
                        loading={loading}
                        onEdit={openEdit}
                        levelConfig={levelConfig}
                    />
                </TabsContent>
            </Tabs>

            {renderFormModal()}
            <PlanningWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
        </div>
    );
}