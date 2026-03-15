import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, CheckSquare, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function getTodosKey(conversationId) {
  return `conv_todos_${conversationId}`;
}

function loadTodos(conversationId) {
  try {
    const raw = localStorage.getItem(getTodosKey(conversationId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos(conversationId, todos) {
  localStorage.setItem(getTodosKey(conversationId), JSON.stringify(todos));
}

export function useTodos(conversationId) {
  const [todos, setTodos] = useState(() => conversationId ? loadTodos(conversationId) : []);

  useEffect(() => {
    if (conversationId) {
      setTodos(loadTodos(conversationId));
    }
  }, [conversationId]);

  const persist = useCallback((next) => {
    setTodos(next);
    if (conversationId) saveTodos(conversationId, next);
  }, [conversationId]);

  const addTodo = useCallback((text) => {
    if (!text.trim()) return;
    persist([...todos, { id: Date.now().toString(), text: text.trim(), done: false }]);
  }, [todos, persist]);

  const toggleTodo = useCallback((id) => {
    persist(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, [todos, persist]);

  const deleteTodo = useCallback((id) => {
    persist(todos.filter(t => t.id !== id));
  }, [todos, persist]);

  const pendingCount = todos.filter(t => !t.done).length;

  return { todos, addTodo, toggleTodo, deleteTodo, pendingCount };
}

export default function ConversationTodoPanel({ open, onClose, conversationId, isDm = false }) {
  const { todos, addTodo, toggleTodo, deleteTodo, pendingCount } = useTodos(conversationId);
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    addTodo(draft);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="todo-panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="overflow-hidden"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="px-4 pt-3 pb-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                  Action Items
                </p>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 tabular-nums">
                    {pendingCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close action items"
              >
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>

            {/* Add input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add an action item…"
                className="flex-1 min-h-[44px] px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all"
                aria-label="New action item"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!draft.trim()}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                aria-label="Add action item"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
              </button>
            </div>

            {/* Todo list */}
            {todos.length === 0 ? (
              <p className="text-xs text-white/25 text-center py-2">No action items yet.</p>
            ) : (
              <ul className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                <AnimatePresence initial={false}>
                  {todos.map(todo => (
                    <motion.li
                      key={todo.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 group/item"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTodo(todo.id)}
                        className="shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center rounded transition-colors hover:bg-white/5 active:scale-95"
                        aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
                      >
                        {todo.done
                          ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                          : <Square className="w-4 h-4 text-white/30" />
                        }
                      </button>
                      <span className={cn(
                        "flex-1 text-xs leading-snug transition-all",
                        todo.done ? "line-through text-white/25" : "text-white/70"
                      )}>
                        {todo.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteTodo(todo.id)}
                        className="shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center rounded opacity-0 group-hover/item:opacity-100 hover:bg-red-500/15 transition-all active:scale-95"
                        aria-label="Delete action item"
                      >
                        <Trash2 className="w-3 h-3 text-red-400/60" />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}