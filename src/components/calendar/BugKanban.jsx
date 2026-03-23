import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bug, AlertCircle, Clock, CheckCircle2, GripVertical, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

const BUG_STATUSES = {
  new: { label: 'New', icon: AlertCircle, color: 'bg-red-50 text-red-700 border-red-200' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'bg-green-50 text-green-700 border-green-200' },
};

const STATUS_ORDER = ['new', 'in_progress', 'resolved'];

const PRIORITY_COLORS = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-slate-400 text-white',
};

function BugCard({ bug, index, isAdmin, onDelete }) {
  return (
    <Draggable draggableId={bug.id} index={index} isDragDisabled={!isAdmin}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
        >
          <Card className="bg-white border border-slate-200 hover:border-slate-300">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {isAdmin && (
                  <div {...provided.dragHandleProps} className="mt-1 cursor-grab">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm text-slate-800 line-clamp-2">
                      {bug.subject}
                    </h4>
                    <Badge className={`text-xs shrink-0 ${PRIORITY_COLORS[bug.priority] || PRIORITY_COLORS.medium}`}>
                      {bug.priority}
                    </Badge>
                  </div>
                  
                  {bug.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                      {bug.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(bug.created_date).toLocaleDateString()}
                    </span>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                        onClick={() => onDelete(bug)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

function BugColumn({ status, bugs, isAdmin, onDelete }) {
  const config = BUG_STATUSES[status];
  const Icon = config.icon;
  const columnBugs = bugs.filter(b => b.status === status);

  return (
    <div className="flex flex-col flex-1 min-w-[260px]">
      <div className={`flex items-center justify-between p-3 rounded-t-lg border ${config.color}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        <span className="text-xs font-medium opacity-70">{columnBugs.length}</span>
      </div>
      
      <Droppable droppableId={status} isDropDisabled={!isAdmin}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 border-x border-b border-slate-200 rounded-b-lg p-3 space-y-3 min-h-[350px] max-h-[500px] overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50/50' : 'bg-slate-50/50'
            }`}
          >
            {columnBugs.map((bug, index) => (
              <BugCard key={bug.id} bug={bug} index={index} isAdmin={isAdmin} onDelete={onDelete} />
            ))}
            {provided.placeholder}
            {columnBugs.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No bugs
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function BugKanban() {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setIsAdmin(u?.role === 'admin')).catch(() => {});
  }, []);

  const { data: bugs = [], isLoading } = useQuery({
    queryKey: ['bugs'],
    queryFn: () => base44.entities.Feedback.filter({ type: 'bug_report' }, '-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Feedback.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['bugs']),
    onError: () => toast.error('Failed to update bug'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Feedback.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bugs']);
      toast.success('Bug deleted');
    },
    onError: () => toast.error('Failed to delete bug'),
  });

  const handleDragEnd = (result) => {
    if (!result.destination || !isAdmin) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    updateMutation.mutate({
      id: draggableId,
      data: { status: newStatus },
    });
  };

  const handleDelete = (bug) => {
    if (confirm(`Delete bug "${bug.subject}"?`)) {
      deleteMutation.mutate(bug.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <Bug className="w-5 h-5" />
            Bug Tracker
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Drag cards to update status' : 'Track reported bugs and their resolution status'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Badge variant="outline" className="text-xs">
              Admin-only editing
            </Badge>
          )}
          <Button asChild style={{ background: brandColors.navyDeep }}>
            <Link to={createPageUrl('Submit') + '?type=bug'}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Report Bug
            </Link>
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_ORDER.map(status => (
            <BugColumn
              key={status}
              status={status}
              bugs={bugs}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}