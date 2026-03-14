import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  GripVertical, Plus, Pencil, Trash2, Loader2, Eye, EyeOff,
  LayoutList, MoreHorizontal, Monitor, Smartphone
} from "lucide-react";
import { iconMap, DefaultIcon } from "@/components/icons";

const DEFAULT_RAIL_ITEMS = [
  { label: "Home", page: "Home", icon: "Home", order: 0, mobile_order: 0, is_enabled: true, is_more_item: false, is_desktop: true, is_mobile: true },
  { label: "Comms", page: "Comms", icon: "MessageCircle", order: 1, mobile_order: 1, is_enabled: true, is_more_item: false, is_desktop: true, is_mobile: true },
  { label: "TOP 100", page: "Top100Women2025", icon: "Trophy", order: 2, mobile_order: 2, is_enabled: true, is_more_item: false, is_desktop: true, is_mobile: true },
  { label: "Play", page: "Arcade", icon: "Gamepad2", order: 3, mobile_order: 3, is_enabled: true, is_more_item: false, is_desktop: true, is_mobile: true },
  { label: "Gather", page: "GatherSpace", icon: "Video", order: 4, mobile_order: 4, is_enabled: true, is_more_item: false, is_desktop: true, is_mobile: true },
  { label: "Saved", page: "MyFavorites", icon: "Bookmark", order: 5, mobile_order: 5, is_enabled: true, is_more_item: false, is_desktop: true, is_mobile: true },
  { label: "Shop", page: "Shop", icon: "Briefcase", order: 6, mobile_order: 6, is_enabled: true, is_more_item: false, is_desktop: true, is_mobile: true },
  { label: "Explore", page: "Arena", icon: "Compass", order: 7, mobile_order: 7, is_enabled: true, is_more_item: true, is_desktop: true, is_mobile: true },
  { label: "Profile", page: "Profile", icon: "User", order: 8, mobile_order: 8, is_enabled: true, is_more_item: true, is_desktop: true, is_mobile: true },
  { label: "Settings", page: "Profile", icon: "Settings", order: 9, mobile_order: 9, is_enabled: true, is_more_item: true, is_desktop: true, is_mobile: true },
];

function IconPreview({ iconName }) {
  const Icon = iconMap[iconName] || DefaultIcon;
  return <Icon className="w-4 h-4" />;
}

