import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Trash2, Ban, CalendarCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AvailabilityExceptions({ providerEmail }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    exception_type: 'blocked'
  });

  const { data: exceptions, isLoading } = useQuery({
    queryKey: ['availability-exceptions', providerEmail],
    queryFn: () => base44.entities.AvailabilityException.filter({ provider_email: providerEmail }),
    enabled: !!providerEmail,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.AvailabilityException.create({
      ...form,
      provider_email: providerEmail,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString()
    }),
    onSuccess: () => {
      toast.success('Exception added');
      queryClient.invalidateQueries(['availability-exceptions', providerEmail]);
      setShowAdd(false);
      setForm({ start_date: '', end_date: '', reason: '', exception_type: 'blocked' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AvailabilityException.delete(id),
    onSuccess: () => {
      toast.success('Exception removed');
      queryClient.invalidateQueries(['availability-exceptions', providerEmail]);
    }
  });

  const upcomingExceptions = exceptions
    .filter(e => new Date(e.end_date) >= new Date())
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Time Off & Exceptions
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : upcomingExceptions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No exceptions set</p>
        ) : (
          <div className="space-y-2">
            {upcomingExceptions.map((exc) => (
              <div 
                key={exc.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  exc.exception_type === 'blocked' ? 'bg-red-50' : 'bg-green-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {exc.exception_type === 'blocked' ? (
                    <Ban className="w-4 h-4 text-red-500" />
                  ) : (
                    <CalendarCheck className="w-4 h-4 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{exc.reason || 'Time Off'}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(exc.start_date), 'MMM d')} - {format(new Date(exc.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => deleteMutation.mutate(exc.id)}
                  className="h-8 w-8 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Off / Exception</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select 
                value={form.exception_type} 
                onValueChange={(v) => setForm({ ...form, exception_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blocked">Block Time (Unavailable)</SelectItem>
                  <SelectItem value="available">Open Time (Override)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input
                placeholder="e.g. Vacation, Holiday, Conference"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button 
              onClick={() => createMutation.mutate()}
              disabled={!form.start_date || !form.end_date || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Exception
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}