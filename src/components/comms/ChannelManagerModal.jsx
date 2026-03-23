import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Lock, Megaphone, Trash2, Edit, Plus, Loader2, X, GripVertical, FolderPlus, ChevronDown, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

const ICONS = ['📢', '💬', '👋', '❓', '✨', '🚀', '🎯', '💡', '🔥', '⭐'];
const CATEGORY_ICONS = ['📁', '🏷️', '📌', '🗂️', '🌐', '🔒', '💼', '🎪', '⚙️', '🎨'];

const EMPTY_CHANNEL_FORM = {
  name: '', description: '', is_private: false, is_readonly: false,
  channel_category: 'custom', icon: '💬', order: 0, category_id: '',
};

const EMPTY_CATEGORY_FORM = { name: '', icon: '📁', color: '#4a90b8' };

// ─── Category Form ────────────────────────────────────────────────────────────
function CategoryForm({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial || EMPTY_CATEGORY_FORM);
  return (
    <div className="mb-3 p-3 rounded-lg border space-y-3 bg-gray-50" style={{ borderColor: `${brandColors.navyDeep}20` }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>
          {initial?.id ? 'Edit Category' : 'New Category'}
        </span>
        <button onClick={onCancel}><X className="w-4 h-4 text-gray-400" /></button>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs">Name</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Engineering" className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Color</Label>
          <input type="color" value={form.color || '#4a90b8'} onChange={e => setForm({ ...form, color: e.target.value })}
            className="h-8 w-14 rounded border cursor-pointer" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Icon</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {CATEGORY_ICONS.map(icon => (
            <button key={icon} onClick={() => setForm({ ...form, icon })}
              className={cn("w-7 h-7 rounded text-base flex items-center justify-center hover:bg-gray-200", form.icon === icon && "bg-blue-100 ring-2 ring-blue-400")}>
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={isSaving || !form.name.trim()} onClick={() => onSave(form)}
          style={{ background: brandColors.goldPrestige }}>
          {isSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}

// ─── Channel Form ─────────────────────────────────────────────────────────────
function ChannelForm({ initial, categories, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial || EMPTY_CHANNEL_FORM);
  return (
    <div className="mb-4 p-4 rounded-lg border space-y-4" style={{ borderColor: `${brandColors.navyDeep}20` }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: brandColors.navyDeep }}>
          {initial?.id ? 'Edit Channel' : 'New Channel'}
        </h3>
        <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="general-discussion" />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="What's this channel about?" rows={2} />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category_id || '__none__'} onValueChange={v => setForm({ ...form, category_id: v === '__none__' ? '' : v })}>
            <SelectTrigger><SelectValue placeholder="Uncategorized" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— Uncategorized —</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {ICONS.map(icon => (
              <button key={icon} onClick={() => setForm({ ...form, icon })}
                className={cn("w-7 h-7 rounded flex items-center justify-center text-base hover:bg-gray-100", form.icon === icon && "bg-blue-100 ring-2 ring-blue-400")}>
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2 flex gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={form.is_private} onCheckedChange={v => setForm({ ...form, is_private: v })} id="priv" />
            <Label htmlFor="priv">Private</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_readonly} onCheckedChange={v => setForm({ ...form, is_readonly: v })} id="ro" />
            <Label htmlFor="ro">Read-only</Label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={isSaving || !form.name.trim()} onClick={() => onSave(form)}
          style={{ background: brandColors.goldPrestige }}>
          {isSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          {initial?.id ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}

// ─── Channel Row ──────────────────────────────────────────────────────────────
function ChannelRow({ channel, index, onEdit, onDelete, onToggleHide, isDeleting }) {
  return (
    <Draggable draggableId={channel.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "flex items-center gap-2 p-2.5 rounded-lg border transition-colors",
            snapshot.isDragging ? "bg-blue-50 shadow-lg" : "bg-white hover:bg-gray-50",
            channel.is_hidden && "opacity-60 bg-gray-50"
          )}
          style={{ borderColor: `${brandColors.navyDeep}15`, ...provided.draggableProps.style }}
        >
          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
            <GripVertical className="w-4 h-4" />
          </div>
          <span className="text-lg">{channel.icon || '💬'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm" style={{ color: brandColors.navyDeep }}>#{channel.name}</span>
              {channel.is_private && <Lock className="w-3 h-3 text-gray-400" />}
              {channel.is_readonly && <Megaphone className="w-3 h-3 text-amber-500" />}
              {channel.is_hidden && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">Hidden</span>}
              {channel.is_default && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">Default</span>}
            </div>
            {channel.description && <p className="text-xs text-gray-400 truncate">{channel.description}</p>}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600" onClick={() => onToggleHide(channel)}>
              {channel.is_hidden ? '👁️' : '🚫'}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(channel)}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(channel)} disabled={isDeleting}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({ category, channels, index: catIndex, onEditCategory, onDeleteCategory, onEditChannel, onDeleteChannel, onToggleHide, isDeleting }) {
  const [collapsed, setCollapsed] = useState(false);
  const isUncategorized = category.id === '__uncategorized__';

  return (
    <Draggable draggableId={`cat-${category.id}`} index={catIndex} isDragDisabled={isUncategorized}>
      {(catProvided, catSnapshot) => (
        <div
          ref={catProvided.innerRef}
          {...catProvided.draggableProps}
          className={cn("rounded-lg border mb-3", catSnapshot.isDragging && "shadow-lg opacity-90")}
          style={{ borderColor: `${brandColors.navyDeep}20` }}
        >
          {/* Category Header */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-t-lg" style={{ background: `${brandColors.navyDeep}08` }}>
            {!isUncategorized && (
              <div {...catProvided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-1.5 flex-1">
              {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              <span className="text-base">{category.icon}</span>
              <span className="font-semibold text-sm" style={{ color: category.color || brandColors.navyDeep }}>
                {category.name}
              </span>
              <span className="text-xs text-gray-400 ml-1">({channels.length})</span>
            </button>
            {!isUncategorized && (
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditCategory(category)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50"
                  onClick={() => onDeleteCategory(category)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Droppable channel list */}
          {!collapsed && (
            <Droppable droppableId={category.id} type="CHANNEL">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "p-2 space-y-1.5 min-h-[48px] rounded-b-lg transition-colors",
                    snapshot.isDraggingOver && "bg-blue-50"
                  )}
                >
                  {channels.map((ch, idx) => (
                            <ChannelRow key={ch.id} channel={ch} index={idx}
                              onEdit={onEditChannel} onDelete={onDeleteChannel} onToggleHide={onToggleHide} isDeleting={isDeleting} />
                          ))}
                  {channels.length === 0 && !snapshot.isDraggingOver && (
                    <p className="text-center text-xs text-gray-300 py-3">Drop channels here</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ChannelManagerModal({ open, onClose }) {
  const [editingChannel, setEditingChannel] = useState(null);
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['admin-channels'],
    queryFn: () => base44.entities.Conversation.filter({ type: 'channel' }, 'order', 200),
    enabled: open,
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['channel-categories'],
    queryFn: () => base44.entities.ChannelCategory.list('order', 100),
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-channels'] });
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  // ── Channel mutations ──
  const createChannelMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Conversation.create({ type: 'channel', ...data, participants: [user.email], owner_email: user.email });
    },
    onSuccess: () => { toast.success('Channel created'); invalidate(); setShowChannelForm(false); setEditingChannel(null); },
    onError: () => toast.error('Failed to create channel'),
  });

  const updateChannelMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Conversation.update(id, data),
    onSuccess: () => { toast.success('Channel updated'); invalidate(); setShowChannelForm(false); setEditingChannel(null); },
    onError: () => toast.error('Failed to update channel'),
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (id) => {
      const msgs = await base44.entities.Message.filter({ conversation_id: id });
      for (const m of msgs) await base44.entities.Message.delete(m.id);
      return base44.entities.Conversation.delete(id);
    },
    onSuccess: () => { toast.success('Channel deleted'); invalidate(); },
    onError: () => toast.error('Failed to delete channel'),
  });

  // ── Category mutations ──
  const createCategoryMutation = useMutation({
    mutationFn: (data) => base44.entities.ChannelCategory.create({ ...data, order: categories.length }),
    onSuccess: () => {
      toast.success('Category created');
      queryClient.invalidateQueries({ queryKey: ['channel-categories'] });
      setShowCategoryForm(false);
    },
    onError: () => toast.error('Failed to create category'),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChannelCategory.update(id, data),
    onSuccess: () => {
      toast.success('Category updated');
      queryClient.invalidateQueries({ queryKey: ['channel-categories'] });
      setEditingCategory(null);
    },
    onError: () => toast.error('Failed to update category'),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (cat) => {
      // Move channels in this category to uncategorized
      const affectedChannels = channels.filter(ch => ch.category_id === cat.id);
      await Promise.all(affectedChannels.map(ch => base44.entities.Conversation.update(ch.id, { category_id: '' })));
      return base44.entities.ChannelCategory.delete(cat.id);
    },
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['channel-categories'] });
      invalidate();
    },
    onError: () => toast.error('Failed to delete category'),
  });

  // ── Drag & Drop ──
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    if (type === 'CATEGORY') {
      // Reorder categories
      const reordered = Array.from(categories);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      queryClient.setQueryData(['channel-categories'], reordered);
      await Promise.all(reordered.map((cat, idx) => base44.entities.ChannelCategory.update(cat.id, { order: idx })));
      return;
    }

    if (type === 'CHANNEL') {
      const srcCatId = source.droppableId;
      const dstCatId = destination.droppableId;
      const channelId = draggableId;

      // Optimistically reorder channels in cache
      const updatedChannels = Array.from(channels);
      const channelIdx = updatedChannels.findIndex(c => c.id === channelId);
      if (channelIdx === -1) return;
      const [movedChannel] = updatedChannels.splice(channelIdx, 1);
      movedChannel.category_id = dstCatId === '__uncategorized__' ? '' : dstCatId;
      updatedChannels.splice(destination.index, 0, movedChannel);
      queryClient.setQueryData(['admin-channels'], updatedChannels);

      // Persist
      await base44.entities.Conversation.update(channelId, {
        category_id: dstCatId === '__uncategorized__' ? '' : dstCatId,
        order: destination.index,
      });
      // Reorder siblings
      const siblings = updatedChannels.filter(c =>
        (c.category_id || '') === (dstCatId === '__uncategorized__' ? '' : dstCatId)
      );
      await Promise.all(siblings.map((ch, idx) => base44.entities.Conversation.update(ch.id, { order: idx })));
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  };

  const handleSaveChannel = (form) => {
    if (editingChannel) updateChannelMutation.mutate({ id: editingChannel.id, data: form });
    else createChannelMutation.mutate(form);
  };

  const handleSaveCategory = (form) => {
    if (editingCategory?.id) updateCategoryMutation.mutate({ id: editingCategory.id, data: form });
    else createCategoryMutation.mutate(form);
  };

  const handleEditChannel = (ch) => { setEditingChannel(ch); setShowChannelForm(true); };
  const handleDeleteChannel = (ch) => {
    if (confirm(`Delete #${ch.name}? This cannot be undone.`)) deleteChannelMutation.mutate(ch.id);
  };
  const handleToggleHideChannel = (ch) => {
    updateChannelMutation.mutate({ id: ch.id, data: { is_hidden: !ch.is_hidden } });
  };
  const handleEditCategory = (cat) => { setEditingCategory(cat); setShowCategoryForm(true); };
  const handleDeleteCategory = (cat) => {
    if (confirm(`Delete category "${cat.name}"? Channels inside will become uncategorized.`))
      deleteCategoryMutation.mutate(cat);
  };

  // Group channels by category
  const grouped = {};
  categories.forEach(cat => { grouped[cat.id] = []; });
  grouped['__uncategorized__'] = [];
  channels.forEach(ch => {
    const key = ch.category_id && grouped[ch.category_id] !== undefined ? ch.category_id : '__uncategorized__';
    grouped[key].push(ch);
  });
  // Sort within groups by order
  Object.keys(grouped).forEach(k => grouped[k].sort((a, b) => (a.order || 0) - (b.order || 0)));

  const uncategorizedChannels = grouped['__uncategorized__'] || [];
  const categorySections = categories.map((cat, i) => ({ ...cat, _index: i }));

  const isLoading = channelsLoading || catsLoading;
  const isSavingChannel = createChannelMutation.isPending || updateChannelMutation.isPending;
  const isSavingCategory = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle style={{ color: brandColors.navyDeep }}>Channel Manager</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-3">
          {/* Action Buttons */}
          {!showChannelForm && !showCategoryForm && (
            <div className="flex gap-2">
              <Button onClick={() => { setShowChannelForm(true); setEditingChannel(null); }} className="flex-1 gap-2"
                style={{ background: brandColors.navyDeep }}>
                <Plus className="w-4 h-4" /> Create Channel
              </Button>
              <Button onClick={() => { setShowCategoryForm(true); setEditingCategory(null); }} variant="outline" className="gap-2">
                <FolderPlus className="w-4 h-4" /> Add Category
              </Button>
            </div>
          )}

          {/* Category Form */}
          {showCategoryForm && (
            <CategoryForm
              initial={editingCategory}
              onSave={handleSaveCategory}
              onCancel={() => { setShowCategoryForm(false); setEditingCategory(null); }}
              isSaving={isSavingCategory}
            />
          )}

          {/* Channel Form */}
          {showChannelForm && (
            <ChannelForm
              initial={editingChannel}
              categories={categories}
              onSave={handleSaveChannel}
              onCancel={() => { setShowChannelForm(false); setEditingChannel(null); }}
              isSaving={isSavingChannel}
            />
          )}

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: brandColors.goldPrestige }} />
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                {/* Top-level uncategorized channels (no category) */}
                <Droppable droppableId="__uncategorized__" type="CHANNEL">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "space-y-1.5 mb-3 min-h-[8px] transition-colors rounded-lg",
                        snapshot.isDraggingOver && "bg-blue-50 p-2"
                      )}
                    >
                      {uncategorizedChannels.map((ch, idx) => (
                        <ChannelRow key={ch.id} channel={ch} index={idx}
                          onEdit={handleEditChannel} onDelete={handleDeleteChannel} onToggleHide={handleToggleHideChannel} isDeleting={deleteChannelMutation.isPending} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Category sections */}
                <Droppable droppableId="categories" type="CATEGORY" direction="vertical">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {categorySections.map((cat, i) => (
                        <CategorySection
                           key={cat.id}
                           category={cat}
                           channels={grouped[cat.id] || []}
                           index={i}
                           onEditCategory={handleEditCategory}
                           onDeleteCategory={handleDeleteCategory}
                           onEditChannel={handleEditChannel}
                           onDeleteChannel={handleDeleteChannel}
                           onToggleHide={handleToggleHideChannel}
                           isDeleting={deleteChannelMutation.isPending}
                         />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}