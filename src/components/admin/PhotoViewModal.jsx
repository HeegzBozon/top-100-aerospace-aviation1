import React from 'react';
import { X, User as UserIcon, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function PhotoViewModal({ photo, onClose }) {
  if (!photo) return null;

  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Approved',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: 'Rejected',
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          text: 'Pending',
        };
    }
  };

  const statusInfo = getStatusInfo(photo.status || 'pending');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-gray-900">Photo Details</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto">
            <div className="p-2 md:p-6 bg-gray-50">
                <img 
                    src={photo.image_url} 
                    alt={photo.caption || 'User upload'} 
                    className="w-full h-auto rounded-lg shadow-lg object-contain max-h-[60vh]"
                />
            </div>

            <div className="p-6 space-y-4">
              {photo.caption && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Caption</h4>
                  <p className="text-gray-800 text-lg">{photo.caption}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                 <div className="flex items-center gap-3">
                  {statusInfo.icon}
                  <div>
                    <div className="text-sm font-medium text-gray-500">Status</div>
                    <div className="text-gray-900 font-medium">{statusInfo.text}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-blue-500" />
                    <div>
                        <div className="text-sm font-medium text-gray-500">Uploader</div>
                        <div className="text-gray-900">{photo.uploader_name}</div>
                        <div className="text-xs text-gray-500">{photo.uploader_email}</div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                        <div className="text-sm font-medium text-gray-500">Uploaded On</div>
                        <div className="text-gray-900">{format(new Date(photo.created_date), 'PPP')}</div>
                    </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}