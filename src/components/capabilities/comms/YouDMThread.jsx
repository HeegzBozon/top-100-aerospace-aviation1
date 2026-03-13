import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Bookmark } from 'lucide-react';

export default function YouDMThread({ currentUser = {} }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`youDm_${currentUser?.email}`);
    if (saved) setNotes(JSON.parse(saved));
  }, [currentUser?.email]);

  // Save to localStorage
  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(`youDm_${currentUser.email}`, JSON.stringify(notes));
    }
  }, [notes, currentUser?.email]);

  const handleAddNote = () => {
    const text = newNote.trim();
    if (!text) return;
    
    setNotes([
      { id: Date.now(), text, createdAt: new Date().toISOString() },
      ...notes
    ]);
    setNewNote('');
  };

  const handleDelete = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleEdit = (id, newText) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text: newText } : n));
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="flex flex-col h-full bg-black/40">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50">
        <h2 className="text-base font-semibold text-amber-200 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Notes to Self
        </h2>
        <p className="text-xs text-gray-500 mt-1">Capture ideas and insights</p>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Bookmark className="w-12 h-12 text-amber-200 mb-3" />
            <p className="text-gray-500 text-sm font-medium">No notes yet</p>
            <p className="text-gray-400 text-xs mt-1">Start writing below</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="p-3 rounded border border-gray-800/50 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 text-sm rounded bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => handleEdit(note.id, editText)}>Save</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-200">{note.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-600">
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingId(note.id); setEditText(note.text); }} className="text-[11px] text-amber-400 hover:text-amber-300">Edit</button>
                      <button onClick={() => handleDelete(note.id)} className="text-[11px] text-red-500 hover:text-red-400">Delete</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-black/20 border-t border-gray-800/50">
        <div className="flex flex-col gap-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleAddNote();
              }
            }}
            placeholder="Write a note..."
            className="w-full p-3 rounded border border-gray-700 bg-gray-900/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
            rows={3}
          />
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            Save Note
          </Button>
        </div>
      </div>
    </div>
  );
}