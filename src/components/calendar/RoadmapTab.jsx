import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, ChevronUp, MessageSquare, Inbox, Clock, PlayCircle, CheckCircle2, Plus, GripVertical, Trash2, Edit2, HelpCircle, Lightbulb, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import RoadmapItemForm from './RoadmapItemForm';
import BugKanban from './BugKanban';
import RoadmapListView from './RoadmapListView';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const STATUS_CONFIG = {
  backlog: { 
    label: 'Backlog', 
    icon: Inbox, 
    color: 'bg-slate-100 text-slate-700 border-slate-200' 
  },
  next_up: { 
    label: 'Next Up', 
    icon: Clock, 
    color: 'bg-amber-50 text-amber-700 border-amber-200' 
  },
  in_progress: { 
    label: 'In Progress', 
    icon: PlayCircle, 
    color: 'bg-blue-50 text-blue-700 border-blue-200' 
  },
  done: { 
    label: 'Done', 
    icon: CheckCircle2, 
    color: 'bg-green-50 text-green-700 border-green-200' 
  },
};

const STATUS_ORDER = ['backlog', 'next_up', 'in_progress', 'done'];

// Educational content
function RoadmapOnboarding({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-5 rounded-xl border-2 border-dashed"
      style={{ borderColor: brandColors.goldPrestige, background: `${brandColors.goldPrestige}10` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: brandColors.goldPrestige }}
          >
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2" style={{ color: brandColors.navyDeep }}>
              Welcome to the Community Roadmap! 🚀
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              This is where you shape the future of TOP 100. Here's how it works:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold" style={{ color: brandColors.navyDeep }}>1</div>
                <div>
                  <span className="font-semibold" style={{ color: brandColors.navyDeep }}>Submit Ideas</span>
                  <p className="text-slate-500 text-xs mt-0.5">Click "Add Item" to suggest features or improvements</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold" style={{ color: brandColors.navyDeep }}>2</div>
                <div>
                  <span className="font-semibold" style={{ color: brandColors.navyDeep }}>Vote on Items</span>
                  <p className="text-slate-500 text-xs mt-0.5">Upvote features you want to see built first</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold" style={{ color: brandColors.navyDeep }}>3</div>
                <div>
                  <span className="font-semibold" style={{ color: brandColors.navyDeep }}>Track Progress</span>
                  <p className="text-slate-500 text-xs mt-0.5">Watch items move from Backlog → Done</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={onDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function ColumnTooltip({ status }) {
  const tooltips = {
    backlog: "Ideas and features waiting to be prioritized. Vote to help us decide what to build next!",
    next_up: "Approved and scheduled for upcoming development. These are coming soon!",
    in_progress: "Currently being built by the team. Check back for updates!",
    done: "Completed and shipped! These features are now live in the platform.",
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="opacity-60 hover:opacity-100 transition-opacity">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {tooltips[status]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function RoadmapCard({ item, index, onUpvote, isUpvoting, hasUpvoted, isAdmin, onEdit, onDelete }) {
  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={!isAdmin}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
        >
          <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                {isAdmin && (
                  <div {...provided.dragHandleProps} className="mt-1 cursor-grab">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                      {item.title}
                    </h4>
                    {isAdmin && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(item)}>
                          <Edit2 className="w-3 h-3 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onDelete(item)}>
                          <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.category && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5"
                          style={{ borderColor: brandColors.goldPrestige, color: brandColors.navyDeep }}
                        >
                          {item.category}
                        </Badge>
                      )}
                      {item.type && item.type !== 'feature' && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {item.type}
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpvote(item)}
                      disabled={isUpvoting}
                      className={`gap-1 px-2 py-1 h-auto ${hasUpvoted ? 'text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <ChevronUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{item.upvotes || 0}</span>
                    </Button>
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

function RoadmapColumn({ status, items, onUpvote, isUpvoting, userEmail, isAdmin, onEdit, onDelete }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const columnItems = items
    .filter(item => item.status === status)
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  
  return (
    <div className="flex flex-col flex-1 min-w-[260px]">
      <div className={`flex items-center justify-between p-3 rounded-t-lg border ${config.color}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-semibold text-sm">{config.label}</span>
          <ColumnTooltip status={status} />
        </div>
        <span className="text-xs font-medium opacity-70">{columnItems.length}</span>
      </div>
      
      <Droppable droppableId={status} isDropDisabled={!isAdmin}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 border-x border-b border-slate-200 rounded-b-lg p-3 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50/50' : 'bg-slate-50/50'
            }`}
          >
            {columnItems.map((item, index) => (
              <RoadmapCard 
                key={item.id}
                item={item}
                index={index}
                onUpvote={onUpvote}
                isUpvoting={isUpvoting}
                hasUpvoted={item.upvoted_by?.includes(userEmail)}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
            {columnItems.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No items
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function ValueStreamRoadmap({ valueStream, title }) {
  const queryClient = useQueryClient();
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('roadmap_onboarding_dismissed') !== 'true';
  });

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('roadmap_onboarding_dismissed', 'true');
  };

  useEffect(() => {
    base44.auth.me().then(u => {
      setUserEmail(u.email);
      setIsAdmin(u.role === 'admin');
    }).catch(() => {});
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['roadmap', valueStream],
    queryFn: () => base44.entities.RoadmapItem.filter({ value_stream: valueStream }, '-upvotes'),
  });

  const upvoteMutation = useMutation({
    mutationFn: async (item) => {
      const hasUpvoted = item.upvoted_by?.includes(userEmail);
      const newUpvotedBy = hasUpvoted
        ? (item.upvoted_by || []).filter(e => e !== userEmail)
        : [...(item.upvoted_by || []), userEmail];
      
      await base44.entities.RoadmapItem.update(item.id, {
        upvotes: newUpvotedBy.length,
        upvoted_by: newUpvotedBy
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['roadmap', valueStream]),
    onError: () => toast.error('Failed to update vote'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RoadmapItem.create({ ...data, submitter_email: userEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmap', valueStream]);
      toast.success('Item added to roadmap');
    },
    onError: () => toast.error('Failed to add item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RoadmapItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmap', valueStream]);
      toast.success('Item updated');
    },
    onError: () => toast.error('Failed to update item'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RoadmapItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roadmap', valueStream]);
      toast.success('Item deleted');
    },
    onError: () => toast.error('Failed to delete item'),
  });

  const handleDragEnd = (result) => {
    if (!result.destination || !isAdmin) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    updateMutation.mutate({ id: draggableId, data: { status: newStatus } });
  };

  const handleSubmit = async (data) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    if (confirm(`Delete "${item.title}"?`)) {
      deleteMutation.mutate(item.id);
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
    <div>
      <AnimatePresence>
        {showOnboarding && <RoadmapOnboarding onDismiss={dismissOnboarding} />}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
            {title}
          </h3>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            {isAdmin && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Admin Mode</Badge>}
            <span>{isAdmin ? 'Drag cards to move between columns' : 'Upvote features you want to see built'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!showOnboarding && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOnboarding(true)}
              className="text-slate-500"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              How it works
            </Button>
          )}
          <Button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            style={{ background: brandColors.goldPrestige }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>
      
      {/* Mobile: Monday-style list view */}
      <div className="md:hidden">
        <RoadmapListView
          items={items}
          onUpvote={(item) => upvoteMutation.mutate(item)}
          userEmail={userEmail}
          isUpvoting={upvoteMutation.isPending}
        />
      </div>

      {/* Desktop: Kanban view */}
      <div className="hidden md:block">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATUS_ORDER.map(status => (
              <RoadmapColumn
                key={status}
                status={status}
                items={items}
                onUpvote={(item) => upvoteMutation.mutate(item)}
                isUpvoting={upvoteMutation.isPending}
                userEmail={userEmail}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <RoadmapItemForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        initialData={editingItem}
        valueStream={valueStream}
      />
    </div>
  );
}

export default function RoadmapTab() {
  const [activeStream, setActiveStream] = useState('operational');

  return (
    <div className="space-y-6">
      <Tabs value={activeStream} onValueChange={setActiveStream}>
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="operational" className="data-[state=active]:bg-slate-100">
            Operational
          </TabsTrigger>
          <TabsTrigger value="developmental" className="data-[state=active]:bg-slate-100">
            Developmental
          </TabsTrigger>
          <TabsTrigger value="bugs" className="data-[state=active]:bg-slate-100">
            Bug Tracker
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="operational" className="mt-6">
          <ValueStreamRoadmap 
            valueStream="operational" 
            title="Operational Value Streams" 
          />
        </TabsContent>
        
        <TabsContent value="developmental" className="mt-6">
          <ValueStreamRoadmap 
            valueStream="developmental" 
            title="Developmental Value Streams" 
          />
        </TabsContent>

        <TabsContent value="bugs" className="mt-6">
          <BugKanban />
        </TabsContent>
      </Tabs>
    </div>
  );
}