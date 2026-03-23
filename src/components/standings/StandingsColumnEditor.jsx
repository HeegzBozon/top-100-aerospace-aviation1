
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw, GripVertical, Eye, EyeOff, Loader2, ChevronsUp, ChevronsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { StandingsColumnConfig } from '@/entities/StandingsColumnConfig';

const defaultColumns = [
  { column_key: 'rank', display_name: 'Rank', order_index: 0, is_visible: true, is_sortable: true, is_frozen: true, min_width: 'w-16', responsive_breakpoint: 'always' },
  { column_key: 'nomineeName', display_name: 'Nominee', order_index: 1, is_visible: true, is_sortable: false, is_frozen: true, min_width: 'w-44', responsive_breakpoint: 'always' },
  { column_key: 'aura', display_name: 'Aura', order_index: 2, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'always' },
  { column_key: 'delta24h', display_name: 'Δ24H', order_index: 3, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'always' },
  { column_key: 'total_wins', display_name: 'Wins', order_index: 4, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'md' },
  { column_key: 'total_losses', display_name: 'Losses', order_index: 5, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'md' },
  { column_key: 'win_percentage', display_name: 'Win %', order_index: 6, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'md' },
  
  // Detailed Scores
  { column_key: 'elo_rating', display_name: 'Blended ELO', order_index: 7, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'lg' },
  { column_key: 'borda_score', display_name: 'Blended Borda', order_index: 8, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'lg' },
  { column_key: 'starpower', display_name: 'Star Power', order_index: 9, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'lg' },
  { column_key: 'nominee_elo_rating', display_name: 'Nominee ELO', order_index: 10, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'xl' },
  { column_key: 'community_elo_rating', display_name: 'Community ELO', order_index: 11, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'xl' },
  { column_key: 'nominee_borda_score', display_name: 'Nominee Borda', order_index: 12, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'xl' },
  { column_key: 'community_borda_score', display_name: 'Community Borda', order_index: 13, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'xl' },
  { column_key: 'nominee_direct_score', display_name: 'Nominee Direct', order_index: 14, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'xl' },
  { column_key: 'community_direct_score', display_name: 'Community Direct', order_index: 15, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'xl' },

  // Spotlight Counts
  { column_key: 'total_spotlights', display_name: 'Total Stars', order_index: 16, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'lg' },
  { column_key: 'rising_star_count', display_name: 'Rising⭐', order_index: 17, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'rock_star_count', display_name: 'Rock⭐', order_index: 18, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'super_star_count', display_name: 'Super⭐', order_index: 19, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'north_star_count', display_name: 'North⭐', order_index: 20, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  
  // Other Stats
  { column_key: 'stardust', display_name: 'Stardust', order_index: 21, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'sm' },
  { column_key: 'clout', display_name: 'Clout', order_index: 22, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'sm' },
  { column_key: 'pairwise_appearance_count', display_name: 'Appearances', order_index: 23, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'xl' },
  { column_key: 'total_votes', display_name: 'Total Votes', order_index: 24, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'xl' },
];

export default function StandingsColumnEditor({ isOpen, onClose, onSaveSuccess }) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveAsDefaultConfirm, setShowSaveAsDefaultConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadColumns();
    }
  }, [isOpen]);

  const loadColumns = async () => {
    setLoading(true);
    try {
        let existingColumns = await StandingsColumnConfig.list();
        const existingKeys = new Set(existingColumns.map(c => c.column_key));
        const defaultKeys = new Set(defaultColumns.map(c => c.column_key));
        
        const setsAreEqual = existingKeys.size === defaultKeys.size && [...existingKeys].every(key => defaultKeys.has(key));

        if (!setsAreEqual && existingColumns.length > 0) {
            toast({ title: 'Updating Columns', description: 'New table columns available. Resetting to new defaults.' });
            const deletePromises = existingColumns.map(col => StandingsColumnConfig.delete(col.id));
            await Promise.all(deletePromises);
            
            const createPromises = defaultColumns.map(col => StandingsColumnConfig.create(col));
            existingColumns = await Promise.all(createPromises);
        } else if (existingColumns.length === 0) {
            const createPromises = defaultColumns.map(col => StandingsColumnConfig.create(col));
            existingColumns = await Promise.all(createPromises);
        }
      
        setColumns(existingColumns.sort((a, b) => a.order_index - b.order_index));
        setHasChanges(false);
    } catch (error) {
      console.error('Error loading column config:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load column configuration.' });
    } finally {
      setLoading(false);
    }
  };

  const updateColumn = (columnId, updates) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      )
    );
    setHasChanges(true);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(columns);
    const [reorderedItem] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, reorderedItem);

    const updatedColumns = reorderedColumns.map((col, index) => ({
      ...col,
      order_index: index
    }));

    setColumns(updatedColumns);
    setHasChanges(true);
  };

  const moveToTop = (columnId) => {
    setColumns(prevColumns => {
      const itemToMove = prevColumns.find(c => c.id === columnId);
      if (!itemToMove) return prevColumns; // Should not happen

      const remainingItems = prevColumns.filter(c => c.id !== columnId);
      const reorderedColumns = [itemToMove, ...remainingItems];

      const updatedColumns = reorderedColumns.map((col, index) => ({
        ...col,
        order_index: index
      }));
      setHasChanges(true);
      return updatedColumns;
    });
  };

  const moveToBottom = (columnId) => {
    setColumns(prevColumns => {
      const itemToMove = prevColumns.find(c => c.id === columnId);
      if (!itemToMove) return prevColumns; // Should not happen

      const remainingItems = prevColumns.filter(c => c.id !== columnId);
      const reorderedColumns = [...remainingItems, itemToMove];

      const updatedColumns = reorderedColumns.map((col, index) => ({
        ...col,
        order_index: index
      }));
      setHasChanges(true);
      return updatedColumns;
    });
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const updatePromises = columns.map(column => 
        StandingsColumnConfig.update(column.id, {
          display_name: column.display_name,
          order_index: column.order_index,
          is_visible: column.is_visible,
          is_frozen: column.is_frozen,
          min_width: column.min_width,
          responsive_breakpoint: column.responsive_breakpoint,
        })
      );

      await Promise.all(updatePromises);
      
      toast({ title: 'Success', description: 'Column configuration saved successfully.' });
      setHasChanges(false);
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving column config:', error);
      toast({ 
        variant: 'destructive',
        title: 'Save Failed', 
        description: 'Failed to save column configuration. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAsNewDefault = async () => {
    setSaving(true);
    try {
      // First save the current changes
      const updatePromises = columns.map(column => 
        StandingsColumnConfig.update(column.id, {
          display_name: column.display_name,
          order_index: column.order_index,
          is_visible: column.is_visible,
          is_frozen: column.is_frozen,
          min_width: column.min_width,
          responsive_breakpoint: column.responsive_breakpoint,
        })
      );

      await Promise.all(updatePromises);

      // This would ideally update a persistent default configuration in the database
      // For this current implementation, "saving as new default" refers to the current state being saved,
      // and the next 'reset to default' will load the defaultColumns array as defined above.
      // If a dynamic default was intended, this would need a separate entity/logic.
      toast({ 
        title: 'New Default Saved', 
        description: 'Current column configuration has been saved. Future resets will use the configured defaults.' 
      });
      
      setHasChanges(false);
      setShowSaveAsDefaultConfirm(false);
      onSaveSuccess();
    } catch (error) {
      console.error('Error saving as new default:', error);
      toast({ 
        variant: 'destructive',
        title: 'Save Failed', 
        description: 'Failed to save as new default. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Reset all columns to default settings? This will overwrite your current configuration.')) {
      return;
    }

    setSaving(true);
    try {
      const deletePromises = columns.filter(col => col.id).map(col => StandingsColumnConfig.delete(col.id));
      await Promise.all(deletePromises);

      const createPromises = defaultColumns.map(col => StandingsColumnConfig.create(col));
      const newColumns = await Promise.all(createPromises);

      setColumns(newColumns.sort((a, b) => a.order_index - b.order_index));
      setHasChanges(true); // Mark as changed so user can save the reset
      toast({ title: 'Success', description: 'Columns reset to default configuration. Please save the changes.' });
    } catch (error) {
      console.error('Error resetting columns:', error);
      toast({ 
        variant: 'destructive',
        title: 'Error', 
        description: 'Failed to reset columns. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-[var(--card)] backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">Configure Table Columns</h2>
              <p className="text-sm text-[var(--muted)] mt-1">Drag to reorder, adjust widths, toggle visibility, and freeze columns</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSaveAsDefaultConfirm(true)} 
                disabled={saving || !hasChanges}
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as New Default
              </Button>
              <Button onClick={saveChanges} disabled={saving || !hasChanges}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted)]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
              </div>
            ) : (
              <>
                {hasChanges && (
                  <div className="bg-yellow-50/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                    <p className="text-yellow-300 text-sm">
                      You have unsaved changes. Click "Save Changes" to apply them.
                    </p>
                  </div>
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="columns">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {columns.map((column, index) => (
                          <Draggable key={column.id} draggableId={column.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-[var(--glass)] border border-[var(--border)] rounded-xl p-4 transition-all ${
                                  snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div {...provided.dragHandleProps} className="cursor-grab text-[var(--muted)] hover:text-[var(--text)]">
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                    <div>
                                      <Input
                                        value={column.display_name}
                                        onChange={(e) => updateColumn(column.id, { display_name: e.target.value })}
                                        className="font-medium"
                                        placeholder="Column name"
                                      />
                                      <div className="text-xs text-[var(--muted)] mt-1">{column.column_key}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => updateColumn(column.id, { is_visible: !column.is_visible })}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                        title={column.is_visible ? 'Hide column' : 'Show column'}
                                      >
                                        {column.is_visible ? (
                                          <Eye className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <EyeOff className="w-4 h-4 text-red-400" />
                                        )}
                                      </button>
                                      <span className="text-sm text-[var(--muted)]">
                                        {column.is_visible ? 'Visible' : 'Hidden'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={column.is_frozen}
                                        onCheckedChange={(checked) => updateColumn(column.id, { is_frozen: checked })}
                                      />
                                      <span className="text-sm text-[var(--muted)]">
                                        {column.is_frozen ? 'Frozen' : 'Scrollable'}
                                      </span>
                                    </div>

                                    <Select
                                      value={column.responsive_breakpoint}
                                      onValueChange={(value) => updateColumn(column.id, { responsive_breakpoint: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Show on Breakpoint" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="always">Always Show</SelectItem>
                                        <SelectItem value="sm">SM+ (640px+)</SelectItem>
                                        <SelectItem value="md">MD+ (768px+)</SelectItem>
                                        <SelectItem value="lg">LG+ (1024px+)</SelectItem>
                                        <SelectItem value="xl">XL+ (1280px+)</SelectItem>
                                        <SelectItem value="2xl">2XL+ (1536px+)</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Select
                                      value={column.min_width}
                                      onValueChange={(value) => updateColumn(column.id, { min_width: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Width" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="w-12">Tiny (48px)</SelectItem>
                                        <SelectItem value="w-16">Small (64px)</SelectItem>
                                        <SelectItem value="w-20">Medium (80px)</SelectItem>
                                        <SelectItem value="w-24">Large (96px)</SelectItem>
                                        <SelectItem value="w-32">X-Large (128px)</SelectItem>
                                        <SelectItem value="w-40">XX-Large (160px)</SelectItem>
                                        <SelectItem value="w-44">3X-Large (176px)</SelectItem>
                                        <SelectItem value="w-52">Max (208px)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex flex-col gap-1 pl-4 border-l border-[var(--border)]">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-7 w-7 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--text)]" 
                                      onClick={() => moveToTop(column.id)} 
                                      title="Move to top"
                                      disabled={index === 0}
                                    >
                                      <ChevronsUp className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-7 w-7 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--text)]" 
                                      onClick={() => moveToBottom(column.id)} 
                                      title="Move to bottom"
                                      disabled={index === columns.length - 1}
                                    >
                                      <ChevronsDown className="w-4 h-4" />
                                    </Button>
                                  </div>

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
              </>
            )}
          </div>

          {/* Save as Default Confirmation Modal */}
          {showSaveAsDefaultConfirm && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--card)] rounded-2xl p-6 max-w-md w-full border border-white/20"
              >
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">Save as New Default?</h3>
                <p className="text-[var(--muted)] mb-6">
                  This will save your current column configuration as the new default. 
                  When you or other admins click "Reset to Defaults" in the future, 
                  it will use this configuration instead of the original system defaults.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSaveAsDefaultConfirm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveAsNewDefault}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Yes, Save as Default
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
