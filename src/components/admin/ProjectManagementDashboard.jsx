import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import RoadmapItemCard from './project/RoadmapItemCard';
import RoadmapItemFormModal from './project/RoadmapItemFormModal';

const B = {
    navy: '#1e3a5a',
    navyDeep: '#0d2035',
    gold: '#c9a87c',
    sky: '#4a90b8',
    surface: '#111c28',
    border: '#1e3a5a60',
};

const COLUMNS = [
    { id: 'backlog', label: 'Backlog', accent: '#5d7a94' },
    { id: 'next_up', label: 'Next Up', accent: '#c9a87c' },
    { id: 'in_progress', label: 'In Progress', accent: '#4a90b8' },
    { id: 'done', label: 'Done', accent: '#7ec8a8' },
];

export default function ProjectManagementDashboard() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const itemsByStatus = (status) => items.filter(i => (i.status || 'backlog') === status);

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination } = result;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const movedItem = items.find(i => i.id === result.draggableId);
        if (!movedItem) return;

        // Optimistic update
        setItems(prev => prev.map(i =>
            i.id === movedItem.id ? { ...i, status: destination.droppableId } : i
        ));

        try {
            await base44.entities.RoadmapItem.update(movedItem.id, { status: destination.droppableId });
        } catch (err) {
            console.error('Failed to update status:', err);
            toast({ variant: 'destructive', title: 'Move failed', description: 'Reverting item position.' });
            setItems(prev => prev.map(i =>
                i.id === movedItem.id ? { ...i, status: source.droppableId } : i
            ));
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingItem) {
                await base44.entities.RoadmapItem.update(editingItem.id, formData);
                toast({ title: 'Updated', description: `"${formData.title}" saved.` });
            } else {
                await base44.entities.RoadmapItem.create(formData);
                toast({ title: 'Created', description: `"${formData.title}" added to board.` });
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
                    <h1 className="text-xl font-bold" style={{ color: B.navy }}>Project Management</h1>
                    <p className="text-sm" style={{ color: '#5d7a94' }}>
                        Drag items across columns to update status.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadItems}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => openCreate('backlog')}
                        style={{ background: B.navy, color: 'white' }}
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        New Item
                    </Button>
                </div>
            </div>

            {/* Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {COLUMNS.map(col => {
                        const colItems = itemsByStatus(col.id);
                        return (
                            <div
                                key={col.id}
                                className="flex flex-col rounded-xl overflow-hidden"
                                style={{ background: B.surface, border: `1px solid ${B.border}`, minHeight: '400px' }}
                            >
                                {/* Column header */}
                                <div
                                    className="flex items-center justify-between px-3 py-2.5 border-b"
                                    style={{ borderColor: `${col.accent}25` }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: col.accent }} />
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.accent }}>
                                            {col.label}
                                        </span>
                                        <span className="text-xs" style={{ color: '#3d6080' }}>{colItems.length}</span>
                                    </div>
                                    <button
                                        onClick={() => openCreate(col.id)}
                                        className="p-0.5 rounded transition-colors"
                                        style={{ color: '#3d6080' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = col.accent; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#3d6080'; }}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Droppable area */}
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex-1 p-2 space-y-2 transition-colors"
                                            style={{
                                                background: snapshot.isDraggingOver ? `${col.accent}08` : 'transparent',
                                            }}
                                        >
                                            {loading && colItems.length === 0 && (
                                                <div className="space-y-2">
                                                    {[1, 2].map(i => (
                                                        <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: '#ffffff08' }} />
                                                    ))}
                                                </div>
                                            )}

                                            {colItems.map((item, index) => (
                                                <Draggable draggableId={item.id} index={index} key={item.id}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                opacity: snapshot.isDragging ? 0.85 : 1,
                                                            }}
                                                        >
                                                            <RoadmapItemCard item={item} onClick={() => openEdit(item)} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}

                                            {provided.placeholder}

                                            {!loading && colItems.length === 0 && (
                                                <button
                                                    onClick={() => openCreate(col.id)}
                                                    className="w-full py-6 rounded-lg text-xs transition-all"
                                                    style={{ color: '#2a4a60', border: '1px dashed #1e3a5a40' }}
                                                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${col.accent}40`; e.currentTarget.style.color = col.accent; }}
                                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e3a5a40'; e.currentTarget.style.color = '#2a4a60'; }}
                                                >
                                                    + Add item
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

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

            {/* Delete button rendered in modal footer via editingItem presence */}
            {editingItem && modalOpen && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(editingItem)}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete "{editingItem.title}"
                    </Button>
                </div>
            )}
        </div>
    );
}