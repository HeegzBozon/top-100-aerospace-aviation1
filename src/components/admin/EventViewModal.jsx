import React from 'react';
import { X, Calendar, MapPin, User as UserIcon, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function EventViewModal({ event, onClose }) {
  if (!event) return null;

  const getEventTypeColor = (type) => {
    const colors = {
      'celebration': 'from-yellow-500 to-orange-400',
      'training': 'from-blue-500 to-cyan-400',
      'social': 'from-purple-500 to-indigo-400',
      'awards': 'from-pink-500 to-rose-400',
      'meetup': 'from-green-500 to-emerald-400'
    };
    return colors[type] || 'from-gray-500 to-slate-400';
  };

  const getStatusColor = (status) => {
    const colors = {
      'upcoming': 'bg-blue-100 text-blue-800',
      'ongoing': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Header */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className={`px-4 py-2 bg-gradient-to-r ${getEventTypeColor(event.event_type)} text-white rounded-full text-sm font-medium`}>
                {event.event_type}
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Date & Time</div>
                  <div className="text-gray-900">{format(new Date(event.event_date), 'PPP p')}</div>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Location</div>
                    <div className="text-gray-900">{event.location}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {event.organizer && (
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Organizer</div>
                    <div className="text-gray-900">{event.organizer}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Attendees</div>
                  <div className="text-gray-900">{(event.attendees || []).length} registered</div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendees List */}
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Registered Attendees</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {event.attendees.map((email, index) => (
                    <div key={index} className="text-sm text-gray-700 px-2 py-1 bg-white rounded border">
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Created: {format(new Date(event.created_date), 'PPP')}</span>
              </div>
              {event.updated_date && event.updated_date !== event.created_date && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {format(new Date(event.updated_date), 'PPP')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}