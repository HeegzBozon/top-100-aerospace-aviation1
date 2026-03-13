import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

export default function AvailabilityCalendar({ settings, bookings = [], onSlotClick }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const isSlotAvailable = (date, hour) => {
    const dayName = dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const daySettings = settings?.weekly_hours?.[dayName];
    
    if (!daySettings?.enabled) return false;
    
    const startHour = parseInt(daySettings.start?.split(':')[0] || '9');
    const endHour = parseInt(daySettings.end?.split(':')[0] || '17');
    
    return hour >= startHour && hour < endHour;
  };

  const getBookingForSlot = (date, hour) => {
    return bookings.find(b => {
      const bookingStart = new Date(b.start_time);
      return isSameDay(bookingStart, date) && bookingStart.getHours() === hour;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <Clock className="w-5 h-5" />
            Weekly Availability
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#e8f5e9' }} />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: brandColors.skyBlue }} />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-100" />
            <span>Unavailable</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-xs text-slate-400 p-2">Time</div>
              {days.map((day, i) => (
                <div 
                  key={i} 
                  className={`text-center p-2 rounded ${isToday(day) ? 'bg-amber-50' : ''}`}
                >
                  <div className="text-xs text-slate-400">{format(day, 'EEE')}</div>
                  <div className={`text-sm font-medium ${isToday(day) ? 'text-amber-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-1">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-1">
                  <div className="text-xs text-slate-400 p-2 text-right">
                    {format(new Date().setHours(hour, 0), 'h a')}
                  </div>
                  {days.map((day, i) => {
                    const available = isSlotAvailable(day, hour);
                    const booking = getBookingForSlot(day, hour);
                    
                    return (
                      <div
                        key={i}
                        onClick={() => available && !booking && onSlotClick?.(day, hour)}
                        className={`
                          h-8 rounded text-xs flex items-center justify-center transition-all
                          ${booking 
                            ? 'text-white cursor-default' 
                            : available 
                              ? 'hover:ring-2 hover:ring-amber-300 cursor-pointer' 
                              : 'cursor-not-allowed'
                          }
                        `}
                        style={{
                          background: booking 
                            ? brandColors.skyBlue 
                            : available 
                              ? '#e8f5e9' 
                              : '#f8fafc'
                        }}
                      >
                        {booking && (
                          <span className="truncate px-1 text-[10px]">
                            {booking.client_user_email?.split('@')[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}