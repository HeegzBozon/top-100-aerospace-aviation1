import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import RoadmapItemCard from './RoadmapItemCard';

const GROUPS = [
    { type: 'feature', label: 'Features', accent: '#c9a87c' },
    { type: 'enhancement', label: 'Enhancements', accent: '#4a90b8' },
    { type: 'bug', label: 'Bugs', accent: '#c87e9d' },
    { type: 'feedback', label: 'Feedback', accent: '#7ec8a8' },
];

export default function TypeGrouping({ items, loading, onEdit, onCreate, onBulkUpdate }) {
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;

        const groupType = result.type;
        const groupItems = items
            .filter(i => (i.type || 'feature') === groupType)
            .sort((a, b) => (a.priority || 0) - (b.priority || 0));

        const [moved] = groupItems.splice(result.source.index, 1);
        groupItems.splice(result.destination.index, 0, moved);

        const updates = groupItems.map((item, index) => ({
            id: item.id,
            priority: (index + 1) * 10,
        }));

        onBulkUpdate(updates);
    };

    return (
        <div>
            <p className="text-sm mb-3" style={{ color: '#5d7a94' }}>
                Parking lot — explore and triage items by type. Drag to reorder priority within each lane.
            </p>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {GROUPS.map(group => {
                        const groupItems = items
                            .filter(i => (i.type || 'feature') === group.type)
                            .sort((a, b) => (a.priority || 0) - (b.priority || 0));

                        return (
                            <div
                                key={group.type}
                                className="flex flex-col rounded-xl overflow-hidden"
                                style={{ background: '#111c28', border: '1px solid #1e3a5a60', minHeight: '300px' }}
                            >
                                <div
                                    className="flex items-center justify-between px-3 py-2.5 border-b"
                                    style={{ borderColor: `${group.accent}25` }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: group.accent }} />
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: group.accent }}>
                                            {group.label}
                                        </span>
                                        <span className="text-xs" style={{ color: '#3d6080' }}>{groupItems.length}</span>
                                    </div>
                                    <button
                                        onClick={() => onCreate('backlog')}
                                        className="p-0.5 rounded transition-colors"
                                        style={{ color: '#3d6080' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = group.accent; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#3d6080'; }}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <Droppable droppableId={group.type} type={group.type}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex-1 p-2 space-y-2 transition-colors"
                                            style={{ background: snapshot.isDraggingOver ? `${group.accent}08` : 'transparent' }}
                                        >
                                            {loading && groupItems.length === 0 && (
                                                <div className="h-16 rounded-lg animate-pulse" style={{ background: '#ffffff08' }} />
                                            )}

                                            {groupItems.map((item, index) => (
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

                                            {!loading && groupItems.length === 0 && (
                                                <p className="text-center text-xs py-6" style={{ color: '#2a4a60' }}>
                                                    No items
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}