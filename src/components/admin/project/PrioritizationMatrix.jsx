import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MessageCircleQuestion } from 'lucide-react';
import RoadmapItemCard from './RoadmapItemCard';

const QUADRANTS = [
    {
        key: 'opportunities',
        title: 'Opportunities',
        sub: 'Quick wins to pursue',
        implementation: 'easy',
        potential: 'high',
        accent: '#7ec8a8',
    },
    {
        key: 'radar',
        title: 'Keep on the Radar',
        sub: 'Major projects to plan',
        implementation: 'difficult',
        potential: 'high',
        accent: '#4a90b8',
    },
    {
        key: 'consider_later',
        title: 'Consider Later',
        sub: 'Low-effort fill-ins',
        implementation: 'easy',
        potential: 'low',
        accent: '#c9a87c',
    },
    {
        key: 'do_not_consider',
        title: 'Do Not Consider',
        sub: 'Thankless tasks to avoid',
        implementation: 'difficult',
        potential: 'low',
        accent: '#c87e9d',
    },
];

function getQuadrantKey(item) {
    if (item.implementation && item.potential) {
        const q = QUADRANTS.find(
            qd => qd.implementation === item.implementation && qd.potential === item.potential
        );
        if (q) return q.key;
    }
    return 'staging';
}

export default function PrioritizationMatrix({ items, loading, onEdit, onCreate, onUpdateItem }) {
    const stagingItems = items.filter(i => getQuadrantKey(i) === 'staging');
    const quadrantItems = (key) => items.filter(i => getQuadrantKey(i) === key);

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        if (result.source.droppableId === result.destination.droppableId) return;

        const { draggableId, destination } = result;

        if (destination.droppableId === 'staging') {
            onUpdateItem(draggableId, { implementation: null, potential: null });
        } else {
            const q = QUADRANTS.find(qd => qd.key === destination.droppableId);
            if (q) {
                onUpdateItem(draggableId, { implementation: q.implementation, potential: q.potential });
            }
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            {/* Staging Section */}
            <div
                className="rounded-xl mb-4 overflow-hidden"
                style={{ background: '#111c28', border: '1px solid #1e3a5a60' }}
            >
                <div
                    className="flex items-center justify-between px-4 py-3 border-b gap-3"
                    style={{ borderColor: '#1e3a5a60' }}
                >
                    <div className="flex items-center gap-2">
                        <MessageCircleQuestion className="w-4 h-4 flex-shrink-0" style={{ color: '#c9a87c' }} />
                        <div>
                            <span className="text-sm font-semibold" style={{ color: '#c8d8e8' }}>
                                Issues Under Discussion
                            </span>
                            <p className="text-xs" style={{ color: '#5d7a94' }}>
                                What is the problem? Who has the problem? Why is it important?
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

                <Droppable droppableId="staging" direction="horizontal">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex gap-2 p-3 overflow-x-auto min-h-[90px] transition-colors"
                            style={{ background: snapshot.isDraggingOver ? '#c9a87c08' : 'transparent' }}
                        >
                            {loading && stagingItems.length === 0 && (
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-52 h-20 rounded-lg animate-pulse flex-shrink-0" style={{ background: '#ffffff08' }} />
                                    ))}
                                </div>
                            )}

                            {stagingItems.map((item, index) => (
                                <Draggable draggableId={item.id} index={index} key={item.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="flex-shrink-0 w-52"
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

                            {!loading && stagingItems.length === 0 && (
                                <p className="text-xs py-4 px-2" style={{ color: '#3d6080' }}>
                                    Drag items here to triage, then move them into the matrix below.
                                </p>
                            )}
                        </div>
                    )}
                </Droppable>
            </div>

            {/* Matrix */}
            <div className="flex">
                {/* Y-axis */}
                <div className="flex flex-col items-center justify-between py-3 pr-1" style={{ width: '28px' }}>
                    <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>High</span>
                    <span
                        className="text-[10px] font-bold text-center"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#5d7a94' }}
                    >
                        Potential for Improvement
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>Low</span>
                </div>

                {/* 2x2 Grid + X-axis */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2">
                        {QUADRANTS.map(q => {
                            const qItems = quadrantItems(q.key);
                            return (
                                <Droppable droppableId={q.key} key={q.key}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="rounded-xl p-3 min-h-[200px] flex flex-col"
                                            style={{
                                                background: snapshot.isDraggingOver ? `${q.accent}10` : `${q.accent}05`,
                                                border: `1px solid ${q.accent}25`,
                                                backgroundImage: `linear-gradient(rgba(30,58,90,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,90,0.03) 1px, transparent 1px)`,
                                                backgroundSize: '20px 20px',
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <span
                                                        className="text-xs font-bold uppercase tracking-wider"
                                                        style={{ color: q.accent }}
                                                    >
                                                        {q.title}
                                                    </span>
                                                    <p className="text-[10px]" style={{ color: '#5d7a94' }}>{q.sub}</p>
                                                </div>
                                                <span className="text-xs" style={{ color: '#3d6080' }}>{qItems.length}</span>
                                            </div>

                                            <div className="space-y-2 flex-1">
                                                {qItems.map((item, index) => (
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

                                                {!loading && qItems.length === 0 && (
                                                    <p className="text-[10px] text-center py-4" style={{ color: '#2a4a60' }}>
                                                        Drop items here
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </div>

                    {/* X-axis */}
                    <div className="flex justify-between items-center mt-2 px-1">
                        <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>Easy</span>
                        <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>Implementation</span>
                        <span className="text-[10px] font-bold" style={{ color: '#5d7a94' }}>Difficult</span>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}