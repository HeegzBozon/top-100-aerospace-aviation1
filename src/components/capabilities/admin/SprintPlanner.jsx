
import { useState, useEffect, useMemo } from 'react';
import { Sprint } from '@/entities/Sprint';
import { Feedback } from '@/entities/Feedback';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Target, Users, Diamond, Edit, Star, BrainCircuit, Zap, Trash2, GripVertical, Rocket } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SprintWizard } from '@/components/capabilities/admin';

const Quadrant = ({ title, items, droppableId, bgColor, borderColor }) => (
  <div className={`rounded-lg p-3 ${bgColor}`}>
    <h4 className="font-bold text-gray-700 text-sm mb-3">{title}</h4>
    <Droppable droppableId={droppableId} type="FEEDBACK_ITEM">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[100px] rounded-md border-2 border-dashed ${snapshot.isDraggingOver ? `bg-white/50 ${borderColor}` : `${borderColor} border-opacity-60`}`}
        >
          <div className="p-2 space-y-2">
            {items.length === 0 ? (
                <div className="text-center text-gray-500 py-4 text-xs">
                  No items here
                </div>
            ) : (
                items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-2.5 rounded-lg border bg-white/80 backdrop-blur-sm transition-all shadow-sm hover:shadow-md ${
                                    snapshot.isDragging ? 'shadow-lg scale-105 border-indigo-300' : 'border-gray-200'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div {...provided.dragHandleProps} className="pt-2 text-gray-300 hover:text-gray-500 cursor-grab">
                                        <GripVertical className="w-4 h-4"/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-xs text-gray-800 line-clamp-2">{item.subject}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {item.story_points && (
                                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                                                <Diamond className="w-3 h-3" />
                                                <span>{item.story_points}</span>
                                            </div>
                                        )}
                                        {item.wsjf_score && (
                                            <div className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-sm">
                                                <Star className="w-3 h-3" />
                                                <span>{item.wsjf_score.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Draggable>
                ))
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  </div>
);

const PrioritizedBacklog = ({ items }) => {
  const quadrants = useMemo(() => ({
    q1: items.filter(item => item.quadrant === 'Q1_Urgent_Important').sort((a,b) => (b.wsjf_score || 0) - (a.wsjf_score || 0)),
    q2: items.filter(item => item.quadrant === 'Q2_Important_Not_Urgent').sort((a,b) => (b.wsjf_score || 0) - (a.wsjf_score || 0)),
    q3: items.filter(item => item.quadrant === 'Q3_Urgent_Not_Important').sort((a,b) => (b.wsjf_score || 0) - (a.wsjf_score || 0)),
    q4: items.filter(item => item.quadrant === 'Q4_Neither' || !item.quadrant).sort((a,b) => (b.wsjf_score || 0) - (a.wsjf_score || 0)),
  }), [items]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-4">
        <BrainCircuit className="w-6 h-6 text-indigo-600" />
        <div>
            <h3 className="font-bold text-lg text-gray-800">Prioritized Backlog</h3>
            <p className="text-sm text-gray-500">{items.length} items to be planned</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Quadrant title="Do First (Urgent & Important)" items={quadrants.q1} droppableId="backlog_q1" bgColor="bg-red-50" borderColor="border-red-300" />
        <Quadrant title="Schedule (Important)" items={quadrants.q2} droppableId="backlog_q2" bgColor="bg-blue-50" borderColor="border-blue-300" />
        <Quadrant title="Delegate (Urgent)" items={quadrants.q3} droppableId="backlog_q3" bgColor="bg-yellow-50" borderColor="border-yellow-300" />
        <Quadrant title="Eliminate (Neither)" items={quadrants.q4} droppableId="backlog_q4" bgColor="bg-gray-100" borderColor="border-gray-300" />
      </div>
    </div>
  );
};


const SprintCard = ({ sprint, items, onEditSprint }) => {
  const allocatedPoints = items.reduce((sum, item) => sum + (item.story_points || 0), 0);
  const utilizationPercent = sprint.capacity_points > 0 ? Math.round((allocatedPoints / sprint.capacity_points) * 100) : 0;
  const isOverCapacity = utilizationPercent > 100;
  const isNearCapacity = utilizationPercent > 80;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 min-h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-800">{sprint.name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditSprint(sprint)}
              className="text-gray-400 hover:text-gray-600 h-7 w-7"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            {format(new Date(sprint.start_date), 'MMM d')} - {format(new Date(sprint.end_date), 'MMM d')}
          </div>
        </div>
        <Badge 
          variant={sprint.status === 'active' ? 'default' : 'outline'}
          className={`capitalize ${sprint.status === 'active' ? 'bg-green-600 text-white' : ''}`}
        >
          {sprint.status}
        </Badge>
      </div>

      {/* Capacity Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Capacity</span>
          <span className={`font-bold ${isOverCapacity ? 'text-red-600' : isNearCapacity ? 'text-yellow-600' : 'text-green-600'}`}>
            {allocatedPoints}/{sprint.capacity_points} pts ({utilizationPercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              isOverCapacity ? 'bg-red-500' : isNearCapacity ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>
        {isOverCapacity && (
          <div className="text-xs text-red-600 mt-1">
            Over capacity by {allocatedPoints - sprint.capacity_points} points
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <Droppable droppableId={sprint.id} type="FEEDBACK_ITEM">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-64 rounded-lg border-2 border-dashed p-3 transition-colors flex-1 ${
              snapshot.isDraggingOver 
                ? 'border-indigo-400 bg-indigo-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Drop items here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-2.5 rounded-lg border bg-white/80 backdrop-blur-sm transition-all shadow-sm hover:shadow-md ${
                          snapshot.isDragging ? 'shadow-lg scale-105 border-indigo-300' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                            <div {...provided.dragHandleProps} className="pt-2 text-gray-300 hover:text-gray-500 cursor-grab">
                                <GripVertical className="w-4 h-4"/>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-xs text-gray-800 line-clamp-2">{item.subject}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {item.story_points && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                                        <Diamond className="w-3 h-3" />
                                        <span>{item.story_points}</span>
                                    </div>
                                )}
                                {item.wsjf_score && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-sm">
                                        <Star className="w-3 h-3" />
                                        <span>{item.wsjf_score.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default function SprintPlanner({ feedback, onFeedbackUpdate }) {
  const [sprints, setSprints] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false); // New state for wizard
  const [editingSprint, setEditingSprint] = useState(null);
  const [newSprint, setNewSprint] = useState({
    name: '',
    capacity_points: '40', // Default capacity
    start_date: null,
    end_date: null,
    status: 'planning'
  });
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadSprints();
  }, []);

  const loadSprints = async () => {
    try {
      const allSprints = await Sprint.list('-start_date');
      setSprints(allSprints);
    } catch (error) {
      console.error('Error loading sprints:', error);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!newSprint.name || !newSprint.capacity_points || !newSprint.start_date || !newSprint.end_date) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const sprintData = {
        ...newSprint,
        capacity_points: parseInt(newSprint.capacity_points),
        start_date: newSprint.start_date.toISOString().split('T')[0],
        end_date: newSprint.end_date.toISOString().split('T')[0],
      };

      if (editingSprint) {
        await Sprint.update(editingSprint.id, sprintData);
      } else {
        await Sprint.create(sprintData);
      }
      
      setNewSprint({ name: '', capacity_points: '40', start_date: null, end_date: null, status: 'planning' });
      setShowCreateForm(false);
      setEditingSprint(null);
      loadSprints();
    } catch (error) {
      console.error('Error saving sprint:', error);
      alert('Error saving sprint');
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (!confirm("Are you sure you want to delete this sprint? All assigned items will be moved back to the backlog. This cannot be undone.")) {
      return;
    }
    setProcessingId(sprintId);
    try {
      // First, unassign all feedback items from this sprint
      const itemsInSprint = feedback.filter(item => item.sprint_id === sprintId);
      await Promise.all(itemsInSprint.map(item => Feedback.update(item.id, { sprint_id: null })));
      
      // Then, delete the sprint
      await Sprint.delete(sprintId);
      
      // Finally, refresh all data
      loadSprints();
      if (onFeedbackUpdate) {
        onFeedbackUpdate();
      }
    } catch (error) {
      console.error('Error deleting sprint:', error);
      alert('Error deleting sprint');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint);
    setNewSprint({
      name: sprint.name,
      capacity_points: sprint.capacity_points.toString(),
      start_date: new Date(sprint.start_date),
      end_date: new Date(sprint.end_date),
      status: sprint.status
    });
    setShowCreateForm(true);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      // If dropping into any backlog quadrant, set sprint_id to null
      const newSprintId = destination.droppableId.startsWith('backlog_') ? null : destination.droppableId;
      
      await Feedback.update(draggableId, {
        sprint_id: newSprintId
      });
      
      // Reload feedback data
      if (onFeedbackUpdate) {
        onFeedbackUpdate();
      }
    } catch (error) {
      console.error('Error updating feedback sprint assignment:', error);
      alert('Error moving item');
    }
  };

  const getSprintItems = (sprintId) => {
    return feedback.filter(item => item.sprint_id === sprintId).sort((a,b) => (b.wsjf_score || 0) - (a.wsjf_score || 0));
  };

  const getBacklogItems = () => {
    return feedback.filter(item => !item.sprint_id).sort((a,b) => (b.wsjf_score || 0) - (a.wsjf_score || 0));
  };

  // Updated handlers for SprintWizard
  const handleWizardComplete = async () => {
    // The wizard should have already created the sprint, so we just need to refresh
    setShowWizard(false);
    await loadSprints();
    if (onFeedbackUpdate) {
      onFeedbackUpdate();
    }
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  // Conditional rendering for SprintWizard
  if (showWizard) {
    return (
      <SprintWizard 
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="w-7 h-7 text-indigo-500"/>
              Sprint Planner
            </h2>
            <p className="text-gray-600 mt-1">Plan your upcoming sprints by dragging items from the backlog.</p>
          </div>
          <div className="flex gap-3"> {/* Modified: Wrapped buttons in a flex div */}
            <Button 
              onClick={() => setShowWizard(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Sprint Runner 🚀
            </Button>
            <Button variant="outline" onClick={() => { setShowCreateForm(true); setEditingSprint(null); setNewSprint({ name: '', capacity_points: '40', start_date: null, end_date: null, status: 'planning' }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Sprint
            </Button>
          </div>
        </div>

        {/* Create/Edit Sprint Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingSprint ? 'Edit Sprint' : 'Create New Sprint'}
            </h3>
            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Name</label>
                  <Input
                    value={newSprint.name}
                    onChange={(e) => setNewSprint(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sprint 24.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Pts)</label>
                  <Input
                    type="number"
                    value={newSprint.capacity_points}
                    onChange={(e) => setNewSprint(prev => ({ ...prev, capacity_points: e.target.value }))}
                    placeholder="e.g., 40"
                    required
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Select value={newSprint.status} onValueChange={(value) => setNewSprint(prev => ({...prev, status: value}))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSprint.start_date ? format(newSprint.start_date, 'PPP') : 'Select start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newSprint.start_date}
                        onSelect={(date) => setNewSprint(prev => ({ ...prev, start_date: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newSprint.end_date ? format(newSprint.end_date, 'PPP') : 'Select end date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newSprint.end_date}
                        onSelect={(date) => setNewSprint(prev => ({ ...prev, end_date: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <Button type="submit">
                    {editingSprint ? 'Update Sprint' : 'Create Sprint'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowCreateForm(false);
                    setEditingSprint(null);
                    setNewSprint({ name: '', capacity_points: '40', start_date: null, end_date: null, status: 'planning' });
                  }}>
                    Cancel
                  </Button>
                </div>
                {editingSprint && (
                   <Button 
                    type="button" 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSprint(editingSprint.id)}
                    disabled={processingId === editingSprint.id}
                   >
                     <Trash2 className="w-4 h-4 mr-2"/>
                     Delete
                   </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Sprint Planning Board */}
        <div className="space-y-8">
            {/* Sprints Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sprints.filter(s => s.status !== 'completed').slice(0, 2).map((sprint) => (
                    <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    items={getSprintItems(sprint.id)}
                    onEditSprint={handleEditSprint}
                    />
                ))}
            </div>

            {/* Backlog */}
            <PrioritizedBacklog items={getBacklogItems()} />

            {/* Additional Sprints (if more than 2 non-completed or completed sprints) */}
            {sprints.filter(s => s.status !== 'completed').length > 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sprints.filter(s => s.status !== 'completed').slice(2).map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    items={getSprintItems(sprint.id)}
                    onEditSprint={handleEditSprint}
                  />
                ))}
              </div>
            )}

            {sprints.filter(s => s.status === 'completed').length > 0 && (
              <>
                <h3 className="text-xl font-bold text-gray-800 pt-4">Completed Sprints</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sprints.filter(s => s.status === 'completed').map((sprint) => (
                    <SprintCard
                      key={sprint.id}
                      sprint={sprint}
                      items={getSprintItems(sprint.id)}
                      onEditSprint={handleEditSprint}
                    />
                  ))}
                </div>
              </>
            )}

        </div>

        {sprints.length === 0 && !showCreateForm && !showWizard && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No sprints created yet</h3>
            <p className="text-gray-400 mb-4">Create your first sprint to start planning</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Sprint
            </Button>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
