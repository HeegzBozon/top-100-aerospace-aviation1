import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Plus, Trash2, Pencil, Check, X, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function YouDMThread({ currentUser = {} }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(`youDm_${currentUser?.email}`);
    if (saved) setNotes(JSON.parse(saved));
  }, [currentUser?.email]);

  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(`youDm_${currentUser.email}`, JSON.stringify(notes));
    }
  }, [notes, currentUser?.email]);

  const handleAdd = () => {
    const text = newNote.trim();
    if (!text) return;
    setNotes([{ id: Date.now(), text, createdAt: new Date().toISOString() }, ...notes]);
    setNewNote('');
    textareaRef.current?.focus();
  };

  const handleDelete = (id) => setNotes(notes.filter(n => n.id !== id));

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    setNotes(notes.map(n => n.id === id ? { ...n, text: editText.trim() } : n));
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-amber-50/40 to-white">
      {/* Notes feed */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5 space-y-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <StickyNote className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Your private scratchpad</p>
              <p className="text-xs text-gray-400 mt-1">Notes only you can see</p>
            </div>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="group relative bg-white rounded-2xl shadow-sm border border-amber-100 px-4 py-3.5 transition-all hover:shadow-md hover:border-amber-200"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSaveEdit(note.id); }}
                    className="w-full text-sm text-gray-800 bg-transparent resize-none focus:outline-none leading-relaxed"
                    rows={3}
                  />
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                      aria-label="Cancel edit"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[11px] text-gray-400">
                      {format(new Date(note.createdAt), "MMM d, h:mm a")}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingId(note.id); setEditText(note.text); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                        aria-label="Edit note"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-amber-100 bg-white">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
              placeholder="Capture a thought… (Enter to save)"
              rows={2}
              className={cn(
                "w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800",
                "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-300 focus:bg-white",
                "transition-all duration-200 leading-relaxed"
              )}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newNote.trim()}
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0",
              newNote.trim()
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            )}
            aria-label="Save note"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}