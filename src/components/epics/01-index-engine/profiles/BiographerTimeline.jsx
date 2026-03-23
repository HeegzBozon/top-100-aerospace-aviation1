import { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, Lock, Unlock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

const ERA_CONFIG = {
  early_career: { label: 'Early Career', color: 'bg-blue-100 text-blue-700', icon: '🌱' },
  transition: { label: 'Transition', color: 'bg-purple-100 text-purple-700', icon: '⚡' },
  breakthrough: { label: 'Breakthrough', color: 'bg-amber-100 text-amber-700', icon: '🚀' },
  leadership: { label: 'Leadership', color: 'bg-green-100 text-green-700', icon: '🤝' },
  future: { label: 'Future', color: 'bg-indigo-100 text-indigo-700', icon: '🔮' },
};

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private', icon: EyeOff },
  { value: 'nominators', label: 'Nominators Only', icon: Eye },
  { value: 'public', label: 'Public', icon: Eye },
];

export default function BiographerTimeline({ fragments, onUpdateFragment, onDeleteFragment }) {
  const [expandedId, setExpandedId] = useState(null);

  // Group fragments by era
  const groupedFragments = fragments.reduce((acc, fragment) => {
    const era = fragment.timeline_era || 'early_career';
    if (!acc[era]) acc[era] = [];
    acc[era].push(fragment);
    return acc;
  }, {});

  // Sort each era group by timeline_order
  Object.keys(groupedFragments).forEach(era => {
    groupedFragments[era].sort((a, b) => (a.timeline_order || 0) - (b.timeline_order || 0));
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    const fragment = fragments.find(f => f.id === draggableId);
    if (!fragment) return;

    const newEra = destination.droppableId;
    const newOrder = destination.index;

    onUpdateFragment(fragment.id, {
      timeline_era: newEra,
      timeline_order: newOrder,
    });
  };

  const handleVisibilityChange = (fragmentId, visibility) => {
    onUpdateFragment(fragmentId, { visibility });
  };

  const handleLockToggle = (fragment) => {
    onUpdateFragment(fragment.id, { is_locked: !fragment.is_locked });
  };

  const eras = ['early_career', 'transition', 'breakthrough', 'leadership', 'future'];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Timeline Visual */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-amber-300 to-indigo-300" />
          
          {eras.map((era) => {
            const config = ERA_CONFIG[era];
            const eraFragments = groupedFragments[era] || [];
            
            return (
              <Droppable key={era} droppableId={era}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`relative pl-14 pb-8 ${snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg' : ''}`}
                  >
                    {/* Era Marker */}
                    <div className="absolute left-3 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-sm"
                      style={{ borderColor: brandColors.goldPrestige }}>
                      {config.icon}
                    </div>
                    
                    <div className="mb-3">
                      <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>
                        {config.label}
                      </h3>
                      <p className="text-xs text-gray-500">{eraFragments.length} fragment{eraFragments.length !== 1 ? 's' : ''}</p>
                    </div>

                    {eraFragments.length === 0 ? (
                      <div className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-gray-400">
                        Drag fragments here or answer prompts to add to this era
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {eraFragments.map((fragment, index) => (
                          <Draggable key={fragment.id} draggableId={fragment.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-3 rounded-lg border bg-white transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                } ${expandedId === fragment.id ? 'ring-2 ring-blue-200' : ''}`}
                              >
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps} className="mt-1 cursor-grab">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-[10px]">
                                        {fragment.prompt_category?.replace('_', ' ')}
                                      </Badge>
                                      {fragment.is_locked && (
                                        <Lock className="w-3 h-3 text-amber-500" />
                                      )}
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        fragment.visibility === 'public' ? 'bg-green-100 text-green-700' :
                                        fragment.visibility === 'nominators' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {fragment.visibility || 'private'}
                                      </span>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 italic mb-1 line-clamp-1">
                                      {fragment.prompt_text}
                                    </p>
                                    
                                    <p className={`text-sm text-gray-800 ${expandedId === fragment.id ? '' : 'line-clamp-2'}`}>
                                      {fragment.content}
                                    </p>
                                    
                                    <button
                                      onClick={() => setExpandedId(expandedId === fragment.id ? null : fragment.id)}
                                      className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                                    >
                                      {expandedId === fragment.id ? (
                                        <>Show less <ChevronUp className="w-3 h-3" /></>
                                      ) : (
                                        <>Show more <ChevronDown className="w-3 h-3" /></>
                                      )}
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Select
                                      value={fragment.visibility || 'private'}
                                      onValueChange={(v) => handleVisibilityChange(fragment.id, v)}
                                    >
                                      <SelectTrigger className="w-8 h-8 p-0 border-0">
                                        {fragment.visibility === 'public' ? (
                                          <Eye className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <EyeOff className="w-4 h-4 text-gray-400" />
                                        )}
                                      </SelectTrigger>
                                      <SelectContent>
                                        {VISIBILITY_OPTIONS.map(opt => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleLockToggle(fragment)}
                                    >
                                      {fragment.is_locked ? (
                                        <Lock className="w-4 h-4 text-amber-500" />
                                      ) : (
                                        <Unlock className="w-4 h-4 text-gray-400" />
                                      )}
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => onDeleteFragment(fragment.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
}