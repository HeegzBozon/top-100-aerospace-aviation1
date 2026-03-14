import React from 'react';
import { X, User as UserIcon, Mail, MessageSquare, Bug, Clock, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function FeedbackViewModal({ feedback, onClose }) {
  if (!feedback) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                feedback.type === 'feedback' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              } flex items-center gap-1.5`}>
                {feedback.type === 'feedback' ? <MessageSquare className="w-4 h-4"/> : <Bug className="w-4 h-4"/>}
                {feedback.type === 'feedback' ? 'Feedback' : 'Bug Report'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feedback.status)}`}>
                {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1).replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{feedback.subject}</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium text-gray-500">Submitted by</div>
                <div className="text-gray-900">{feedback.user_email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium text-gray-500">Submitted on</div>
                <div className="text-gray-900">{format(new Date(feedback.created_date), 'PPP p')}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <div className="prose max-w-none text-gray-800 bg-gray-50 p-4 rounded-lg border">
              <p>{feedback.description}</p>
            </div>
          </div>

          {(feedback.screenshot_url || feedback.loom_link) && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Attachments</h4>
              <div className="space-y-4">
                {feedback.screenshot_url && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h5 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Screenshot</h5>
                    <a href={feedback.screenshot_url} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={feedback.screenshot_url} 
                        alt="User provided screenshot" 
                        className="rounded-lg border border-gray-200 max-w-full h-auto shadow-sm hover:shadow-md transition-shadow"
                      />
                    </a>
                  </div>
                )}
                {feedback.loom_link && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                     <h5 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Loom Recording</h5>
                    <a href={feedback.loom_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {feedback.loom_link}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}