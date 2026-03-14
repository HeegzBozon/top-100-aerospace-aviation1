
import React from 'react';
import { X, Mail, User as UserIcon, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function UserViewModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">User Details</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <img 
              src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=random&size=128`}
              alt="User Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user.full_name || 'No name set'}</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Role</div>
                <div className="text-gray-900 font-medium capitalize">{user.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-gray-500">Joined</div>
                <div className="text-gray-900">{format(new Date(user.created_date), 'PPP')}</div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
             <p className="text-sm text-gray-500">More user stats and activity logs can be added here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
