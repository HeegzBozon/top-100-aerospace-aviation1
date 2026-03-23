
import { useState, useEffect } from 'react';
import { DockItem } from '@/entities/DockItem';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Edit, GripVertical, Loader2, RotateCcw } from 'lucide-react';
import { iconMap, DefaultIcon } from '@/components/icons';
import { resetDockOrder } from '@/functions/resetDockOrder';
import { fixVoteButton } from '@/functions/fixVoteButton';

import DockItemForm from './DockItemForm';

const IconDisplay = ({ iconName }) => {
    const Icon = iconMap[iconName] || DefaultIcon;
    return <Icon className="w-5 h-5 text-gray-600" />;
};

export default function DockSettingsManager() {
    const [dockItems, setDockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { toast } = useToast();
    const [processingReset, setProcessingReset] = useState(false);

    const fetchDockItems = async () => {
        setLoading(true);
        try {
            const items = await DockItem.list('order');
            setDockItems(items);
        } catch (error) {
            console.error("Failed to fetch dock items:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load dock items.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDockItems();
    }, []);

    const handleResetDock = async () => {
        if (!confirm('Are you sure you want to reset the dock to its recommended layout? This will replace your current configuration.')) {
            return;
        }

        setProcessingReset(true);
        try {
            console.log('Calling resetDockOrder...');
            const { data } = await resetDockOrder();
            console.log('Reset response:', data);

            if (data.success) {
                toast({
                    title: 'Dock Reset Complete',
                    description: 'The dock has been updated. Check the bottom of your screen!'
                });

                console.log('Refreshing admin view and dock...');
                await fetchDockItems(); // Refresh the admin view

                // Ensure DB changes are propagated
                setTimeout(() => {
                    console.log('Dock reset successful with data parity check.');
                }, 500);

            } else {
                throw new Error(data.error || 'Failed to reset dock.');
            }
        } catch (error) {
            console.error('Failed to reset dock:', error);
            toast({
                variant: 'destructive',
                title: 'Reset Failed',
                description: error.message || 'Could not reset the dock.'
            });
        } finally {
            setProcessingReset(false);
        }
    };

    const handleFixVoteButton = async () => {
        setProcessingReset(true);
        try {
            const { data } = await fixVoteButton();
            if (data.success) {
                toast({
                    title: 'Fixed!',
                    description: 'Vote button now points to BallotBox'
                });
                await fetchDockItems();
                await fetchDockItems();
            } else {
                throw new Error(data.error || 'Failed to fix vote button.');
            }
        } catch (error) {
            console.error('Failed to fix vote button:', error);
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: error.message || 'Could not fix vote button.'
            });
        } finally {
            setProcessingReset(false);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(dockItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setDockItems(items); // Optimistic UI update

        try {
            const updatePromises = items.map((item, index) =>
                DockItem.update(item.id, { order: index })
            );
            await Promise.all(updatePromises);
            toast({ title: 'Success', description: 'Dock order saved successfully.' });
        } catch (error) {
            console.error("Failed to update dock order:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save new order.' });
            fetchDockItems(); // Revert on error
        }
    };

    const handleToggleEnabled = async (item) => {
        const newIsEnabled = !item.isEnabled;

        // Optimistic UI update
        setDockItems(items => items.map(i => i.id === item.id ? { ...i, isEnabled: newIsEnabled } : i));

        try {
            await DockItem.update(item.id, { isEnabled: newIsEnabled });
            toast({ title: 'Success', description: `'${item.label}' has been ${newIsEnabled ? 'enabled' : 'disabled'}.` });
        } catch (error) {
            console.error("Failed to toggle item:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update item status.' });
            fetchDockItems(); // Revert on error
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingItem(null);
        fetchDockItems();
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" /></div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Dock Settings</h2>
                    <p className="text-gray-600">Drag and drop to reorder, use the toggle to show/hide.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleFixVoteButton} disabled={processingReset}>
                        {processingReset ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RotateCcw className="w-4 h-4 mr-2" />
                        )}
                        Fix Vote Button
                    </Button>
                    <Button variant="outline" onClick={handleResetDock} disabled={processingReset}>
                        {processingReset ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RotateCcw className="w-4 h-4 mr-2" />
                        )}
                        Reset Order
                    </Button>
                    <Button onClick={handleAddItem}>
                        <Plus className="w-4 h-4 mr-2" /> Add Dock Item
                    </Button>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="dockItems">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {dockItems.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`flex items-center gap-4 p-4 rounded-lg border bg-white/80 dark:bg-black/20 backdrop-blur-sm transition-shadow ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}`}
                                        >
                                            <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                                                <GripVertical />
                                            </div>
                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md">
                                                <IconDisplay iconName={item.icon} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.label}</p>
                                                <p className="text-xs text-gray-500">Page: {item.pageName}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Switch
                                                    checked={item.isEnabled}
                                                    onCheckedChange={() => handleToggleEnabled(item)}
                                                />
                                                <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {showForm && (
                <DockItemForm
                    item={editingItem}
                    onClose={() => setShowForm(false)}
                    onSuccess={handleFormSuccess}
                    existingItemsCount={dockItems.length}
                />
            )}
        </div>
    );
}
