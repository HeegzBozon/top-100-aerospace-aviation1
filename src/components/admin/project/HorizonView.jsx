import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Rocket } from 'lucide-react';

export default function HorizonView({ items, loading, onEdit, onCreate, onUpdateItem, horizons, labelKey = 'title' }) {
    const unassigned = items.filter(i => !i.horizon);

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.source.droppableId === result.destination.droppableId) return;

        const { draggableId, destination } = result;
        const target = destination.droppableId;

        if (target === 'unassigned') {
            onUpdateItem(draggableId, { horizon: null });
        } else {
            onUpdateItem(draggableId, { horizon: target });
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            {/* Unassigned staging area */}
            <div
                className="rounded-xl mb-4 overflow-hidden"
                style={{ background: '#111c28', border: '1px solid #1e3a5a60' }}
            >
                <div
                    className="flex items-center justify-between px-4 py-3 border-b gap-3"
                    style={{ borderColor: '#1e3a5a60' }}
                >
                    <div className="flex items-center gap-2">
                        <Rocket className="w-4 h-4 flex-shrink-0" style={{ color: '#c9a87c' }} />
                        <div>
                            <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>
                                Unassigned Horizons
                            </span>
                            <p className="text-xs" style={{ color: '#5d7a94' }}>
                                Drag items to classify their growth horizon
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onCreate('backlog')}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                        style={{ background: '#1e3a5a', color: 'white' }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </button>
                </div>

                <Droppable droppableId="unassigned" direction="horizontal" type="horizon">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex gap-2 p-3 overflow-x-auto min-h-[90px] transition-colors"
                            style={{ background: snapshot.isDraggingOver ? '#c9a87c08' : 'transparent' }}
                        >
                            {loading && unassigned.length === 0 && (
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-52 h-20 rounded-lg animate-pulse flex-shrink-0" style={{ background: '#ffffff08' }} />
                                    ))}
                                </div>
                            )}

                            {unassigned.map((item, index) => (
                                <Draggable draggableId={item.id} index={index} key={item.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={() => onEdit(item)}
                                            className="flex-shrink-0 w-52 rounded-lg p-3 cursor-pointer transition-all"
                                            style={{
                                                ...provided.draggableProps.style,
                                                background: '#ffffff05',
                                                border: '1px solid #1e3a5a30',
                                                opacity: snapshot.isDragging ? 0.85 : 1,
                                            }}
                                        >
                                            <p className="text-xs font-medium mb-0.5" style={{ color: '#d4e0ec' }}>
                                                {item[labelKey]}
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

                            {!loading && unassigned.length === 0 && (
                                <p className="text-xs py-4 px-2" style={{ color: '#3d6080' }}>
                                    All items have been assigned to a horizon.
                                </p>
                            )}
                        </div>
                    )}
                </Droppable>
            </div>

            {/* 3 Horizon columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {horizons.map(h => {
                    const hItems = items.filter(i => i.horizon === h.value);
                    return (
                        <Droppable droppableId={h.value} key={h.value} type="horizon">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex flex-col rounded-xl overflow-hidden min-h-[300px] transition-colors"
                                    style={{
                                        background: snapshot.isDraggingOver ? `${h.accent}08` : '#111c28',
                                        border: `1px solid ${h.accent}25`,
                                    }}
                                >
                                    <div
                                        className="px-3 py-2.5 border-b"
                                        style={{ borderColor: `${h.accent}25` }}
                                    >
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className="w-2 h-2 rounded-full" style={{ background: h.accent }} />
                                            <span
                                                className="text-xs font-bold uppercase tracking-wider"
                                                style={{ color: h.accent }}
                                            >
                                                {h.label}
                                            </span>
                                            <span className="text-xs" style={{ color: '#3d6080' }}>{hItems.length}</span>
                                        </div>
                                        <p className="text-[10px]" style={{ color: '#5d7a94' }}>{h.sub}</p>
                                    </div>

                                    <div className="flex-1 p-2 space-y-2">
                                        {loading && hItems.length === 0 && (
                                            <div className="h-16 rounded-lg animate-pulse" style={{ background: '#ffffff08' }} />
                                        )}

                                        {hItems.map((item, index) => (
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
                                                            {item[labelKey]}
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

                                        {!loading && hItems.length === 0 && (
                                            <p className="text-center text-xs py-6" style={{ color: '#2a4a60' }}>
                                                No items
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    );
                })}
            </div>
        </DragDropContext>
    );
}