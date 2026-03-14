
import React, { useState, useEffect, useCallback } from 'react';
import { StandingsColumnConfig } from '@/entities/StandingsColumnConfig';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Loader2, RotateCcw, Save, Snowflake } from 'lucide-react';

const defaultColumns = [
  { column_key: 'rank', display_name: 'Rank', order_index: 0, is_visible: true, is_sortable: true, is_frozen: true, min_width: 'w-16', responsive_breakpoint: 'always' },
  { column_key: 'nomineeName', display_name: 'Nominee', order_index: 1, is_visible: true, is_sortable: false, is_frozen: true, min_width: 'w-44', responsive_breakpoint: 'always' },
  { column_key: 'aura', display_name: 'Aura', order_index: 2, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'always' },
  { column_key: 'delta24h', display_name: 'Δ24H', order_index: 3, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'always' },
  { column_key: 'total_wins', display_name: 'Wins', order_index: 4, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'md' },
  { column_key: 'total_losses', display_name: 'Losses', order_index: 5, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'md' },
  { column_key: 'win_percentage', display_name: 'Win %', order_index: 6, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'md' },
  { column_key: 'elo_rating', display_name: 'ELO', order_index: 7, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'lg' },
  { column_key: 'borda_score', display_name: 'Borda', order_index: 8, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'lg' },
  { column_key: 'direct_vote_count', display_name: 'Direct Votes', order_index: 9, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'lg' },
  { column_key: 'starpower', display_name: 'Star Power', order_index: 10, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'xl' },
  { column_key: 'stardust', display_name: 'Stardust', order_index: 11, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'clout', display_name: 'Clout', order_index: 12, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'endorsements', display_name: 'Endorsements', order_index: 13, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'sm' },
  // New V1 spotlight columns
  { column_key: 'rising_star_count', display_name: 'Rising⭐', order_index: 14, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'rock_star_count', display_name: 'Rock⭐', order_index: 15, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'super_star_count', display_name: 'Super⭐', order_index: 16, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'north_star_count', display_name: 'North⭐', order_index: 17, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-16', responsive_breakpoint: 'xl' },
  { column_key: 'total_spotlights', display_name: 'Total Stars', order_index: 18, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'lg' },
  { column_key: 'pairwise_appearance_count', display_name: 'Appearances', order_index: 19, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'xl' },
  { column_key: 'total_votes', display_name: 'Total Votes', order_index: 20, is_visible: false, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'xl' }
];

export default function StandingsColumnManager() {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadColumns();
  }, []);

  const loadColumns = async () => {
    setLoading(true);
    try {
      // First, delete all existing columns to reset
      const existingColumns = await StandingsColumnConfig.list();
      if (existingColumns.length > 0) {
        const deletePromises = existingColumns.map(col => StandingsColumnConfig.delete(col.id));
        await Promise.all(deletePromises);
      }
      
      // Create fresh columns with new defaults
      const createPromises = defaultColumns.map(col => StandingsColumnConfig.create(col));
      const newColumns = await Promise.all(createPromises);
      
      setColumns(newColumns.sort((a, b) => a.order_index - b.order_index));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading column config:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to load column configuration. Please refresh and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Updates column state in memory and marks for unsaved changes
  const updateColumn = useCallback((columnId, updates) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(columns);
    const [reorderedItem] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, reorderedItem);

    // Update order_index for all columns in memory only
    const updatedColumns = reorderedColumns.map((col, index) => ({
      ...col,
      order_index: index
    }));

    setColumns(updatedColumns);
    setHasUnsavedChanges(true);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const updatePromises = columns.map(async (column) => {
        try {
          await StandingsColumnConfig.update(column.id, {
            display_name: column.display_name,
            order_index: column.order_index,
            is_visible: column.is_visible,
            is_frozen: column.is_frozen,
            min_width: column.min_width,
            responsive_breakpoint: column.responsive_breakpoint,
          });
          return { status: 'fulfilled', value: { success: true, columnKey: column.column_key } };
        } catch (error) {
          console.error(`Failed to update column ${column.column_key}:`, error);
          return { status: 'rejected', reason: error, columnKey: column.column_key };
        }
      });

      const results = await Promise.all(updatePromises); // Use Promise.all with custom status objects

      const fulfilled = results.filter(result => result.status === 'fulfilled');
      const rejected = results.filter(result => result.status === 'rejected');

      if (rejected.length === 0) {
        toast({ title: 'Success', description: 'Column configuration saved successfully.' });
        setHasUnsavedChanges(false);
      } else if (fulfilled.length > 0) {
        toast({ 
          variant: 'destructive',
          title: 'Partial Save', 
          description: `${fulfilled.length} columns saved, ${rejected.length} failed. Please review and try again.` 
        });
      } else {
        toast({ 
          variant: 'destructive',
          title: 'Save Failed', 
          description: 'Failed to save column configuration. Please check your connection and try again.' 
        });
      }
    } catch (error) {
      console.error('Error saving column config:', error);
      toast({ 
        variant: 'destructive',
        title: 'Network Error', 
        description: 'An unexpected error occurred while saving. Please check your connection and try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all columns to default settings? This will overwrite your current configuration and cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      // Delete all existing configurations
      // Filter out columns that don't have an ID (e.g., newly added ones that haven't been saved yet)
      const deletePromises = columns.filter(col => col.id).map(col => StandingsColumnConfig.delete(col.id));
      await Promise.all(deletePromises);

      // Recreate with defaults
      const createPromises = defaultColumns.map(col => StandingsColumnConfig.create(col));
      const newColumns = await Promise.all(createPromises);

      setColumns(newColumns.sort((a, b) => a.order_index - b.order_index));
      setHasUnsavedChanges(false);
      toast({ title: 'Success', description: 'Columns reset to default configuration.' });
    } catch (error) {
      console.error('Error resetting columns:', error);
      toast({ 
        variant: 'destructive',
        title: 'Error', 
        description: 'Failed to reset columns. Please refresh and try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          <span className="mt-2 text-[var(--muted)]">Loading column configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">Standings Table Columns</h2>
          <p className="text-[var(--muted)] mt-1">Configure the columns shown in the standings table</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            disabled={saving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={saveChanges}
            disabled={saving || !hasUnsavedChanges}
            className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
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
                      className={`bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 transition-all ${
                        snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
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

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={column.is_visible}
                                onCheckedChange={(checked) => updateColumn(column.id, { is_visible: checked })}
                              />
                              <span className="text-sm text-[var(--muted)]">Visible</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={column.is_frozen}
                                onCheckedChange={(checked) => updateColumn(column.id, { is_frozen: checked })}
                              />
                              <Snowflake className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-[var(--muted)]">Frozen</span>
                            </div>
                          </div>

                          <Select
                            value={column.responsive_breakpoint}
                            onValueChange={(value) => updateColumn(column.id, { responsive_breakpoint: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="w-12">Very Small (48px)</SelectItem>
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
    </div>
  );
}
