import React, { useState } from 'react';
import { PersonalTask } from '@/entities/PersonalTask';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Tag, Calendar } from 'lucide-react';

const TaskItem = ({ task, onTaskUpdate, onTaskDelete }) => {
  const { toast } = useToast();
  const isDone = task.status === 'done';

  const handleStatusChange = async (checked) => {
    const newStatus = checked ? 'done' : 'todo';
    try {
      const updatedTask = await PersonalTask.update(task.id, { status: newStatus });
      onTaskUpdate(updatedTask);
      if (newStatus === 'done') {
        toast({
          title: "Task Completed!",
          description: `You've finished "${task.title}". Great job!`,
        });
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the task status.",
      });
    }
  };

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500',
  };

  return (
    <div className={`
      flex items-center gap-4 p-3 rounded-lg bg-white/5 border-l-4
      ${priorityColors[task.priority] || 'border-l-gray-500'}
      transition-all duration-200
      ${isDone ? 'opacity-50' : ''}
    `}>
      <Checkbox
        id={`task-${task.id}`}
        checked={isDone}
        onCheckedChange={handleStatusChange}
        className="w-5 h-5"
      />
      <label htmlFor={`task-${task.id}`} className={`flex-1 font-medium cursor-pointer ${isDone ? 'line-through' : ''}`}>
        {task.title}
      </label>
      {task.due_date && (
        <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
          <Calendar className="w-3 h-3" />
          {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  );
};

export default function PersonalTaskDashboard({ tasks, onTaskCreated, onTaskUpdated }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState('todo'); // 'all', 'todo', 'done'
  const { toast } = useToast();

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await PersonalTask.create({ title: newTaskTitle, status: 'todo' });
      onTaskCreated(newTask);
      setNewTaskTitle('');
      toast({
        title: "Task Added",
        description: `"${newTaskTitle}" has been added to your list.`,
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Could not create the new task.",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  }).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div className="bg-[var(--glass)] border border-white/10 shadow-xl rounded-2xl p-6 space-y-6 h-full flex flex-col">
      <h2 className="text-xl font-bold">My Inbox</h2>
      
      {/* Quick Capture Form */}
      <form onSubmit={handleCreateTask}>
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-[var(--muted)]" />
          <Input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:border-b-[var(--accent)] transition-colors"
          />
          <Button type="submit" size="sm" variant="ghost">Add</Button>
        </div>
      </form>
      
      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Button variant={filter === 'todo' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('todo')}>
          To Do ({tasks.filter(t => t.status === 'todo').length})
        </Button>
        <Button variant={filter === 'done' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('done')}>
          Done ({tasks.filter(t => t.status === 'done').length})
        </Button>
        <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>
          All
        </Button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskItem key={task.id} task={task} onTaskUpdate={onTaskUpdated} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-[var(--muted)]">
              {filter === 'todo' ? "You're all caught up!" : "No tasks here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}