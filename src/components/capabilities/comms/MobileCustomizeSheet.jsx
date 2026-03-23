import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Sun, Moon, List, MessageSquare, Bookmark, Settings } from "lucide-react";
import { brandColors } from "@/components/core/brandTheme";
import { getMobileTheme } from "@/components/core/commsUtils";

const ICON_MAP = { List, MessageSquare, Bookmark, Settings };

const ITEMS_CONFIG = {
  index:    { icon: 'List',          label: 'Index' },
  threads:  { icon: 'MessageSquare', label: 'Threads' },
  later:    { icon: 'Bookmark',      label: 'Saved' },
  settings: { icon: 'Settings',      label: 'Settings' },
};

export default function MobileCustomizeSheet({
  open, onOpenChange,
  isDarkMode, onDarkModeChange,
  itemOrder, onOrderChange,
  enabledItems, onEnabledChange,
}) {
  const theme = getMobileTheme(isDarkMode, brandColors);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(itemOrder);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    onOrderChange(items);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-0 px-0 pb-8"
        style={{ background: isDarkMode ? brandColors.navyMid : brandColors.cream, maxHeight: '70vh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }} />
        </div>

        <SheetHeader className="px-5 pb-4">
          <SheetTitle style={{ color: theme.text }} className="text-left">Customize Home</SheetTitle>
          <p className="text-sm text-left" style={{ color: theme.textMuted }}>Toggle quick views in Home</p>
        </SheetHeader>

        <div className="space-y-1 px-3">
          {/* Dark Mode Toggle */}
          <div
            className="flex items-center justify-between px-3 py-3 rounded-xl"
            style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
          >
            <div className="flex items-center gap-3">
              {isDarkMode
                ? <Moon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
                : <Sun className="w-5 h-5" style={{ color: theme.text }} />
              }
              <span className="font-medium" style={{ color: theme.text }}>Dark Mode</span>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={onDarkModeChange} className="data-[state=checked]:bg-green-600" />
          </div>

          <div className="h-px my-3" style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />

          {/* Draggable Items */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="customize-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                  {itemOrder.map((key, index) => {
                    const item = ITEMS_CONFIG[key];
                    const Icon = ICON_MAP[item.icon];
                    return (
                      <Draggable key={key} draggableId={key} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center justify-between px-3 py-3 rounded-xl"
                            style={{
                              ...provided.draggableProps.style,
                              background: snapshot.isDragging
                                ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')
                                : 'transparent',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-5 h-5" style={{ color: theme.textMuted }} />
                              </div>
                              <Icon className="w-5 h-5" style={{ color: theme.textMuted }} />
                              <span className="font-medium" style={{ color: theme.text }}>{item.label}</span>
                            </div>
                            <Switch
                              checked={enabledItems[key]}
                              onCheckedChange={(checked) => onEnabledChange(key, checked)}
                              className="data-[state=checked]:bg-green-600"
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </SheetContent>
    </Sheet>
  );
}