function RailItemFormDialog({ item, onClose, onSave, existingCount }) {
  const [form, setForm] = useState({
    label: item?.label ?? "",
    page: item?.page ?? "",
    icon: item?.icon ?? "Home",
    query: item?.query ?? "",
    is_enabled: item?.is_enabled ?? true,
    is_more_item: item?.is_more_item ?? false,
    is_desktop: item?.is_desktop ?? true,
    is_mobile: item?.is_mobile ?? true,
    order: item?.order ?? existingCount,
    mobile_order: item?.mobile_order ?? existingCount,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.page.trim() || !form.icon.trim()) {
      toast({ variant: "destructive", title: "Validation", description: "Label, page, and icon are required." });
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Rail Item" : "Add Rail Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Home" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="page">Page name</Label>
              <Input id="page" value={form.page} onChange={e => setForm(f => ({ ...f, page: e.target.value }))} placeholder="Home" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="icon">Icon name</Label>
              <div className="flex items-center gap-2">
                <Input id="icon" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Home" />
                <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                  <IconPreview iconName={form.icon} />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="query">Query string (optional)</Label>
              <Input id="query" value={form.query} onChange={e => setForm(f => ({ ...f, query: e.target.value }))} placeholder="tab=overview" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm font-medium">Show in "More" menu</span>
            <Switch checked={form.is_more_item} onCheckedChange={v => setForm(f => ({ ...f, is_more_item: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <span className="text-xs font-bold uppercase opacity-50">Desktop</span>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enabled</span>
                <Switch checked={form.is_desktop} onCheckedChange={v => setForm(f => ({ ...f, is_desktop: v }))} />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              <span className="text-xs font-bold uppercase opacity-50">Mobile</span>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enabled</span>
                <Switch checked={form.is_mobile} onCheckedChange={v => setForm(f => ({ ...f, is_mobile: v }))} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50">
            <span className="text-sm font-medium">Global Visibility</span>
            <Switch checked={form.is_enabled} onCheckedChange={v => setForm(f => ({ ...f, is_enabled: v }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {item ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RailItemManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formItem, setFormItem] = useState(null); // null = closed, {} = new, {...} = editing
  const [formOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("desktop"); // desktop, mobile
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.RailItem.list("order");
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const seedDefaults = async () => {
    const confirmed = window.confirm("Seed default rail items? Existing items won't be duplicated by label.");
    if (!confirmed) return;
    const existing = items.map(i => i.label.toLowerCase());
    const toCreate = DEFAULT_RAIL_ITEMS.filter(d => !existing.includes(d.label.toLowerCase()));
    if (!toCreate.length) { toast({ title: "Already seeded", description: "All defaults already exist." }); return; }
    await base44.entities.RailItem.bulkCreate(toCreate);
    toast({ title: "Seeded", description: `${toCreate.length} default items added.` });
    fetch();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    // Sort current items based on the active view
    const currentItemsInView = items
      .filter(i => activeTab === "desktop" ? i.is_desktop !== false : i.is_mobile !== false)
      .sort((a, b) => activeTab === "desktop" ? (a.order - b.order) : (a.mobile_order - b.mobile_order));

    const reordered = Array.from(currentItemsInView);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Update local state by mapping the new order back to the full items list
    setItems(prev => prev.map(item => {
      const newIdx = reordered.findIndex(ri => ri.id === item.id);
      if (newIdx === -1) return item;
      return activeTab === "desktop" ? { ...item, order: newIdx } : { ...item, mobile_order: newIdx };
    }));

    // Persist to DB
    const updates = reordered.map((it, idx) =>
      base44.entities.RailItem.update(it.id, activeTab === "desktop" ? { order: idx } : { mobile_order: idx })
    );
    await Promise.all(updates);
    toast({ title: "Order saved" });
  };

  const handleToggle = async (item) => {
    const next = !item.is_enabled;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_enabled: next } : i));
    await base44.entities.RailItem.update(item.id, { is_enabled: next });
    toast({ title: next ? "Item shown" : "Item hidden", description: item.label });
  };

  const handleSave = async (formData) => {
    if (formItem?.id) {
      await base44.entities.RailItem.update(formItem.id, formData);
      toast({ title: "Updated", description: formItem.label });
    } else {
      await base44.entities.RailItem.create(formData);
      toast({ title: "Created", description: formData.label });
    }
    setFormOpen(false);
    setFormItem(null);
    fetch();
  };

  const handleDelete = async () => {
    await base44.entities.RailItem.delete(deleteTarget.id);
    toast({ title: "Deleted", description: deleteTarget.label });
    setDeleteTarget(null);
    fetch();
  };

  const activeItems = items
    .filter(i => activeTab === "desktop" ? i.is_desktop !== false : i.is_mobile !== false)
    .sort((a, b) => activeTab === "desktop" ? (a.order - b.order) : (a.mobile_order - b.mobile_order));

  const railItems = activeItems.filter(i => !i.is_more_item);
  const moreItems = activeItems.filter(i => i.is_more_item);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Icon Rail</h2>
          <p className="text-sm text-gray-500 mt-0.5">Drag to reorder · toggle eye to hide · edit/delete per item</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-4">
            <button
              className={`flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('desktop')}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              className={`flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('mobile')}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>
          {items.length === 0 && (
            <Button variant="outline" onClick={seedDefaults}>Seed defaults</Button>
          )}
          <Button onClick={() => { setFormItem({}); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add item
          </Button>
        </div>
      </div>

      {/* Rail Items */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <LayoutList className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Main rail</span>
          <Badge variant="secondary">{railItems.length}</Badge>
        </div>
        <ItemList
          items={railItems}
          droppableId="rail"
          onDragEnd={handleDragEnd}
          onToggle={handleToggle}
          onEdit={(it) => { setFormItem(it); setFormOpen(true); }}
          onDelete={(it) => setDeleteTarget(it)}
        />
      </div>

      {/* More Items */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">More menu</span>
          <Badge variant="secondary">{moreItems.length}</Badge>
        </div>
        <ItemList
          items={moreItems}
          droppableId="more"
          onDragEnd={handleDragEnd}
          onToggle={handleToggle}
          onEdit={(it) => { setFormItem(it); setFormOpen(true); }}
          onDelete={(it) => setDeleteTarget(it)}
        />
      </div>

      {/* Form dialog */}
      {formOpen && (
        <RailItemFormDialog
          item={formItem?.id ? formItem : null}
          existingCount={items.length}
          onClose={() => { setFormOpen(false); setFormItem(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>This removes it from the icon rail permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ItemList({ items, droppableId, onDragEnd, onToggle, onEdit, onDelete }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {items.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">No items yet.</p>
            )}
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white transition-shadow ${snapshot.isDragging ? "shadow-lg ring-2 ring-indigo-300" : "shadow-sm"} ${!item.is_enabled ? "opacity-50" : ""}`}
                  >
                    <div {...provided.dragHandleProps} className="cursor-grab text-gray-300 hover:text-gray-500">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <IconPreview iconName={item.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.label}</p>
                      <p className="text-xs text-gray-400 truncate">{item.page}{item.query ? `?${item.query}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onToggle(item)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        title={item.is_enabled ? "Hide" : "Show"}
                      >
                        {item.is_enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
  );
}