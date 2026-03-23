import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SprintPlanning({ conversationId, sprintId }) {
  const queryClient = useQueryClient();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { data: sprint = {} } = useQuery({
    queryKey: ["sprint", sprintId],
    queryFn: () => base44.entities.Sprint?.get?.(sprintId),
    enabled: !!sprintId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["sprint-tasks", sprintId],
    queryFn: () => base44.entities.Feedback?.filter?.(
      { sprint_id: sprintId },
      "-story_points",
      50
    ) || [],
    enabled: !!sprintId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (title) => {
      return await base44.entities.Feedback?.create?.({
        type: "user_story",
        subject: title,
        description: "",
        user_email: (await base44.auth.me())?.email,
        sprint_id: sprintId,
        status: "backlog",
        story_points: 5,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sprint-tasks", sprintId]);
      setNewTaskTitle("");
      setIsAddingTask(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }) => {
      return await base44.entities.Feedback?.update?.(taskId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sprint-tasks", sprintId]);
    },
  });

  const velocity = sprint.allocated_points || 0;
  const maxCapacity = sprint.capacity_points || 0;
  const utilizationRate = maxCapacity > 0 ? Math.round((velocity / maxCapacity) * 100) : 0;
  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)
    : 0;

  const handleAddTask = useCallback(() => {
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate(newTaskTitle);
    }
  }, [newTaskTitle, createTaskMutation]);

  return (
    <div className="space-y-4">
      {/* Sprint Header Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-gray-700/40 bg-gray-900/30 p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Velocity</div>
          <div className="text-lg font-bold text-white">{velocity}</div>
          <div className="text-xs text-gray-500 mt-1">of {maxCapacity} pts</div>
        </div>

        <div className="rounded-lg border border-gray-700/40 bg-gray-900/30 p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Utilization</div>
          <div className={cn(
            "text-lg font-bold",
            utilizationRate > 90 ? "text-red-400" : utilizationRate > 70 ? "text-amber-400" : "text-emerald-400"
          )}>
            {utilizationRate}%
          </div>
        </div>

        <div className="rounded-lg border border-gray-700/40 bg-gray-900/30 p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Completion</div>
          <div className="text-lg font-bold text-blue-400">{completionRate}%</div>
        </div>
      </div>

      {/* Task List with Kanban-like feel */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks in this sprint</p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={cn(
                "group px-3 py-2.5 rounded-lg border transition-all duration-200 cursor-pointer",
                task.status === "done"
                  ? "border-gray-700/20 bg-gray-900/20"
                  : "border-gray-700/40 bg-gray-900/30 hover:bg-gray-900/50"
              )}
              onClick={() => {}}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTaskMutation.mutate({
                      taskId: task.id,
                      updates: { status: task.status === "done" ? "backlog" : "done" },
                    });
                  }}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0",
                    task.status === "done"
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-gray-600 hover:border-gray-500"
                  )}
                  aria-label={`Mark as ${task.status === "done" ? "incomplete" : "complete"}`}
                >
                  {task.status === "done" && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    task.status === "done" ? "text-gray-500 line-through" : "text-gray-200"
                  )}>
                    {task.subject}
                  </p>
                </div>

                {task.story_points && (
                  <div className={cn(
                    "text-xs font-bold px-2 py-1 rounded transition-all duration-200 flex-shrink-0",
                    "bg-gray-800/60 text-gray-300 group-hover:bg-gray-800"
                  )}>
                    {task.story_points}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Input */}
      {isAddingTask ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
              if (e.key === "Escape") {
                setIsAddingTask(false);
                setNewTaskTitle("");
              }
            }}
            placeholder="Task title..."
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleAddTask}
            disabled={createTaskMutation.isPending || !newTaskTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddingTask(true)}
          className="w-full border-gray-700 text-gray-400 hover:text-gray-300 hover:bg-gray-900/50"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add task
        </Button>
      )}
    </div>
  );
}

// Helper component for check icon
function CheckCircle({ className }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}