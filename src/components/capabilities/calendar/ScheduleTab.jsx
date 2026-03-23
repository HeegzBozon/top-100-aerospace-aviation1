import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isSameMonth, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, Plus, Calendar, MoreHorizontal, Award, Sparkles, Edit2, Trash2, Globe, Zap, ExternalLink, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
  green: '#22c55e',
};

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function MonthCalendar({ month, events, selectedDate, onSelectDate }) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad start of month
  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];
  
  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter(e => {
      const eventDate = parseISO(e.event_date);
      return isSameDay(eventDate, day);
    });
  };

  return (
    <div className="flex-1">
      <div className="text-center font-bold text-lg mb-3" style={{ color: brandColors.navyDeep }}>
        {format(month, 'MMMM yyyy')}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
            {day}
          </div>
        ))}
        
        {paddedDays.map((day, idx) => {
          if (!day) {
            return <div key={`pad-${idx}`} className="h-10" />;
          }
          
          const dayEvents = getEventsForDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const inCurrentMonth = isSameMonth(day, month);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`
                h-10 rounded-md text-sm font-medium relative transition-all
                ${isSelected ? 'ring-2 ring-offset-1' : ''}
                ${isCurrentDay ? 'font-bold' : ''}
                ${inCurrentMonth ? '' : 'text-slate-300'}
                hover:bg-slate-100
              `}
              style={{ 
                backgroundColor: isSelected ? `${brandColors.skyBlue}20` : undefined,
                ringColor: isSelected ? brandColors.skyBlue : undefined,
                color: isCurrentDay ? brandColors.navyDeep : undefined,
              }}
            >
              {format(day, 'd')}
              {dayEvents.length > 0 && (
                <span 
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: dayEvents.some(e => e.is_official) ? brandColors.goldPrestige : brandColors.green }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EventItem({ event, onClick }) {
  const eventDate = parseISO(event.event_date);
  const isOfficial = event.is_official;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-start gap-3 py-3 cursor-pointer px-3 -mx-3 rounded-lg transition-all
        ${isOfficial 
          ? 'bg-gradient-to-r from-amber-50 to-transparent hover:from-amber-100 border-l-4' 
          : 'hover:bg-slate-50'
        }
      `}
      style={{ borderLeftColor: isOfficial ? brandColors.goldPrestige : 'transparent' }}
      onClick={() => onClick(event)}
    >
      <div 
        className={`shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white relative ${isOfficial ? 'ring-2 ring-offset-1' : ''}`}
        style={{ 
          backgroundColor: isOfficial ? brandColors.goldPrestige : brandColors.skyBlue,
          ringColor: isOfficial ? brandColors.goldPrestige : undefined,
        }}
      >
        <span className="text-xs font-medium">{format(eventDate, 'MMM')}</span>
        <span className="text-lg font-bold leading-none">{format(eventDate, 'd')}</span>
        {isOfficial && (
          <div 
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: brandColors.navyDeep }}
          >
            <Award className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold" style={{ color: brandColors.navyDeep }}>
            {event.title}
          </h4>
          {isOfficial && (
            <Badge 
              className="text-xs px-1.5 py-0 h-5 gap-1"
              style={{ backgroundColor: brandColors.goldPrestige, color: 'white' }}
            >
              <Sparkles className="w-3 h-3" />
              Official
            </Badge>
          )}
          {event.is_public && (
            <Badge className="text-xs px-1.5 py-0 h-5 gap-1 bg-green-500 text-white">
              <Globe className="w-3 h-3" />
            </Badge>
          )}
          {event.party_mode && (
            <Badge className="text-xs px-1.5 py-0 h-5 gap-1 bg-pink-500 text-white animate-pulse">
              <Zap className="w-3 h-3" />
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500">
          {format(eventDate, 'EEE, MMM d, h:mma')}
        </p>
      </div>
    </motion.div>
  );
}

function EventDetailModal({ event, open, onClose, onEdit, onDelete, canModify }) {
  if (!event) return null;
  
  const eventDate = parseISO(event.event_date);
  const isOfficial = event.is_official;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-lg ${isOfficial ? 'border-2' : ''}`} style={{ borderColor: isOfficial ? brandColors.goldPrestige : undefined }}>
        {isOfficial && (
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${brandColors.goldPrestige}, ${brandColors.navyDeep})` }}
          />
        )}
        <div className="flex items-start gap-4 mb-6">
          <div 
            className={`shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white relative ${isOfficial ? 'ring-2 ring-offset-2' : ''}`}
            style={{ 
              backgroundColor: isOfficial ? brandColors.goldPrestige : brandColors.skyBlue,
              ringColor: isOfficial ? brandColors.goldPrestige : undefined,
            }}
          >
            <span className="text-xs font-medium">{format(eventDate, 'MMM')}</span>
            <span className="text-xl font-bold leading-none">{format(eventDate, 'd')}</span>
            {isOfficial && (
              <div 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: brandColors.navyDeep }}
              >
                <Award className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                {event.title}
              </h2>
              {isOfficial && (
                <Badge 
                  className="text-xs gap-1"
                  style={{ backgroundColor: brandColors.goldPrestige, color: 'white' }}
                >
                  <Award className="w-3 h-3" />
                  Official TOP 100 Event
                </Badge>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              {event.is_public && (
                <Badge className="text-xs gap-1 bg-green-500 text-white">
                  <Globe className="w-3 h-3" />
                  Public
                </Badge>
              )}
              {event.party_mode && (
                <Badge className="text-xs gap-1 bg-pink-500 text-white">
                  <Zap className="w-3 h-3" />
                  Party Mode
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-sm font-medium text-slate-500 w-16">When</span>
            <span className="text-sm" style={{ color: brandColors.navyDeep }}>
              {format(eventDate, 'EEE, MMM d, h:mma')}
            </span>
          </div>
          
          {event.location && (
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-slate-500 w-16">Where</span>
              <span className="text-sm" style={{ color: brandColors.navyDeep }}>
                {event.location}
              </span>
            </div>
          )}
          
          {event.description && (
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-slate-500 w-16">Details</span>
              <span className="text-sm text-slate-600">
                {event.description}
              </span>
            </div>
          )}
          
          {event.organizer && (
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-slate-500 w-16">Added by</span>
              <span className="text-sm text-slate-600">
                {event.organizer}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
          <Link to={createPageUrl('EventPage') + `?id=${event.id}`}>
            <Button size="sm" className="gap-1" style={{ backgroundColor: brandColors.skyBlue }}>
              <ExternalLink className="w-3.5 h-3.5" />
              View Event Page
            </Button>
          </Link>
          
          {canModify && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => onEdit(event)}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(event)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EventFormModal({ open, onClose, selectedDate, onSubmit, isAdmin, editingEvent = null }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(selectedDate || new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [partyMode, setPartyMode] = useState(false);
  
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setStartDate(parseISO(editingEvent.event_date));
      setStartTime(format(parseISO(editingEvent.event_date), 'HH:mm'));
      setLocation(editingEvent.location || '');
      setDescription(editingEvent.description || '');
      setIsOfficial(editingEvent.is_official || false);
      setIsPublic(editingEvent.is_public || false);
      setPartyMode(editingEvent.party_mode || false);
    } else {
      setTitle('');
      setStartDate(selectedDate || new Date());
      setStartTime('09:00');
      setLocation('');
      setDescription('');
      setIsOfficial(false);
      setIsPublic(false);
      setPartyMode(false);
    }
  }, [editingEvent, selectedDate, open]);
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter an event name');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const eventDateTime = new Date(startDate);
      if (!allDay) {
        const [hours, minutes] = startTime.split(':');
        eventDateTime.setHours(parseInt(hours), parseInt(minutes));
      }
      
      await onSubmit({
        title,
        event_date: eventDateTime.toISOString(),
        location,
        description,
        event_type: 'meetup',
        status: 'upcoming',
        is_official: isOfficial,
        is_public: isPublic,
        party_mode: partyMode,
      }, editingEvent?.id);
      
      onClose();
    } catch (error) {
      toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="space-y-4">
          <Input
            placeholder="Type the name of the event..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0"
            autoFocus
          />
          
          <div className="p-4 rounded-lg border bg-slate-50 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Start</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="flex-1"
                  />
                  {!allDay && (
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-28"
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch checked={allDay} onCheckedChange={setAllDay} />
              <span className="text-sm text-slate-600">All day</span>
            </div>
          </div>
          
          <Input
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          
          <Input
            placeholder="Notes (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          {/* Event Options */}
          <div className="space-y-3 p-4 rounded-lg border bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                <div>
                  <span className="text-sm font-medium">Events On Air</span>
                  <p className="text-xs text-slate-500">Anyone can find and view this event</p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-500" />
                <div>
                  <span className="text-sm font-medium">Party Mode</span>
                  <p className="text-xs text-slate-500">Real-time photo sharing from guests</p>
                </div>
              </div>
              <Switch checked={partyMode} onCheckedChange={setPartyMode} />
            </div>
          </div>

          {isAdmin && (
            <div 
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{ backgroundColor: `${brandColors.goldPrestige}15`, borderColor: brandColors.goldPrestige }}
            >
              <Switch checked={isOfficial} onCheckedChange={setIsOfficial} />
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
                  Official TOP 100 Event
                </span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ backgroundColor: brandColors.green }}
              className="text-white"
            >
              {isSubmitting ? (editingEvent ? 'Updating...' : 'Posting...') : (editingEvent ? 'Update event' : 'Post this event')}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ScheduleTab() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setIsAdmin(u.role === 'admin');
      setUserEmail(u.email);
    }).catch(() => {});
  }, []);
  
  const nextMonth = addMonths(currentMonth, 1);
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.filter({}, 'event_date'),
  });
  
  const createEventMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event created!');
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event updated!');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event deleted');
      setSelectedEvent(null);
    },
  });

  const handleSubmitEvent = async (data, eventId) => {
    if (eventId) {
      await updateEventMutation.mutateAsync({ id: eventId, data });
    } else {
      await createEventMutation.mutateAsync(data);
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(null);
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleDeleteEvent = (event) => {
    if (confirm(`Delete "${event.title}"?`)) {
      deleteEventMutation.mutate(event.id);
    }
  };

  const openCreateForm = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };

  const canModifyEvent = (event) => {
    return isAdmin || event.created_by === userEmail;
  };
  
  const eventsForSelectedDate = events.filter(e => {
    const eventDate = parseISO(e.event_date);
    return isSameDay(eventDate, selectedDate);
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={openCreateForm}
          style={{ backgroundColor: brandColors.green }}
          className="gap-2 text-white"
        >
          <Plus className="w-4 h-4" />
          New event
        </Button>
        
        <h2 
          className="text-2xl font-bold"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
        >
          Schedule
        </h2>
        
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Calendar Navigation */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Dual Month Calendar */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex gap-8">
          <MonthCalendar 
            month={currentMonth} 
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <MonthCalendar 
            month={nextMonth} 
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>
      
      {/* Events for Selected Date */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4" style={{ color: brandColors.skyBlue }} />
          <span className="font-medium" style={{ color: brandColors.navyDeep }}>
            {format(selectedDate, 'EEE, MMM d').toUpperCase()}
          </span>
        </div>
        
        {eventsForSelectedDate.length > 0 ? (
          <div className="divide-y">
            {eventsForSelectedDate.map(event => (
              <EventItem 
                key={event.id} 
                event={event} 
                onClick={setSelectedEvent}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Nothing's on the schedule</p>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={openCreateForm}
        >
          Add an event
        </Button>
      </div>
      
      {/* Modals */}
      <EventFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingEvent(null); }}
        selectedDate={selectedDate}
        onSubmit={handleSubmitEvent}
        isAdmin={isAdmin}
        editingEvent={editingEvent}
      />
      
      <EventDetailModal
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        canModify={selectedEvent && canModifyEvent(selectedEvent)}
      />
    </div>
  );
}