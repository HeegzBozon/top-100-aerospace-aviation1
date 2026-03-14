import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock } from 'lucide-react';

/**
 * Displays launch time in both UTC and local time.
 * Pass isoString (the launch.net ISO string).
 */
export default function LaunchDateTime({ isoString, showIcon = true, className = '' }) {
  if (!isoString) return null;

  let date;
  try {
    date = parseISO(isoString);
  } catch {
    return null;
  }

  const utc = format(date, 'MMM d, yyyy · HH:mm') + ' UTC';
  const local = date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {showIcon && <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" aria-hidden="true" />}
        <time dateTime={isoString}>{utc}</time>
      </div>
      <p className="text-xs text-gray-400 pl-5">{local}</p>
    </div>
  );
}