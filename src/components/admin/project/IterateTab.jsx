import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';

const B = { surface: '#111c28', border: '#1e3a5a60' };

export default function IterateTab({ items, loading, onEdit, onCreate, onUpdateItem, levelConfig }) {
    const columns = levelConfig.statuses.map(s => ({ id: s.value, label: s.label, accent: s.color }));
    const firstStatus = columns[0]?.id;
    const itemsByStatus = (status) => items.filter(i => (i.status || firstStatus) === status);

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
            <div className="flex flex-wrap gap-3">
                {columns.map(col => {
                    const colItems = itemsByStatus(col.id);
                    return (
                        <div
                            key={col.id}
                            className="flex flex-col rounded-xl overflow-hidden flex-1 min-w-[240px]"
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
                                                        onClick={() => onEdit(item)}
                                                        className="rounded-lg p-3 cursor-pointer transition-all"
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            background: '#ffffff05',
                                                            border: '1px solid #1e3a5a30',
                                                            opacity: snapshot.isDragging ? 0.85 : 1,
                                                        }}
                                                    >
                                                        <p className="text-xs font-medium mb-0.5" style={{ color: '#d4e0ec' }}>
                                                            {item[levelConfig.labelKey]}
                                                        </p>
                                                        {item.description && (
                                                            <p className="text-[10px] truncate" style={{ color: '#5d7a94' }}>
                                                                {item.description}
                                                            </p>
                                                        )}
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