import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ExploreTab from './project/ExploreTab';
import IntegrateTab from './project/IntegrateTab';
import IterateTab from './project/IterateTab';
import ReleaseTab from './project/ReleaseTab';
import RoadmapItemFormModal from './project/RoadmapItemFormModal';

const B = {
    navy: '#1e3a5a',
    navyDeep: '#0d2035',
    gold: '#c9a87c',
    sky: '#4a90b8',
    surface: '#111c28',
    border: '#1e3a5a60',
};

export default function SeasonalPlanningDashboard() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('explore');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [defaultStatus, setDefaultStatus] = useState('backlog');
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await base44.entities.RoadmapItem.list('-priority', 500);
            setItems(data);
        } catch (err) {
            console.error('Failed to load roadmap items:', err);
            toast({ variant: 'destructive', title: 'Load failed', description: 'Could not fetch roadmap items.' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleSave = async (formData) => {
        try {
            if (editingItem) {
                await base44.entities.RoadmapItem.update(editingItem.id, formData);
                toast({ title: 'Updated', description: `"${formData.title}" saved.` });
            } else {
                await base44.entities.RoadmapItem.create(formData);
                toast({ title: 'Created', description: `"${formData.title}" added.` });
            }
            setModalOpen(false);
            setEditingItem(null);
            await loadItems();
        } catch (err) {
            console.error('Save failed:', err);
            toast({ variant: 'destructive', title: 'Save failed', description: err.message });
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Delete "${item.title}"?`)) return;
        try {
            await base44.entities.RoadmapItem.delete(item.id);
            setItems(prev => prev.filter(i => i.id !== item.id));
            setModalOpen(false);
            setEditingItem(null);
            toast({ title: 'Deleted', description: `"${item.title}" removed.` });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Delete failed' });
        }
    };

    const handleUpdateItem = async (id, data) => {
        const oldItem = items.find(i => i.id === id);
        if (!oldItem) return;
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
        try {
            await base44.entities.RoadmapItem.update(id, data);
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
            await base44.entities.RoadmapItem.bulkUpdate(updates);
        } catch (err) {
            setItems(oldItems);
            toast({ variant: 'destructive', title: 'Reorder failed', description: 'Reverting order.' });
        }
    };

    const openCreate = (status = 'backlog') => {
        setEditingItem(null);
        setDefaultStatus(status);
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: B.navy }}>Seasonal Planning</h1>
                    <p className="text-sm" style={{ color: '#5d7a94' }}>
                        Explore, integrate, iterate, and release your roadmap.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadItems} disabled={loading}>
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => openCreate('backlog')} style={{ background: B.navy, color: 'white' }}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        New Item
                    </Button>
                </div>
            </div>

            {/* Tabs */}
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
                    />
                </TabsContent>

                <TabsContent value="integrate" className="mt-4">
                    <IntegrateTab
                        items={items}
                        loading={loading}
                        onEdit={openEdit}
                        onCreate={openCreate}
                    />
                </TabsContent>

                <TabsContent value="iterate" className="mt-4">
                    <IterateTab
                        items={items}
                        loading={loading}
                        onEdit={openEdit}
                        onCreate={openCreate}
                        onUpdateItem={handleUpdateItem}
                    />
                </TabsContent>

                <TabsContent value="release" className="mt-4">
                    <ReleaseTab
                        items={items}
                        loading={loading}
                        onEdit={openEdit}
                    />
                </TabsContent>
            </Tabs>

            {/* Form Modal */}
            {modalOpen && (
                <RoadmapItemFormModal
                    item={editingItem}
                    defaultStatus={defaultStatus}
                    onClose={() => { setModalOpen(false); setEditingItem(null); }}
                    onSave={handleSave}
                    onDelete={editingItem ? handleDelete : undefined}
                />
            )}
        </div>
    );
}