import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Plus, Trash2, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ClientNotesPanel({ providerEmail, clientEmail, bookingId }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTags, setNewTags] = useState('');
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['client-notes', providerEmail, clientEmail],
    queryFn: () => base44.entities.ClientNote.filter({
      provider_email: providerEmail,
      client_email: clientEmail,
    }),
    enabled: !!providerEmail && !!clientEmail,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes'] });
      setNewNote('');
      setNewTags('');
      setIsAdding(false);
      toast.success('Note saved');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientNote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes'] });
      toast.success('Note deleted');
    },
  });

  const handleSave = () => {
    if (!newNote.trim()) return;
    createMutation.mutate({
      provider_email: providerEmail,
      client_email: clientEmail,
      content: newNote.trim(),
      booking_id: bookingId || undefined,
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          Private Notes
        </CardTitle>
        {!isAdding && (
          <Button size="sm" variant="ghost" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="p-3 border rounded-lg bg-slate-50 space-y-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a private note about this client..."
              rows={3}
            />
            <Input
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!newNote.trim() || createMutation.isPending}
                className="bg-[#1e3a5a]"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No notes yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="p-3 border rounded-lg text-sm group">
                <div className="flex justify-between items-start">
                  <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6"
                    onClick={() => deleteMutation.mutate(note.id)}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
                {note.tags?.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  {format(new Date(note.created_date), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}