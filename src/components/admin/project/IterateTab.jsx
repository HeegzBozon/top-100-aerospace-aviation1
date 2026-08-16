import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import RoadmapItemCard from './RoadmapItemCard';

const B = { surface: '#111c28', border: '#1e3a5a60' };

const COLUMNS = [
    { id: 'backlog', label: 'Backlog', accent: '#5d7a94' },
    { id: 'next_up', label: 'Next Up', accent: '#c9a87c' },
    { id: 'in_progress', label: 'In Progress', accent: '#4a90b8' },
    { id: 'done', label: 'Done', accent: '#7ec8a8' },
];

export default function IterateTab({ items, loading, onEdit, onCreate, onUpdateItem }) {
    const itemsByStatus = (status) => items.filter(i => (i.status || 'backlog') === status);

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (source.droppableId !== destination.droppableId) {
            onUpdateItem(result.draggableId, { status: destination.droppableId });
        }
    };

    return (
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
                                    onClick={() => onCreate(col.id)}
                                    className="p-0.5 rounded transition-colors"
                                    style={{ color: '#3d6080' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = col.accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#3d6080'; }}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex-1 p-2 space-y-2 transition-colors"
                                        style={{ background: snapshot.isDraggingOver ? `${col.accent}08` : 'transparent' }}
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
                                                        <RoadmapItemCard item={item} onClick={() => onEdit(item)} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {provided.placeholder}

                                        {!loading && colItems.length === 0 && (
                                            <button
                                                onClick={() => onCreate(col.id)}
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
    );
}