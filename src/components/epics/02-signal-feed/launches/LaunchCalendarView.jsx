import React, { useMemo, useState } from 'react';
import { parseISO, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek, addMonths, subMonths, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';

function LaunchDot({ launch, onClick }) {
  const isGo = launch.status?.abbrev === 'Go';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(launch); }}
      className={`w-full text-left text-[10px] truncate rounded px-1 py-0.5 mb-0.5 leading-tight ${
        isGo ? 'bg-green-100 text-green-800' : 'bg-indigo-50 text-indigo-700'
      } hover:opacity-80`}
      title={launch.name}
    >
      {launch.name.split('|')[0].trim()}
    </button>
  );
}

export default function LaunchCalendarView({ launches, onSelectLaunch }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const launchDates = useMemo(() =>
    launches.map(l => ({ ...l, _date: l.net ? parseISO(l.net) : null })).filter(l => l._date),
    [launches]
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getLaunchesForDay = (day) =>
    launchDates.filter(l => isSameDay(l._date, day));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-sm font-bold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center border-b border-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-[10px] font-semibold text-gray-400 uppercase">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const dayLaunches = getLaunchesForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] p-1 border-b border-r border-gray-50 ${!isCurrentMonth ? 'bg-gray-50/50' : ''}`}
            >
              <p className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                isToday ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {format(day, 'd')}
              </p>
              {dayLaunches.slice(0, 3).map(l => (
                <LaunchDot key={l.id} launch={l} onClick={onSelectLaunch} />
              ))}
              {dayLaunches.length > 3 && (
                <p className="text-[10px] text-gray-400 pl-1">+{dayLaunches.length - 3} more</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}