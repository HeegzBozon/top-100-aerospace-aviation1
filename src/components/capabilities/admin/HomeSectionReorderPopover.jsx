import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Settings2, GripVertical, Eye, EyeOff, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'home_section_config_v1';

export const DEFAULT_SECTIONS = [
  { id: 'spotlight',   label: 'Industry Spotlight' },
  { id: 'featured',    label: 'Featured Today' },
  { id: 'dashboard',   label: 'Aerospace Dashboard' },
  { id: 'programs',    label: 'Trending Programs' },
  { id: 'talent',      label: 'Trending Talent' },
  { id: 'favorites',   label: 'Community Favorites' },
  { id: 'missions',    label: 'Upcoming Missions' },
  { id: 'topPrograms', label: 'Top Programs' },
  { id: 'domain',      label: 'Domain Explorer' },
  { id: 'originals',   label: 'TOP 100 Originals' },
  { id: 'trending',    label: 'Trending Now' },
];

export function loadSectionConfig(user) {
  // Prefer globally-persisted config from user record
  if (user?.home_section_config) {
    try {
      return typeof user.home_section_config === 'string'
        ? JSON.parse(user.home_section_config)
        : user.home_section_config;
    } catch { /* fall through */ }
  }
  // Fallback: localStorage (legacy / offline)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSectionConfig(config) {
  // Always mirror to localStorage for instant local reads
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Persist globally to the user record
  base44.auth.updateMe({ home_section_config: config }).catch(() => {});
}

export default function HomeSectionReorderPopover({ isAdmin, user, onConfigChange }) {
  const [open, setOpen] = useState(false);

  const getInitialConfig = useCallback(() => {
    const saved = loadSectionConfig(user);
    if (saved) return saved;
    return DEFAULT_SECTIONS.map(s => ({ ...s, visible: true }));
  }, [user]);

  const [sections, setSections] = useState(getInitialConfig);

  const persist = useCallback((updated) => {
    setSections(updated);
    saveSectionConfig(updated);
    onConfigChange?.(updated);
  }, [onConfigChange]);

  if (!isAdmin) return null;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(sections);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    persist(reordered);
  };

  const toggleVisible = (id) => {
    persist(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const handleReset = () => {
    persist(DEFAULT_SECTIONS.map(s => ({ ...s, visible: true })));
  };

  return (
    <>
      {/* Floating toggle — bottom-right, above mobile nav */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Reorder home sections"
        className="fixed bottom-24 right-4 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 active:scale-95 transition-all md:bottom-6"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      {/* Popover panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Home section order"
          className="fixed bottom-40 right-4 z-50 w-72 rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden md:bottom-20"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-500" />
              Section Order
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                aria-label="Reset to defaults"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close panel"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drag list */}
          <div className="overflow-y-auto max-h-96">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="home-sections">
                {(provided) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="divide-y divide-gray-100"
                  >
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(drag, snapshot) => (
                          <li
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            className={`flex items-center gap-3 px-4 py-2.5 bg-white transition-colors ${
                              snapshot.isDragging ? 'bg-amber-50 shadow-md rounded-lg' : ''
                            } ${!section.visible ? 'opacity-40' : ''}`}
                          >
                            <span
                              {...drag.dragHandleProps}
                              aria-label="Drag to reorder"
                              className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>
                            <span className="flex-1 text-sm text-gray-700 truncate">
                              {section.label}
                            </span>
                            <button
                              onClick={() => toggleVisible(section.id)}
                              aria-label={section.visible ? `Hide ${section.label}` : `Show ${section.label}`}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 transition-colors"
                            >
                              {section.visible
                                ? <Eye className="w-4 h-4" />
                                : <EyeOff className="w-4 h-4" />
                              }
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <p className="text-[10px] text-gray-400 text-center py-2 border-t border-gray-100">
            Admin only · Drag to reorder · Eye to toggle
          </p>
        </div>
      )}
    </>
  );
}