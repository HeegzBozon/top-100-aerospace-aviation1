import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Assuming this exists, if not will fallback to input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit2, Award } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EventManagement() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventType, setEventType] = useState('meetup');
    const [eventStatus, setEventStatus] = useState('upcoming');
    const [isOfficial, setIsOfficial] = useState(false);

    const { data: events, isLoading } = useQuery({
        queryKey: ['admin-events'],
        queryFn: () => base44.entities.Event.list({ sort: { event_date: -1 } }),
        initialData: []
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Event.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
            setIsDialogOpen(false);
            toast.success('Event created successfully');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}) => base44.entities.Event.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
            setIsDialogOpen(false);
            setEditingEvent(null);
            toast.success('Event updated successfully');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Event.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
            toast.success('Event deleted');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            event_date: formData.get('event_date'),
            event_type: eventType,
            location: formData.get('location'),
            organizer: formData.get('organizer'),
            status: eventStatus,
            is_official: isOfficial,
        };

        if (editingEvent) {
            updateMutation.mutate({ id: editingEvent.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const openCreateDialog = () => {
        setEditingEvent(null);
        setEventType('meetup');
        setEventStatus('upcoming');
        setIsOfficial(false);
        setIsDialogOpen(true);
    };

    const openEditDialog = (event) => {
        setEditingEvent(event);
        setEventType(event.event_type || 'meetup');
        setEventStatus(event.status || 'upcoming');
        setIsOfficial(event.is_official || false);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Event Management</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="w-4 h-4 mr-2" /> Create Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input name="title" defaultValue={editingEvent?.title} required placeholder="Event Title" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date & Time</label>
                                <Input 
                                    type="datetime-local" 
                                    name="event_date" 
                                    defaultValue={editingEvent?.event_date ? format(new Date(editingEvent.event_date), "yyyy-MM-dd'T'HH:mm") : ''} 
                                    required 
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-amber-50 border-amber-200">
                                <Switch checked={isOfficial} onCheckedChange={setIsOfficial} />
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm font-medium text-amber-800">Official TOP 100 Event</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select value={eventType} onValueChange={setEventType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="meetup">Meetup</SelectItem>
                                            <SelectItem value="training">Training</SelectItem>
                                            <SelectItem value="celebration">Celebration</SelectItem>
                                            <SelectItem value="awards">Awards</SelectItem>
                                            <SelectItem value="social">Social</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={eventStatus} onValueChange={setEventStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input name="location" defaultValue={editingEvent?.location} placeholder="Virtual or Physical Address" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Organizer</label>
                                <Input name="organizer" defaultValue={editingEvent?.organizer} placeholder="Organizer Name" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea 
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    name="description" 
                                    defaultValue={editingEvent?.description} 
                                    placeholder="Event details..." 
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingEvent ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b font-medium grid grid-cols-12 gap-4 text-sm text-slate-500">
                    <div className="col-span-4">Event</div>
                    <div className="col-span-3">Date</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y">
                    {events.map(event => (
                        <div key={event.id} className="p-4 grid grid-cols-12 gap-4 items-center text-sm hover:bg-slate-50 transition-colors">
                            <div className="col-span-4 font-medium flex items-center gap-2">
                                {event.is_official && <Award className="w-4 h-4 text-amber-500" />}
                                {event.title}
                            </div>
                            <div className="col-span-3 text-slate-600">
                                {format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}
                            </div>
                            <div className="col-span-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                    {event.event_type}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                    event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                    event.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {event.status}
                                </span>
                            </div>
                            <div className="col-span-1 flex justify-end gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(event)}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                                    if(confirm('Are you sure you want to delete this event?')) deleteMutation.mutate(event.id);
                                }}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No events found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}